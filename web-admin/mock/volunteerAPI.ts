const volunteers = [
  {
    id: '1',
    name: '张三',
    phone: '13800000000',
    volunteerType: '讲解服务',
    serviceType: '半天',
    serviceHours: 4,
    lectureCount: 2,
    totalPoints: 5,
    registerTime: '2024-06-01 10:00:00',
    lastServiceTime: '2024-06-10 09:30:00',
  },
  {
    id: '2',
    name: '李四',
    phone: '13900000001',
    volunteerType: '场馆服务',
    serviceType: '全天',
    serviceHours: 8,
    lectureCount: 0,
    totalPoints: 2,
    registerTime: '2024-06-02 11:00:00',
    lastServiceTime: '2024-06-11 13:30:00',
  },
];

export default {
  'GET /api/volunteers': (req: any, res: any) => {
    res.json({
      success: true,
      data: {
        list: volunteers,
        total: volunteers.length,
      },
    });
  },
}; 