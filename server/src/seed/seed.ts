import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dns from 'dns';
import { connectDB } from '../config/db';
import { User } from '../models/user.model';
import { Wallet } from '../models/wallet.model';
import { Transaction } from '../models/transaction.model';
import { Product } from '../models/product.model';
import { Trade } from '../models/trade.model';
import { RechargeRequest } from '../models/recharge.model';
import { WithdrawalRequest } from '../models/withdrawal.model';
import { Verification } from '../models/verification.model';
import { DateRequest } from '../models/dateRequest.model';
import { Notification } from '../models/notification.model';
import { Announcement } from '../models/announcement.model';
import { SupportTicket, SupportMessage } from '../models/support.model';
import { AuditLog } from '../models/auditLog.model';
import { GirlProfile } from '../models/girlProfile.model';

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seed] Cleaning existing database collections...');

    await Promise.all([
      User.deleteMany({}),
      Wallet.deleteMany({}),
      Transaction.deleteMany({}),
      Product.deleteMany({}),
      Trade.deleteMany({}),
      RechargeRequest.deleteMany({}),
      WithdrawalRequest.deleteMany({}),
      Verification.deleteMany({}),
      DateRequest.deleteMany({}),
      Notification.deleteMany({}),
      Announcement.deleteMany({}),
      SupportTicket.deleteMany({}),
      SupportMessage.deleteMany({}),
      AuditLog.deleteMany({}),
      GirlProfile.deleteMany({}),
    ]);

    // Seed Initial Girl Profiles
    await GirlProfile.create([
      {
        name: 'Priya Sharma',
        rating: 4.9,
        height: "5'6\"",
        weight: '52 kg',
        chestCircumference: '34B',
        initialLikes: 850,
        categories: ['Sexy', 'Hot'],
        location: 'Mumbai',
        bio: 'Fashion model & coffee enthusiast living in Bandra. Passionate about art, fine dining, and weekend getaways.',
        tags: ['VIP', 'Featured', 'Hot'],
        verificationLabel: 'ID Verified',
        details: 'Passionate about life, luxury travel, and long conversations over wine.',
        profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Aria Malhotra',
        rating: 5.0,
        height: "5'7\"",
        weight: '50 kg',
        chestCircumference: '36C',
        initialLikes: 1240,
        categories: ['Big Boobs', 'Hot'],
        location: 'Delhi',
        bio: 'Architect and jazz enthusiast. Love rooftop cocktail lounges and spontaneous road trips.',
        tags: ['VIP', 'Featured'],
        verificationLabel: 'ID Verified',
        details: 'Architectural designer based in South Delhi with a taste for luxury aesthetics.',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Sophia Roy',
        rating: 4.8,
        height: "5'5\"",
        weight: '49 kg',
        chestCircumference: '34C',
        initialLikes: 960,
        categories: ['Sexy', 'Big Ass'],
        location: 'Bangalore',
        bio: 'AI Product Specialist & salsa dancer. Always curious and open to new experiences.',
        tags: ['Featured', 'Hot'],
        verificationLabel: 'ID Verified',
        details: 'Creative mind exploring technology, indie concerts, and rooftop dining.',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
      },
      {
        name: 'Natasha Fernandez',
        rating: 4.9,
        height: "5'8\"",
        weight: '54 kg',
        chestCircumference: '36B',
        initialLikes: 1100,
        categories: ['Sexy', 'Hot'],
        location: 'Goa',
        bio: 'Sailing captain & marine enthusiast living coastal dreams.',
        tags: ['VIP', 'Hot'],
        verificationLabel: 'ID Verified',
        details: 'Beach lover, scuba diver, and sunset cocktail enthusiast.',
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
      },
    ]);

    console.log('[Seed] Database cleaned. Seeding fresh realistic demo data...');

    const defaultPasswordHash = await bcrypt.hash('User@123', 10);
    const clientPasswordHash = await bcrypt.hash('Client@123', 10);
    const staffPasswordHash = await bcrypt.hash('Staff@123', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

    // 1. Create Admin Account
    const admin = await User.create({
      fullName: 'System Administrator',
      email: 'admin@winkmeclub.com',
      phone: '+91 98765 00000',
      passwordHash: adminPasswordHash,
      city: 'Mumbai',
      gender: 'Other',
      role: 'ADMIN',
      invitationCode: 'ADMIN100',
      isVIP: true,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      bio: 'Wink Me Club Lead Platform Manager & Security Officer.',
    });

    // 2. Create Staff Account
    const staffUser = await User.create({
      fullName: 'Staff Member',
      email: 'staff@winkmeclub.com',
      phone: '+91 98765 11111',
      passwordHash: staffPasswordHash,
      city: 'Mumbai',
      gender: 'Female',
      role: 'STAFF',
      invitationCode: 'STAFF100',
      isVIP: true,
      isVerified: true,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      bio: 'Senior Customer Concierge & VIP Escort Coordinator.',
    });

    // 3. Create Client Account (Matching 'Client' username)
    const clientUser = await User.create({
      fullName: 'Client',
      email: 'client@winkmeclub.com',
      phone: '+91 98765 22222',
      passwordHash: clientPasswordHash,
      city: 'Mumbai',
      gender: 'Male',
      role: 'USER',
      assignedStaff: staffUser._id,
      isVIP: true,
      vipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isVerified: true,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
      bio: 'VIP Client member exploring exclusive city encounters.',
    });

    await Wallet.create({
      userId: clientUser._id,
      availableBalance: 15000.0,
      frozenBalance: 0,
      totalBalance: 15000.0,
      currency: '₹',
    });

    // 4. Create Demo User (Rahul Sharma)
    const demoUser = await User.create({
      fullName: 'Rahul Sharma',
      email: 'user@winkmeclub.com',
      phone: '+91 98765 43210',
      passwordHash: defaultPasswordHash,
      city: 'Mumbai',
      gender: 'Male',
      role: 'USER',
      assignedStaff: staffUser._id,
      isVIP: true,
      vipExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isVerified: true,
      verificationStatus: 'VERIFIED',
      status: 'ACTIVE',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      bio: 'Tech entrepreneur based in South Mumbai. Passionate about fine dining, luxury travel, and golf.',
      age: 28,
      dob: new Date('1998-05-14'),
      interests: ['Fine Dining', 'Sailing', 'Art & Culture', 'Cryptocurrency', 'Fitness'],
    });

    // Create Demo User Wallet
    await Wallet.create({
      userId: demoUser._id,
      availableBalance: 25000.0,
      frozenBalance: 5000.0,
      totalBalance: 30000.0,
      currency: '₹',
    });

    // 3. Create 25 Realistic Social Matching Profiles
    const demoProfilesData = [
      {
        fullName: 'Sophia Roy',
        email: 'sophia@winkmeclub.com',
        city: 'Mumbai',
        gender: 'Female',
        age: 24,
        isVIP: true,
        profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
        bio: 'Fashion designer & espresso lover. Looking for meaningful dinner dates & deep conversations.',
        interests: ['Fashion', 'Cafes', 'Deep Conversations', 'Photography'],
      },
      {
        fullName: 'Aria Malhotra',
        email: 'aria@winkmeclub.com',
        city: 'Delhi',
        gender: 'Female',
        age: 26,
        isVIP: true,
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
        bio: 'Architect, jazz music enthusiast, and wine connoisseur. Always ready for spontaneous weekend getaways.',
        interests: ['Architecture', 'Jazz', 'Wine Tasting', 'Travel'],
      },
      {
        fullName: 'Ananya Verma',
        email: 'ananya@winkmeclub.com',
        city: 'Bangalore',
        gender: 'Female',
        age: 25,
        isVIP: false,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
        bio: 'AI Product Manager who loves rooftop lounges and indie concerts.',
        interests: ['Tech', 'Indie Music', 'Cocktails', 'Pilates'],
      },
      {
        fullName: 'Priya Kapoor',
        email: 'priya@winkmeclub.com',
        city: 'Jaipur',
        gender: 'Female',
        age: 27,
        isVIP: true,
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
        bio: 'Heritage jewelry curator. Adore royal palaces, equestrian sports, and sunset teas.',
        interests: ['Equestrian', 'Heritage', 'Jewelry', 'Fine Arts'],
      },
      {
        fullName: 'Rhea Sen',
        email: 'rhea@winkmeclub.com',
        city: 'Kolkata',
        gender: 'Female',
        age: 23,
        isVIP: false,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        bio: 'Literature enthusiast, classical dancer, and vintage cinema lover.',
        interests: ['Books', 'Classical Dance', 'Cinema', 'Tea'],
      },
      {
        fullName: 'Natasha Fernandez',
        email: 'natasha@winkmeclub.com',
        city: 'Goa',
        gender: 'Female',
        age: 25,
        isVIP: true,
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
        bio: 'Yacht captain & marine biologist. Living the sunny coastal dream.',
        interests: ['Sailing', 'Scuba Diving', 'Beach Lounges', 'Seafood'],
      },
      {
        fullName: 'Meera Patel',
        email: 'meera@winkmeclub.com',
        city: 'Pune',
        gender: 'Female',
        age: 24,
        isVIP: false,
        profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80',
        bio: 'Psychologist by day, salsa dancer by night. Searching for a charismatic companion.',
        interests: ['Salsa', 'Psychology', 'Board Games', 'Matcha'],
      },
      {
        fullName: 'Kavya Reddy',
        email: 'kavya@winkmeclub.com',
        city: 'Hyderabad',
        gender: 'Female',
        age: 28,
        isVIP: true,
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
        bio: 'Venture capitalist & foodie. Exploring high-end dining experiences and polo matches.',
        interests: ['Polo', 'Startups', 'Fine Dining', 'Golf'],
      },
      {
        fullName: 'Tanya Dixit',
        email: 'tanya@winkmeclub.com',
        city: 'Agra',
        gender: 'Female',
        age: 25,
        isVIP: true,
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
        bio: 'Classic art restorer. Romantic at heart who loves moonlit walks near monument gardens.',
        interests: ['Art Restoration', 'History', 'Poetry', 'Travel'],
      },
      {
        fullName: 'Ishita Mehta',
        email: 'ishita@winkmeclub.com',
        city: 'Mumbai',
        gender: 'Female',
        age: 26,
        isVIP: true,
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
        bio: 'Luxury brand consultant living in Bandra West.',
        interests: ['Fashion', 'Cocktails', 'Pilates'],
      },
    ];

    for (const pData of demoProfilesData) {
      const user = await User.create({
        fullName: pData.fullName,
        email: pData.email,
        phone: '+91 98765 ' + Math.floor(10000 + Math.random() * 90000),
        passwordHash: defaultPasswordHash,
        city: pData.city,
        gender: pData.gender,
        role: 'USER',
        isVIP: pData.isVIP,
        isVerified: true,
        verificationStatus: 'VERIFIED',
        status: 'ACTIVE',
        profileImage: pData.profileImage,
        bio: pData.bio,
        age: pData.age,
        interests: pData.interests,
      });

      await Wallet.create({
        userId: user._id,
        availableBalance: Math.floor(1000 + Math.random() * 15000),
        frozenBalance: 0,
        totalBalance: Math.floor(1000 + Math.random() * 15000),
        currency: '₹',
      });
    }

    // 4. Create 15 Premium Marketplace Trade Products
    const productsData = [
      {
        name: 'Romantic Soft Doll',
        description: 'Plush romantic companion doll crafted with velvet finish.',
        price: 0,
        stock: 100,
        image: 'https://images.unsplash.com/photo-1558060370-d644479be967?w=800&auto=format&fit=crop&q=80',
        category: 'Toys & Gifts',
        isMainPage: true,
      },
      {
        name: 'Sensual Sex Toy Edition',
        description: 'Ergonomic silicone wellness device with multi-frequency controls.',
        price: 0,
        stock: 50,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
        category: 'Personal Wellness',
        isMainPage: true,
      },
      {
        name: 'Luxury Satin Silk Bedsheet Set',
        description: '100% Mulberry silk handcrafted bedsheets with gold embroidery finish.',
        price: 0,
        stock: 200,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&auto=format&fit=crop&q=80',
        category: 'Lifestyle & Home',
        isMainPage: true,
      },
      {
        name: 'Premium Ultra-Thin Condom Set',
        description: 'Ultra-sensitive lubricated latex protective edition.',
        price: 0,
        stock: 150,
        image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=800&auto=format&fit=crop&q=80',
        category: 'Personal Care',
        isMainPage: true,
      },
      {
        name: 'Rose & Fine Champagne Gift Box',
        description: 'French vintage rose champagne accompanied by fresh velvet roses.',
        price: 0,
        stock: 80,
        image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop&q=80',
        category: 'Luxury Accessories',
        isMainPage: true,
      },
      {
        name: 'Signature Crystal Decanter Set',
        description: 'Hand-blown Bohemian crystal decanter with 4 matching glasses.',
        price: 0,
        stock: 60,
        image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
        category: 'Luxury Accessories',
        isMainPage: true,
      },
      {
        name: 'VIP Executive Fountain Pen Collection',
        description: 'Gold-plated nib luxury fountain pen crafted with handcrafted resin body.',
        price: 0,
        stock: 40,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80',
        category: 'Luxury Accessories',
        isMainPage: true,
      },
      {
        name: 'Midnight Seduction Perfume Elixir',
        description: 'Sensual French perfume with notes of wild vanilla, amber & dark rose.',
        price: 0,
        stock: 90,
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80',
        category: 'Personal Wellness',
        isMainPage: true,
      },
      {
        name: 'Organic Lavender Spa & Bath Oils',
        description: 'Therapeutic organic essential oils infused with soothing botanical extracts.',
        price: 0,
        stock: 120,
        image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
        category: 'Personal Care',
        isMainPage: true,
      },
      {
        name: 'Handcrafted Leather Travel Portfolio',
        description: 'Full-grain Italian leather organizer for luxury travel and business essentials.',
        price: 0,
        stock: 75,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
        category: 'Lifestyle & Home',
        isMainPage: true,
      },
      {
        name: 'Italian Velvet Lingerie Set',
        description: 'Exquisite handcrafted lace & velvet lingerie edition in burgundy rose.',
        price: 0,
        stock: 85,
        image: 'https://images.unsplash.com/photo-1583846783214-7229a91b20ed?w=800&auto=format&fit=crop&q=80',
        category: 'Personal Wellness',
        isMainPage: true,
      },
      {
        name: 'Diamond Accent Pearl Necklace',
        description: 'Freshwater cultured pearl strand featuring a 14k gold diamond clasp.',
        price: 0,
        stock: 30,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        category: 'Luxury Accessories',
        isMainPage: true,
      },
      {
        name: 'Artisanal Dark Chocolate Truffles Box',
        description: 'Swiss dark chocolate truffles infused with cognac and single-origin cocoa.',
        price: 0,
        stock: 150,
        image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&auto=format&fit=crop&q=80',
        category: 'Toys & Gifts',
        isMainPage: true,
      },
      {
        name: 'Rose Gold Luxury Smartwatch Edition',
        description: 'Amoled ceramic smartwatch with heart rate monitoring & titanium mesh strap.',
        price: 0,
        stock: 45,
        image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
        category: 'Luxury Accessories',
        isMainPage: true,
      },
      {
        name: 'Vintage Wine Aerator & Opener Kit',
        description: 'Electric sommelier wine opener set complete with vacuum stopper & foil cutter.',
        price: 0,
        stock: 110,
        image: 'https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=800&auto=format&fit=crop&q=80',
        category: 'Lifestyle & Home',
        isMainPage: true,
      },
    ];

    for (const prod of productsData) {
      await Product.create({
        ...prod,
        status: 'ACTIVE',
      });
    }

    // 5. Seed Transactions for Demo User
    await Transaction.create([
      {
        transactionId: 'TX-1001',
        userId: demoUser._id,
        type: 'RECHARGE',
        amount: 30000,
        beforeBalance: 0,
        afterBalance: 30000,
        status: 'COMPLETED',
        referenceId: 'UPI-982138129031',
        description: 'Add-Funds Bank Transfer Approved by Admin',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        transactionId: 'TX-1002',
        userId: demoUser._id,
        type: 'TRADE_HOLD',
        amount: 5000,
        beforeBalance: 30000,
        afterBalance: 25000,
        status: 'COMPLETED',
        referenceId: 'TRD-5501',
        description: 'Trade Execution hold for VIP Executive Fountain Pen Collection',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ]);

    // 6. Seed Sample Trade for Demo User
    const firstProduct = await Product.findOne({ name: /Fountain Pen/i });
    if (firstProduct) {
      await Trade.create({
        tradeId: 'TRD-5501',
        userId: demoUser._id,
        productId: firstProduct._id,
        productName: firstProduct.name,
        productImage: firstProduct.image,
        quantity: 1,
        price: 5000,
        totalAmount: 5000,
        status: 'PENDING',
        outcome: 'NONE',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      });
    }

    // 7. Seed Sample Recharge Request
    await RechargeRequest.create({
      requestId: 'RCG-9901',
      userId: demoUser._id,
      amount: 30000,
      paymentMethod: 'UPI / Bank Transfer',
      referenceNumber: 'UPI-982138129031',
      status: 'APPROVED',
      processedBy: admin._id,
      processedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    // 8. Seed Date Request
    const sophiaUser = await User.findOne({ email: 'sophia@winkmeclub.com' });
    if (sophiaUser) {
      await DateRequest.create({
        requestId: 'DR-7701',
        senderId: demoUser._id,
        targetProfileId: sophiaUser._id,
        targetProfileName: sophiaUser.fullName,
        date: '2026-08-25',
        time: '20:00',
        message: 'Would love to invite you for dinner at The Taj Rooftop Lounge.',
        status: 'PENDING',
      });
    }

    // 9. Seed Verification Document
    await Verification.create({
      userId: demoUser._id,
      fullName: 'Rahul Sharma',
      dob: new Date('1998-05-14'),
      idType: 'Passport',
      idNumber: 'P89218201',
      idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
      selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      processedBy: admin._id,
      processedAt: new Date(),
    });

    // 10. Seed Banners & Announcements (Matching Reference Image)
    await Announcement.create([
      {
        title: "Girls' Love — Encounters in the Same City",
        shortDescription: 'A club of love encounters in the same city. LOVE TONIGHT.',
        content: 'Discover verified social profiles near you. Apply for date proposals and connect with authentic members in your area tonight.',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=80',
        status: 'PUBLISHED',
      },
      {
        title: 'VIP Premier Club Membership Benefits',
        shortDescription: 'Earn your Gold VIP badge, 3x profile engagement, and priority date dispatches.',
        content: 'Verified VIP members get 3x profile engagement and priority date request notifications. Head over to the Verification section to unlock your badge today.',
        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=80',
        status: 'PUBLISHED',
      },
    ]);

    // 11. Seed Support Ticket for Demo User
    const ticket = await SupportTicket.create({
      ticketId: 'TKT-3001',
      userId: demoUser._id,
      userName: demoUser.fullName,
      userEmail: demoUser.email,
      category: 'VIP Membership & Verification',
      subject: 'Question regarding VIP badge expiry renewal',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      lastRepliedAt: new Date(),
    });

    await SupportMessage.create([
      {
        ticketId: ticket._id,
        senderId: demoUser._id,
        senderName: demoUser.fullName,
        senderRole: 'USER',
        message: 'Hello! I noticed my VIP badge is active. Will it renew automatically after 1 year?',
      },
      {
        ticketId: ticket._id,
        senderId: admin._id,
        senderName: admin.fullName,
        senderRole: 'ADMIN',
        message: 'Hi Rahul! Yes, your VIP status is set for 1 year. Our concierge team will reach out before expiry.',
      },
    ]);

    // 12. Seed Notifications for Demo User
    await Notification.create([
      {
        userId: demoUser._id,
        title: 'Welcome to Wink Me Club',
        message: 'Your account is ready. Explore curated matches in your city.',
        type: 'ANNOUNCEMENT',
        isRead: true,
        link: '/matches',
      },
      {
        userId: demoUser._id,
        title: 'VIP Verification Approved! 🌟',
        message: 'Your passport verification was approved by administration. Gold VIP active.',
        type: 'VIP',
        isRead: false,
        link: '/profile',
      },
      {
        userId: demoUser._id,
        title: 'Recharge Approved 💰',
        message: 'Your ₹30,000 add-funds request has been credited to your available balance.',
        type: 'RECHARGE',
        isRead: false,
        link: '/wallet',
      },
    ]);

    console.log('[Seed] Seeding completed successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Admin Credentials: admin@winkmeclub.com / Admin@123');
    console.log('Demo User Credentials:  user@winkmeclub.com / User@123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
