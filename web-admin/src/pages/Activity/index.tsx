import React, { useState } from 'react';
import { Table, Button, Input, Space, Modal, Form, Select, DatePicker, message, Card, Row, Col, Statistic, Tag } from 'antd';
import { PlusOutlined, CalendarOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;

interface Activity {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  points: number;
}

const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      title: '消防安全知识讲座',
      description: '为志愿者提供消防安全知识培训',
      type: '培训',
      status: '进行中',
      startDate: '2024-08-15',
      endDate: '2024-08-15',
      location: '消防博物馆会议室',
      maxParticipants: 50,
      currentParticipants: 35,
      points: 100
    },
    {
      id: '2',
      title: '博物馆导览服务',
      description: '为游客提供博物馆导览服务',
      type: '服务',
      status: '报名中',
      startDate: '2024-08-20',
      endDate: '2024-08-20',
      location: '消防博物馆展厅',
      maxParticipants: 20,
      currentParticipants: 12,
      points: 80
    },
    {
      id: '3',
      title: '社区消防宣传',
      description: '在社区开展消防知识宣传活动',
      type: '宣传',
      status: '已结束',
      startDate: '2024-08-10',
      endDate: '2024-08-10',
      location: '社区广场',
      maxParticipants: 30,
      currentParticipants: 28,
      points: 120
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form] = Form.useForm();

  const getStatusColor = (status: string) => {
    switch (status) {
      case '报名中': return 'blue';
      case '进行中': return 'green';
      case '已结束': return 'gray';
      case '已取消': return 'red';
      default: return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '培训': return 'purple';
      case '服务': return 'blue';
      case '宣传': return 'orange';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '活动名称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={getTypeColor(type)}>{type}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '时间',
      key: 'time',
      render: (record: Activity) => (
        <div>
          <div>{record.startDate}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>至 {record.endDate}</div>
        </div>
      ),
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
      width: 150,
    },
    {
      title: '参与人数',
      key: 'participants',
      render: (record: Activity) => (
        <span>{record.currentParticipants}/{record.maxParticipants}</span>
      ),
    },
    {
      title: '积分',
      dataIndex: 'points',
      key: 'points',
      render: (points: number) => <span style={{ color: '#fa8c16' }}>{points}</span>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Activity) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" onClick={() => handleViewParticipants(record)}>查看报名</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingActivity(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    form.setFieldsValue({
      ...activity,
      startDate: dayjs(activity.startDate),
      endDate: dayjs(activity.endDate),
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    message.success('删除成功');
  };

  const handleViewParticipants = (activity: Activity) => {
    message.info(`查看 ${activity.title} 的报名人员`);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const activityData = {
        ...values,
        startDate: values.startDate.format('YYYY-MM-DD'),
        endDate: values.endDate.format('YYYY-MM-DD'),
      };

      if (editingActivity) {
        setActivities(activities.map(a => 
          a.id === editingActivity.id ? { ...a, ...activityData } : a
        ));
        message.success('更新成功');
      } else {
        const newActivity: Activity = {
          id: Date.now().toString(),
          ...activityData,
          currentParticipants: 0,
        };
        setActivities([...activities, newActivity]);
        message.success('添加成功');
      }
      setIsModalVisible(false);
    });
  };

  const totalActivities = activities.length;
  const ongoingActivities = activities.filter(a => a.status === '进行中').length;
  const totalParticipants = activities.reduce((sum, a) => sum + a.currentParticipants, 0);
  const totalPoints = activities.reduce((sum, a) => sum + a.points, 0);

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="活动总数"
              value={totalActivities}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="进行中活动"
              value={ongoingActivities}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总参与人数"
              value={totalParticipants}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总积分"
              value={totalPoints}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
          <Search
            placeholder="搜索活动名称"
            style={{ width: 300 }}
            onSearch={(value) => console.log('搜索:', value)}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            添加活动
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={activities}
        rowKey="id"
          pagination={{
            total: activities.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>

      <Modal
        title={editingActivity ? '编辑活动' : '添加活动'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="活动名称"
                rules={[{ required: true, message: '请输入活动名称' }]}
              >
                <Input placeholder="请输入活动名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="type"
                label="活动类型"
                rules={[{ required: true, message: '请选择活动类型' }]}
              >
                <Select placeholder="请选择活动类型">
                  <Option value="培训">培训</Option>
                  <Option value="服务">服务</Option>
                  <Option value="宣传">宣传</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="startDate"
                label="开始日期"
                rules={[{ required: true, message: '请选择开始日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="endDate"
                label="结束日期"
                rules={[{ required: true, message: '请选择结束日期' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="location"
                label="活动地点"
                rules={[{ required: true, message: '请输入活动地点' }]}
              >
                <Input placeholder="请输入活动地点" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="maxParticipants"
                label="最大参与人数"
                rules={[{ required: true, message: '请输入最大参与人数' }]}
              >
                <Input type="number" placeholder="请输入最大参与人数" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="points"
                label="积分奖励"
                rules={[{ required: true, message: '请输入积分奖励' }]}
              >
                <Input type="number" placeholder="请输入积分奖励" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="活动状态"
                rules={[{ required: true, message: '请选择活动状态' }]}
              >
                <Select placeholder="请选择活动状态">
                  <Option value="报名中">报名中</Option>
                  <Option value="进行中">进行中</Option>
                  <Option value="已结束">已结束</Option>
                  <Option value="已取消">已取消</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ActivityPage; 