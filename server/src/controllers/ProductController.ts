import { Request, Response } from 'express';
import Product from '../models/Product';

export async function getAllProducts(req: Request, res: Response) {
  try {
    const { q, minPrice, maxPrice } = req.query as Record<string, string | undefined>;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(60, Number(req.query.limit) || 24);
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('_id name price imageUrl description vendor'),
      Product.countDocuments(filter),
    ]);

    res.json({ page, limit, total, items });
  } catch (err) {
    console.error('getAllProducts error', err);
    res.status(500).json({ message: 'Failed to load products' });
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const product = await Product.findById(req.params.productId)
      .select('_id name price imageUrl description vendor');
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error('getProductById error', err);
    res.status(500).json({ message: 'Failed to load product' });
  }
}
