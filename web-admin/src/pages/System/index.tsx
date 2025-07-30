import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import { useModel } from '@umijs/max';

interface AdminUser {
  id: string;
  username: string;
  role: '主管理员' | '二级管理员';
}

const mockAdmins: AdminUser[] = [
  { id: '1', username: 'admin', role: '主管理员' },
  { id: '2', username: 'subadmin1', role: '二级管理员' },
  { id: '3', username: 'subadmin2', role: '二级管理员' },
];

const SystemPage: React.FC = () => {
  const { name } = useModel('global');
  const [admins, setAdmins] = useState<AdminUser[]>(mockAdmins);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addForm] = Form.useForm();
  const [selfForm] = Form.useForm();
  const [selfResetModalVisible, setSelfResetModalVisible] = useState(false);
  const [editPwdModalVisible, setEditPwdModalVisible] = useState(false);
  const [editNameModalVisible, setEditNameModalVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null);
  const [pwdForm] = Form.useForm();
  const [nameForm] = Form.useForm();

  // 优先从localStorage读取当前用户信息
  let currentUser = mockAdmins[0];
  try {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const userObj = JSON.parse(userStr);
      // 只要有username和role就用
      if (userObj.username && userObj.role) {
        currentUser = userObj;
      }
    }
  } catch (e) {}

  // 新增二级管理员
  const handleAdd = () => {
    setAddModalVisible(true);
  };
  React.useEffect(() => {
    if (addModalVisible) {
      addForm.resetFields();
    }
  }, [addModalVisible]);
  const handleAddSubmit = async () => {
    try {
      const values = await addForm.validateFields();
      setAdmins(prev => [
        ...prev,
        { id: (Math.random() * 100000).toFixed(0), username: values.username, role: '二级管理员' },
      ]);
      setAddModalVisible(false);
      message.success('新增二级管理员成功');
    } catch (err) {
      // 校验失败
    }
  };

  // 修改密码
  const handleEditPwd = (admin: AdminUser) => {
    setEditTarget(admin);
    setEditPwdModalVisible(true);
    setTimeout(() => pwdForm.resetFields(), 0);
  };
  const handleEditPwdSubmit = async () => {
    try {
      const values = await pwdForm.validateFields();
      setAdmins(prev => prev.map(a => a.id === editTarget?.id ? { ...a } : a)); // mock: 只弹提示
      setEditPwdModalVisible(false);
      message.success('密码重置成功（mock）');
    } catch (err) {}
  };

  // 修改用户名
  const handleEditName = (admin: AdminUser) => {
    setEditTarget(admin);
    setEditNameModalVisible(true);
    setTimeout(() => nameForm.setFieldsValue({ newUsername: admin.username }), 0);
  };
  const handleEditNameSubmit = async () => {
    try {
      const values = await nameForm.validateFields();
      setAdmins(prev => [...prev.map(a => a.id === editTarget?.id ? { ...a, username: values.newUsername } : a)]);
      setEditNameModalVisible(false);
      message.success('用户名修改成功');
    } catch (err) {}
  };

  // 删除重置密码相关操作
  const handleDelete = (id: string) => {
    setAdmins(prev => prev.filter(a => a.id !== id));
    message.success('删除成功');
  };

  // 退出登录
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  const columns = [
    { title: '用户名', dataIndex: 'username' },
    { title: '角色', dataIndex: 'role' },
    {
      title: '操作',
      render: (_: any, record: AdminUser) => (
        <Space>
          {currentUser.role === '主管理员' && (
            <>
              <a onClick={() => handleEditPwd(record)}>修改密码</a>
              <a onClick={() => handleEditName(record)}>修改用户名</a>
              {record.role === '二级管理员' && (
                <Popconfirm title="确认删除该二级管理员？" onConfirm={() => handleDelete(record.id)}>
                  <a>删除</a>
                </Popconfirm>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '系统管理' }}>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAdd}>新增二级管理员</Button>
        <Button danger onClick={handleLogout}>退出</Button>
      </Space>
      <Table columns={columns} dataSource={admins} rowKey="id" pagination={false} />
      <Modal
        open={addModalVisible}
        title="新增二级管理员"
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddSubmit}
        destroyOnHidden
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}> 
            <Input />
          </Form.Item>
          <Form.Item 
            name="password" 
            label="密码" 
            rules={[ 
              { required: true, message: '请输入密码' },
              { min: 6, max: 12, message: '密码长度需为6-12位' },
              { 
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) {
                    return Promise.reject('密码需包含字母和数字，且为6-12位');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          > 
            <Input.Password maxLength={12} />
          </Form.Item>
        </Form>
      </Modal>
      {/* 修改密码弹窗 */}
      <Modal
        open={editPwdModalVisible}
        title={`重置密码：${editTarget?.username || ''}`}
        onCancel={() => setEditPwdModalVisible(false)}
        onOk={handleEditPwdSubmit}
        destroyOnHidden
      >
        <Form form={pwdForm} layout="vertical">
          <Form.Item name="newPassword" label="新密码" rules={[{ required: true, message: '请输入新密码' }, { min: 6, max: 12, message: '密码长度需为6-12位' }, { validator: (_, value) => { if (!value) return Promise.resolve(); if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,12}$/.test(value)) { return Promise.reject('密码需包含字母和数字，且为6-12位'); } return Promise.resolve(); } }]}> 
            <Input.Password maxLength={12} />
          </Form.Item>
          <Form.Item name="confirmPassword" label="确认新密码" dependencies={["newPassword"]} rules={[{ required: true, message: '请再次输入新密码' }, ({ getFieldValue }) => ({ validator(_, value) { if (!value || getFieldValue('newPassword') === value) { return Promise.resolve(); } return Promise.reject(new Error('两次输入的密码不一致')); } })]}> 
            <Input.Password maxLength={12} />
          </Form.Item>
        </Form>
      </Modal>
      {/* 修改用户名弹窗 */}
      <Modal
        open={editNameModalVisible}
        title={`修改用户名：${editTarget?.username || ''}`}
        onCancel={() => setEditNameModalVisible(false)}
        onOk={handleEditNameSubmit}
        destroyOnHidden
      >
        <Form form={nameForm} layout="vertical">
          <Form.Item name="newUsername" label="新用户名" rules={[{ required: true, message: '请输入新用户名' }, { min: 2, max: 20, message: '用户名长度需为2-20位' }]}> 
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SystemPage; 