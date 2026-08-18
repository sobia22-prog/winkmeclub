import { Request, Response } from 'express';
import { Product } from '../models/product.model';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const products = await Product.find({ status: 'ACTIVE' }).sort({ price: 1 });

      return res.status(200).json({
        success: true,
        count: products.length,
        products,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch products.' });
    }
  }

  static async getProductById(req: Request, res: Response) {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      return res.status(200).json({
        success: true,
        product,
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || 'Failed to fetch product.' });
    }
  }
}
