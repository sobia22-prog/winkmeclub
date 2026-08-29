import { Request, Response } from 'express';
import { Product } from '../models/product.model';

export class ProductController {
  static async getProducts(req: Request, res: Response) {
    try {
      const defaultProducts = [
        {
          name: 'Romantic Soft Doll',
          description: 'Plush romantic companion doll crafted with velvet finish.',
          price: 0,
          stock: 100,
          image: '/images/products/doll.jpg',
          category: 'Toys & Gifts',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Sensual Sex Toy Edition',
          description: 'Ergonomic silicone wellness device with multi-frequency controls.',
          price: 0,
          stock: 50,
          image: '/images/products/sex_toy.jpg',
          category: 'Personal Wellness',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Luxury Satin Silk Bedsheet Set',
          description: '100% Mulberry silk handcrafted bedsheets with gold embroidery finish.',
          price: 0,
          stock: 200,
          image: '/images/products/bedsheet.jpg',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Premium Ultra-Thin Condom Set',
          description: 'Ultra-sensitive lubricated latex protective edition.',
          price: 0,
          stock: 150,
          image: '/images/products/condom.jpg',
          category: 'Personal Care',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Rose & Fine Champagne Gift Box',
          description: 'French vintage rose champagne accompanied by fresh velvet roses.',
          price: 0,
          stock: 80,
          image: '/images/products/champagne.jpg',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Signature Crystal Decanter Set',
          description: 'Hand-blown Bohemian crystal decanter with 4 matching glasses.',
          price: 0,
          stock: 60,
          image: '/images/products/decanter.jpg',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'VIP Executive Fountain Pen Collection',
          description: 'Gold-plated nib luxury fountain pen crafted with handcrafted resin body.',
          price: 0,
          stock: 40,
          image: '/images/products/doll.jpg',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Midnight Seduction Perfume Elixir',
          description: 'Sensual French perfume with notes of wild vanilla, amber & dark rose.',
          price: 0,
          stock: 90,
          image: '/images/products/champagne.jpg',
          category: 'Personal Wellness',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Organic Lavender Spa & Bath Oils',
          description: 'Therapeutic organic essential oils infused with soothing botanical extracts.',
          price: 0,
          stock: 120,
          image: '/images/products/condom.jpg',
          category: 'Personal Care',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Handcrafted Leather Travel Portfolio',
          description: 'Full-grain Italian leather organizer for luxury travel and business essentials.',
          price: 0,
          stock: 75,
          image: '/images/products/bedsheet.jpg',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Italian Velvet Lingerie Set',
          description: 'Exquisite handcrafted lace & velvet lingerie edition in burgundy rose.',
          price: 0,
          stock: 85,
          image: '/images/products/sex_toy.jpg',
          category: 'Personal Wellness',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Diamond Accent Pearl Necklace',
          description: 'Freshwater cultured pearl strand featuring a 14k gold diamond clasp.',
          price: 0,
          stock: 30,
          image: '/images/products/decanter.jpg',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Artisanal Dark Chocolate Truffles Box',
          description: 'Swiss dark chocolate truffles infused with cognac and single-origin cocoa.',
          price: 0,
          stock: 150,
          image: '/images/products/doll.jpg',
          category: 'Toys & Gifts',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Rose Gold Luxury Smartwatch Edition',
          description: 'Amoled ceramic smartwatch with heart rate monitoring & titanium mesh strap.',
          price: 0,
          stock: 45,
          image: '/images/products/champagne.jpg',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Vintage Wine Aerator & Opener Kit',
          description: 'Electric sommelier wine opener set complete with vacuum stopper & foil cutter.',
          price: 0,
          stock: 110,
          image: '/images/products/decanter.jpg',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
          isMainPage: true,
        },
      ];

      let products = await Product.find({ status: 'ACTIVE' }).sort({ createdAt: 1 });

      // Reset / seed if products are less than 15 or have legacy images
      if (
        products.length < 15 ||
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
