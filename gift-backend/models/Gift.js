const mongoose = require('mongoose');

const GiftSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  stock: { type: Number, required: true },
  points: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Gift', GiftSchema); 