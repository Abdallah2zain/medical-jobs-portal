import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// قراءة بيانات المنشآت
const dataPath = path.join(__dirname, '../data/facilities_data.json');
const facilitiesData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

async function seedFacilities() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  console.log('بدء إدخال بيانات المنشآت الطبية...');

  for (const facility of facilitiesData.facilities) {
    try {
      // استخراج حسابات التواصل الاجتماعي
      const socialMedia = facility.socialMedia || {};
      
      await connection.execute(
        `INSERT INTO medical_facilities 
          (name, nameEn, type, city, address, phone, email, website, googleMapsUrl, latitude, longitude, 
           instagram, facebook, twitter, snapchat, verificationStatus) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
          nameEn = VALUES(nameEn),
          address = VALUES(address),
          phone = VALUES(phone),
          website = VALUES(website),
          verificationStatus = VALUES(verificationStatus)`,
        [
          facility.name,
          facility.nameEn || null,
          facility.type,
          facility.city,
          facility.address,
          facility.phone,
          facility.email || null,
          facility.website || null,
          facility.googleMapsUrl || null,
          facility.latitude || null,
          facility.longitude || null,
          socialMedia.instagram || null,
          socialMedia.facebook || null,
          socialMedia.twitter || null,
          socialMedia.snapchat || null,
          facility.verificationStatus || 'pending'
        ]
      );
      console.log(`✓ تم إضافة: ${facility.name}`);
    } catch (error) {
      console.error(`✗ خطأ في إضافة ${facility.name}:`, error.message);
    }
  }

  await connection.end();
  console.log('\\nتم الانتهاء من إدخال البيانات!');
  process.exit(0);
}

seedFacilities();
