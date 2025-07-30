import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Modal } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

// 协议内容（可替换为接口/静态文件读取）
const protocols = {
  rule: `上海消防博物馆志愿者服务细则（试行）\n...（此处省略，详见 protocols.json）`,
  faq: `上海消防博物馆志愿者服务期间\n常见问题Q&A\n...（此处省略，详见 protocols.json）`,
  privacy: `消防博物馆志愿者报名系统 —未成年人个人信息保护规则\n...（此处省略，详见 protocols.json）`,
};

const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [registerForm] = Form.useForm();
  const [resetForm] = Form.useForm();
  const [protocolChecked, setProtocolChecked] = useState(false);
  const [protocolModal, setProtocolModal] = useState<{visible: boolean, type: 'rule'|'faq'|'privacy'|null}>({visible: false, type: null});

  const onFinish = (values: any) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (values.username === 'test' && values.password === '123456') {
        localStorage.setItem('token', 'mock-token');
        message.success('登录成功');
        navigate('/');
      } else {
        message.error('用户名或密码错误');
      }
    }, 1000);
  };

  const handleRegister = async () => {
    try {
      const values = await registerForm.validateFields();
      setRegisterModalVisible(false);
      message.success('注册成功（mock）');
    } catch (err) {}
  };
  const handleResetPwd = async () => {
    try {
      const values = await resetForm.validateFields();
      setResetModalVisible(false);
      message.success('密码重置成功（mock）');
    } catch (err) {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fa', paddingTop: 80 }}>
      <div style={{ maxWidth: 400, margin: '0 auto', background: '#fff', borderRadius: 16, boxShadow: '0 4px 16px #0001', padding: 40 }}>
        <img src={logo} alt="logo" style={{ width: '100%', borderRadius: 12, marginBottom: 24 }} />
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 600 }}>上海消防博物馆志愿者</div>
          <div style={{ fontSize: 22, fontWeight: 500, marginTop: 2 }}>管理系统</div>
        </div>
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}> 
            <Input prefix={<UserOutlined />} placeholder="用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}> 
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="current-password" />
          </Form.Item>
          <Form.Item>
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox>记住用户名</Checkbox>
            </Form.Item>
            <a style={{ float: 'right' }} onClick={() => setResetModalVisible(true)}>找回密码</a>
          </Form.Item>
          {/* 删除协议勾选项和相关弹窗 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ marginBottom: 8 }}>
              登 录
            </Button>
            <div style={{ textAlign: 'center' }}>
              <a onClick={() => setRegisterModalVisible(true)}>注册</a>
            </div>
          </Form.Item>
        </Form>
      </div>
      {/* 协议弹窗 */}
      <Modal
        open={protocolModal.visible}
        title={protocolModal.type === 'rule' ? '服务细则' : protocolModal.type === 'faq' ? '常见问题' : '隐私保护'}
        onCancel={() => setProtocolModal({visible: false, type: null})}
        footer={null}
        width={700}
      >
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: 14, maxHeight: 480, overflow: 'auto' }}>
          {protocolModal.type ? protocols[protocolModal.type] : ''}
        </pre>
      </Modal>
      {/* 注册弹窗 */}
      <Form form={registerForm} layout="vertical">
        <Modal
          open={registerModalVisible}
          title="注册"
          onCancel={() => setRegisterModalVisible(false)}
          onOk={handleRegister}
          destroyOnHidden
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}> <Input /> </Form.Item>
          <Form.Item name="position" label="职位" rules={[{ required: true, message: '请输入职位' }]}> <Input /> </Form.Item>
          <Form.Item name="phone" label="电话" rules={[{ required: true, message: '请输入电话' }, { pattern: /^1\d{10}$/, message: '请输入有效手机号' }]}> <Input /> </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, max: 12, message: '密码长度需为6-12位' }, { validator: (_, value) => { if (!value) return Promise.resolve(); if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) { return Promise.reject('密码需包含字母和数字，且为6-12位'); } return Promise.resolve(); } }]}> <Input.Password maxLength={12} /> </Form.Item>
          <Form.Item name="confirmPassword" label="确认密码" dependencies={["password"]} rules={[{ required: true, message: '请再次输入密码' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('两次输入的密码不一致')); } })]}> <Input.Password maxLength={12} /> </Form.Item>
        </Modal>
      </Form>
      {/* 找回密码弹窗 */}
      <Form form={resetForm} layout="vertical">
        <Modal
          open={resetModalVisible}
          title="找回密码"
          onCancel={() => setResetModalVisible(false)}
          onOk={handleResetPwd}
          destroyOnHidden
        >
          <Form.Item name="phone" label="电话" rules={[{ required: true, message: '请输入电话' }, { pattern: /^1\d{10}$/, message: '请输入有效手机号' }]}> <Input /> </Form.Item>
          <Form.Item name="code" label="验证码" rules={[{ required: true, message: '请输入验证码' }]}> <Input /> </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, max: 12, message: '密码长度需为6-12位' }, { validator: (_, value) => { if (!value) return Promise.resolve(); if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) { return Promise.reject('密码需包含字母和数字，且为6-12位'); } return Promise.resolve(); } }]}> <Input.Password maxLength={12} /> </Form.Item>
          <Form.Item name="confirmPassword" label="再次输入新密码" dependencies={["newPassword"]} rules={[{ required: true, message: '请再次输入新密码' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('两次输入的密码不一致')); } })]}> <Input.Password maxLength={12} /> </Form.Item>
        </Modal>
      </Form>
    </div>
  );
};

export default LoginPage; 