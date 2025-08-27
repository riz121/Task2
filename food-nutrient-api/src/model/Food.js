const mongoose = require('mongoose');

const FoodSchema = new mongoose.Schema({
  food_cd: { type: String, index: true },
  group_name: String,
  food_name: { type: String, index: true, required: true },
  research_year: String,
  maker_name: String,
  ref_name: String,
  serving_size: String,
  calorie: Number,
  carbohydrate: Number,
  protein: Number,
  province: Number,
  sugars: Number,
  salt: Number,
  cholesterol: Number,
  saturated_fatty_acids: Number,
  trans_fat: Number
}, { timestamps: true });

module.exports = mongoose.model('Food', FoodSchema);
