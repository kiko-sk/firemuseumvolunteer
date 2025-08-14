import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Button, message } from 'antd';
import { UserOutlined, CalendarOutlined, TrophyOutlined, RiseOutlined, ReloadOutlined, GiftOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { fetchVolunteers } from '../../utils/supabaseVolunteer';
import { fetchSignupRecords } from '../../utils/supabaseSignup';
import { fetchGifts } from '../../utils/supabaseGift';

interface VolunteerData {
  id: string;
  name: string;
  gender: string;
  age: number;
  serviceType: string;
  serviceHours: number;
  serviceScore: number;
  explainScore: number;
  // bonusScore: number; // 暂时注释，Supabase数据库中没有此字段
  totalScore: number;
  redeemedScore: number;
  remainingScore: number;
  status: string;
  remark?: string;
}

interface SignupRecord {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  volunteerType: string;
  serviceSlotId: string;
  date: string;
  serviceType: string;
  timeSlot: string;
  signupTime: string;
  status: string;
  points: number;
  notes?: string;
}

const StatisticsPage: React.FC = () => {
  const [volunteerData, setVolunteerData] = useState<VolunteerData[]>([]);
  const [signupData, setSignupData] = useState<SignupRecord[]>([]);
  const [giftStats, setGiftStats] = useState({ totalGifts: 0, activeGifts: 0, totalStock: 0, totalExchanged: 0, totalPointsUsed: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState<string>('');

  // 本地管理员判定（与各页一致：currentUser.phone==='test'）
  const isLocalAdmin = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    try { const u = JSON.parse(currentUser); return u.phone === 'test'; } catch { return false; }
  };

  // 数据加载（云端模式优先从 Supabase 拉取；本地管理员走 localStorage）
  const loadData = async () => {
    try {
      if (isLocalAdmin()) {
        // 志愿者
        const storedVolunteers = localStorage.getItem('volunteerData');
        const volunteers = storedVolunteers ? JSON.parse(storedVolunteers) : [];
        // 标准化+重算
        const normalized = (Array.isArray(volunteers) ? volunteers : []).map((r: any) => {
          const toNum = (v: any, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
          const serviceHours = toNum(r.serviceHours ?? r.servicehours, 0);
          const sh2025 = toNum(r.serviceHours2025 ?? r.servicehours2025, 0);
          const explain = toNum(r.explainScore ?? r.explainscore ?? r.explanationScore, 0);
          const bonus = toNum(r.bonusScore ?? r.bonusscore, 0);
          const serviceScore = Math.floor(sh2025 / 4);
          const totalscore = toNum(r.totalscore ?? r.totalScore, serviceScore + explain + bonus);
          const redeemed = toNum(r.redeemedscore ?? r.redeemedScore, 0);
          const remaining = toNum(r.remainingscore ?? r.remainingScore, totalscore - redeemed);
          const serviceType = (r.serviceType ?? r.servicetype ?? r.type ?? '').toString();
          return { ...r, serviceHours, serviceHours2025: sh2025, explainScore: explain, bonusScore: bonus, totalscore, redeemedscore: redeemed, remainingscore: remaining, serviceType };
        });
        setVolunteerData(normalized);

        // 报名
        const storedSignups = localStorage.getItem('signupRecords');
        setSignupData(storedSignups ? JSON.parse(storedSignups) : []);

        // 礼品（本地）
        const storedGifts = localStorage.getItem('giftData');
        const gifts = storedGifts ? JSON.parse(storedGifts) : [];
        const gs = {
          totalGifts: gifts.length,
          activeGifts: gifts.filter((g: any) => g.status === 'active').length,
          totalStock: gifts.reduce((s: number, g: any) => s + (Number(g.stock) || 0), 0),
          totalExchanged: gifts.reduce((s: number, g: any) => s + (Number(g.exchanged) || 0), 0),
          totalPointsUsed: gifts.reduce((s: number, g: any) => s + (Number(g.exchanged) || 0) * (Number(g.points) || 0), 0)
        };
        setGiftStats(gs);
      } else {
        // 云端模式
        // 志愿者
        const vols = await fetchVolunteers();
        const normalized = (Array.isArray(vols) ? vols : []).map((r: any) => {
          const toNum = (v: any, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
          const serviceHours = toNum(r.servicehours ?? r.serviceHours, 0);
          const sh2025 = toNum(r.servicehours2025 ?? r.serviceHours2025, 0);
          const explain = toNum(r.explainscore ?? r.explainScore, 0);
          const bonus = toNum(r.bonusscore ?? r.bonusScore, 0);
          const serviceScore = Math.floor(sh2025 / 4);
          const totalscore = toNum(r.totalscore ?? r.totalScore, serviceScore + explain + bonus);
          const redeemed = toNum(r.redeemedscore ?? r.redeemedScore, 0);
          const remaining = toNum(r.remainingscore ?? r.remainingScore, totalscore - redeemed);
          const serviceType = (r.serviceType ?? r.servicetype ?? r.type ?? '').toString();
          return { ...r, serviceHours: serviceHours, serviceHours2025: sh2025, explainScore: explain, bonusScore: bonus, totalscore, redeemedscore: redeemed, remainingscore: remaining, serviceType };
        });
        setVolunteerData(normalized as any);

        // 报名
        try {
          const signups = await fetchSignupRecords();
          setSignupData(Array.isArray(signups) ? signups : []);
        } catch (e) {
          console.warn('云端报名获取失败，回退到本地signupRecords:', e);
          const storedSignups = localStorage.getItem('signupRecords');
          setSignupData(storedSignups ? JSON.parse(storedSignups) : []);
        }

        // 礼品
        try {
          const gifts = await fetchGifts();
          const gs = {
            totalGifts: (gifts || []).length,
            activeGifts: (gifts || []).filter((g: any) => g.status === 'active').length,
            totalStock: (gifts || []).reduce((s: number, g: any) => s + (Number(g.stock) || 0), 0),
            totalExchanged: (gifts || []).reduce((s: number, g: any) => s + (Number(g.exchanged) || 0), 0),
            totalPointsUsed: (gifts || []).reduce((s: number, g: any) => s + (Number(g.exchanged) || 0) * (Number(g.points) || 0), 0)
          };
          setGiftStats(gs);
        } catch (e) {
          console.warn('云端礼品获取失败，回退到本地giftData:', e);
          const storedGifts = localStorage.getItem('giftData');
          const gifts = storedGifts ? JSON.parse(storedGifts) : [];
          const gs = {
            totalGifts: gifts.length,
            activeGifts: gifts.filter((g: any) => g.status === 'active').length,
            totalStock: gifts.reduce((s: number, g: any) => s + (Number(g.stock) || 0), 0),
            totalExchanged: gifts.reduce((s: number, g: any) => s + (Number(g.exchanged) || 0), 0),
            totalPointsUsed: gifts.reduce((s: number, g: any) => s + (Number(g.exchanged) || 0) * (Number(g.points) || 0), 0)
          };
          setGiftStats(gs);
        }
      }

      setLastUpdateTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('统计数据加载失败');
    }
  };

  // 监听localStorage变化
  useEffect(() => {
    loadData();

    // 监听storage事件
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'volunteerData' || e.key === 'signupRecords' || e.key === 'giftData') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 定时刷新数据
    const interval = setInterval(loadData, 5000); // 每5秒刷新一次

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // 计算统计数据
  const totalVolunteers = volunteerData.length;
  const activeVolunteers = volunteerData.filter(v => v.status === 'active').length;
  const needReviewVolunteers = volunteerData.filter(v => v.status === 'need_review').length;
  const inactiveVolunteers = volunteerData.filter(v => v.status === 'inactive').length;
  
  const totalServiceHours = volunteerData.reduce((sum, v: any) => sum + (Number((v as any).serviceHours) || 0), 0);
  const totalServiceScore = volunteerData.reduce((sum, v: any) => sum + (Number((v as any).serviceScore ?? (Math.floor((Number((v as any).serviceHours2025) || 0) / 4))) || 0), 0);
  const totalExplainScore = volunteerData.reduce((sum, v: any) => sum + (Number((v as any).explainScore) || 0), 0);
  // const totalBonusScore = volunteerData.reduce((sum, v: any) => sum + (Number((v as any).bonusScore) || 0), 0);
  const totalScore = volunteerData.reduce((sum, v: any) => sum + (Number((v as any).totalscore ?? (v as any).totalScore) || 0), 0);
  const totalRedeemedScore = volunteerData.reduce((sum, v: any) => sum + (Number((v as any).redeemedscore ?? (v as any).redeemedScore) || 0), 0);
  const totalRemainingScore = volunteerData.reduce((sum, v: any) => sum + (Number((v as any).remainingscore ?? (v as any).remainingScore) || 0), 0);

  // 报名统计
  const totalSignups = signupData.length;
  const confirmedSignups = signupData.filter(s => s.status === 'confirmed').length;
  const pendingSignups = signupData.filter(s => s.status === 'pending').length;
  const cancelledSignups = signupData.filter(s => s.status === 'cancelled').length;
  const waitlistSignups = signupData.filter(s => s.status === 'waitlist').length;

  // 学生志愿者vs社会志愿者
  const studentVolunteers = signupData.filter(s => s.volunteerType === '学生志愿者').length;
  const socialVolunteers = signupData.filter(s => s.volunteerType === '社会志愿者').length;

  // 服务类型统计（改为基于志愿者画像的 serviceType，而非报名记录，避免报名缺字段导致为0）
  const venueServiceCount = volunteerData.filter((v: any) => (v.serviceType || '') === '场馆服务').length;
  const explainServiceCount = volunteerData.filter((v: any) => (v.serviceType || '') === '讲解服务').length;

  // 计算活跃度
  const activeRate = totalVolunteers > 0 ? Math.round((activeVolunteers / totalVolunteers) * 100) : 0;
  const completionRate = totalSignups > 0 ? Math.round((confirmedSignups / totalSignups) * 100) : 0;

  // 月度数据（基于当前月份）
  const currentMonth = dayjs().format('M月');
  const monthlyData = [
    { 
      month: currentMonth, 
      volunteers: totalVolunteers, 
      activities: totalSignups, 
      points: totalScore,
      serviceHours: totalServiceHours
    }
  ];

  const columns = [
    { title: '月份', dataIndex: 'month', key: 'month' },
    { title: '志愿者数', dataIndex: 'volunteers', key: 'volunteers' },
    { title: '报名数', dataIndex: 'activities', key: 'activities' },
    { title: '服务时长', dataIndex: 'serviceHours', key: 'serviceHours', render: (hours: number) => `${hours}小时` },
    { title: '积分总数', dataIndex: 'points', key: 'points' },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* 数据更新时间 */}
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadData}
          size="small"
        >
          刷新数据
        </Button>
        <span style={{ marginLeft: '8px', color: '#666', fontSize: '12px' }}>
          最后更新: {lastUpdateTime}
        </span>
      </div>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总志愿者数"
              value={totalVolunteers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总报名数"
              value={totalSignups}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总积分"
              value={totalScore}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总服务时长"
              value={totalServiceHours}
              suffix="小时"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 礼品统计 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="礼品总数"
              value={giftStats.totalGifts}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="上架礼品"
              value={giftStats.activeGifts}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总库存"
              value={giftStats.totalStock}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已兑换 / 总消耗积分"
              valueRender={() => (
                <div>
                  <div style={{ fontWeight: 600 }}>{giftStats.totalExchanged}</div>
                  <div style={{ color: '#999', fontSize: 12 }}>消耗 {giftStats.totalPointsUsed} 分</div>
                </div>
              )}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="志愿者状态分布">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="活跃"
                  value={activeVolunteers}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="待审核"
                  value={needReviewVolunteers}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="非活跃"
                  value={inactiveVolunteers}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
            <Progress 
              percent={activeRate} 
              status="active" 
              format={() => `活跃度: ${activeRate}%`}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="报名状态分布">
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="已确认"
                  value={confirmedSignups}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="待确认"
                  value={pendingSignups}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="已取消"
                  value={cancelledSignups}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="候补"
                  value={waitlistSignups}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
            </Row>
            <Progress 
              percent={completionRate} 
              format={() => `完成率: ${completionRate}%`}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="志愿者类型分布">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="学生志愿者"
                  value={studentVolunteers}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="社会志愿者"
                  value={socialVolunteers}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="服务类型分布">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="场馆服务"
                  value={venueServiceCount}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="讲解服务"
                  value={explainServiceCount}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Card title="积分详细统计">
            <Row gutter={16}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="服务积分"
                  value={totalServiceScore}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="讲解积分"
                  value={totalExplainScore}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              {/* <Col xs={12} sm={6}>
                <Statistic
                  title="附加积分"
                  value={totalBonusScore}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Col> */}
              <Col xs={12} sm={6}>
                <Statistic
                  title="已兑换积分"
                  value={totalRedeemedScore}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Card title="月度统计">
      <Table
        columns={columns}
          dataSource={monthlyData} 
          rowKey="month" 
        pagination={false}
      />
      </Card>
    </div>
  );
};

export default StatisticsPage; 