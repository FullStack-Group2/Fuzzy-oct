// shipper.controller.ts
import { Request, Response } from "express";
import OrderModel from "../models/Order";
import OrderItemModel from "../models/OrderItem";
import ProductModel from "../models/Product";
import { Types } from "mongoose";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const ALLOWED_TARGET = ["DELIVERED", "CANCELED"] as const;
type AllowedTarget = (typeof ALLOWED_TARGET)[number];

/**
 * GET /api/shipper/orders
 * Returns ACTIVE orders for the current shipper's distributionHub
 */
export async function listActiveOrders(req: Request, res: Response) {
  try {
    const rawHubId =
      (req as any).user?.hubId ??
      (typeof req.query.hubId === "string" ? req.query.hubId : undefined); // dev fallback

    if (!rawHubId) return res.status(400).json({ error: "hubId required" });
    if (!Types.ObjectId.isValid(rawHubId)) {
      return res.status(400).json({ error: "hubId invalid" });
    }
    const hubId = new Types.ObjectId(rawHubId);

    const orders = await OrderModel
      .find({ distributionHub: hubId, status: "ACTIVE" })
      .populate({ path: "customer", select: "name address" })
      .lean();

    if (!orders.length) {
      return res.json([]); // keep prod behavior
    }

    const orderIds: Types.ObjectId[] = orders.map(o => new Types.ObjectId(o.id));
    const items = await OrderItemModel.find({ order: { $in: orderIds } })
      .populate({ path: "product", select: "name imageUrl" })
      .lean();

    const itemsByOrder = new Map<string, any[]>();
    for (const it of items) {
      const k = String((it as any).order);
      if (!itemsByOrder.has(k)) itemsByOrder.set(k, []);
      itemsByOrder.get(k)!.push(it);
    }

    const dto = orders.map(o => ({
      id: String(o._id),
      status: String(o.status ?? "").toUpperCase(),
      // support both "totalprice" and "totalPrice" field names
      totalPrice: Number((o as any).totalprice ?? (o as any).totalPrice ?? 0),
      customerName: (o as any).customer?.name ?? "Unknown",
    }));

    return res.json(dto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list orders" });
  }
}

/**
 * GET /api/shipper/orders/:id
 * Returns details for a single order in the shipper’s hub
 */
/*
export async function getOrderDetail(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const order: any = await OrderModel
      .findById(id)
      .populate({ path: "customer", select: "name address" })
      .populate({ path: "orderItems", populate: { path: "product", select: "name imageUrl" } })
      .lean();

    if (!order) return res.status(404).json({ error: "Order not found" });

    const hubId = (req as any).user?.hubId as string | undefined;
    if (hubId && String(order.distributionHub) !== String(hubId)) {
      return res.status(403).json({ error: "Not allowed to view this order" });
    }

    const items =
      order.orderItems?.map((it: any) => {
        const subtotal = Math.round(it.priceAtPurchase * it.quantity * 100) / 100;
        return {
          id: String(it._id),
          productName: it.product?.name ?? "Unknown Product",
          imageUrl: it.product?.imageUrl ?? "",
          priceAtPurchase: it.priceAtPurchase,
          quantity: it.quantity,
          subtotal,
        };
      }) ?? [];

    const total = items.reduce((sum: number, it: any) => sum + it.subtotal, 0);

    const dto = {
      id: String(order._id),
      status: order.status, // uppercase
      orderDate: new Date(order.orderDate).toISOString(),
      totalPrice: Math.round(total * 100) / 100,
      hubId: String(order.distributionHub),
      customerName: order.customer?.name ?? "Unknown",
      customerAddress: order.customer?.address ?? "Unknown",
      items,
    };

    res.json(dto);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load order" });
  }
}
*/

export async function getOrderDetail(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    
    const orderId = new Types.ObjectId(id);

    const hubIdStr = req.user?.hubId;
    const hubFilter =
      hubIdStr && Types.ObjectId.isValid(hubIdStr)
        ? { distributionHub: new Types.ObjectId(hubIdStr) }
        : {};

        
    // 1) Order header (scoped to hub)
    const order: any = await OrderModel.findOne({ _id: orderId, ...hubFilter })
      .populate({ path: "customer", select: "name address" })
      .lean()
      .exec();
      console.log(5);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // 2) Items (no populate)
    const items = await OrderItemModel.find({ order: orderId })
      .select("product quantity price priceAtPurchase") // adjust if your fields differ
      .lean()
      .exec();
    // 3) Fetch products only for valid ObjectIds
    const validProductIds = Array.from(
      new Set(
        items
          .map(it => it.product)
          .filter((pid: any) => pid && Types.ObjectId.isValid(pid))
          .map((pid: any) => String(pid))
      )

    ).map(id => new Types.ObjectId(id));
    const products = validProductIds.length
      ? await ProductModel.find({ _id: { $in: validProductIds } })
          .select("name imageUrl price")
          .lean()
          .exec()
      : [];
    const productMap = new Map(products.map(p => [String(p._id), p]));
    // 4) Map + totals
    const mappedItems = items.map((it: any) => {
      const p = productMap.get(String(it.product));
      const price = Number(it?.price ?? it?.priceAtPurchase ?? p?.price ?? 0);
      const quantity = Number(it?.quantity ?? 0);
      const subtotal = Math.round(price * quantity * 100) / 100;
      return {
        id: String(it._id),
        productId: p ? String(p.id) : (Types.ObjectId.isValid(it.product) ? String(it.product) : null),
        productName: p?.name ?? "Unknown Product",
        imageUrl: p?.imageUrl ?? "",
        price,
        priceAtPurchase: price,
        quantity,
        subtotal,
      };
    });
    const computedTotal = mappedItems.reduce((s, it) => s + it.subtotal, 0);
    const storedTotal = Number(order.totalprice ?? order.totalPrice ?? 0);
    const totalPrice =
      storedTotal > 0 ? storedTotal : Math.round(computedTotal * 100) / 100;
    // 5) Response DTO
    return res.json({
      id: String(order._id),
      status: String(order.status ?? "").toUpperCase(),
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString() : null,
      totalPrice,
      hubId: String(order.distributionHub),
      customerName: order.customer?.name ?? "Unknown",
      customerAddress: order.customer?.address ?? "Unknown",
      items: mappedItems,
    });
  } catch (err: any) {
    console.error("[getOrderDetail] ERROR:", err?.name, err?.message, err?.stack);
    return res.status(500).json({ error: "Failed to load order" });
  }
}


/**
 * PATCH /api/shipper/orders/:id/status
 * Body: { status: 'DELIVERED' | 'CANCELED', reason?: string }
 * Only ACTIVE → (DELIVERED|CANCELED)
 */
/*
export async function patchOrderStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const desired = String((req.body as any)?.status || "");

    if (!ALLOWED_TARGET.includes(desired as AllowedTarget)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order: any = await OrderModel.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.status !== "ACTIVE") {
      return res.status(409).json({ error: "Order is not ACTIVE" });
    }

    const hubId = (req as any).user?.hubId as string | undefined;
    if (hubId && String(order.distributionHub) !== String(hubId)) {
      return res.status(403).json({ error: "Not allowed to update this order" });
    }

    order.status = desired; // store uppercase
    await order.save();

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update status" });
  }
}
*/
export async function patchOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    // 0) AuthZ: must be a SHIPPER
    if (!req.user || req.user.role !== "SHIPPER") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    const desired = String(req.body?.status ?? "").toUpperCase();

    if (!Types.ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid order id" });
    if (!ALLOWED_TARGET.includes(desired as any)) return res.status(400).json({ error: "Invalid status" });

    const hubIdStr = req.user.hubId;
    if (!hubIdStr || !Types.ObjectId.isValid(hubIdStr)) {
      return res.status(400).json({ error: "Invalid hub in token" });
    }
    const hubId = new Types.ObjectId(hubIdStr);

    // 1) Atomic update: only update if it's THIS hub and ACTIVE
    const updated = await OrderModel.findOneAndUpdate(
      { _id: id, distributionHub: hubId, status: "ACTIVE" },
      { $set: { status: desired } },
      { new: true }
    ).lean();

    if (updated) return res.json({ ok: true, status: updated.status });

    // 2) Diagnose why it failed (clear 4xx instead of generic 500)
    const exists = await OrderModel.exists({ _id: id });
    if (!exists) return res.status(404).json({ error: "Order not found" });

    const inThisHub = await OrderModel.exists({ _id: id, distributionHub: hubId });
    if (!inThisHub) return res.status(403).json({ error: "Not allowed to update this order" });

    const notActive = await OrderModel.exists({ _id: id, distributionHub: hubId, status: { $ne: "ACTIVE" } });
    if (notActive) return res.status(409).json({ error: "Order is not ACTIVE" });

    return res.status(409).json({ error: "Could not update order" });
  } catch (err) {
    console.error("[patchOrderStatus] ERROR:", (err as any)?.message, err);
    return res.status(500).json({ error: "Failed to update status" });
  }
}