/**
 * import_data.js
 * Usage:
 *   EXCEL_PATH=/path/to/excel.xlsx MONGO_URI=mongodb://localhost:27017/fooddb node import_data.js
 *
 * When using docker-compose the compose mounts host /mnt/data to /data in container,
 * and EXCEL_PATH should point to /data/<filename.xlsx>
 */
const mongoose = require('mongoose');
const XLSX = require('xlsx');
const Food = require('./models/Food');
require('dotenv').config();

const EXCEL_PATH = process.env.EXCEL_PATH || '/data/통합_...xlsx';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fooddb';

function parseNum(x) {
  if (x === undefined || x === null) return null;
  if (typeof x === 'number') return isFinite(x) ? x : null;
  const s = String(x).trim().replace(/,/g, '');
  if (s === '-' || s === '—' || s === '') return null;
  const v = Number(s);
  return Number.isNaN(v) ? null : v;
}

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGO_URI);
  const wb = XLSX.readFile(EXCEL_PATH);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
  console.log('Rows read:', rows.length);

  // optional: clear collection first (uncomment if desired)
  // await Food.deleteMany({});

  for (const row of rows) {
    const doc = {
      food_cd: row['식품코드'] || row['식품코드 '] || row['food_code'] || row['food_cd'] || null,
      group_name: row['식품군'] || row['group'] || null,
      food_name: row['식품명'] || row['식품이름'] || row['품목명'] || row['food_name'] || null,
      research_year: row['연도'] || row['조사년도'] || row['research_year'] || null,
      maker_name: row['지역 / 제조사'] || row['지역/제조사'] || row['제조사'] || row['maker_name'] || null,
      ref_name: row['성분표출처'] || row['자료출처'] || null,
      serving_size: row['1회제공량'] || row['1회 제공량'] || null,
      calorie: parseNum(row['열량'] || row['kcal']),
      carbohydrate: parseNum(row['탄수화물(g)'] || row['탄수화물'] || row['탄수']),
      protein: parseNum(row['단백질(g)'] || row['단백질']),
      province: parseNum(row['지방(g)'] || row['지방']),
      sugars: parseNum(row['총당류(g)'] || row['당류']),
      salt: parseNum(row['나트륨(㎎)'] || row['나트륨(mg)'] || row['나트륨']),
      cholesterol: parseNum(row['콜레스테롤(㎎)'] || row['콜레스테롤']),
      saturated_fatty_acids: parseNum(row['포화지방산(g)'] || row['포화지방']),
      trans_fat: parseNum(row['트랜스지방(g)'] || row['트랜스지방'] || row['trans'])
    };

    if (doc.food_name || doc.food_cd) {
      try {
        await Food.create(doc);
      } catch (e) {
        console.error('Insert error for', doc.food_name || doc.food_cd, e.message || e);
      }
    }
  }

  console.log('Import complete');
  mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
