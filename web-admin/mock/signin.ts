import { Request, Response } from 'express';
import dayjs from 'dayjs';

interface SigninRecord {
  id: string;
  volunteerName: string;
  volunteerPhone: string;
  signinTime: string;
  signinLocation: string;
  serviceType: string;
  status: 'normal' | 'late' | 'absent';
  remark?: string;
}

interface SigninStats {
  totalSignins: number;
  todaySignins: number;
  weekSignins: number;
  monthSignins: number;
  onTimeRate: number;
  lateRate: number;
  absentRate: number;
}

// 模拟签到数据
let signinRecords: SigninRecord[] = [
  {
    id: '1',
    volunteerName: '张三',
    volunteerPhone: '13812345678',
    signinTime: '2025-01-15 08:30:00',
    signinLocation: '博物馆正门',
    serviceType: '场馆服务',
    status: 'normal',
    remark: '准时到岗',
  },
  {
    id: '2',
    volunteerName: '李四',
    volunteerPhone: '13987654321',
    signinTime: '2025-01-15 09:15:00',
    signinLocation: '博物馆正门',
    serviceType: '讲解服务',
    status: 'late',
    remark: '迟到15分钟',
  },
  {
    id: '3',
    volunteerName: '王五',
    volunteerPhone: '13765432109',
    signinTime: '2025-01-15 08:45:00',
    signinLocation: '博物馆正门',
    serviceType: '场馆服务',
    status: 'normal',
    remark: '',
  },
  {
    id: '4',
    volunteerName: '赵六',
    volunteerPhone: '13654321098',
    signinTime: '2025-01-14 08:30:00',
    signinLocation: '博物馆正门',
    serviceType: '讲解服务',
    status: 'normal',
    remark: '',
  },
  {
    id: '5',
    volunteerName: '孙七',
    volunteerPhone: '13543210987',
    signinTime: '2025-01-14 09:30:00',
    signinLocation: '博物馆正门',
    serviceType: '场馆服务',
    status: 'late',
    remark: '迟到1小时',
  },
];

// 计算统计数据
const calculateStats = (records: SigninRecord[], startDate?: string, endDate?: string, serviceType?: string): SigninStats => {
  let filteredRecords = records;

  // 按日期筛选
  if (startDate && endDate) {
    filteredRecords = records.filter(record => {
      const recordDate = dayjs(record.signinTime);
      return recordDate.isAfter(startDate) && recordDate.isBefore(endDate);
    });
  }

  // 按服务类型筛选
  if (serviceType && serviceType !== 'all') {
    filteredRecords = filteredRecords.filter(record => record.serviceType === serviceType);
  }

  const total = filteredRecords.length;
  const normal = filteredRecords.filter(r => r.status === 'normal').length;
  const late = filteredRecords.filter(r => r.status === 'late').length;
  const absent = filteredRecords.filter(r => r.status === 'absent').length;

  // 计算今日、本周、本月签到数
  const today = dayjs().format('YYYY-MM-DD');
  const weekStart = dayjs().startOf('week').format('YYYY-MM-DD');
  const monthStart = dayjs().startOf('month').format('YYYY-MM-DD');

  const todaySignins = filteredRecords.filter(r => 
    dayjs(r.signinTime).format('YYYY-MM-DD') === today
  ).length;

  const weekSignins = filteredRecords.filter(r => 
    dayjs(r.signinTime).isAfter(weekStart)
  ).length;

  const monthSignins = filteredRecords.filter(r => 
    dayjs(r.signinTime).isAfter(monthStart)
  ).length;

  return {
    totalSignins: total,
    todaySignins,
    weekSignins,
    monthSignins,
    onTimeRate: total > 0 ? Math.round((normal / total) * 100) : 0,
    lateRate: total > 0 ? Math.round((late / total) * 100) : 0,
    absentRate: total > 0 ? Math.round((absent / total) * 100) : 0,
  };
};

export default {
  'GET /api/signin-records': (req: Request, res: Response) => {
    const { startDate, endDate, serviceType } = req.query;
    
    const stats = calculateStats(
      signinRecords,
      startDate as string,
      endDate as string,
      serviceType as string
    );

    res.json({
      code: 0,
      records: signinRecords,
      stats,
    });
  },

  'POST /api/signin': (req: Request, res: Response) => {
    const { volunteerName, volunteerPhone, serviceType, location } = req.body;
    
    const now = dayjs();
    const expectedTime = dayjs().hour(8).minute(30); // 预期签到时间 8:30
    const isLate = now.isAfter(expectedTime);
    
    const newRecord: SigninRecord = {
      id: Date.now().toString(),
      volunteerName,
      volunteerPhone,
      signinTime: now.format('YYYY-MM-DD HH:mm:ss'),
      signinLocation: location || '博物馆正门',
      serviceType,
      status: isLate ? 'late' : 'normal',
      remark: isLate ? '迟到' : '准时到岗',
    };

    signinRecords.push(newRecord);

    res.json({
      code: 0,
      msg: '签到成功',
      data: newRecord,
    });
  },

  'DELETE /api/signin-records/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    const index = signinRecords.findIndex(record => record.id === id);
    
    if (index !== -1) {
      signinRecords.splice(index, 1);
      res.json({ code: 0, msg: '删除成功' });
    } else {
      res.status(404).json({ code: 1, msg: '记录不存在' });
    }
  },
}; 