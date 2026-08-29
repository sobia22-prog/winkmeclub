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
          image: 'https://images.unsplash.com/photo-1558060370-d644479be967?w=800&auto=format&fit=crop&q=80',
          category: 'Toys & Gifts',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Sensual Sex Toy Edition',
          description: 'Ergonomic silicone wellness device with multi-frequency controls.',
          price: 0,
          stock: 50,
          image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
          category: 'Personal Wellness',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Luxury Satin Silk Bedsheet Set',
          description: '100% Mulberry silk handcrafted bedsheets with gold embroidery finish.',
          price: 0,
          stock: 200,
          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Premium Ultra-Thin Condom Set',
          description: 'Ultra-sensitive lubricated latex protective edition.',
          price: 0,
          stock: 150,
          image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80',
          category: 'Personal Care',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Rose & Fine Champagne Gift Box',
          description: 'French vintage rose champagne accompanied by fresh velvet roses.',
          price: 0,
          stock: 80,
          image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Signature Crystal Decanter Set',
          description: 'Hand-blown Bohemian crystal decanter with 4 matching glasses.',
          price: 0,
          stock: 60,
          image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'VIP Executive Fountain Pen Collection',
          description: 'Gold-plated nib luxury fountain pen crafted with handcrafted resin body.',
          price: 0,
          stock: 40,
          image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Midnight Seduction Perfume Elixir',
          description: 'Sensual French perfume with notes of wild vanilla, amber & dark rose.',
          price: 0,
          stock: 90,
          image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80',
          category: 'Personal Wellness',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Organic Lavender Spa & Bath Oils',
          description: 'Therapeutic organic essential oils infused with soothing botanical extracts.',
          price: 0,
          stock: 120,
          image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
          category: 'Personal Care',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Handcrafted Leather Travel Portfolio',
          description: 'Full-grain Italian leather organizer for luxury travel and business essentials.',
          price: 0,
          stock: 75,
          image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Italian Velvet Lingerie Set',
          description: 'Exquisite handcrafted lace & velvet lingerie edition in burgundy rose.',
          price: 0,
          stock: 85,
          image: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=800&auto=format&fit=crop&q=80',
          category: 'Personal Wellness',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Diamond Accent Pearl Necklace',
          description: 'Freshwater cultured pearl strand featuring a 14k gold diamond clasp.',
          price: 0,
          stock: 30,
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Artisanal Dark Chocolate Truffles Box',
          description: 'Swiss dark chocolate truffles infused with cognac and single-origin cocoa.',
          price: 0,
          stock: 150,
          image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&auto=format&fit=crop&q=80',
          category: 'Toys & Gifts',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Rose Gold Luxury Smartwatch Edition',
          description: 'Amoled ceramic smartwatch with heart rate monitoring & titanium mesh strap.',
          price: 0,
          stock: 45,
          image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
          category: 'Luxury Accessories',
          status: 'ACTIVE',
          isMainPage: true,
        },
        {
          name: 'Vintage Wine Aerator & Opener Kit',
          description: 'Electric sommelier wine opener set complete with vacuum stopper & foil cutter.',
          price: 0,
          stock: 110,
          image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=80',
          category: 'Lifestyle & Home',
          status: 'ACTIVE',
          isMainPage: true,
        },
      ];

      let products = await Product.find({ status: 'ACTIVE' }).sort({ createdAt: 1 });

      // Seed initial default products ONLY if database collection is completely empty
      if (products.length === 0) {
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
