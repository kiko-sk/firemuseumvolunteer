import React, { useEffect } from 'react';
import { Button, Modal } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { supabase } from '@/utils/supabaseClient';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isBefore from 'dayjs/plugin/isBefore';
import isAfter from 'dayjs/plugin/isAfter';
import localeData from 'dayjs/plugin/localeData';
import { useLocation, useNavigate } from 'react-router-dom';
dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(localeData);

export function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 检查登录状态
    const token = localStorage.getItem('token');
    const isLoginPage = location.pathname === '/login';
    const isLandingPage = location.pathname === '/';

    // 主站页面不需要登录验证
    if (isLandingPage) {
      return;
    }

    if (!token && !isLoginPage) {
      // 未登录且不在登录页，重定向到登录页
      navigate('/login');
      return;
    }

    if (token && isLoginPage) {
      // 已登录但在登录页，重定向到管理首页
      navigate('/home');
      return;
    }
  }, [location.pathname, navigate]);

  const handleLogout = async () => {
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
        navigate('/login');
      },
    });
  };

  // 如果是登录页或主站页面，返回纯页面内容，不添加任何UI元素
  if (location.pathname === '/login' || location.pathname === '/') {
    return <>{children}</>;
  }

  return <>{children}</>;
}

// 保持 runtime 兼容：命名导出 layout
export function layout({ children }: { children: React.ReactNode }) {
  return <AppLayoutWrapper>{children}</AppLayoutWrapper>;
}




