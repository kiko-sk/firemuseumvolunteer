import { db } from './db';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const data = await db.getSignupList();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: '获取数据失败' });
    }
  } else if (req.method === 'POST') {
    try {
      const success = await db.saveSignupList(req.body);
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
