import { Request, Response } from 'express';
import { VendorModel } from '../models/Vendor';
import { Types } from "mongoose";
import OrderModel from "../models/Order";
import OrderItemModel from "../models/OrderItem";
import ProductModel from "../models/Product";
import { AuthenticatedRequest } from "../middleware/authMiddleware";
import { OrderStatus } from "../models/OrderStatus";

// Get vendor with profile picture
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

/**
 * Helper: collect orderIds that include at least one item belonging to this vendor
 */
async function findOrderIdsForVendor(vendorId: Types.ObjectId): Promise<string[]> {
  // Get all items of orders; only keep those whose product belongs to this vendor
  const items = await OrderItemModel.find({})
    .select("order product")
    .populate({
      path: "product",
      select: "_id vendor",
      match: { vendor: vendorId },
    })
    .lean()
    .exec();

  const ids = new Set<string>();
  for (const it of items) {
    // populated product will be null if vendor doesn't match
    if ((it as any).product) {
      ids.add(String((it as any).order));
    }
  }
  return Array.from(ids);
}

/**
 * GET /api/vendor/orders
 * Returns vendor-visible orders that are NOT REJECTED (by vendor)
 * (i.e., vendorDecision in ["PENDING", "ACCEPTED"])
 */
export async function getAllOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== "VENDOR") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const vendorId = new Types.ObjectId(req.user.userId);

    // Which orders contain this vendor's products?
    const orderIds = await findOrderIdsForVendor(vendorId);
    if (orderIds.length === 0) return res.json([]);

    // Exclude vendor-rejected orders
    const orders = await OrderModel.find({
      _id: { $in: orderIds },
      status: { $ne: OrderStatus.CANCELED },
    })
      .populate({ path: "customer", select: "name address" })
      .sort({ orderDate: -1 })
      .lean()
      .exec();

    const dto = orders.map((o: any) => ({
      id: String(o._id),
      status: String(o.status ?? "").toUpperCase(),           // ACTIVE | DELIVERED | CANCELED
      vendorDecision: String(o.vendorDecision ?? "").toUpperCase(), // PENDING | ACCEPTED
      totalPrice: Number(o.totalPrice ?? o.totalprice ?? 0),
      customerName: o.customer?.name ?? "Unknown",
    }));

    return res.json(dto);
  } catch (err) {
    console.error("[vendor.getAllOrders] ERROR:", (err as any)?.message, err);
    return res.status(500).json({ error: "Failed to list vendor orders" });
  }
}

/**
 * GET /api/vendor/orders/:id
 * Returns details for a single order that includes at least one item for this vendor.
 * Items are filtered to ONLY this vendor's products.
 */
export async function getOrderDetails(req: AuthenticatedRequest, res: Response) {
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

    // Verify this order actually contains products owned by this vendor
    const relevantItemExists = await OrderItemModel.exists({ order: orderId }).then(async (exists) => {
      if (!exists) return false;
      // at least one item whose product.vendor = vendorId
      const items = await OrderItemModel.find({ order: orderId })
        .select("product")
        .populate({
          path: "product",
          select: "_id vendor",
          match: { vendor: vendorId },
        })
        .lean();
      return items.some((it: any) => !!it.product);
    });
    if (!relevantItemExists) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Load the order header
    const order: any = await OrderModel.findById(orderId)
      .populate({ path: "customer", select: "name address" })
      .lean()
      .exec();
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Load items for this order
    const items = await OrderItemModel.find({ order: orderId })
      .select("product quantity price priceAtPurchase")
      .lean()
      .exec();

    // Fetch products, then filter to ONLY this vendor's products
    const validProductIds = Array.from(
      new Set(
        items
          .map((it: any) => it.product)
          .filter((pid: any) => pid && Types.ObjectId.isValid(pid))
          .map((pid: any) => String(pid))
      )
    ).map((x) => new Types.ObjectId(x));

    const products = validProductIds.length
      ? await ProductModel.find({ _id: { $in: validProductIds } })
        .select("_id name imageUrl price vendor")
        .lean()
        .exec()
      : [];

    const productMap = new Map(products.map((p: any) => [String(p._id), p]));
    const vendorItems = items
      .map((it: any) => {
        const p = productMap.get(String(it.product));
        if (!p || String(p.vendor) !== String(vendorId)) return null; // keep vendor-only
        const price = Number(it?.price ?? it?.priceAtPurchase ?? p?.price ?? 0);
        const quantity = Number(it?.quantity ?? 0);
        const subtotal = Math.round(price * quantity * 100) / 100;
        return {
          id: String(it._id),
          productId: String(p._id),
          productName: p?.name ?? "Unknown Product",
          imageUrl: p?.imageUrl ?? "",
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
      storedTotal > 0 ? storedTotal : Math.round(vendorSubtotal * 100) / 100; // fallback, though vendors usually see full order total

    // DTO
    return res.json({
      id: String(order._id),
      status: String(order.status ?? "").toUpperCase(),
      vendorDecision: String(order.vendorDecision ?? "").toUpperCase(), // PENDING | ACCEPTED | REJECTED
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString() : null,
      totalPrice,
      customerName: order.customer?.name ?? "Unknown",
      customerAddress: order.customer?.address ?? "Unknown",
      items: vendorItems,
      vendorSubtotal, // convenient for vendor UI
      vendorRejectReason: order.vendorRejectReason ?? null,
    });
  } catch (err) {
    console.error("[vendor.getOrderDetails] ERROR:", (err as any)?.message, err);
    return res.status(500).json({ error: "Failed to load order" });
  }
}

/**
 * PATCH /api/vendor/orders/:id/status
 * Body: { action: "ACCEPT" | "REJECT", reason?: string }
 * Accept: sets vendorDecision = ACCEPTED
 * Reject: sets vendorDecision = REJECTED and records vendorRejectReason
 *
 * NOTE: Does NOT touch Order.status (ACTIVE/DELIVERED/CANCELED),
 * so your shipper flow remains unchanged.
 */
export async function updateStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== "VENDOR") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const actionRaw = String(req.body?.action ?? "").toUpperCase();
    const reason = String(req.body?.reason ?? "");

    if (!["ACCEPT", "REJECT", "ACCEPTED", "REJECTED"].includes(actionRaw)) {
      return res.status(400).json({ error: "Invalid action" });
    }
    const isAccept = actionRaw.startsWith('ACCEPT');

    const vendorId = new Types.ObjectId(req.user.userId);
    const orderId = new Types.ObjectId(id);

    // Ensure the vendor is part of this order (has at least one item in it)
    const items = await OrderItemModel.find({ order: orderId })
      .select("product")
      .populate({ path: "product", select: "_id vendor", match: { vendor: vendorId } })
      .lean()
      .exec();
    const isInOrder = items.some((it: any) => !!it.product);
    if (!isInOrder) return res.status(404).json({ error: "Order not found" });

    const current = await OrderModel.findById(orderId).lean().exec();
    if (!current) return res.status(404).json({ error: 'Order not found' });

    if (isAccept) {
      if (current.status === OrderStatus.DELIVERED || current.status === OrderStatus.CANCELED) {
        return res.status(409).json({ error: `Order already ${current.status.toLowerCase()}` });
      }
      // If already ACTIVE, return OK idempotently
      if (current.status === OrderStatus.ACTIVE) {
        return res.json({ ok: true, status: OrderStatus.ACTIVE, cancelReason: null });
      }
      if (current.status !== OrderStatus.PENDING) {
        return res.status(409).json({ error: `Cannot accept from ${current.status}` });
      }
    } else {
      // Reject path
      if (current.status !== OrderStatus.PENDING) {
        return res.status(409).json({ error: `Cannot reject from ${current.status}` });
      }
      if (!reason) {
        return res.status(400).json({ error: 'Cancel reason is required when rejecting' });
      }
    }

    const update = isAccept
      ? { $set: { status: OrderStatus.ACTIVE }, $unset: { cancelReason: '' } }
      : { $set: { status: OrderStatus.CANCELED, cancelReason: reason } };

    const updated = await OrderModel.findOneAndUpdate(
      { _id: orderId },
      update,
      { new: true }
    )
      .lean()
      .exec();

    if (!updated) {
      return res.status(409).json({ error: 'Could not update order' });
    }

    return res.json({
      ok: true,
      status: updated.status,
      cancelReason: updated.cancelReason ?? null,
    });
  } catch (err) {
    console.error("[vendor.updateStatus] ERROR:", (err as any)?.message, err);
    return res.status(500).json({ error: "Failed to update vendor decision" });
  }
}