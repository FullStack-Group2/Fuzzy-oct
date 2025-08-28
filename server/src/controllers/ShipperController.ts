import { Request, Response } from 'express';
import { Types } from 'mongoose';

import OrderModel from '../models/Order';
import OrderItemModel from '../models/OrderItem';
import { ProductModel } from '../models/Product';
import { ShipperModel } from '../models/Shipper';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserServices } from '../services/UserServices';

const ALLOWED_TARGET = ['DELIVERED', 'CANCELED'] as const;
type AllowedTarget = (typeof ALLOWED_TARGET)[number];

/**
 * List ACTIVE orders for the current shipper's distribution hub
 */
export async function listActiveOrders(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== 'SHIPPER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const hubIdStr =
      req.user.hubId ||
      (typeof req.query.hubId === 'string' ? req.query.hubId : undefined);

    if (!hubIdStr) return res.status(400).json({ error: 'hubId required' });
    if (!Types.ObjectId.isValid(hubIdStr)) {
      return res.status(400).json({ error: 'hubId invalid' });
    }

    const hubId = new Types.ObjectId(hubIdStr);

    const orders = await OrderModel.find({
      distributionHub: hubId,
      status: 'ACTIVE',
    })
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

/**
 * Get details of a single ACTIVE order in this shipper's hub
 */
export async function getOrderDetail(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== 'SHIPPER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }
    const orderId = new Types.ObjectId(id);

    const hubIdStr = req.user.hubId;
    if (!hubIdStr || !Types.ObjectId.isValid(hubIdStr)) {
      return res.status(400).json({ error: 'Invalid hub in token' });
    }
    const hubId = new Types.ObjectId(hubIdStr);

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

    // Collect valid productIds
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

    const productMap = new Map(products.map((p) => [String(p._id), p as any]));

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
        productName: (p as any)?.name ?? 'Unknown Product',
        imageUrl: (p as any)?.imageUrl ?? '',
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

/**
 * Update order status (DELIVERED or CANCELED) for this shipper's hub
 */
export async function patchOrderStatus(
  req: AuthenticatedRequest,
  res: Response,
) {
  try {
    if (!req.user || req.user.role !== 'SHIPPER') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    if (!Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid order id' });
    }

    const desired = String(req.body?.status ?? '').toUpperCase();
    if (!ALLOWED_TARGET.includes(desired as AllowedTarget)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const reason = String(req.body?.reason ?? '').trim();
    if (desired === 'CANCELED' && !reason) {
      return res.status(400).json({ error: 'Cancel reason is required' });
    }

    const hubIdStr = req.user.hubId;
    if (!hubIdStr || !Types.ObjectId.isValid(hubIdStr)) {
      return res.status(400).json({ error: 'Invalid hub in token' });
    }
    const hubId = new Types.ObjectId(hubIdStr);

    // If canceling, restore product stock quantities
    if (desired === 'CANCELED') {
      const items = await OrderItemModel.find({ order: id }).select(
        'product quantity',
      );
      for (const it of items) {
        if (Types.ObjectId.isValid(String(it.product)) && it.quantity > 0) {
          await ProductModel.findByIdAndUpdate(it.product, {
            $inc: { availableStock: it.quantity },
          });
        }
      }
    }

    // Prepare update
    const update =
      desired === 'CANCELED'
        ? { $set: { status: 'CANCELED', cancelReason: reason } }
        : { $set: { status: 'DELIVERED' }, $unset: { cancelReason: 1 } };

    // Apply only if order is ACTIVE and in this hub
    const updated = await OrderModel.findOneAndUpdate(
      { _id: id, distributionHub: hubId, status: 'ACTIVE' },
      update,
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
    console.error('[patchOrderStatus] ERROR:', (err as any)?.message, err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}

/* ------------------------------------------------------------------ */
/* Shipper profile endpoints (from dev, with minor compat improvements) */
/* ------------------------------------------------------------------ */

/**
 * Get shipper by id (includes profile picture and hub info)
 * - Populates `assignedHub` if present in schema.
 * - If your schema also has `distributionHub`, you can populate it similarly.
 */
export const getShipperById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const shipper = await ShipperModel.findById(id)
      .select('-password')
      .populate('assignedHub', 'hubName hubLocation');

    if (!shipper) {
      return res.status(404).json({ message: 'Shipper not found.' });
    }

    res.status(200).json({
      shipper: {
        id: shipper._id,
        username: shipper.username,
        email: shipper.email,
        role: shipper.role,
        assignedHub: (shipper as any).assignedHub ?? undefined,
        distributionHub: (shipper as any).distributionHub ?? undefined,
        profilePicture: shipper.profilePicture,
      },
    });
  } catch (error) {
    console.error('Error fetching shipper :', error);
    res.status(500).json({
      message: 'Failed to fetch shipper.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Update shipper basic fields (username, hubs, profile picture, etc.)
 * - Enforces unique username
 * - Accepts either `assignedHub` or `distributionHub` ids if your model supports them
 */
export const updateShipper = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, assignedHub, distributionHub, ...rest } = req.body as {
      username?: string;
      assignedHub?: string;
      distributionHub?: string;
      [k: string]: unknown;
    };

    const updateData: any = { ...rest };

    if (username) {
      const existingUser = await UserServices.usernameExists(username);
      if (existingUser) {
        return res.status(409).json({ message: 'Username already exists.' });
      }
      updateData.username = username;
    }

    if (assignedHub !== undefined) {
      if (!assignedHub || !Types.ObjectId.isValid(assignedHub)) {
        return res
          .status(400)
          .json({ message: 'assignedHub must be a valid ObjectId.' });
      }
      updateData.assignedHub = new Types.ObjectId(assignedHub);
    }

    if (distributionHub !== undefined) {
      if (!distributionHub || !Types.ObjectId.isValid(distributionHub)) {
        return res
          .status(400)
          .json({ message: 'distributionHub must be a valid ObjectId.' });
      }
      updateData.distributionHub = new Types.ObjectId(distributionHub);
    }

    const shipper = await ShipperModel.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .populate('assignedHub', 'hubName hubLocation');

    if (!shipper) {
      return res.status(404).json({ message: 'Shipper not found.' });
    }

    res.status(200).json({
      shipper: {
        id: shipper._id,
        username: shipper.username,
        email: shipper.email,
        assignedHub: (shipper as any).assignedHub ?? undefined,
        distributionHub: (shipper as any).distributionHub ?? undefined,
        profilePicture: shipper.profilePicture,
        role: shipper.role,
      },
    });
  } catch (error) {
    console.error('Error updating shipper:', error);
    res.status(500).json({
      message: 'Failed to update shipper.',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
