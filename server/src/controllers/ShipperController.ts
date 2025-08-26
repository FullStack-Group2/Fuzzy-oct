// shipper.controller.ts
import { Request, Response } from 'express';
import OrderModel from '../models/Order';
import OrderItemModel from '../models/OrderItem';
import ProductModel from '../models/Product';
import { Types } from 'mongoose';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const ALLOWED_TARGET = ['DELIVERED', 'CANCELED'] as const;
type AllowedTarget = (typeof ALLOWED_TARGET)[number];

/**
 * GET /api/shipper/orders
 * Returns ACTIVE orders for the current shipper's distributionHub
 */
export async function listActiveOrders(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    // AuthZ
    if (!req.user || req.user.role !== 'SHIPPER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const hubIdStr =
      req.user.hubId ||
      (typeof req.query.hubId === 'string' ? req.query.hubId : undefined); // optional dev fallback
    if (!hubIdStr) return res.status(400).json({ error: 'hubId required' });
    if (!Types.ObjectId.isValid(hubIdStr))
      return res.status(400).json({ error: 'hubId invalid' });

    const hubId = new Types.ObjectId(hubIdStr);

    // Only ACTIVE, only this hub
    const orders = await OrderModel.find({ distributionHub: hubId, status: 'ACTIVE' })
      .populate({ path: 'customer', select: 'name address' })
      .lean()
      .exec();

    const dto = orders.map((o) => ({
      id: String(o._id),
      status: String(o.status ?? '').toUpperCase(),
      totalPrice: Number((o as any).totalPrice ?? (o as any).totalprice ?? 0),
      customerName: (o as any).customer?.name ?? 'Unknown',
    }));

    return res.json(dto);
  } catch (err) {
    console.error('[listActiveOrders] ERROR:', (err as any)?.message, err);
    return res.status(500).json({ error: 'Failed to list orders' });
  }
}

export async function getOrderDetail(req: AuthenticatedRequest, res: Response) {

  try {
    if (!req.user || req.user.role !== 'SHIPPER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id))
      return res.status(400).json({ error: 'Invalid order id' });

    const orderId = new Types.ObjectId(id);

    const hubIdStr = req.user.hubId;
    if (!hubIdStr || !Types.ObjectId.isValid(hubIdStr)) {
      return res.status(400).json({ error: 'Invalid hub in token' });
    }
    const hubId = new Types.ObjectId(hubIdStr);

    // Only ACTIVE and only this hub
    const order: any = await OrderModel.findOne({
      _id: orderId,
      distributionHub: hubId,
      status: 'ACTIVE',
    })
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
          .map((it) => it.product)
          .filter((pid: any) => pid && Types.ObjectId.isValid(pid))
          .map((pid: any) => String(pid)),
      ),
    ).map((id) => new Types.ObjectId(id));

    const products = validProductIds.length
      ? await ProductModel.find({ _id: { $in: validProductIds } })
          .select('name imageUrl price')
          .lean()
          .exec()
      : [];

    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const mappedItems = items.map((it: any) => {
      const p = productMap.get(String(it.product));
      const price = Number(it?.price ?? it?.priceAtPurchase ?? p?.price ?? 0);
      const quantity = Number(it?.quantity ?? 0);
      const subtotal = Math.round(price * quantity * 100) / 100;
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
      };
    });

    const computedTotal = mappedItems.reduce((s, it) => s + it.subtotal, 0);
    const storedTotal = Number(order.totalPrice ?? order.totalprice ?? 0);
    const totalPrice =
      storedTotal > 0 ? storedTotal : Math.round(computedTotal * 100) / 100;

    return res.json({
      id: String(order._id),
      status: String(order.status ?? '').toUpperCase(),
      cancelReason: order.cancelReason ?? null,
      orderDate: order.orderDate
        ? new Date(order.orderDate).toISOString()
        : null,
      totalPrice,
      hubId: String(order.distributionHub),
      customerName: order.customer?.name ?? 'Unknown',
      customerAddress: order.customer?.address ?? 'Unknown',
      items: mappedItems,
    });
  } catch (err: any) {
    console.error(
      '[getOrderDetail] ERROR:',
      err?.name,
      err?.message,
      err?.stack,
    );
    return res.status(500).json({ error: 'Failed to load order' });
  }
}

export async function patchOrderStatus(
  req: AuthenticatedRequest,
  res: Response,
) {
   try {
    if (!req.user || req.user.role !== "SHIPPER") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid order id" });

    const desired = String(req.body?.status ?? "").toUpperCase();
    if (!ALLOWED_TARGET.includes(desired as AllowedTarget)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const reason = String(req.body?.reason ?? "").trim();
    if (desired === "CANCELED" && !reason) {
      return res.status(400).json({ error: "Cancel reason is required" });
    }

    const hubIdStr = req.user.hubId;
    if (!hubIdStr || !Types.ObjectId.isValid(hubIdStr)) {
      return res.status(400).json({ error: "Invalid hub in token" });
    }
    const hubId = new Types.ObjectId(hubIdStr);

    const update =
      desired === "CANCELED"
        ? { $set: { status: "CANCELED", cancelReason: reason } }
        : { $set: { status: "DELIVERED" }, $unset: { cancelReason: 1 } };

    const updated = await OrderModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), distributionHub: hubId, status: "ACTIVE" },
      update,
      { new: true } // return post-update doc
    ).lean();

    if (updated) return res.json({ ok: true, status: updated.status, cancelReason: updated.cancelReason ?? null });

    // Diagnose
    const exists = await OrderModel.exists({ _id: id });
    if (!exists) return res.status(404).json({ error: "Order not found" });

    const inThisHub = await OrderModel.exists({ _id: id, distributionHub: hubId });
    if (!inThisHub) return res.status(403).json({ error: "Not allowed to update this order" });

    const notActive = await OrderModel.exists({ _id: id, distributionHub: hubId, status: { $ne: "ACTIVE" } });
    if (notActive) return res.status(409).json({ error: "Order is not ACTIVE" });

    return res.status(409).json({ error: "Could not update order" });
  } catch (err) {
    console.error('[patchOrderStatus] ERROR:', (err as any)?.message, err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}
