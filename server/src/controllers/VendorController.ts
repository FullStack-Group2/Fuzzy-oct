import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';

import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { VendorModel } from '../models/Vendor';
import OrderModel from '../models/Order';
import OrderItemModel from '../models/OrderItem';
import { ProductModel, IProduct } from '../models/Product';
import { OrderStatus } from '../models/OrderStatus';

import {
  createProduct,
  getOneProduct,
  getVendorProducts,
  editProduct,
  deleteProduct,
  getVendorOrders,
  getVendorOrderHistory,
  getProductSalesCount,
} from '../services/VendorService';
import { UserServices } from '../services/UserServices';

/* ------------------------------------------------------------------ */
/* Vendor profile (shared)                                             */
/* ------------------------------------------------------------------ */

// Fetch a vendor by ID (exclude password, include profile picture and business info)
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

/* ------------------------------------------------------------------ */
/* HEAD branch: Vendor-facing order visibility & decisions             */
/* (multi-vendor aware; uses OrderStatus and stock adjustments)        */
/* ------------------------------------------------------------------ */

// Helper: find all orderIds that contain products from this vendor
async function findOrderIdsForVendor(vendorId: Types.ObjectId): Promise<string[]> {
  const items = await OrderItemModel.find({})
    .select('order product')
    .populate({
      path: 'product',
      select: '_id vendor',
      match: { vendor: vendorId },
    })
    .lean()
    .exec();

  const ids = new Set<string>();
  for (const it of items) {
    if ((it as any).product) {
      ids.add(String((it as any).order));
    }
  }
  return Array.from(ids);
}

const ALLOWED = new Set(['ACTIVE', 'DELIVERED', 'CANCELED']);

function parseStatusFilter(q: unknown): string[] | undefined {
  if (!q) return;
  const raw = Array.isArray(q) ? q : String(q).split(',');
  const list = raw
    .map(s => String(s).trim().toUpperCase())
    .filter(s => ALLOWED.has(s));
  return list.length ? list : undefined;
}

// List all vendor-visible orders (only those containing this vendor’s products)
export async function getAllOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const vendorId = new Types.ObjectId(req.user.userId);    

    const orderIds = await findOrderIdsForVendor(vendorId);
    if (orderIds.length === 0) return res.json([]);

    const statuses = parseStatusFilter(req.query.status);

    const match: any = { _id: { $in: orderIds } };
    if (statuses) match.status = { $in: statuses };

    const orders = await OrderModel.find(match)
      .populate({ path: 'customer', select: 'name address' })
      .sort({ orderDate: -1 })
      .lean()
      .exec();

    const dto = orders.map((o: any) => ({
      id: String(o._id),
      status: String(o.status ?? '').toUpperCase(),
      totalPrice: Number(o.totalPrice ?? o.totalprice ?? 0),
      customerName: o.customer?.name ?? 'Unknown',
    }));

    return res.json(dto);
  } catch (err) {
    console.error('[vendor.getAllOrders] ERROR:', (err as any)?.message, err);
    return res.status(500).json({ error: 'Failed to list vendor orders' });
  }
}

// Get details of a single order, filtered to only this vendor’s items
export async function getOrderDetails(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const orderId = new Types.ObjectId(id);
    const vendorId = new Types.ObjectId(req.user.userId);

    // Ensure the order actually contains this vendor’s products
    const relevantItemExists = await OrderItemModel.exists({ order: orderId }).then(
      async (exists) => {
        if (!exists) return false;
        const items = await OrderItemModel.find({ order: orderId })
          .select('product')
          .populate({
            path: 'product',
            select: '_id vendor',
            match: { vendor: vendorId },
          })
          .lean();
        return items.some((it: any) => !!it.product);
      },
    );
    if (!relevantItemExists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order: any = await OrderModel.findById(orderId)
      .populate({ path: 'customer', select: 'name address' })
      .lean()
      .exec();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    const items = await OrderItemModel.find({ order: orderId })
      .select('product quantity price priceAtPurchase')
      .lean()
      .exec();

    const validProductIds = Array.from(
      new Set(
        items
          .map((it: any) => it.product)
          .filter((pid: any) => pid && Types.ObjectId.isValid(pid))
          .map((pid: any) => String(pid)),
      ),
    ).map((x) => new Types.ObjectId(x));

    const products = validProductIds.length
      ? await ProductModel.find({ _id: { $in: validProductIds } })
          .select('_id name imageUrl price vendor')
          .lean()
          .exec()
      : [];

    const productMap = new Map(products.map((p: any) => [String(p._id), p]));
    const vendorItems = items
      .map((it: any) => {
        const p = productMap.get(String(it.product));
        if (!p || String(p.vendor) !== String(vendorId)) return null;
        const price = Number(it?.price ?? it?.priceAtPurchase ?? p?.price ?? 0);
        const quantity = Number(it?.quantity ?? 0);
        const subtotal = Math.round(price * quantity * 100) / 100;
        return {
          id: String(it._id),
          productId: String(p._id),
          productName: p?.name ?? 'Unknown Product',
          imageUrl: p?.imageUrl ?? '',
          price,
          priceAtPurchase: price,
          quantity,
          subtotal,
        };
      })
      .filter(Boolean) as any[];

    const vendorSubtotal = vendorItems.reduce((s, it) => s + it.subtotal, 0);
    const storedTotal = Number(order.totalprice ?? order.totalPrice ?? 0);
    const totalPrice =
      storedTotal > 0 ? storedTotal : Math.round(vendorSubtotal * 100) / 100;

    return res.json({
      id: String(order._id),
      status: String(order.status ?? '').toUpperCase(),
      vendorDecision: String(order.vendorDecision ?? '').toUpperCase(),
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString() : null,
      totalPrice,
      customerName: order.customer?.name ?? 'Unknown',
      customerAddress: order.customer?.address ?? 'Unknown',
      items: vendorItems,
      vendorSubtotal,
      vendorRejectReason: order.vendorRejectReason ?? null,
    });
  } catch (err) {
    console.error('[vendor.getOrderDetails] ERROR:', (err as any)?.message, err);
    return res.status(500).json({ error: 'Failed to load order' });
  }
}

// Helper: collect only this vendor’s items from an order
async function collectVendorItems(orderId: Types.ObjectId, vendorId: Types.ObjectId) {
  const items = await OrderItemModel.find({ order: orderId })
    .select('product quantity')
    .populate({
      path: 'product',
      select: '_id vendor name',
      match: { vendor: vendorId },
    })
    .lean();

  const vendorItems = items
    .filter((it: any) => !!it.product)
    .map((it: any) => ({
      productId: it.product._id as Types.ObjectId,
      productName: it.product.name as string,
      qty: Number(it.quantity) || 0,
    }))
    .filter((x) => x.qty > 0);

  return vendorItems;
}

// Update vendor decision on an order (ACCEPT or REJECT)
export async function updateStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const orderId = new Types.ObjectId(id);
    const vendorId = new Types.ObjectId(req.user.userId);

    const actionRaw = String(req.body?.action ?? '').toUpperCase();
    const isAccept = actionRaw.startsWith('ACCEPT');
    const reason = String(req.body?.reason ?? '');

    const current = await OrderModel.findById(orderId).lean().exec();
    if (!current) return res.status(404).json({ error: 'Order not found' });

    if (isAccept) {
      if ([OrderStatus.DELIVERED, OrderStatus.CANCELED].includes(current.status)) {
        return res
          .status(409)
          .json({ error: `Order already ${current.status.toLowerCase()}` });
      }
      if (current.status === OrderStatus.ACTIVE) {
        return res.json({ ok: true, status: OrderStatus.ACTIVE, cancelReason: null });
      }
      if (current.status !== OrderStatus.PENDING) {
        return res.status(409).json({ error: `Cannot accept from ${current.status}` });
      }

      // Make sure vendor is actually part of this order
      const vendorItems = await collectVendorItems(orderId, vendorId);
      if (vendorItems.length === 0) {
        return res.status(404).json({ error: 'Order not found for this vendor' });
      }

      // Transaction: deduct stock and mark order ACTIVE
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          for (const it of vendorItems) {
            const r = await ProductModel.updateOne(
              { _id: it.productId, vendor: vendorId, availableStock: { $gte: it.qty } },
              { $inc: { availableStock: -it.qty } },
              { session },
            );
            if (r.matchedCount === 0) {
              throw new Error(`INSUFFICIENT:${it.productName || String(it.productId)}`);
            }
          }
          await OrderModel.updateOne(
            { _id: orderId, status: OrderStatus.PENDING },
            { $set: { status: OrderStatus.ACTIVE }, $unset: { cancelReason: '' } },
            { session },
          );
        });

        return res.json({ ok: true, status: OrderStatus.ACTIVE, cancelReason: null });
      } catch (e: any) {
        if (e?.message?.startsWith('INSUFFICIENT:')) {
          const name = e.message.split('INSUFFICIENT:')[1] || 'an item';
          return res.status(409).json({
            error: `Insufficient stock for ${name}.`,
            code: 'INSUFFICIENT_STOCK',
            item: name,
          });
        }
        console.error('[accept txn] ERROR', e);
        return res.status(500).json({ error: 'Failed to accept order' });
      } finally {
        session.endSession();
      }
    } else {
      if (current.status !== OrderStatus.PENDING) {
        return res.status(409).json({ error: `Cannot reject from ${current.status}` });
      }
      if (!reason) {
        return res
          .status(400)
          .json({ error: 'Cancel reason is required when rejecting' });
      }
      const updated = await OrderModel.findOneAndUpdate(
        { _id: orderId, status: OrderStatus.PENDING },
        { $set: { status: OrderStatus.CANCELED, cancelReason: `Vendor Canceled: ${reason}` } },
        { new: true },
      ).lean();
      if (!updated) return res.status(409).json({ error: 'Could not update order' });

      return res.json({
        ok: true,
        status: updated.status,
        cancelReason: updated.cancelReason ?? null,
      });
    }
  } catch (err) {
    console.error('[vendor.updateStatus] ERROR:', (err as any)?.message, err);
    return res.status(500).json({ error: 'Failed to update vendor decision' });
  }
}

/* ------------------------------------------------------------------ */
/* Teammate (dev branch): product CRUD + vendor analytics              */
/* ------------------------------------------------------------------ */

// Add a new product
export const addProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.user!;
    const { name, price, description, imageUrl, category, availableStock } =
      req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !availableStock) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create new product
    const newProduct = await createProduct({
      name: name.trim(),
      price,
      description: description.trim(),
      imageUrl: (imageUrl || '').trim(),
      category,
      availableStock,
      vendor: new Types.ObjectId(userId),
    });

    res
      .status(201)
      .json({ message: 'Product added successfully.', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      message: 'Failed to add product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all vendor's products
export const getAllProducts = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.user!;
    const products = await getVendorProducts(userId);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: 'Failed to fetch products.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const editProductDetails = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.user!;
    const { productId } = req.params;
    const updateData = req.body;

    // Owner validate
    const products: IProduct[] = await getVendorProducts(userId);
    const targetProduct = products.find((p) => p._id.toString() === productId);

    if (!targetProduct) {
      return res
        .status(404)
        .json({ message: 'Product not found or access denied.' });
    }

    const updatedProduct = await editProduct(productId, updateData);
    res.status(200).json({
      message: 'Product updated successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      message: 'Failed to update product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const deleteOneProduct = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { userId } = req.user!;
    const { productId } = req.params;

    // Owner validate
    const products: IProduct[] = await getVendorProducts(userId);
    const targetProduct = products.find((p) => p._id.toString() === productId);

    if (!targetProduct) {
      return res
        .status(404)
        .json({ message: 'Product not found or access denied.' });
    }

    await deleteProduct(productId);
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      message: 'Failed to delete product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getActiveOrders = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { vendorId } = req.params;
    const orders = await getVendorOrders(vendorId);
    res
      .status(200)
      .json({ message: 'Active orders fetched successfully.', orders });
  } catch (error) {
    console.error('Error fetching active orders:', error);
    res.status(500).json({
      message: 'Failed to fetch active orders.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getOrderHistory = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { vendorId } = req.params;
    const orders = await getVendorOrderHistory(vendorId);
    res
      .status(200)
      .json({ message: 'Past orders fetched successfully.', orders });
  } catch (error) {
    console.error('Error fetching past orders:', error);
    res.status(500).json({
      message: 'Failed to fetch past orders.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProductSales = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const { productId } = req.params;
    const totalSold = await getProductSalesCount(productId);
    res
      .status(200)
      .json({ message: 'Product sales fetched successfully.', totalSold });
  } catch (error) {
    console.error('Error fetching product sales:', error);
    res.status(500).json({
      message: 'Failed to fetch product sales.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const product = await getOneProduct(productId);
    res.status(200).json({ message: 'Product fetched successfully', product });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      message: 'Failed to fetch product.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const productInventoryDecrease = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { amount } = req.body;
    const parsedAmount = Number(amount);

    console.log(parsedAmount)
    
    if (isNaN(parsedAmount)) {
      return res.status(400).json({ message: 'Invalid amount provided.' });
    }

    if (!productId || !amount) {
      return res.status(400).json({ message: 'Product ID and amount are required.' });
    }

    const product = await getOneProduct(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    if (product.availableStock < amount) {
      return res.status(400).json({ message: 'Insufficient inventory.' });
    }

    const updatedProduct = await editProduct(productId, {
      availableStock: product.availableStock - amount,
    });

    res.status(200).json({
      message: 'Product inventory decreased successfully.',
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error decreasing product inventory:', error);
    res.status(500).json({
      message: 'Failed to decrease product inventory.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, businessName, businessAddress, ...updateData } = req.body;

    // Check username uniqueness
    if (username) {
      const existingUser = await UserServices.usernameExists(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      updateData.username = username;
    }

    // Check businessName uniqueness
    if (businessName) {
      const existingVendor = await VendorModel.findOne({ businessName });
      if (existingVendor && existingVendor.id.toString() !== id) {
        return res
          .status(409)
          .json({ message: 'Business name already exists.' });
      }
      updateData.businessName = businessName;
    }

    // Check businessAddress uniqueness
    if (businessAddress) {
      const existingVendor = await VendorModel.findOne({ businessAddress });
      if (existingVendor && existingVendor.id.toString() !== id) {
        return res
          .status(409)
          .json({ message: 'Business address already exists.' });
      }
      updateData.businessAddress = businessAddress;
    }

    const vendor = await VendorModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    res.status(200).json({
      vendor: {
        id: vendor._id,
        username: vendor.username,
        email: vendor.email,
        businessName: vendor.businessName,
        businessAddress: vendor.businessAddress,
        profilePicture: vendor.profilePicture,
        role: vendor.role,
      },
    });
  } catch (error) {
    console.error('Error updating vendor:', error);
    res.status(500).json({
      message: 'Failed to update vendor.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
