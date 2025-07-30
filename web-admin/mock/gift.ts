import { Request, Response } from 'express';

let gifts = [
  {
    id: '1001',
    image: 'https://img.zcool.cn/community/01b6b95d5e7e6fa801216518a8e7e2.jpg',
    name: '博物馆定制水杯',
    stock: 5,
    points: 10,
  },
  {
    id: '1002',
    image: 'https://img.zcool.cn/community/01b6b95d5e7e6fa801216518a8e7e2.jpg',
    name: '消防文创T恤',
    stock: 3,
    points: 20,
  },
  {
    id: '1003',
    image: 'https://img.zcool.cn/community/01b6b95d5e7e6fa801216518a8e7e2.jpg',
    name: '消防车模型',
    stock: 1,
    points: 50,
  },
  {
    id: '1004',
    image: 'https://img.zcool.cn/community/01b6b95d5e7e6fa801216518a8e7e2.jpg',
    name: '消防员主题徽章',
    stock: 10,
    points: 5,
  },
];

let exchangeRecords = [
  { id: '1', giftId: '1001', giftName: '博物馆定制水杯', points: 10, date: '2023年6月10日' },
  { id: '2', giftId: '1002', giftName: '消防文创T恤', points: 20, date: '2023年5月25日' },
  { id: '3', giftId: '1004', giftName: '消防员主题徽章', points: 5, date: '2023年5月10日' },
];

let userPoints = 85;

export default {
  'GET /api/gifts': (req: Request, res: Response) => {
    res.json({ code: 0, data: gifts });
  },
  'POST /api/gifts': (req: Request, res: Response) => {
    const { image, name, stock, points } = req.body;
    const id = (Math.random() * 100000).toFixed(0);
    const newGift = { id, image, name, stock, points };
    gifts.push(newGift);
    res.json({ code: 0, data: newGift });
  },
  'PUT /api/gifts/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const { image, name, stock, points } = req.body;
    const idx = gifts.findIndex(g => g.id === id);
    if (idx === -1) return res.json({ code: 1, msg: '礼品不存在' });
    gifts[idx] = { ...gifts[idx], image, name, stock, points };
    res.json({ code: 0, data: gifts[idx] });
  },
  'DELETE /api/gifts/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const idx = gifts.findIndex(g => g.id === id);
    if (idx === -1) return res.json({ code: 1, msg: '礼品不存在' });
    const deleted = gifts.splice(idx, 1);
    res.json({ code: 0, data: deleted[0] });
  },
  'GET /api/points': (req: Request, res: Response) => {
    res.json({ code: 0, points: userPoints });
  },
  'POST /api/exchange': (req: Request, res: Response) => {
    const { giftId } = req.body;
    const gift = gifts.find(g => g.id === giftId);
    if (!gift) return res.json({ code: 1, msg: '礼品不存在' });
    if (gift.stock <= 0) return res.json({ code: 1, msg: '库存不足' });
    if (userPoints < gift.points) return res.json({ code: 1, msg: '积分不足' });
    gift.stock -= 1;
    userPoints -= gift.points;
    exchangeRecords.unshift({
      id: (Math.random() * 100000).toFixed(0),
      giftId: gift.id,
      giftName: gift.name,
      points: gift.points,
      date: new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }),
    });
    res.json({ code: 0 });
  },
  'GET /api/exchange-records': (req: Request, res: Response) => {
    res.json({ code: 0, data: exchangeRecords });
  },
}; 