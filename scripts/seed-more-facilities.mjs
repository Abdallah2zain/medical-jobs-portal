import mysql from 'mysql2/promise';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;

async function seedFacilities() {
  const connection = await mysql.createConnection(DATABASE_URL);
  
  // قراءة البيانات من الملف
  const data = JSON.parse(fs.readFileSync('./data/wikipedia_hospitals.json', 'utf8'));
  
  console.log(`Found ${data.hospitals.length} hospitals to insert`);
  
  let inserted = 0;
  let skipped = 0;
  
  for (const hospital of data.hospitals) {
    try {
      // التحقق من عدم وجود المستشفى مسبقاً
      const [existing] = await connection.execute(
        'SELECT id FROM medical_facilities WHERE name = ?',
        [hospital.name]
      );
      
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      
      // تحديد نوع المنشأة
      let facilityType = 'hospital';
      if (hospital.name.includes('مجمع') || hospital.name.includes('مدينة')) {
        facilityType = 'complex';
      } else if (hospital.name.includes('مركز')) {
        facilityType = 'center';
      } else if (hospital.name.includes('عيادة') || hospital.name.includes('عيادات')) {
        facilityType = 'clinic';
      }
      
      // إدخال المستشفى
      await connection.execute(
        `INSERT INTO medical_facilities (name, city, address, type, website, verificationStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, 'pending', NOW(), NOW())`,
        [
          hospital.name,
          hospital.city || 'الرياض',
          hospital.location || hospital.city || '',
          facilityType,
          hospital.website || null
        ]
      );
      
      inserted++;
      console.log(`✓ Inserted: ${hospital.name}`);
    } catch (error) {
      console.error(`✗ Error inserting ${hospital.name}:`, error.message);
    }
  }
  
  console.log(`\\nSummary: Inserted ${inserted}, Skipped ${skipped} (already exist)`);
  
  await connection.end();
}

seedFacilities().catch(console.error);
