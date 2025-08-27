import { Request, Response } from 'express';
import { VendorModel } from '../models/Vendor';
import mongoose, { Types } from 'mongoose';
import OrderModel from '../models/Order';
import OrderItemModel from '../models/OrderItem';
import ProductModel from '../models/Product';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { OrderStatus } from '../models/OrderStatus';

// Fetch a vendor by ID (exclude password, include profile picture and business info)
export const getVendorById = async (req: Request, res: Response) => {
  try {
    const { vendorId } = req.params;

    const vendor = await VendorModel.findById(vendorId).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found.' });
    }

    res.status(200).json({
      vendor: {
        id: vendor._id,
        username: vendor.username,
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

// Helper: find all orderIds that contain products from this vendor (remove after Duy adds single-vendor orders)
async function findOrderIdsForVendor(
  vendorId: Types.ObjectId,
): Promise<string[]> {
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

// List all vendor-visible orders (only those containing this vendor’s products)
export async function getAllOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'VENDOR') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const vendorId = new Types.ObjectId(req.user.userId);

    // Find orders that include this vendor’s products
    const orderIds = await findOrderIdsForVendor(vendorId);
    if (orderIds.length === 0) return res.json([]);

    // Fetch orders, excluding those already rejected
    const orders = await OrderModel.find({
      _id: { $in: orderIds },
    })
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
export async function getOrderDetails(
  req: AuthenticatedRequest,
  res: Response,
) {
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
    const relevantItemExists = await OrderItemModel.exists({
      order: orderId,
    }).then(async (exists) => {
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
    });
    if (!relevantItemExists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Fetch order header
    const order: any = await OrderModel.findById(orderId)
      .populate({ path: 'customer', select: 'name address' })
      .lean()
      .exec();
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Fetch all items for this order
    const items = await OrderItemModel.find({ order: orderId })
      .select('product quantity price priceAtPurchase')
      .lean()
      .exec();

    // Fetch products and filter down to this vendor’s
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
      orderDate: order.orderDate
        ? new Date(order.orderDate).toISOString()
        : null,
      totalPrice,
      customerName: order.customer?.name ?? 'Unknown',
      customerAddress: order.customer?.address ?? 'Unknown',
      items: vendorItems,
      vendorSubtotal,
      vendorRejectReason: order.vendorRejectReason ?? null,
    });
  } catch (err) {
    console.error(
      '[vendor.getOrderDetails] ERROR:',
      (err as any)?.message,
      err,
    );
    return res.status(500).json({ error: 'Failed to load order' });
  }
}

// Helper: collect only this vendor’s items from an order
async function collectVendorItems(
  orderId: Types.ObjectId,
  vendorId: Types.ObjectId,
) {
  const items = await OrderItemModel.find({ order: orderId })
    .select('product quantity')
    .populate({
      path: 'product',
      select: '_id vendor name',
      match: { vendor: vendorId },
    })
    .lean();

  // Keep only this vendor’s products (change after Duy adds single-vendor orders)
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
    if (!req.user || req.user.role !== "VENDOR") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const orderId = new Types.ObjectId(id);
    const vendorId = new Types.ObjectId(req.user.userId);

    const actionRaw = String(req.body?.action ?? "").toUpperCase();
    const isAccept = actionRaw.startsWith("ACCEPT");
    const reason = String(req.body?.reason ?? "");

    const current = await OrderModel.findById(orderId).lean().exec();
    if (!current) return res.status(404).json({ error: "Order not found" });

    if (isAccept) {
      if ([OrderStatus.DELIVERED, OrderStatus.CANCELED].includes(current.status)) {
        return res.status(409).json({ error: `Order already ${current.status.toLowerCase()}` });
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
        return res.status(404).json({ error: "Order not found for this vendor" });
      }

      // Transaction: deduct stock and mark order ACTIVE
      const session = await mongoose.startSession();
      try {
        await session.withTransaction(async () => {
          for (const it of vendorItems) {
            const r = await ProductModel.updateOne(
              { _id: it.productId, vendor: vendorId, availableStock: { $gte: it.qty } },
              { $inc: { availableStock: -it.qty } },
              { session }
            );
            if (r.matchedCount === 0) {
              throw new Error(`INSUFFICIENT:${it.productName || String(it.productId)}`);
            }
          }
          await OrderModel.updateOne(
            { _id: orderId, status: OrderStatus.PENDING },
            { $set: { status: OrderStatus.ACTIVE }, $unset: { cancelReason: "" } },
            { session }
          );
        });

        return res.json({ ok: true, status: OrderStatus.ACTIVE, cancelReason: null });
      } catch (e: any) {
        if (e?.message?.startsWith("INSUFFICIENT:")) {
          const name = e.message.split("INSUFFICIENT:")[1] || "an item";
          return res.status(409).json({
            error: `Insufficient stock for ${name}.`,
            code: "INSUFFICIENT_STOCK",
            item: name,
          });
        }
        console.error("[accept txn] ERROR", e);
        return res.status(500).json({ error: "Failed to accept order" });
      } finally {
        session.endSession();
      }
    } else {
      if (current.status !== OrderStatus.PENDING) {
        return res.status(409).json({ error: `Cannot reject from ${current.status}` });
      }
      if (!reason) {
        return res.status(400).json({ error: "Cancel reason is required when rejecting" });
      }
      const updated = await OrderModel.findOneAndUpdate(
        { _id: orderId, status: OrderStatus.PENDING },
        { $set: { status: OrderStatus.CANCELED, cancelReason: reason } },
        { new: true }
      ).lean();
      if (!updated) return res.status(409).json({ error: "Could not update order" });

      return res.json({ ok: true, status: updated.status, cancelReason: updated.cancelReason ?? null });
    }
  } catch (err) {
    console.error("[vendor.updateStatus] ERROR:", (err as any)?.message, err);
    return res.status(500).json({ error: "Failed to update vendor decision" });
  }
}
