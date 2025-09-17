// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Truong Quoc Tri, Pham Nhat Minh
// ID: 4010989, s4019811

import { Request, Response } from 'express';
import { Types } from 'mongoose';

import OrderModel from '../models/Order';
import OrderItemModel from '../models/OrderItem';
import { ProductModel } from '../models/Product';
import { UserModel } from '../models/User';
import { CustomerModel } from '../models/Customer';
import { VendorModel } from '../models/Vendor';
import { ProductCategory } from '../models/ProductCategory';

import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserServices } from '../services/UserServices';

import {
  getProducts,
  getOneProduct,
  addItemToCart,
  createOrderFromItem,
  deleteItemByProduct,
  getCustomerCart,
  getCustomerCartByObjectId,
  modifyItemCart,
} from '../services/CustomerServices';

import { ICartItem } from '../models/CartItem';

const ALLOWED_TARGET = new Set(['CANCELED']);

// -----------------------------
// Helpers
// -----------------------------

// Find vendor display names per orderId
async function vendorNameByOrderIds(orderIds: Types.ObjectId[]) {
  const rows = await OrderItemModel.aggregate<{
    _id: Types.ObjectId;
    vendor: Types.ObjectId;
    vendorSet: Types.ObjectId[];
  }>([
    { $match: { order: { $in: orderIds } } },
    {
      $lookup: {
        from: ProductModel.collection.name,
        localField: 'product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$order',
        vendor: { $first: '$product.vendor' },
        vendorSet: { $addToSet: '$product.vendor' },
      },
    },
  ]);

  for (const r of rows) {
    if ((r.vendorSet || []).length > 1) {
      console.warn(
        `[customer.controller] Order ${String(
          r._id,
        )} has multiple vendors in items. Using the first.`,
      );
    }
  }

  const vendorIds = Array.from(
    new Set(rows.map((r) => String(r.vendor)).filter(Boolean)),
  );

  if (!vendorIds.length) return new Map<string, string>();

  const users = await UserModel.find({ _id: { $in: vendorIds } })
    .select({ businessName: 1, name: 1, username: 1 })
    .lean()
    .exec();

  const nameById = new Map<string, string>(
    users.map((u: any) => [
      String(u._id),
      u.businessName || u.name || u.username || 'Unknown vendor',
    ]),
  );

  const map = new Map<string, string>();
  for (const r of rows) {
    map.set(String(r._id), nameById.get(String(r.vendor)) || 'Unknown vendor');
  }
  return map;
}

const ALLOWED = new Set(['ACTIVE', 'PENDING']);

function parseStatusFilter(q: unknown): string[] | undefined {
  if (!q) return;
  const raw = Array.isArray(q) ? q : String(q).split(',');
  const list = raw
    .map((s) => String(s).trim().toUpperCase())
    .filter((s) => ALLOWED.has(s));
  return list.length ? list : undefined;
}

// -----------------------------
// Orders (Customer-owned)
// -----------------------------

// List all orders for the authenticated customer
export async function listCustomerOrders(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const customerIdStr = (req.user as any).userId || (req.user as any).id;
    if (!customerIdStr || !Types.ObjectId.isValid(customerIdStr)) {
      return res.status(400).json({ error: 'Invalid customer id in token' });
    }
    const customer = new Types.ObjectId(customerIdStr);

    const statuses = parseStatusFilter((req as any).query?.status);

    const match: any = { customer };
    if (statuses) match.status = { $in: statuses };

    const orders = await OrderModel.find(match)
      .select('status totalPrice totalprice createdAt')
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    const orderIds = orders.map((o) => o._id as Types.ObjectId);
    const vendorNameMap =
      orderIds.length > 0
        ? await vendorNameByOrderIds(orderIds)
        : new Map<string, string>();

    const dto = orders.map((o) => ({
      id: String(o._id),
      status: String(o.status ?? '').toUpperCase(),
      totalPrice: Number((o as any).totalPrice ?? (o as any).totalprice ?? 0),
      vendorName: vendorNameMap.get(String(o._id)) || 'Unknown vendor',
    }));

    return res.json(dto);
  } catch (err) {
    console.error('[listCustomerOrders] ERROR:', (err as any)?.message, err);
    return res.status(500).json({ error: 'Failed to load orders' });
  }
}

// Get detail of a single customer order (items + vendor info)
export async function getCustomerOrderDetail(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const orderId = new Types.ObjectId(id);

    const customerIdStr = (req.user as any).userId || (req.user as any).id;
    if (!customerIdStr || !Types.ObjectId.isValid(customerIdStr)) {
      return res.status(400).json({ error: 'Invalid customer id in token' });
    }
    const customer = new Types.ObjectId(customerIdStr);

    const order: any = await OrderModel.findOne({ _id: orderId, customer })
      .select(
        'status totalPrice totalprice customer address shippingAddress cancelReason orderDate',
      )
      .populate({ path: 'customer', select: 'name address' })
      .lean()
      .exec();

    console.log('DTOTOTOTOTORDER', order);

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const itemsRaw = await OrderItemModel.find({ order: orderId })
      .select('product quantity price priceAtPurchase')
      // .populate('product', 'name price sale vendor imageUrl')
      .lean()
      .exec();
    console.log('DTOTOTOTOTitemsRaw', itemsRaw);
    const validProductIds = Array.from(
      new Set(
        itemsRaw
          .map((it: any) => it.product)
          .filter((pid: any) => pid && Types.ObjectId.isValid(pid))
          .map((pid: any) => String(pid)),
      ),
    ).map((idStr) => new Types.ObjectId(idStr));

    const products = validProductIds.length
      ? await ProductModel.find({ _id: { $in: validProductIds } })
          .select('name imageUrl price vendor sale')
          .lean()
          .exec()
      : [];
    console.log('DTOTOTOTOTproductstttt', products);

    const productMap = new Map(products.map((p) => [String(p._id), p as any]));
    console.log('DTOTOTOTOTproductMap', productMap);

    const mappedItems = itemsRaw.map((it: any) => {
      const p: any = productMap.get(String(it.product));
      console.log('SALE tu p:', p.sale);
      // const price = Number(it?.price ?? it?.priceAtPurchase ?? p?.price ?? 0);
      // const price = Number(it?.price ?? p?.price ?? 0 - p?.sale * 1000);
      const price =
        Number(it?.price ?? p?.price ?? 0) * (1 - (p?.sale ?? 0) / 100);

      const quantity = Number(it?.quantity ?? 0);
      const subtotal = Math.round(price * quantity * 100) / 100;
      // console.log("CO XUONG DAY DUOC KHONG", it?.subtotal)

      return {
        id: String(it._id),
        productId: p
          ? String(p._id)
          : Types.ObjectId.isValid(it.product)
            ? String(it.product)
            : null,
        productName: p?.name ?? 'Unknown Product',
        imageUrl: p?.imageUrl ?? '',
        price,
        priceAtPurchase: price,
        quantity,
        subtotal,
        vendor: p?.vendor ? String(p.vendor) : null,
      };
    });
    let vendorName = 'Unknown vendor';
    const firstVendorId = mappedItems.find((it) => it.vendor)?.vendor;
    if (firstVendorId) {
      const user = await UserModel.findById(firstVendorId)
        .select({ businessName: 1, name: 1, username: 1 })
        .lean()
        .exec();
      vendorName =
        (user as any)?.businessName ||
        (user as any)?.name ||
        (user as any)?.username ||
        'Unknown vendor';
    }

    // const computedTotal = mappedItems.reduce((s, it) => s + it.subtotal, 0);
    const computedTotal = mappedItems.reduce((s, it) => s + it.subtotal, 0);

    console.log('CO XUONG DAY DUOC ORDER', order);

    const storedTotal = Number(order.totalPrice ?? order.totalprice ?? 0);
    const totalPrice =
      storedTotal > 0 ? storedTotal : Math.round(computedTotal * 100) / 100;
    console.log('CO XUONG DAY DUOC KHONG', storedTotal);
    console.log('CO XUONG DAY DUOC KHONG', totalPrice);

    const customerAddress =
      order?.customer?.address ??
      order?.shippingAddress ??
      order?.address ??
      'Unknown';

    return res.json({
      id: String(order._id),
      status: String(order.status ?? '').toUpperCase(),
      cancelReason: order.cancelReason ?? null,
      orderDate: order.orderDate
        ? new Date(order.orderDate).toISOString()
        : null,
      totalPrice,
      vendorName,
      customerAddress,
      items: mappedItems.map(({ vendor, ...rest }) => rest),
    });
  } catch (err: any) {
    console.error(
      '[getCustomerOrderDetail] ERROR:',
      err?.name,
      err?.message,
      err?.stack,
    );
    return res.status(500).json({ error: 'Failed to load order' });
  }
}

// Cancel (only PENDING -> CANCELED)
export async function patchCustomerOrderStatus(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== 'CUSTOMER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const raw = (typeof req.body?.status === 'string' ? req.body.status : '')
      .trim()
      .toUpperCase();
    if (!raw) return res.status(400).json({ error: 'Missing status in body' });
    if (!ALLOWED_TARGET.has(raw)) {
      return res
        .status(400)
        .json({ error: `Invalid status: ${req.body?.status}` });
    }

    const reason = String(req.body?.reason ?? '').trim();

    const customerIdStr = (req.user as any).userId || (req.user as any).id;
    if (!customerIdStr || !Types.ObjectId.isValid(customerIdStr)) {
      return res.status(400).json({ error: 'Invalid customer id in token' });
    }
    const customer = new Types.ObjectId(customerIdStr);

    const updated = await OrderModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), customer, status: 'PENDING' },
      {
        $set: {
          status: 'CANCELED',
          ...(reason ? { cancelReason: `Customer Canceled: ${reason}` } : {}),
        },
      },
      { new: true },
    ).lean();

    if (updated) {
      return res.json({
        ok: true,
        status: (updated as any).status,
        cancelReason: (updated as any).cancelReason ?? null,
      });
    }

    return res.status(409).json({ error: 'Could not update order' });
  } catch (err) {
    console.error(
      '[patchCustomerOrderStatus] ERROR:',
      (err as any)?.message,
      err,
    );
    return res.status(500).json({ error: 'Failed to update status' });
  }
}

// -----------------------------
// Cart & Catalog (from dev)
// -----------------------------

// Get all items in the cart
export const getCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const carts = await getCustomerCart(userId);
    res.status(200).json({ carts });
  } catch (error) {
    console.error('Error fetching cart item:', error);
    res.status(500).json({
      message: 'Failed to fetch cart item.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Add item to cart
export const addToCart = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { itemId, quantity } = req.body;
    const { userId } = req.user!;

    const cartItems = await addItemToCart({
      customer: userId,
      product: itemId,
      quantity,
    });

    res.status(200).json({ message: 'Product added successfully.', cartItems });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      message: 'Failed to add to cart.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Update quantity of an item in cart
export const updateCartItem = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { itemId, quantity } = req.body;
    const { userId } = req.user!;

    // console.log(
    //   `check data in updateCart Item:\n userId:${userId} \nitemId: ${itemId},\n quantity: ${quantity}`,
    // );
    if (quantity <= 0) {
      return res
        .status(400)
        .json({ message: 'Quantity cannot be negative or equal 0' });
    }

    const updatedItem = await modifyItemCart({
      customerId: userId,
      itemId: itemId,
      quantity,
    });

    if (!updatedItem) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.status(200).json({
      message: 'Cart item updated successfully',
      cartItem: updatedItem,
    });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};
// Create order from cart items
export const createOrder = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const order = await createOrderFromItem(userId);
    console.log('Created order:', order);

    if (!order) {
      return res.status(500).json({
        message: 'Not available in stock.',
      });
    }
    return res
      .status(200)
      .json({ message: 'Create order successfully', order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Failed to create order.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Remove item from cart by cart item id
export const removeItemFromCart = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { productId } = req.params; // this is actually the cart item id according to dev usage
    const { userId } = req.user!;

    const cartItems: ICartItem[] = await getCustomerCartByObjectId(userId);
    const targetItem = cartItems.find((p) => p.id.toString() === productId);
    if (!targetItem) {
      return res
        .status(404)
        .json({ message: 'Item not found or access denied.' });
    }

    await deleteItemByProduct(userId, productId);

    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({
      message: 'Failed to remove cart item.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get customer basic info with profile picture
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const customer = await CustomerModel.findById(id).select('-password');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      customer: {
        id: customer._id,
        username: customer.username,
        email: customer.email,
        role: customer.role,
        name: customer.name,
        address: customer.address,
        profilePicture: customer.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      message: 'Failed to fetch customer.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, ...updateData } = req.body;

    // Fetch the current customer first
    const existingCustomer = await UserServices.findById(id);
    if (!existingCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    // If username is provided AND it's different, check uniqueness
    if (username && username !== existingCustomer.username) {
      const existingUser = await UserServices.usernameExists(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      (updateData as any).username = username;
    }

    const customer = await CustomerModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.status(200).json({
      customer: {
        id: customer._id,
        username: customer.username,
        email: customer.email,
        name: customer.name,
        address: customer.address,
        profilePicture: customer.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      message: 'Failed to update customer.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// -----------------------------
// Product
// -----------------------------

const toNumOrNull = (v: unknown): number | null => {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const nonNegative = (n: number | null) => (n !== null && n >= 0 ? n : null);

const validCategory = (v: unknown): v is ProductCategory =>
  typeof v === 'string' &&
  (Object.values(ProductCategory) as string[]).includes(v);

export const getAllProducts = async (req: Request, res: Response) => {
  const PAGE_SIZE = 4;
  try {
    // console.log(`check request: ${JSON.stringify(req.query)}`);
    // ----- read raw query -----
    const rawVendor = (req.query.vendor as string | undefined) ?? null;
    const rawMin = toNumOrNull(req.query.minPrice);
    const rawMax = toNumOrNull(req.query.maxPrice);
    const rawCategory = (req.query.category as string | undefined) ?? null;
    const rawKeyword =
      (req.query.keyword as string | undefined)?.trim() ?? null;
    const rawPage = toNumOrNull(req.query.page);
    const rawOrder = (req.query.order as string | undefined)?.toLowerCase(); // 'asc' | 'desc'

    // ----- validate numbers -----
    const minPrice = nonNegative(rawMin);
    const maxPrice = nonNegative(rawMax);

    // Reject if both present and min > max
    if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
      return res
        .status(400)
        .json({ error: 'minPrice is larger than maxPrice' });
    }

    // vendor must be non-empty string
    const vendor = rawVendor && rawVendor.trim().length > 0 ? rawVendor : null;

    // page must be >= 1 (default 1)
    const page = rawPage && rawPage >= 1 ? rawPage : 1;

    // category must be from enum (else ignore)
    const category =
      rawCategory && validCategory(rawCategory) ? rawCategory : null;

    // keyword empty => ignore
    const keyword = rawKeyword && rawKeyword.length > 0 ? rawKeyword : null;

    // order must be 'asc' or 'desc' (else no sorting)
    const priceOrder =
      rawOrder === 'asc' || rawOrder === 'desc'
        ? (rawOrder as 'asc' | 'desc')
        : null;

    // console.log(`check request query after validated: \n minPrice: ${minPrice}\n maxPrice: ${maxPrice}\n category: ${category} \n keyword: ${keyword} \n page: ${page}\n pageSize ${PAGE_SIZE} priceOrder: ${priceOrder}`)
    // ----- call service -----
    const result = await getProducts(
      { minPrice, maxPrice, category, keyword, vendor },
      { page, pageSize: PAGE_SIZE },
      { priceOrder },
    );

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({
      message: 'Failed to fetch products.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;
    const data = await getOneProduct(productId);
    if (!data) {
      return res
        .status(404)
        .json({ message: 'product or vendor information not found.' });
    }
    res.status(200).json({
      message: 'fetched successfully',
      product: data.product,
      vendor: data.vendor,
    });
  } catch (error) {
    console.error('Error fetching:', error);
    res.status(500).json({
      message: 'Failed to fetch.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getVendorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const vendor = await VendorModel.findById(id).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    res.status(200).json({
      vendor: {
        id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        role: vendor.role,
        businessName: vendor.businessName,
        businessAddress: vendor.businessAddress,
        profilePicture: vendor.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching vendor:', error);
    res.status(500).json({
      message: 'Failed to fetch vendor.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
