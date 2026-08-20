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
          image: '/images/products/doll.jpg',
          category: 'Toys & Gifts',
          status: 'ACTIVE',
        },
        {
          name: 'Sensual Sex Toy Edition',
          description: 'Ergonomic silicone wellness device with multi-frequency controls.',
          price: 1000,
          image: '/images/products/sex_toy.jpg',
          category: 'Personal Wellness',
          status: 'ACTIVE',
        },
        {
          name: 'Luxury Satin Silk Bedsheet Set',
          description: '100% Mulberry silk handcrafted bedsheets with gold embroidery finish.',
          price: 2000,
          image: '/images/products/bedsheet.jpg',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
        },
        {
          name: 'Premium Ultra-Thin Condom Set',
          description: 'Ultra-sensitive lubricated latex protective edition.',
          price: 500,
          image: '/images/products/condom.jpg',
          category: 'Personal Care',
          status: 'ACTIVE',
        },
        {
          name: 'Rose & Fine Champagne Gift Box',
          description: 'French vintage rose champagne accompanied by fresh velvet roses.',
          price: 3500,
          image: '/images/products/champagne.jpg',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
        },
        {
          name: 'Signature Crystal Decanter Set',
          description: 'Hand-blown Bohemian crystal decanter with 4 matching glasses.',
          price: 5000,
          image: '/images/products/decanter.jpg',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
        },
      ];

      let products = await Product.find({ status: 'ACTIVE' }).sort({ price: 1 });

      // Always reset/seed if product list is outdated or uses external unsplash URLs
      if (
        products.length < 6 ||
        products.some((p) => p.image.includes('unsplash') || !p.image.startsWith('/images/products/'))
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
