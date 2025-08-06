import React from 'react';
import { Card, Row, Col, Typography, Button, Space, Divider, Statistic } from 'antd';
import { 
  TeamOutlined, 
  GiftOutlined, 
  CalendarOutlined, 
  BarChartOutlined,
  LoginOutlined,
  UserOutlined,
  SafetyOutlined,
  TrophyOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const LandingPage: React.FC = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '0'
    }}>
      {/* 导航栏 */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={3} style={{ color: 'white', margin: 0 }}>
                🚒 上海消防博物馆志愿者管理系统
              </Title>
            </Col>
            <Col>
              <Space>
                <Button 
                  type="primary" 
                  ghost 
                  icon={<LoginOutlined />}
                  onClick={() => window.open('/login', '_blank')}
                >
                  管理后台
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* 主要内容 */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* 英雄区域 */}
        <div style={{ textAlign: 'center', marginBottom: '80px', color: 'white' }}>
          <Title level={1} style={{ color: 'white', marginBottom: '24px' }}>
            专业的志愿者管理平台
          </Title>
          <Paragraph style={{ fontSize: '20px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '40px' }}>
            为上海消防博物馆提供全方位的志愿者服务管理解决方案
          </Paragraph>
          <Space size="large">
            <Button 
              type="primary" 
              size="large" 
              icon={<LoginOutlined />}
              onClick={() => window.open('/login', '_blank')}
              style={{ height: '48px', fontSize: '16px' }}
            >
              进入管理后台
            </Button>
            <Button 
              ghost 
              size="large" 
              icon={<UserOutlined />}
              onClick={() => window.open('/register', '_blank')}
              style={{ height: '48px', fontSize: '16px' }}
            >
              注册新用户
            </Button>
          </Space>
        </div>

        {/* 功能特色 */}
        <Row gutter={[32, 32]} style={{ marginBottom: '80px' }}>
          <Col xs={24} md={12} lg={6}>
            <Card 
              hoverable 
              style={{ 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <TeamOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={4}>志愿者管理</Title>
              <Paragraph>
                完整的志愿者信息管理，包括个人信息、服务记录、积分统计等
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} md={12} lg={6}>
            <Card 
              hoverable 
              style={{ 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <CalendarOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
              <Title level={4}>报名管理</Title>
              <Paragraph>
                智能的报名系统，自动开启关闭，支持候补机制
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} md={12} lg={6}>
            <Card 
              hoverable 
              style={{ 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <GiftOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
              <Title level={4}>礼品兑换</Title>
              <Paragraph>
                积分兑换系统，丰富的礼品选择，库存管理
              </Paragraph>
            </Card>
          </Col>
          
          <Col xs={24} md={12} lg={6}>
            <Card 
              hoverable 
              style={{ 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <BarChartOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
              <Title level={4}>数据分析</Title>
              <Paragraph>
                详细的数据统计和分析，可视化图表展示
              </Paragraph>
            </Card>
          </Col>
        </Row>

        {/* 系统优势 */}
        <div style={{ marginBottom: '80px' }}>
          <Title level={2} style={{ textAlign: 'center', color: 'white', marginBottom: '48px' }}>
            系统优势
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <Card style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                height: '100%'
              }}>
                <SafetyOutlined style={{ fontSize: '32px', color: '#52c41a', marginBottom: '16px' }} />
                <Title level={4}>数据安全</Title>
                <Paragraph>
                  • 本地数据存储，保护隐私<br/>
                  • HTTPS加密传输<br/>
                  • 完善的权限控制
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                height: '100%'
              }}>
                <TrophyOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '16px' }} />
                <Title level={4}>高效管理</Title>
                <Paragraph>
                  • 批量导入导出Excel<br/>
                  • 自动化报名系统<br/>
                  • 实时数据同步
                </Paragraph>
              </Card>
            </Col>
            
            <Col xs={24} md={8}>
              <Card style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                height: '100%'
              }}>
                <UserOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={4}>用户友好</Title>
                <Paragraph>
                  • 现代化界面设计<br/>
                  • 响应式布局<br/>
                  • 直观的操作体验
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>

        {/* 统计数据 */}
        <div style={{ marginBottom: '80px' }}>
          <Title level={2} style={{ textAlign: 'center', color: 'white', marginBottom: '48px' }}>
            系统概览
          </Title>
          <Row gutter={[32, 32]}>
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <Statistic
                  title="志愿者总数"
                  value={150}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <Statistic
                  title="服务时长"
                  value={2800}
                  suffix="小时"
                  prefix={<CalendarOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <Statistic
                  title="礼品兑换"
                  value={89}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
            
            <Col xs={12} md={6}>
              <Card style={{ 
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                textAlign: 'center'
              }}>
                <Statistic
                  title="活跃度"
                  value={95}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* 联系信息 */}
        <div style={{ textAlign: 'center', color: 'white' }}>
          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.3)' }} />
          <Paragraph style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © 2024 上海消防博物馆志愿者管理系统 | 技术支持：fmvsh.cn
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 