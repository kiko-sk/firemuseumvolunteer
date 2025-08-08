import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Typography, Tag, Progress } from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  GiftOutlined, 
  TrophyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface VolunteerData {
  id: string;
  name: string;
  gender: string;
  age: number;
  type: '场馆服务' | '讲解服务';
  serviceHours: number;
  serviceScore: number;
  explainScore: number;
  // bonusScore: number; // 暂时注释，Supabase数据库中没有此字段
  totalScore: number;
  redeemedScore: number;
  remainingScore: number;
  lastExplainDate: string;
  status: 'active' | 'inactive' | 'need_review';
  registerDate: string;
  lastServiceDate: string;
  remark: string;
}

const HomePage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    needReview: 0,
    inactive: 0,
    totalScore: 0,
    totalServiceHours: 0,
    avgAge: 0,
    maleCount: 0,
    femaleCount: 0,
    explainServiceCount: 0,
    venueServiceCount: 0
  });

  // 从localStorage加载数据并计算统计信息
  useEffect(() => {
    const loadData = () => {
      const savedData = localStorage.getItem('volunteerData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          setVolunteers(parsedData);
          
          // 计算统计数据
          const total = parsedData.length;
          const active = parsedData.filter((v: VolunteerData) => v.status === 'active').length;
          const needReview = parsedData.filter((v: VolunteerData) => v.status === 'need_review').length;
          const inactive = parsedData.filter((v: VolunteerData) => v.status === 'inactive').length;
          const totalScore = parsedData.reduce((sum: number, v: VolunteerData) => sum + v.totalScore, 0);
          const totalServiceHours = parsedData.reduce((sum: number, v: VolunteerData) => sum + v.serviceHours, 0);
          const avgAge = total > 0 ? Math.round(parsedData.reduce((sum: number, v: VolunteerData) => sum + v.age, 0) / total) : 0;
          const maleCount = parsedData.filter((v: VolunteerData) => v.gender === '男').length;
          const femaleCount = parsedData.filter((v: VolunteerData) => v.gender === '女').length;
          const explainServiceCount = parsedData.filter((v: VolunteerData) => v.type === '讲解服务').length;
          const venueServiceCount = parsedData.filter((v: VolunteerData) => v.type === '场馆服务').length;

          setStats({
            total,
            active,
            needReview,
            inactive,
            totalScore,
            totalServiceHours,
            avgAge,
            maleCount,
            femaleCount,
            explainServiceCount,
            venueServiceCount
          });
        } catch (error) {
          console.error('加载数据失败:', error);
        }
      }
    };

    // 初始加载
    loadData();

    // 监听localStorage变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'volunteerData') {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // 定期检查数据更新（每5秒）
    const interval = setInterval(loadData, 5000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      <div style={{ 
        marginBottom: '32px',
        textAlign: 'center',
        padding: '24px 0'
      }}>
        <Title 
          level={2} 
          style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          🏠 消防博物馆志愿者管理系统
        </Title>
        <Paragraph style={{ fontSize: '16px', color: '#666' }}>
          欢迎使用消防博物馆志愿者管理系统，实时数据统计，高效管理志愿者信息
        </Paragraph>
      </div>
      
      {/* 主要统计数据 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '140px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500', lineHeight: '1.2' }}>
                  👥 志愿者总数
                </span>
              }
              value={stats.total}
              valueStyle={{ 
                color: 'white', 
                fontSize: '28px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                lineHeight: '1.2'
              }}
              prefix={<UserOutlined style={{ color: 'white', fontSize: '20px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              height: '140px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500', lineHeight: '1.2' }}>
                  ✅ 活跃志愿者
                </span>
              }
              value={stats.active}
              valueStyle={{ 
                color: 'white', 
                fontSize: '28px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                lineHeight: '1.2'
              }}
              prefix={<CheckCircleOutlined style={{ color: 'white', fontSize: '20px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              height: '140px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500', lineHeight: '1.2' }}>
                  ⚠️ 需考核志愿者
                </span>
              }
              value={stats.needReview}
              valueStyle={{ 
                color: 'white', 
                fontSize: '28px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                lineHeight: '1.2'
              }}
              prefix={<ExclamationCircleOutlined style={{ color: 'white', fontSize: '20px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              height: '140px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '14px', fontWeight: '500', lineHeight: '1.2' }}>
                  🏅 总积分
                </span>
              }
              value={stats.totalScore}
              valueStyle={{ 
                color: 'white', 
                fontSize: '28px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                lineHeight: '1.2'
              }}
              prefix={<TrophyOutlined style={{ color: 'white', fontSize: '20px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细统计信息 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              height: '120px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: '#2c3e50', fontSize: '13px', fontWeight: '500', lineHeight: '1.2' }}>
                  ⏰ 总服务时长
                </span>
              }
              value={stats.totalServiceHours}
              suffix="小时"
              valueStyle={{ 
                color: '#2c3e50', 
                fontSize: '22px', 
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}
              prefix={<ClockCircleOutlined style={{ color: '#667eea', fontSize: '18px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              height: '120px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: '#2c3e50', fontSize: '13px', fontWeight: '500', lineHeight: '1.2' }}>
                  📊 平均年龄
                </span>
              }
              value={stats.avgAge}
              suffix="岁"
              valueStyle={{ 
                color: '#2c3e50', 
                fontSize: '22px', 
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}
              prefix={<UserOutlined style={{ color: '#ff9a9e', fontSize: '18px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              height: '120px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '13px', fontWeight: '500', lineHeight: '1.2' }}>
                  🎤 讲解服务
                </span>
              }
              value={stats.explainServiceCount}
              valueStyle={{ 
                color: 'white', 
                fontSize: '22px', 
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}
              prefix={<UserOutlined style={{ color: 'white', fontSize: '18px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              height: '120px'
            }}
            bodyStyle={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '13px', fontWeight: '500', lineHeight: '1.2' }}>
                  🏛️ 场馆服务
                </span>
              }
              value={stats.venueServiceCount}
              valueStyle={{ 
                color: 'white', 
                fontSize: '22px', 
                fontWeight: 'bold',
                lineHeight: '1.2'
              }}
              prefix={<UserOutlined style={{ color: 'white', fontSize: '18px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 详细分析卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: '#667eea' }} />
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>志愿者状态分布</span>
              </div>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              height: '200px'
            }}
            bodyStyle={{ padding: '16px', height: 'calc(100% - 57px)', overflow: 'hidden' }}
          >
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Tag color="green" style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}>
                  活跃
                </Tag>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0} 
                  strokeColor="#52c41a"
                  showInfo={false}
                  style={{ flex: 1, marginRight: '12px' }}
                  size="small"
                />
                <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '14px' }}>{stats.active}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Tag color="orange" style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}>
                  需考核
                </Tag>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.needReview / stats.total) * 100) : 0} 
                  strokeColor="#faad14"
                  showInfo={false}
                  style={{ flex: 1, marginRight: '12px' }}
                  size="small"
                />
                <span style={{ fontWeight: 'bold', color: '#faad14', fontSize: '14px' }}>{stats.needReview}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Tag color="red" style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}>
                  非活跃
                </Tag>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.inactive / stats.total) * 100) : 0} 
                  strokeColor="#ff4d4f"
                  showInfo={false}
                  style={{ flex: 1, marginRight: '12px' }}
                  size="small"
                />
                <span style={{ fontWeight: 'bold', color: '#ff4d4f', fontSize: '14px' }}>{stats.inactive}</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserOutlined style={{ color: '#667eea' }} />
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>性别分布</span>
              </div>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              height: '200px'
            }}
            bodyStyle={{ padding: '16px', height: 'calc(100% - 57px)', overflow: 'hidden' }}
          >
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Tag color="blue" style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}>
                  男性
                </Tag>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.maleCount / stats.total) * 100) : 0} 
                  strokeColor="#1890ff"
                  showInfo={false}
                  style={{ flex: 1, marginRight: '12px' }}
                  size="small"
                />
                <span style={{ fontWeight: 'bold', color: '#1890ff', fontSize: '14px' }}>{stats.maleCount}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <Tag color="pink" style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px' }}>
                  女性
                </Tag>
                <Progress 
                  percent={stats.total > 0 ? Math.round((stats.femaleCount / stats.total) * 100) : 0} 
                  strokeColor="#eb2f96"
                  showInfo={false}
                  style={{ flex: 1, marginRight: '12px' }}
                  size="small"
                />
                <span style={{ fontWeight: 'bold', color: '#eb2f96', fontSize: '14px' }}>{stats.femaleCount}</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 系统公告和快速操作 */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarOutlined style={{ color: '#667eea' }} />
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>系统公告</span>
              </div>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              height: '320px'
            }}
            bodyStyle={{ padding: '16px', height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '8px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
                <Text style={{ color: '#667eea', fontWeight: '500', fontSize: '13px' }}>📢 欢迎新志愿者加入我们的团队！</Text>
              </div>
              <div style={{ padding: '8px', background: 'rgba(25, 135, 84, 0.1)', borderRadius: '8px' }}>
                <Text style={{ color: '#198754', fontWeight: '500', fontSize: '13px' }}>📅 下周六将举办消防安全知识讲座</Text>
              </div>
              <div style={{ padding: '8px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px' }}>
                <Text style={{ color: '#ffc107', fontWeight: '500', fontSize: '13px' }}>⚠️ 请及时更新个人信息</Text>
              </div>
              <div style={{ padding: '8px', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '8px' }}>
                <Text style={{ color: '#dc3545', fontWeight: '500', fontSize: '13px' }}>🎁 新的积分兑换礼品已上架</Text>
              </div>
              <div style={{ padding: '8px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px' }}>
                <Text style={{ color: '#667eea', fontWeight: '500', fontSize: '13px' }}>📊 实时数据统计功能已上线</Text>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <GiftOutlined style={{ color: '#667eea' }} />
                <span style={{ fontWeight: '600', color: '#2c3e50' }}>快速操作</span>
              </div>
            }
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              height: '320px'
            }}
            bodyStyle={{ padding: '16px', height: 'calc(100% - 57px)', overflow: 'auto' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '10px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
                <Text style={{ color: '#667eea', fontWeight: '500', fontSize: '13px' }}>👤 添加新志愿者</Text>
              </div>
              <div style={{ padding: '10px', background: 'rgba(25, 135, 84, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
                <Text style={{ color: '#198754', fontWeight: '500', fontSize: '13px' }}>📅 创建新活动</Text>
              </div>
              <div style={{ padding: '10px', background: 'rgba(255, 193, 7, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
                <Text style={{ color: '#ffc107', fontWeight: '500', fontSize: '13px' }}>🎁 管理礼品库存</Text>
              </div>
              <div style={{ padding: '10px', background: 'rgba(220, 53, 69, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
                <Text style={{ color: '#dc3545', fontWeight: '500', fontSize: '13px' }}>📊 查看统计数据</Text>
              </div>
              <div style={{ padding: '10px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
                <Text style={{ color: '#667eea', fontWeight: '500', fontSize: '13px' }}>📥 导入Excel数据</Text>
              </div>
              <div style={{ padding: '10px', background: 'rgba(25, 135, 84, 0.1)', borderRadius: '8px', cursor: 'pointer' }}>
                <Text style={{ color: '#198754', fontWeight: '500', fontSize: '13px' }}>💾 导出数据备份</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage; 