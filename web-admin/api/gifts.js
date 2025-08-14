import { db } from './db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await db.getGifts();
      // 返回与前端期望的格式一致的数据
      res.status(200).json({ code: 0, data: data });
    } catch (error) {
      res.status(500).json({ code: 1, msg: '获取数据失败' });
    }
  } else if (req.method === 'POST') {
    try {
      const success = await db.saveGifts(req.body);
      if (success) {
        res.status(200).json({ message: '保存成功' });
      } else {
        res.status(500).json({ error: '保存失败' });
      }
    } catch (error) {
      res.status(500).json({ error: '保存失败' });
    }
  } else {
    res.status(405).json({ error: '方法不允许' });
  }
} 