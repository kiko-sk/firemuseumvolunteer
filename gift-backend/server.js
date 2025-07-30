const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8001;
const DATA_FILE = path.join(__dirname, 'gifts.json');

app.use(cors());
app.use(express.json());

// 读取礼品数据
function readGifts() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}
// 写入礼品数据
function writeGifts(gifts) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(gifts, null, 2), 'utf-8');
}

// 获取所有礼品
app.get('/api/gifts', (req, res) => {
  const gifts = readGifts();
  res.json({ code: 0, data: gifts });
});

// 新增礼品
app.post('/api/gifts', (req, res) => {
  const gifts = readGifts();
  const newGift = { ...req.body, id: Date.now().toString() };
  gifts.push(newGift);
  writeGifts(gifts);
  res.json({ code: 0, data: newGift });
});

// 编辑礼品
app.put('/api/gifts/:id', (req, res) => {
  const gifts = readGifts();
  const idx = gifts.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: 1, msg: '未找到礼品' });
  gifts[idx] = { ...gifts[idx], ...req.body };
  writeGifts(gifts);
  res.json({ code: 0, data: gifts[idx] });
});

// 删除礼品
app.delete('/api/gifts/:id', (req, res) => {
  let gifts = readGifts();
  const idx = gifts.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: 1, msg: '未找到礼品' });
  const deleted = gifts[idx];
  gifts = gifts.filter(g => g.id !== req.params.id);
  writeGifts(gifts);
  res.json({ code: 0, data: deleted });
});

app.listen(PORT, () => {
  console.log(`Gift backend running at http://localhost:${PORT}`);
}); 