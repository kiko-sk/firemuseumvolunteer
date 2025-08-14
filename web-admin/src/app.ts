import React from 'react';
import { Modal, Button, Popconfirm, Space } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { supabase } from '@/utils/supabaseClient';

// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate
export async function getInitialState(): Promise<{ name: string; isLoggedIn: boolean }> {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // 如果没有登录且不在登录页面，重定向到登录页
  if (!isLoggedIn && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }

  return {
    name: '@umijs/max',
    isLoggedIn
  };
}

function getUserModeLabel(): { label: string; color: string } {
  try {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return { label: '云端', color: '#1890ff' };
    const user = JSON.parse(currentUser);
    // 仅本地管理员（phone==='test'）视为本地模式
    if (user && user.phone === 'test') return { label: '本地', color: '#faad14' };
    return { label: '云端', color: '#1890ff' };
  } catch {
    return { label: '云端', color: '#1890ff' };
  }
}

export const layout = () => {
  const pathname = window.location.pathname;
  const isLoginPage = pathname === '/login';
  const isLandingPage = pathname === '/';

  // 登录页和主站页不使用布局
  if (isLoginPage || isLandingPage) return false;

  const handleLogout = () => {
    Modal.confirm({
      title: '确认退出',
      content: '确定要退出登录吗？',
      okText: '退出',
      okButtonProps: { danger: true },
      cancelText: '取消',
      onOk: async () => {
        try { await supabase.auth.signOut(); } catch {}
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        window.location.href = '/login';
      },
    });
  };

  const currentUserStr = localStorage.getItem('currentUser');
  const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: { locale: false },
    avatarProps: {
      src: undefined,
      size: 'small',
      title: currentUser?.name || currentUser?.email || '管理员',
    },
    actionsRender: () => {
      const mode = getUserModeLabel();
      return [
        React.createElement(
          Space,
          { key: 'actions', size: 8 },
          // 模式指示标签
          React.createElement('span', { key: 'mode', style: { fontSize: 12, color: mode.color, padding: '2px 8px', border: `1px solid ${mode.color}33`, borderRadius: 12 } }, `${mode.label}模式`),
          // 刷新按钮
          React.createElement(
            Button as any,
            { key: 'refresh', type: 'text', size: 'small', onClick: () => window.location.reload(), title: '刷新当前页' },
            '刷新'
          ),
          // 退出
          React.createElement(
            Popconfirm,
            {
              key: 'logout-confirm',
              title: '确认退出',
              description: '确定要退出登录吗？',
              okText: '退出',
              cancelText: '取消',
              okButtonProps: { danger: true },
              onConfirm: handleLogout,
            } as any,
            React.createElement(
              Button as any,
              { type: 'text', shape: 'circle', size: 'small', icon: React.createElement(LogoutOutlined, null), title: '退出' }
            )
          )
        ),
      ];
    },
    onPageChange: () => {
      const token = localStorage.getItem('token');
      const path = window.location.pathname;
      if (!token && path !== '/login' && path !== '/') {
        window.location.href = '/login';
        return;
      }
      if (token && path === '/login') {
        window.location.href = '/home';
      }
    },
  } as any;
};
