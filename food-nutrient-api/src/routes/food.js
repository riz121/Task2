const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const Food = require('../model/Food');
const router = express.Router();

/**
 * Helper: send validation errors
 */
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  return null;
}

/**
 * GET /foods
 * Query params: food_name, research_year, maker_name, food_code, page, per_page
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('per_page').optional().isInt({ min: 1, max: 500 }).toInt()
  ],
  async (req, res) => {
    const errResp = handleValidationErrors(req, res);
    if (errResp) return errResp;

    try {
      const { food_name, research_year, maker_name, food_code } = req.query;
      const page = parseInt(req.query.page || 1);
      const per_page = parseInt(req.query.per_page || 20);
      const filter = {};

      if (food_name) filter.food_name = { $regex: food_name, $options: 'i' };
      if (research_year) filter.research_year = research_year;
      if (maker_name) filter.maker_name = { $regex: maker_name, $options: 'i' };
      if (food_code) filter.food_cd = food_code;

      const total = await Food.countDocuments(filter);
      const items = await Food.find(filter).skip((page - 1) * per_page).limit(per_page).lean();

      res.json({ total, page, per_page, items });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'internal error' });
    }
  }
);

/**
 * GET /foods/:id
 */
router.get('/:id', [param('id').isMongoId()], async (req, res) => {
  const errResp = handleValidationErrors(req, res);
  if (errResp) return errResp;

  try {
    const doc = await Food.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * POST /foods
 */
router.post(
  '/',
  [
    body('food_cd').optional().isString().trim(),
    body('food_name').notEmpty().withMessage('food_name is required').trim(),
    body('calorie').optional().isNumeric(),
    body('carbohydrate').optional().isNumeric(),
    body('protein').optional().isNumeric()
    // add more validators as needed
  ],
  async (req, res) => {
    const errResp = handleValidationErrors(req, res);
    if (errResp) return errResp;

    try {
      const doc = new Food(req.body);
      await doc.save();
      res.status(201).json(doc);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'internal error' });
    }
  }
);

/**
 * PUT /foods/:id
 */
router.put('/:id', [param('id').isMongoId()], async (req, res) => {
  const errResp = handleValidationErrors(req, res);
  if (errResp) return errResp;

  try {
    const doc = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

/**
 * DELETE /foods/:id
 */
router.delete('/:id', [param('id').isMongoId()], async (req, res) => {
  const errResp = handleValidationErrors(req, res);
  if (errResp) return errResp;

  try {
    const doc = await Food.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json({ deleted: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;
