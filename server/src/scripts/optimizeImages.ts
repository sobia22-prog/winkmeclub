import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { GirlProfile } from '../models/girlProfile.model';
import { User } from '../models/user.model';
import { Product } from '../models/product.model';
import { Announcement } from '../models/announcement.model';
import { RechargeRequest } from '../models/recharge.model';
import { Verification } from '../models/verification.model';
import { SystemSettings } from '../models/systemSettings.model';
import { compressToWebp, isBase64Image } from '../utils/imageCompressor';

async function runOptimization() {
  console.log('====================================================');
  console.log('🚀 Wink Me Club - Database Image Optimizer (WebP)');
  console.log('====================================================');

  try {
    await connectDB();

    let totalUpdated = 0;
    let totalBytesSaved = 0;

    // 1. Girl Profiles
    console.log('\n[1/7] Scanning Girl Profiles...');
    const girlProfiles = await GirlProfile.find();
    let gpCount = 0;
    for (const gp of girlProfiles) {
      let changed = false;
      if (gp.profileImage && isBase64Image(gp.profileImage)) {
        const oldLen = gp.profileImage.length;
        const compressed = await compressToWebp(gp.profileImage);
        if (compressed !== gp.profileImage) {
          totalBytesSaved += Math.max(0, oldLen - compressed.length);
          gp.profileImage = compressed;
          changed = true;
        }
      }
      if (Array.isArray(gp.galleryImages) && gp.galleryImages.length > 0) {
        const newGallery: string[] = [];
        for (const img of gp.galleryImages) {
          if (isBase64Image(img)) {
            const oldLen = img.length;
            const compressed = await compressToWebp(img);
            if (compressed !== img) {
              totalBytesSaved += Math.max(0, oldLen - compressed.length);
              changed = true;
            }
            newGallery.push(compressed);
          } else {
            newGallery.push(img);
          }
        }
        if (changed) gp.galleryImages = newGallery;
      }
      if (changed) {
        await gp.save();
        gpCount++;
        totalUpdated++;
        console.log(`  ✓ Optimized Girl Profile: ${gp.name} (${gp._id})`);
      }
    }
    console.log(`  Total Girl Profiles optimized: ${gpCount}`);

    // 2. Users
    console.log('\n[2/7] Scanning Users...');
    const users = await User.find({ profileImage: { $exists: true, $ne: '' } });
    let uCount = 0;
    for (const u of users) {
      if (u.profileImage && isBase64Image(u.profileImage)) {
        const oldLen = u.profileImage.length;
        const compressed = await compressToWebp(u.profileImage);
        if (compressed !== u.profileImage) {
          totalBytesSaved += Math.max(0, oldLen - compressed.length);
          u.profileImage = compressed;
          await u.save();
          uCount++;
          totalUpdated++;
          console.log(`  ✓ Optimized User Profile Image: ${u.fullName} (${u._id})`);
        }
      }
    }
    console.log(`  Total Users optimized: ${uCount}`);

    // 3. Products
    console.log('\n[3/7] Scanning Products...');
    const products = await Product.find({ image: { $exists: true, $ne: '' } });
    let pCount = 0;
    for (const p of products) {
      if (p.image && isBase64Image(p.image)) {
        const oldLen = p.image.length;
        const compressed = await compressToWebp(p.image);
        if (compressed !== p.image) {
          totalBytesSaved += Math.max(0, oldLen - compressed.length);
          p.image = compressed;
          await p.save();
          pCount++;
          totalUpdated++;
          console.log(`  ✓ Optimized Product Image: ${p.name} (${p._id})`);
        }
      }
    }
    console.log(`  Total Products optimized: ${pCount}`);

    // 4. Announcements
    console.log('\n[4/7] Scanning Announcements...');
    const announcements = await Announcement.find({ image: { $exists: true, $ne: '' } });
    let aCount = 0;
    for (const a of announcements) {
      if (a.image && isBase64Image(a.image)) {
        const oldLen = a.image.length;
        const compressed = await compressToWebp(a.image);
        if (compressed !== a.image) {
          totalBytesSaved += Math.max(0, oldLen - compressed.length);
          a.image = compressed;
          await a.save();
          aCount++;
          totalUpdated++;
          console.log(`  ✓ Optimized Announcement Image: ${a.title} (${a._id})`);
        }
      }
    }
    console.log(`  Total Announcements optimized: ${aCount}`);

    // 5. Recharges
    console.log('\n[5/7] Scanning Recharges...');
    const recharges = await RechargeRequest.find({ receiptUrl: { $exists: true, $ne: '' } });
    let rCount = 0;
    for (const r of recharges) {
      if (r.receiptUrl && isBase64Image(r.receiptUrl)) {
        const oldLen = r.receiptUrl.length;
        const compressed = await compressToWebp(r.receiptUrl);
        if (compressed !== r.receiptUrl) {
          totalBytesSaved += Math.max(0, oldLen - compressed.length);
          r.receiptUrl = compressed;
          await r.save();
          rCount++;
          totalUpdated++;
          console.log(`  ✓ Optimized Recharge Receipt: ${r.requestId} (${r._id})`);
        }
      }
    }
    console.log(`  Total Recharges optimized: ${rCount}`);

    // 6. Verifications
    console.log('\n[6/7] Scanning Verifications...');
    const verifications = await Verification.find();
    let vCount = 0;
    for (const v of verifications) {
      let changed = false;
      if (v.idDocumentUrl && isBase64Image(v.idDocumentUrl)) {
        const oldLen = v.idDocumentUrl.length;
        const compressed = await compressToWebp(v.idDocumentUrl);
        if (compressed !== v.idDocumentUrl) {
          totalBytesSaved += Math.max(0, oldLen - compressed.length);
          v.idDocumentUrl = compressed;
          changed = true;
        }
      }
      if (v.selfieUrl && isBase64Image(v.selfieUrl)) {
        const oldLen = v.selfieUrl.length;
        const compressed = await compressToWebp(v.selfieUrl);
        if (compressed !== v.selfieUrl) {
          totalBytesSaved += Math.max(0, oldLen - compressed.length);
          v.selfieUrl = compressed;
          changed = true;
        }
      }
      if (changed) {
        await v.save();
        vCount++;
        totalUpdated++;
        console.log(`  ✓ Optimized Verification Documents: ${v.fullName} (${v._id})`);
      }
    }
    console.log(`  Total Verifications optimized: ${vCount}`);

    // 7. System Settings
    console.log('\n[7/7] Scanning System Settings...');
    const settings = await SystemSettings.findOne();
    if (settings && settings.projectImage && isBase64Image(settings.projectImage)) {
      const oldLen = settings.projectImage.length;
      const compressed = await compressToWebp(settings.projectImage);
      if (compressed !== settings.projectImage) {
        totalBytesSaved += Math.max(0, oldLen - compressed.length);
        settings.projectImage = compressed;
        await settings.save();
        totalUpdated++;
        console.log(`  ✓ Optimized System Project Image`);
      }
    }

    const mbSaved = (totalBytesSaved / (1024 * 1024)).toFixed(2);
    console.log('\n====================================================');
    console.log(`🎉 Optimization Complete!`);
    console.log(`Documents Updated: ${totalUpdated}`);
    console.log(`Space Saved: ~${mbSaved} MB (${totalBytesSaved} bytes)`);
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Optimization failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runOptimization();
