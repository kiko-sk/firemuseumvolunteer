import { Request, Response } from 'express';

interface LeaveRecord {
  name: string;
  time: string;
  reason: string;
}

interface SignupItem {
  id: string;
  dayType: string;
  signupStart: string;
  signupEnd: string;
  serviceType: string;
  timeSlot: string;
  requiredCount: number;
  signedCount: number;
  status: string;
  signups: Array<{ name: string; time: string }>;
  leaves: LeaveRecord[];
}

let signupList: SignupItem[] = [
  {
    id: '1',
    dayType: '双休日',
    signupStart: '2025-07-09 19:00:00',
    signupEnd: '2025-07-13 12:00:00',
    serviceType: '场馆服务',
    timeSlot: '上午',
    requiredCount: 5,
    signedCount: 2,
    status: '报名中',
    signups: [
      { name: '张三', time: '2025-07-09 19:01:00' },
      { name: '李四', time: '2025-07-09 19:02:00' },
    ],
    leaves: [],
  },
  {
    id: '2',
    dayType: '双休日',
    signupStart: '2025-07-09 19:00:00',
    signupEnd: '2025-07-13 12:00:00',
    serviceType: '讲解服务',
    timeSlot: '下午',
    requiredCount: 5,
    signedCount: 1,
    status: '报名中',
    signups: [
      { name: '王五', time: '2025-07-09 19:03:00' },
    ],
    leaves: [],
  },
];

export default {
  'GET /api/signup-list': (req: Request, res: Response) => {
    res.json({ code: 0, data: signupList });
  },
  'POST /api/signup': (req: Request, res: Response) => {
    const { name, serviceType, date, timeSlot } = req.body;
    const found = signupList.find(item => item.serviceType === serviceType && item.timeSlot === timeSlot && item.signupStart.startsWith(date));
    if (found) {
      if (found.signedCount >= found.requiredCount) {
        return res.json({ code: 1, msg: '该班次已满员' });
      }
      found.signups.push({ name, time: new Date().toISOString() });
      found.signedCount = found.signups.length;
      res.json({ code: 0, msg: '报名成功' });
    } else {
      res.json({ code: 1, msg: '未找到对应班次' });
    }
  },
  'POST /api/leave': (req: Request, res: Response) => {
    const { name, serviceType, date, timeSlot, reason } = req.body;
    const found = signupList.find(item => item.serviceType === serviceType && item.timeSlot === timeSlot && item.signupStart.startsWith(date));
    if (found) {
      found.leaves.push({ name, time: new Date().toISOString(), reason });
      res.json({ code: 0, msg: '请假成功' });
    } else {
      res.json({ code: 1, msg: '未找到对应班次' });
    }
  },
}; 