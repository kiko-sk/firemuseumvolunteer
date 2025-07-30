import { Request, Response } from 'express';

let volunteerStyles = [
  {
    id: '1',
    name: '张三',
    desc: '优秀志愿者',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    sort: 1,
  },
  {
    id: '2',
    name: '李四',
    desc: '服务之星',
    imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    sort: 2,
  },
  {
    id: '3',
    name: '王五',
    desc: '热心公益',
    imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    sort: 3,
  },
  {
    id: '4',
    name: '赵六',
    desc: '志愿先锋',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    sort: 4,
  },
  {
    id: '5',
    name: '钱七',
    desc: '微笑天使',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    sort: 5,
  },
  {
    id: '6',
    name: '孙八',
    desc: '青春榜样',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    sort: 6,
  },
];

export default {
  'GET /api/volunteer-style': (req: Request, res: Response) => {
    res.json({ code: 0, data: volunteerStyles });
  },
}; 