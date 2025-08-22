import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ShipperModel } from '../models/Shipper';
import Order from '../models/Order';
import { OrderStatus } from '../models/OrderStatus';

/**
 * GET /api/shipper/orders
 * Return ACTIVE orders for the shipper's assigned hub.
 */
export async function getAssignedOrders(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

    // Find shipper's hub
    const shipper = await ShipperModel.findById(req.user.userId).select('assignedHub');
    if (!shipper?.assignedHub) {
      return res.status(400).json({ message: 'Shipper is not assigned to a hub.' });
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Number(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Order.find({ hub: shipper.assignedHub, status: OrderStatus.ACTIVE })
        .sort({ orderDate: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id status totalPrice orderDate') // plus summary fields
        .populate({ path: 'customer', select: 'username name address' }),
      Order.countDocuments({ hub: shipper.assignedHub, status: OrderStatus.ACTIVE }),
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    console.error('getAssignedOrders error', err);
    res.status(500).json({ message: 'Failed to load orders' });
  }
}

/**
 * GET /api/shipper/orders/:orderId
 * Return full order details for an order in the shipper's hub.
 */
export async function getOrderDetails(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

    const shipper = await ShipperModel.findById(req.user.userId).select('hub');
    if (!shipper?.assignedHub) {
      return res.status(400).json({ message: 'Shipper is not assigned to a hub.' });
    }

    const order = await Order.findOne({ _id: req.params.orderId, hub: shipper.assignedHub })
      .populate({ path: 'customer', select: 'username name address phone' })
      .populate({
        path: 'orderItems',
        populate: { path: 'product', select: 'name price imageUrl description' },
      });

    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error('getOrderDetails error', err);
    res.status(500).json({ message: 'Failed to load order' });
  }
}

/**
 * PATCH /api/shipper/orders/:orderId
 * Update status from ACTIVE -> DELIVERED or CANCELED for orders in the shipper's hub.
 */
export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: 'Authentication required.' });

    const shipper = await ShipperModel.findById(req.user.userId).select('hub');
    if (!shipper?.assignedHub) {
      return res.status(400).json({ message: 'Shipper is not assigned to a hub.' });
    }

    const { status } = req.body as { status?: string };
    const allowed = [OrderStatus.DELIVERED, OrderStatus.CANCELED];
    if (!status || !allowed.includes(status as OrderStatus)) {
      return res.status(400).json({ message: 'Invalid status. Use DELIVERED or CANCELED.' });
    }

    const order = await Order.findOne({ _id: req.params.orderId, hub: shipper.assignedHub });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== OrderStatus.ACTIVE) {
      return res.status(409).json({ message: 'Order is not ACTIVE anymore.' });
    }

    order.status = status as OrderStatus;
    await order.save();

    res.json({ message: 'Order updated', status: order.status });
  } catch (err) {
    console.error('updateOrderStatus error', err);
    res.status(500).json({ message: 'Failed to update order' });
  }
}
