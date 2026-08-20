import { Request, Response } from 'express';
import { Product } from '../models/product.model';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const defaultProducts = [
        {
          name: 'Romantic Soft Doll',
          description: 'Plush romantic companion doll crafted with velvet finish.',
          price: 500,
          image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&auto=format&fit=crop&q=80',
          category: 'Toys & Gifts',
          status: 'ACTIVE',
        },
        {
          name: 'Sensual Sex Toy Edition',
          description: 'Ergonomic silicone wellness device with multi-frequency controls.',
          price: 1000,
          image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&auto=format&fit=crop&q=80',
          category: 'Personal Wellness',
          status: 'ACTIVE',
        },
        {
          name: 'Luxury Satin Silk Bedsheet Set',
          description: '100% Mulberry silk handcrafted bedsheets with gold embroidery finish.',
          price: 2000,
          image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&auto=format&fit=crop&q=80',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
        },
        {
          name: 'Premium Ultra-Thin Condom Set',
          description: 'Ultra-sensitive lubricated latex protective edition.',
          price: 500,
          image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
          category: 'Personal Care',
          status: 'ACTIVE',
        },
        {
          name: 'Rose & Fine Champagne Gift Box',
          description: 'French vintage rose champagne accompanied by fresh velvet roses.',
          price: 3500,
          image: 'https://images.unsplash.com/photo-1569919659476-f0852f6834b7?w=600&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
        },
        {
          name: 'Signature Crystal Decanter Set',
          description: 'Hand-blown Bohemian crystal decanter with 4 matching glasses.',
          price: 5000,
          image: 'https://images.unsplash.com/photo-1527061011665-3652c757a4d4?w=600&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
        },
      ];

      let products = await Product.find({ status: 'ACTIVE' }).sort({ price: 1 });

      // Always reset/seed if product list is outdated or has incorrect images
      if (
        products.length < 6 ||
        products.some(
          (p) =>
            p.image.includes('photo-1579684385127') ||
            p.image.includes('photo-1628771065518') ||
            p.image.includes('photo-1559454403') ||
            p.image.includes('photo-1510812431401')
        )
      ) {
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
