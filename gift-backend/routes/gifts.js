const express = require('express');
const router = express.Router();
const Gift = require('../models/Gift');

// 获取所有礼品
router.get('/', async (req, res) => {
  const gifts = await Gift.find().sort({ createdAt: -1 });
  res.json({ code: 0, data: gifts });
});

// 新增礼品
router.post('/', async (req, res) => {
  const gift = new Gift(req.body);
  await gift.save();
  res.json({ code: 0, data: gift });
});

// 编辑礼品
router.put('/:id', async (req, res) => {
  await Gift.findByIdAndUpdate(req.params.id, req.body);
  res.json({ code: 0 });
});

// 删除礼品
router.delete('/:id', async (req, res) => {
  await Gift.findByIdAndDelete(req.params.id);
  res.json({ code: 0 });
});

module.exports = router; 