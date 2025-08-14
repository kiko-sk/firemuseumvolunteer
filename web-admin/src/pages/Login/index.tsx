import React, { useState } from 'react';
import { Form, Input, Button, Checkbox, message, Modal } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import { sendSMSVerificationCode, verifySMSCode, clearSMSCode } from '@/services/sms';
import { supabase } from '@/utils/supabaseClient';

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
  const [resetCountdown, setResetCountdown] = useState(0);

  // 获取已注册用户列表
  const getRegisteredUsers = () => {
    const users = localStorage.getItem('registeredUsers');
    return users ? JSON.parse(users) : [];
  };

  // 保存注册用户
  const saveRegisteredUser = (userData: any) => {
    const users = getRegisteredUsers();
    // 检查是否已存在相同手机号
    const existingUserIndex = users.findIndex((user: any) => user.phone === userData.phone);
    if (existingUserIndex >= 0) {
      // 更新现有用户信息
      users[existingUserIndex] = userData;
    } else {
      // 添加新用户
      users.push(userData);
    }
    localStorage.setItem('registeredUsers', JSON.stringify(users));
  };

  // 发送验证码
  const handleSendResetCode = async () => {
    try {
      const phone = resetForm.getFieldValue('phone');
      if (!phone) {
        message.error('请先输入手机号');
        return;
      }
      
      // 验证手机号格式
      if (!/^1\d{10}$/.test(phone)) {
        message.error('请输入有效的手机号');
        return;
      }

      // 检查用户是否存在
      const users = getRegisteredUsers();
      const user = users.find((u: any) => u.phone === phone);
      if (!user) {
        message.error('该手机号未注册，请先注册');
        return;
      }

      // 开始倒计时
      setResetCountdown(60);
      const timer = setInterval(() => {
        setResetCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // 调用短信服务发送验证码
      const result = await sendSMSVerificationCode(phone);
      
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message || '发送验证码失败');
      }
      
    } catch (error) {
      console.error('发送验证码失败:', error);
      message.error('发送验证码失败，请重试');
    }
  };

  // 替换注册逻辑
  const handleRegister = async (values: any) => {
    try {
      setLoading(true);
      const email = values.email;
      const password = values.password;
      if (!/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(email)) {
        message.error('请输入有效的邮箱地址');
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // options: { emailRedirectTo: window.location.origin + '/login' },
      });
      if (error) {
        message.error(error.message || '注册失败，请稍后再试');
        return;
      }
      setRegisterModalVisible(false);
      registerForm.resetFields();
      message.success('注册成功！验证邮件已发送至您的邮箱，请完成验证后再登录');
    } catch (err) {
      message.error('注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 替换登录逻辑
  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      if (values.username === 'test' && values.password === '123456') {
        localStorage.setItem('token', 'mock-token');
        localStorage.setItem('currentUser', JSON.stringify({
          name: '测试用户',
          email: 'test',
          position: '管理员'
        }));
        message.success('登录成功');
        navigate('/home');
        return;
      }
      let result;
      if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(values.username)) {
        result = await supabase.auth.signInWithPassword({ email: values.username, password: values.password });
      } else {
        message.error('请输入有效的邮箱地址');
        return;
      }
      if (result.error) {
        // Supabase登录失败，尝试本地登录
        const users = getRegisteredUsers();
        const user = users.find((u: any) => u.email === values.username && u.password === values.password);
        if (user) {
          localStorage.setItem('token', 'mock-token');
          localStorage.setItem('currentUser', JSON.stringify(user));
          message.success('登录成功');
          navigate('/home');
        } else {
          message.error(result.error.message || '邮箱或密码错误');
        }
        return;
      }
      // 登录成功，写入localStorage
      const user = result.data.user;
      localStorage.setItem('token', result.data.session?.access_token || '');
      localStorage.setItem('currentUser', JSON.stringify({
        name: user.user_metadata?.name || user.email,
        email: user.email,
        position: user.user_metadata?.position || ''
      }));
      message.success('登录成功');
      navigate('/home');
    } catch (err) {
      message.error('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPwd = async (values: any) => {
    try {
      // 检查用户是否存在
      const users = getRegisteredUsers();
      const userIndex = users.findIndex((u: any) => u.email === values.email);
      if (userIndex >= 0) {
        // 更新用户密码
        users[userIndex].password = values.newPassword;
        localStorage.setItem('registeredUsers', JSON.stringify(users));
        setResetModalVisible(false);
        resetForm.resetFields();
        setResetCountdown(0);
        message.success('密码重置成功！请使用新密码登录');
      } else {
        message.error('该邮箱未注册，请先注册');
      }
    } catch (err) {
      message.error('重置失败，请重试');
    }
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
          <Form.Item name="username" label="邮箱地址" rules={[{ required: true, message: '请输入邮箱地址' }, { type: 'email', message: '请输入有效的邮箱地址' }]}> 
            <Input prefix={<UserOutlined />} placeholder="请输入邮箱地址" autoComplete="username" />
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
        <Modal
          open={registerModalVisible}
          title="注册"
        onCancel={() => {
          setRegisterModalVisible(false);
          registerForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={registerForm}
          layout="vertical"
          onFinish={handleRegister}
        >
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="position" label="职位" rules={[{ required: true, message: '请输入职位' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }, { min: 6, max: 12, message: '密码长度需为6-12位' }, { validator: (_, value) => { if (!value) return Promise.resolve(); if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) { return Promise.reject('密码需包含字母和数字，且为6-12位'); } return Promise.resolve(); } }]}>
            <Input.Password maxLength={12} />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认密码" dependencies={["password"]} rules={[{ required: true, message: '请再次输入密码' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('password') === value) { return Promise.resolve(); } return Promise.reject(new Error('两次输入的密码不一致')); } })]}>
            <Input.Password maxLength={12} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ marginRight: 8 }}>
              确定
            </Button>
            <Button onClick={() => {
              setRegisterModalVisible(false);
              registerForm.resetFields();
            }}>
              取消
            </Button>
          </Form.Item>
        </Form>
        </Modal>
      {/* 找回密码弹窗 */}
        <Modal
          open={resetModalVisible}
          title="找回密码"
        onCancel={() => {
          setResetModalVisible(false);
          resetForm.resetFields();
          setResetCountdown(0);
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={resetForm}
          layout="vertical"
          onFinish={handleResetPwd}
        >
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效的邮箱地址' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="验证码" rules={[{ required: true, message: '请输入验证码' }]}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Input style={{ flex: 1 }} placeholder="请输入验证码" />
              <Button 
                type="primary" 
                disabled={resetCountdown > 0}
                onClick={handleSendResetCode}
                style={{ width: 120 }}
              >
                {resetCountdown > 0 ? `${resetCountdown}s` : '获取验证码'}
              </Button>
            </div>
          </Form.Item>
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, max: 12, message: '密码长度需为6-12位' }, { validator: (_, value) => { if (!value) return Promise.resolve(); if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) { return Promise.reject('密码需包含字母和数字，且为6-12位'); } return Promise.resolve(); } }]}>
            <Input.Password maxLength={12} />
          </Form.Item>
          <Form.Item name="confirmPassword" label="再次输入新密码" dependencies={["newPassword"]} rules={[{ required: true, message: '请再次输入新密码' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('两次输入的密码不一致')); } })]}>
            <Input.Password maxLength={12} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading} style={{ marginRight: 8 }}>
              确定
            </Button>
            <Button onClick={() => {
              setResetModalVisible(false);
              resetForm.resetFields();
              setResetCountdown(0);
            }}>
              取消
            </Button>
          </Form.Item>
        </Form>
        </Modal>
    </div>
  );
};

export default LoginPage; 