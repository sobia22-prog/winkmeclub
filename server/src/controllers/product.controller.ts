import { Request, Response } from 'express';
import { Product } from '../models/product.model';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      let products = await Product.find({ status: 'ACTIVE' }).sort({ price: 1 });

      const defaultProducts = [
        {
          name: 'Romantic Soft Doll',
          description: 'Plush romantic companion doll crafted with velvet finish.',
          price: 500,
          image: 'https://images.unsplash.com/photo-1558060370-d644479be967?w=500&auto=format&fit=crop&q=80',
          category: 'Toys & Gifts',
          status: 'ACTIVE',
        },
        {
          name: 'Sensual Sex Toy Edition',
          description: 'Ergonomic silicone wellness device with multi-frequency controls.',
          price: 1000,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
          category: 'Personal Wellness',
          status: 'ACTIVE',
        },
        {
          name: 'Luxury Satin Silk Bedsheet Set',
          description: '100% Mulberry silk handcrafted bedsheets with gold embroidery finish.',
          price: 2000,
          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=500&auto=format&fit=crop&q=80',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
        },
        {
          name: 'Premium Ultra-Thin Condom Set',
          description: 'Ultra-sensitive lubricated latex protective edition.',
          price: 500,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80',
          category: 'Personal Care',
          status: 'ACTIVE',
        },
        {
          name: 'Rose & Fine Champagne Gift Box',
          description: 'French vintage rose champagne accompanied by fresh velvet roses.',
          price: 3500,
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
        },
      ];

      // If DB has old products or less than 5 items, seed default items
      if (products.length < 4 || products.some(p => p.price > 10000)) {
        await Product.deleteMany({});
        products = await Product.create(defaultProducts);
      }

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
