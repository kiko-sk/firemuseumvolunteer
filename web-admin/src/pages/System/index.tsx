import React from 'react';
import { Card, Row, Col, Form, Input, Button, Switch, Select, Divider, message } from 'antd';
import { SettingOutlined, SecurityScanOutlined, BellOutlined } from '@ant-design/icons';

const { Option } = Select;

const SystemPage: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = (values: any) => {
    console.log('保存设置:', values);
    message.success('设置保存成功');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="系统设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            siteName: '消防博物馆志愿者管理系统',
            siteDescription: '专业的志愿者管理平台',
            emailNotification: true,
            smsNotification: false,
            autoBackup: true,
            backupInterval: 'daily',
            maxFileSize: 10,
            sessionTimeout: 30,
          }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Card title="基本设置" size="small" style={{ marginBottom: '16px' }}>
                <Form.Item name="siteName" label="系统名称" rules={[{ required: true }]}>
                  <Input placeholder="请输入系统名称" />
                </Form.Item>
                <Form.Item name="siteDescription" label="系统描述">
                  <Input.TextArea rows={3} placeholder="请输入系统描述" />
                </Form.Item>
                <Form.Item name="contactEmail" label="联系邮箱">
                  <Input placeholder="请输入联系邮箱" />
                </Form.Item>
                <Form.Item name="contactPhone" label="联系电话">
                  <Input placeholder="请输入联系电话" />
                </Form.Item>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="通知设置" size="small" style={{ marginBottom: '16px' }}>
                <Form.Item name="emailNotification" label="邮件通知" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="smsNotification" label="短信通知" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="autoBackup" label="自动备份" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="backupInterval" label="备份频率">
                  <Select>
                    <Option value="daily">每日</Option>
                    <Option value="weekly">每周</Option>
                    <Option value="monthly">每月</Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Card title="安全设置" size="small" style={{ marginBottom: '16px' }}>
                <Form.Item name="sessionTimeout" label="会话超时时间(分钟)">
                  <Input type="number" min={5} max={1440} />
                </Form.Item>
                <Form.Item name="maxLoginAttempts" label="最大登录尝试次数">
                  <Input type="number" min={3} max={10} />
                </Form.Item>
                <Form.Item name="passwordMinLength" label="密码最小长度">
                  <Input type="number" min={6} max={20} />
          </Form.Item>
                <Form.Item name="requireStrongPassword" label="要求强密码" valuePropName="checked">
                  <Switch />
          </Form.Item>
              </Card>
            </Col>
            
            <Col span={12}>
              <Card title="文件设置" size="small" style={{ marginBottom: '16px' }}>
                <Form.Item name="maxFileSize" label="最大文件大小(MB)">
                  <Input type="number" min={1} max={100} />
          </Form.Item>
                <Form.Item name="allowedFileTypes" label="允许的文件类型">
                  <Select mode="tags" placeholder="请选择允许的文件类型">
                    <Option value="jpg">JPG</Option>
                    <Option value="png">PNG</Option>
                    <Option value="pdf">PDF</Option>
                    <Option value="doc">DOC</Option>
                    <Option value="xls">XLS</Option>
                  </Select>
          </Form.Item>
                <Form.Item name="enableFileCompression" label="启用文件压缩" valuePropName="checked">
                  <Switch />
          </Form.Item>
              </Card>
            </Col>
          </Row>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" size="large">
              保存设置
            </Button>
            <Button style={{ marginLeft: '16px' }} size="large">
              重置
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SystemPage; 