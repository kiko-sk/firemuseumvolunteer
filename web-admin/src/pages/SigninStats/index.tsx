import React, { useRef, useEffect, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Card, Row, Col, Statistic, DatePicker, Select, Space, Tag } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

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

const SigninStatsPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<SigninRecord[]>([]);
  const [stats, setStats] = useState<SigninStats>({
    totalSignins: 0,
    todaySignins: 0,
    weekSignins: 0,
    monthSignins: 0,
    onTimeRate: 0,
    lateRate: 0,
    absentRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [serviceType, setServiceType] = useState<string>('all');

  // 获取签到数据
  const fetchSigninData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.append('startDate', dateRange[0].format('YYYY-MM-DD'));
        params.append('endDate', dateRange[1].format('YYYY-MM-DD'));
      }
      if (serviceType !== 'all') {
        params.append('serviceType', serviceType);
      }

      const response = await fetch(`/api/signin-records?${params}`);
      const data = await response.json();
      setDataSource(data.records || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error('获取签到数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSigninData();
  }, [dateRange, serviceType]);

  // 导出数据
  const handleExport = () => {
    const csvContent = [
      ['志愿者姓名', '手机号', '签到时间', '签到地点', '服务类型', '状态', '备注'],
      ...dataSource.map(record => [
        record.volunteerName,
        record.volunteerPhone,
        record.signinTime,
        record.signinLocation,
        record.serviceType,
        record.status === 'normal' ? '正常' : record.status === 'late' ? '迟到' : '缺勤',
        record.remark || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `签到记录_${dayjs().format('YYYY-MM-DD')}.csv`;
    link.click();
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'normal':
        return <Tag color="green">正常</Tag>;
      case 'late':
        return <Tag color="orange">迟到</Tag>;
      case 'absent':
        return <Tag color="red">缺勤</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const columns: ProColumns<SigninRecord>[] = [
    {
      title: '志愿者姓名',
      dataIndex: 'volunteerName',
      width: 120,
    },
    {
      title: '手机号',
      dataIndex: 'volunteerPhone',
      width: 130,
      render: (text) => {
        if (typeof text === 'string') {
          return text.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
        }
        return text;
      },
    },
    {
      title: '签到时间',
      dataIndex: 'signinTime',
      width: 160,
      render: (text) => {
        if (text) {
          return dayjs(text as string).format('YYYY-MM-DD HH:mm:ss');
        }
        return text;
      },
    },
    {
      title: '签到地点',
      dataIndex: 'signinLocation',
      width: 150,
    },
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
  ];

  return (
    <PageContainer>
      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日签到"
              value={stats.todaySignins}
              valueStyle={{ color: '#1763a6' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本周签到"
              value={stats.weekSignins}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本月签到"
              value={stats.monthSignins}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="准时率"
              value={stats.onTimeRate}
              suffix="%"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选条件 */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <span>时间范围：</span>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
            placeholder={['开始日期', '结束日期']}
          />
          <span>服务类型：</span>
          <Select
            value={serviceType}
            onChange={setServiceType}
            style={{ width: 120 }}
            options={[
              { label: '全部', value: 'all' },
              { label: '场馆服务', value: '场馆服务' },
              { label: '讲解服务', value: '讲解服务' },
            ]}
          />
          <Button icon={<ReloadOutlined />} onClick={fetchSigninData}>
            刷新
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出
          </Button>
        </Space>
      </Card>

      {/* 签到记录表格 */}
      <ProTable<SigninRecord>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        dataSource={dataSource}
        search={false}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        loading={loading}
        toolBarRender={false}
      />
    </PageContainer>
  );
};

export default SigninStatsPage; 