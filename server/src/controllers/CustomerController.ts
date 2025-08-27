import { Response } from "express";
import { Types } from "mongoose";
import OrderModel from "../models/Order";
import OrderItemModel from "../models/OrderItem";
import ProductModel from "../models/Product";
import { UserModel } from "../models/User";
import { AuthenticatedRequest } from "../middleware/authMiddleware";

const ALLOWED_TARGET = new Set(["CANCELED"]);

// Helper: find vendor names for a set of orderIds
async function vendorNameByOrderIds(orderIds: Types.ObjectId[]) {
  // Aggregate vendor IDs from order items
  const rows = await OrderItemModel.aggregate<{
    _id: Types.ObjectId;
    vendor: Types.ObjectId;
    vendorSet: Types.ObjectId[];
  }>([
    { $match: { order: { $in: orderIds } } },
    {
      $lookup: {
        from: ProductModel.collection.name,
        localField: "product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$order",
        vendor: { $first: "$product.vendor" },
        vendorSet: { $addToSet: "$product.vendor" },
      },
    },
  ]);

  // Warn if an order unexpectedly has multiple vendors
  for (const r of rows) {
    if ((r.vendorSet || []).length > 1) {
      console.warn(
        `[customer.controller] Order ${String(r._id)} has multiple vendors in items. Using the first.`,
      );
    }
  }

  // Collect unique vendor IDs
  const vendorIds = Array.from(
    new Set(rows.map((r) => String(r.vendor)).filter(Boolean)),
  );

  if (!vendorIds.length) return new Map<string, string>();

  // Fetch vendor user records
  const users = await UserModel.find({ _id: { $in: vendorIds } })
    .select({ businessName: 1, name: 1, username: 1 })
    .lean()
    .exec();

  // Build map vendorId -> displayName
  const nameById = new Map<string, string>(
    users.map((u: any) => [
      String(u._id),
      u.businessName || u.name || u.username || "Unknown vendor",
    ]),
  );

  // Build map orderId -> vendorName
  const map = new Map<string, string>();
  for (const r of rows) {
    map.set(String(r._id), nameById.get(String(r.vendor)) || "Unknown vendor");
  }
  return map;
}

// List all orders belonging to the authenticated customer
export async function listCustomerOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== "CUSTOMER") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const customerIdStr = (req.user as any).userId || (req.user as any).id;
    if (!customerIdStr || !Types.ObjectId.isValid(customerIdStr)) {
      return res.status(400).json({ error: "Invalid customer id in token" });
    }
    const customer = new Types.ObjectId(customerIdStr);

    // Fetch orders for this customer
    const orders = await OrderModel.find({ customer })
      .select("status totalPrice totalprice createdAt")
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    // Map vendor names
    const orderIds = orders.map(o => o._id as Types.ObjectId);
    const vendorNameMap = orderIds.length ? await vendorNameByOrderIds(orderIds) : new Map<string, string>();

    // Build DTO for response
    const dto = orders.map(o => ({
      id: String(o._id),
      status: String(o.status ?? "").toUpperCase(),
      totalPrice: Number((o as any).totalPrice ?? (o as any).totalprice ?? 0),
      vendorName: vendorNameMap.get(String(o._id)) || "Unknown vendor",
    }));

    return res.json(dto);
  } catch (err) {
    console.error("[listCustomerOrders] ERROR:", (err as any)?.message, err);
    return res.status(500).json({ error: "Failed to load orders" });
  }
}

// Get detail of a single customer order (including items and vendor info)
export async function getCustomerOrderDetail(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== "CUSTOMER") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }
    const orderId = new Types.ObjectId(id);

    const customerIdStr = (req.user as any).userId || (req.user as any).id;
    if (!customerIdStr || !Types.ObjectId.isValid(customerIdStr)) {
      return res.status(400).json({ error: "Invalid customer id in token" });
    }
    const customer = new Types.ObjectId(customerIdStr);

    // Fetch the order (must belong to this customer)
    const order: any = await OrderModel.findOne({ _id: orderId, customer })
      .select("status totalPrice totalprice customer address shippingAddress cancelReason orderDate")
      .populate({ path: "customer", select: "name address" })
      .lean()
      .exec();

    if (!order) return res.status(404).json({ error: "Order not found" });

    // Fetch order items
    const itemsRaw = await OrderItemModel.find({ order: orderId })
      .select("product quantity price priceAtPurchase")
      .lean()
      .exec();

    // Collect valid productIds
    const validProductIds = Array.from(
      new Set(
        itemsRaw
          .map((it: any) => it.product)
          .filter((pid: any) => pid && Types.ObjectId.isValid(pid))
          .map((pid: any) => String(pid)),
      ),
    ).map(idStr => new Types.ObjectId(idStr));

    // Fetch product details
    const products = validProductIds.length
      ? await ProductModel.find({ _id: { $in: validProductIds } })
        .select("name imageUrl price vendor")
        .lean()
        .exec()
      : [];

    const productMap = new Map(products.map(p => [String(p._id), p]));

    // Map items with product details
    const mappedItems = itemsRaw.map((it: any) => {
      const p: any = productMap.get(String(it.product));
      const price = Number(it?.price ?? it?.priceAtPurchase ?? p?.price ?? 0);
      const quantity = Number(it?.quantity ?? 0);
      const subtotal = Math.round(price * quantity * 100) / 100;
      return {
        id: String(it._id),
        productId: p ? String(p._id) : (Types.ObjectId.isValid(it.product) ? String(it.product) : null),
        productName: p?.name ?? "Unknown Product",
        imageUrl: p?.imageUrl ?? "",
        price,
        priceAtPurchase: price,
        quantity,
        subtotal,
        vendor: p?.vendor ? String(p.vendor) : null,
      };
    });

    // Resolve vendor name from the first item
    let vendorName = "Unknown vendor";
    const firstVendorId = mappedItems.find(it => it.vendor)?.vendor;
    if (firstVendorId) {
      const user = await UserModel.findById(firstVendorId)
        .select({ businessName: 1, name: 1, username: 1 })
        .lean()
        .exec();
      vendorName =
        (user as any)?.businessName ||
        (user as any)?.name ||
        (user as any)?.username ||
        "Unknown vendor";
    }

    // Compute total price
    const computedTotal = mappedItems.reduce((s, it) => s + it.subtotal, 0);
    const storedTotal = Number(order.totalPrice ?? order.totalprice ?? 0);
    const totalPrice = storedTotal > 0 ? storedTotal : Math.round(computedTotal * 100) / 100;

    // Resolve address
    const customerAddress =
      order?.customer?.address ??
      order?.shippingAddress ??
      order?.address ??
      "Unknown";

    // Send DTO
    return res.json({
      id: String(order._id),
      status: String(order.status ?? "").toUpperCase(),
      cancelReason: order.cancelReason ?? null,
      orderDate: order.orderDate ? new Date(order.orderDate).toISOString() : null,
      totalPrice,
      vendorName,
      customerAddress,
      items: mappedItems.map(({ vendor, ...rest }) => rest), // strip helper field
    });
  } catch (err: any) {
    console.error("[getCustomerOrderDetail] ERROR:", err?.name, err?.message, err?.stack);
    return res.status(500).json({ error: "Failed to load order" });
  }
}

// Cancel a customer order (only allowed from PENDING -> CANCELED)
export async function patchCustomerOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== "CUSTOMER") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid order id" });
    }

    const raw = (typeof req.body?.status === "string" ? req.body.status : "").trim().toUpperCase();
    if (!raw) return res.status(400).json({ error: "Missing status in body" });
    if (!ALLOWED_TARGET.has(raw)) {
      return res.status(400).json({ error: `Invalid status: ${req.body?.status}` });
    }

    const reason = String(req.body?.reason ?? "").trim();

    const customerIdStr = (req.user as any).userId || (req.user as any).id;
    if (!customerIdStr || !Types.ObjectId.isValid(customerIdStr)) {
      return res.status(400).json({ error: "Invalid customer id in token" });
    }
    const customer = new Types.ObjectId(customerIdStr);

    // Only allow cancel from PENDING -> CANCELED
    const updated = await OrderModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id), customer, status: "PENDING" },
      { $set: { status: "CANCELED", ...(reason ? { cancelReason: `Customer: ${reason}` } : {}) } },
      { new: true }
    ).lean();

    if (updated) {
      return res.json({
        ok: true,
        status: updated.status,
        cancelReason: (updated as any).cancelReason ?? null,
      });
    }

    return res.status(409).json({ error: "Could not update order" });
  } catch (err) {
    console.error("[patchCustomerOrderStatus] ERROR:", (err as any)?.message, err);
    return res.status(500).json({ error: "Failed to update status" });
  }
}
