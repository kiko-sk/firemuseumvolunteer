const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/giftdb';

// Data files
const GIFTS_FILE = path.join(__dirname, 'gifts.json');
const VOLUNTEER_STYLE_FILE = path.join(__dirname, 'volunteer-style.json');
const ACTIVITIES_FILE = path.join(__dirname, 'activities.json');
const SIGNUP_LIST_FILE = path.join(__dirname, 'signup-list.json');
const POINTS_FILE = path.join(__dirname, 'points.json');

// Helper functions for file operations
function readJsonFile(filePath, defaultValue = []) {
  if (!fs.existsSync(filePath)) return defaultValue;
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Initialize data files if they don't exist
if (!fs.existsSync(VOLUNTEER_STYLE_FILE)) {
  const defaultVolunteerStyle = [
    { imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', name: '张三', desc: '优秀志愿者' },
    { imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80', name: '李四', desc: '服务之星' },
    { imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80', name: '王五', desc: '热心公益' },
    { imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80', name: '赵六', desc: '志愿先锋' },
    { imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', name: '钱七', desc: '微笑天使' },
    { imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80', name: '孙八', desc: '青春榜样' },
  ];
  writeJsonFile(VOLUNTEER_STYLE_FILE, defaultVolunteerStyle);
}

if (!fs.existsSync(ACTIVITIES_FILE)) {
  const defaultActivities = [
    {
      id: '1',
      title: '消防知识科普活动',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      content: '通过互动体验，学习消防安全知识，提高安全意识。',
      createdAt: new Date().toISOString()
    }
  ];
  writeJsonFile(ACTIVITIES_FILE, defaultActivities);
}

if (!fs.existsSync(SIGNUP_LIST_FILE)) {
  const defaultSignupList = [
    {
      id: '1',
      serviceType: '场馆服务',
      timeSlot: '上午',
      signupStart: new Date().toISOString().slice(0, 10) + ' 09:00:00',
      signupEnd: new Date().toISOString().slice(0, 10) + ' 12:00:00',
      signedCount: 2,
      requiredCount: 5,
      signups: [
        { name: '张三', time: '2024-01-15 09:00' },
        { name: '李四', time: '2024-01-15 09:30' }
      ]
    },
    {
      id: '2',
      serviceType: '讲解服务',
      timeSlot: '下午',
      signupStart: new Date().toISOString().slice(0, 10) + ' 14:00:00',
      signupEnd: new Date().toISOString().slice(0, 10) + ' 17:00:00',
      signedCount: 1,
      requiredCount: 3,
      signups: [
        { name: '王五', time: '2024-01-15 14:00' }
      ]
    }
  ];
  writeJsonFile(SIGNUP_LIST_FILE, defaultSignupList);
}

if (!fs.existsSync(POINTS_FILE)) {
  const defaultPoints = { points: 100 };
  writeJsonFile(POINTS_FILE, defaultPoints);
}

// MongoDB connection (optional)
if (MONGODB_URI !== 'mongodb://localhost:27017/giftdb') {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
}

// Gift APIs
app.get('/api/gifts', (req, res) => {
  const gifts = readJsonFile(GIFTS_FILE);
  res.json({ code: 0, data: gifts });
});

app.post('/api/gifts', (req, res) => {
  const gifts = readJsonFile(GIFTS_FILE);
  const newGift = { ...req.body, id: Date.now().toString() };
  gifts.push(newGift);
  writeJsonFile(GIFTS_FILE, gifts);
  res.json({ code: 0, data: newGift });
});

app.put('/api/gifts/:id', (req, res) => {
  const gifts = readJsonFile(GIFTS_FILE);
  const idx = gifts.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: 1, msg: '未找到礼品' });
  gifts[idx] = { ...gifts[idx], ...req.body };
  writeJsonFile(GIFTS_FILE, gifts);
  res.json({ code: 0, data: gifts[idx] });
});

app.delete('/api/gifts/:id', (req, res) => {
  let gifts = readJsonFile(GIFTS_FILE);
  const idx = gifts.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ code: 1, msg: '未找到礼品' });
  const deleted = gifts[idx];
  gifts = gifts.filter(g => g.id !== req.params.id);
  writeJsonFile(GIFTS_FILE, gifts);
  res.json({ code: 0, data: deleted });
});

// Volunteer style API
app.get('/api/volunteer-style', (req, res) => {
  const volunteerStyle = readJsonFile(VOLUNTEER_STYLE_FILE);
  res.json({ code: 0, data: volunteerStyle });
});

// Activities API
app.get('/api/activities', (req, res) => {
  const activities = readJsonFile(ACTIVITIES_FILE);
  res.json(activities);
});

// Signup list API
app.get('/api/signup-list', (req, res) => {
  const signupList = readJsonFile(SIGNUP_LIST_FILE);
  res.json({ code: 0, data: signupList });
});

app.post('/api/signup', (req, res) => {
  const { name, serviceType, timeSlot, date } = req.body;
  const signupList = readJsonFile(SIGNUP_LIST_FILE);
  
  const dateStr = date.split('T')[0];
  const signupItem = signupList.find(item => {
    const itemDate = item.signupStart.split(' ')[0];
    return item.serviceType === serviceType && 
           item.timeSlot === timeSlot && 
           itemDate === dateStr;
  });

  if (!signupItem) {
    return res.status(404).json({ code: 1, msg: '未找到对应班次' });
  }

  if (signupItem.signedCount >= signupItem.requiredCount) {
    return res.status(400).json({ code: 1, msg: '该班次已满员' });
  }

  const now = new Date();
  const signupStart = new Date(signupItem.signupStart);
  const signupEnd = new Date(signupItem.signupEnd);

  if (now < signupStart || now > signupEnd) {
    return res.status(400).json({ code: 1, msg: '不在报名时间范围内' });
  }

  // Add signup
  if (!signupItem.signups) signupItem.signups = [];
  signupItem.signups.push({ name, time: now.toISOString() });
  signupItem.signedCount++;

  writeJsonFile(SIGNUP_LIST_FILE, signupList);
  res.json({ code: 0, msg: '报名成功' });
});

// Points API
app.get('/api/points', (req, res) => {
  const points = readJsonFile(POINTS_FILE);
  res.json(points);
});

// Exchange API
app.post('/api/exchange', (req, res) => {
  const { giftId } = req.body;
  const gifts = readJsonFile(GIFTS_FILE);
  const points = readJsonFile(POINTS_FILE);
  
  const gift = gifts.find(g => g.id === giftId);
  if (!gift) {
    return res.status(404).json({ code: 1, msg: '礼品不存在' });
  }

  if (points.points < gift.points) {
    return res.status(400).json({ code: 1, msg: '积分不足' });
  }

  if (gift.stock <= 0) {
    return res.status(400).json({ code: 1, msg: '库存不足' });
  }

  // Process exchange
  points.points -= gift.points;
  gift.stock--;

  writeJsonFile(POINTS_FILE, points);
  writeJsonFile(GIFTS_FILE, gifts);

  res.json({ code: 0, msg: '兑换成功' });
});

// Sign in API
app.post('/api/signin', (req, res) => {
  const { latitude, longitude } = req.body;
  const MUSEUM_LAT = 31.22874;
  const MUSEUM_LNG = 121.47564;
  const ALLOW_RADIUS = 500; // 米

  function getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const distance = getDistanceFromLatLonInMeters(latitude, longitude, MUSEUM_LAT, MUSEUM_LNG);
  
  if (distance > ALLOW_RADIUS) {
    return res.status(400).json({ code: 1, msg: '您不在博物馆范围内，无法签到' });
  }

  // Add points for sign in
  const points = readJsonFile(POINTS_FILE);
  points.points += 10; // 签到奖励10积分
  writeJsonFile(POINTS_FILE, points);

  res.json({ code: 0, msg: '签到成功', points: points.points });
});

app.use('/api/gifts', require('./routes/gifts'));

app.get('/', (req, res) => {
  res.send('Fire Museum Volunteer Backend API running');
});

app.listen(PORT, () => {
  console.log(`API server running at http://localhost:${PORT}`);
}); 