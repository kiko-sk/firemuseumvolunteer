import React, { useState, useEffect } from 'react';
import { Card, Table, Button, message, Space, Typography, Row, Col, Statistic, Tag } from 'antd';
import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface ScoreData {
  id: string;
  volunteerName: string;
  volunteerNo: string;
  serviceScore: number;
  explanationScore: number;
  bonusScore: number;
  totalScore: number;
  redeemedScore: number;
  remainingScore: number;
  lastUpdateTime: string;
}

const ScoreManagement: React.FC = () => {
  const [scoreData, setScoreData] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      // 从localStorage加载志愿者数据并转换为积分数据
      const volunteerData = localStorage.getItem('volunteerData');
      if (volunteerData) {
        const volunteers = JSON.parse(volunteerData);
        const scoreRecords: ScoreData[] = volunteers.map((volunteer: any) => ({
          id: volunteer.id,
          volunteerName: volunteer.name,
          volunteerNo: volunteer.volunteerNo || '',
          serviceScore: volunteer.serviceScore || 0,
          explanationScore: volunteer.explanationScore || 0,
          bonusScore: volunteer.bonusScore || 0,
          totalScore: (volunteer.serviceScore || 0) + (volunteer.explanationScore || 0) + (volunteer.bonusScore || 0),
          redeemedScore: volunteer.redeemedScore || 0,
          remainingScore: ((volunteer.serviceScore || 0) + (volunteer.explanationScore || 0) + (volunteer.bonusScore || 0)) - (volunteer.redeemedScore || 0),
          lastUpdateTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }));
        setScoreData(scoreRecords);
      }
    } catch (error) {
      console.error('加载数据失败:', error);
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      title: '志愿者编号',
      dataIndex: 'volunteerNo',
      key: 'volunteerNo',
      width: 120,
      render: (text: string) => <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</span>
    },
    {
      title: '姓名',
      dataIndex: 'volunteerName',
      key: 'volunteerName',
      width: 100,
      render: (text: string) => <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</span>
    },
    {
      title: '服务积分',
      dataIndex: 'serviceScore',
      key: 'serviceScore',
      width: 100,
      render: (value: number) => <Tag color="blue">{value}</Tag>
    },
    {
      title: '讲解积分',
      dataIndex: 'explanationScore',
      key: 'explanationScore',
      width: 100,
      render: (value: number) => <Tag color="green">{value}</Tag>
    },
    {
      title: '附加积分',
      dataIndex: 'bonusScore',
      key: 'bonusScore',
      width: 100,
      render: (value: number) => <Tag color="orange">{value}</Tag>
    },
    {
      title: '总积分',
      dataIndex: 'totalScore',
      key: 'totalScore',
      width: 100,
      render: (value: number) => <Tag color="red" style={{ fontWeight: 'bold' }}>{value}</Tag>
    },
    {
      title: '已兑换积分',
      dataIndex: 'redeemedScore',
      key: 'redeemedScore',
      width: 120,
      render: (value: number) => <Tag color="purple">{value}</Tag>
    },
    {
      title: '剩余积分',
      dataIndex: 'remainingScore',
      key: 'remainingScore',
      width: 100,
      render: (value: number) => <Tag color="cyan">{value}</Tag>
    },
    {
      title: '更新时间',
      dataIndex: 'lastUpdateTime',
      key: 'lastUpdateTime',
      width: 150,
      render: (text: string) => (
        <Text type="secondary" style={{ fontSize: '12px' }}>
          {dayjs(text).format('MM-DD HH:mm')}
        </Text>
      )
    }
  ];

  // 统计数据
  const totalScore = scoreData.reduce((sum, item) => sum + item.totalScore, 0);
  const totalRedeemed = scoreData.reduce((sum, item) => sum + item.redeemedScore, 0);
  const totalRemaining = scoreData.reduce((sum, item) => sum + item.remainingScore, 0);
  const averageScore = scoreData.length > 0 ? Math.round(totalScore / scoreData.length) : 0;

  return (
    <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
            🏆 积分管理
          </Title>
          <Text type="secondary">
            查看志愿者的积分信息，数据来自志愿者管理页面
          </Text>
        </div>

        {/* 统计卡片 */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <Statistic
                title="总积分"
                value={totalScore}
                valueStyle={{ color: 'white' }}
                suffix="分"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <Statistic
                title="已兑换"
                value={totalRedeemed}
                valueStyle={{ color: 'white' }}
                suffix="分"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
              <Statistic
                title="剩余积分"
                value={totalRemaining}
                valueStyle={{ color: 'white' }}
                suffix="分"
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card size="small" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <Statistic
                title="平均积分"
                value={averageScore}
                valueStyle={{ color: 'white' }}
                suffix="分"
              />
            </Card>
          </Col>
        </Row>

        {/* 操作按钮 */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            icon={<SyncOutlined />}
            loading={loading}
            onClick={loadData}
            style={{
              borderRadius: '8px',
              border: '1px solid #d9d9d9'
            }}
          >
            刷新数据
          </Button>
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => message.info('请到志愿者管理页面编辑积分信息')}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '8px'
            }}
          >
            编辑积分
          </Button>
        </div>

        {/* 数据表格 */}
        <Table
          columns={columns}
          dataSource={scoreData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
          }}
          scroll={{ x: 1200 }}
          size="small"
          style={{
            borderRadius: '8px',
            overflow: 'hidden'
          }}
        />
      </Card>
    </div>
  );
};

export default ScoreManagement; 