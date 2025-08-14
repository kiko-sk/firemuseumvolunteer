import { db } from './db';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { giftId, points } = req.body;
      
      // 获取当前积分
      const currentPoints = await db.getPoints();
      const userPoints = currentPoints.points || 0;
      
      // 获取礼品信息
      const gifts = await db.getGifts();
      const gift = gifts.find(g => g.id === giftId);
      
      if (!gift) {
        return res.status(400).json({ error: '礼品不存在' });
      }
      
      if (userPoints < gift.points) {
        return res.status(400).json({ error: '积分不足' });
      }
      
      if (gift.stock <= 0) {
        return res.status(400).json({ error: '礼品库存不足' });
      }
      
      // 扣除积分
      const newPoints = userPoints - gift.points;
      await db.savePoints({ points: newPoints });
      
      // 减少库存
      const updatedGifts = gifts.map(g => 
        g.id === giftId ? { ...g, stock: g.stock - 1 } : g
      );
      await db.saveGifts(updatedGifts);
      
      // 记录兑换记录
      const exchangeRecords = await db.getExchangeRecords();
      const newRecord = {
        id: Date.now().toString(),
        giftName: gift.name,
        points: gift.points,
        date: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      exchangeRecords.push(newRecord);
      await db.saveExchangeRecords(exchangeRecords);
      
      res.status(200).json({ 
        message: '兑换成功',
        remainingPoints: newPoints,
        gift: gift
      });
    } catch (error) {
      res.status(500).json({ error: '兑换失败' });
    }
  } else {
    res.status(405).json({ error: '方法不允许' });
  }
}
