import { Request, Response } from 'express';

interface ActivityItem {
  id: string;
  title: string;
  image: string;
  content: string;
  createdAt: string;
  status: string;
}

let activities: ActivityItem[] = [
  {
    id: '1',
    title: '博物馆志愿者招募活动',
    image: 'https://via.placeholder.com/300x200/1763a6/ffffff?text=活动图片1',
    content: '欢迎加入我们的志愿者团队，为博物馆文化传播贡献力量。',
    createdAt: '2025-01-15 10:00:00',
    status: '进行中',
  },
  {
    id: '2',
    title: '文物讲解员培训',
    image: 'https://via.placeholder.com/300x200/1763a6/ffffff?text=活动图片2',
    content: '专业的文物讲解培训，提升讲解技能和服务质量。',
    createdAt: '2025-01-10 14:30:00',
    status: '已完成',
  },
];

export default {
  'GET /api/activities': (req: Request, res: Response) => {
    res.json(activities);
  },
  
  'POST /api/activities': (req: Request, res: Response) => {
    const { title, image, content } = req.body;
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      title,
      image,
      content,
      createdAt: new Date().toISOString(),
      status: '进行中',
    };
    activities.push(newActivity);
    res.json(newActivity);
  },
  
  'PUT /api/activities/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, image, content } = req.body;
    const index = activities.findIndex(item => item.id === id);
    if (index !== -1) {
      activities[index] = { ...activities[index], title, image, content };
      res.json(activities[index]);
    } else {
      res.status(404).json({ error: '活动不存在' });
    }
  },
  
  'DELETE /api/activities/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const index = activities.findIndex(item => item.id === id);
    if (index !== -1) {
      activities.splice(index, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: '活动不存在' });
    }
  },
}; 