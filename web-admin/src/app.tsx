import React, { useEffect } from 'react';
import { Button } from 'antd';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import localeData from 'dayjs/plugin/localeData';
import { useLocation, useNavigate } from 'react-router-dom';
dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(localeData);

export function layout({ children }: { children: React.ReactNode }) {
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  // 如果是登录页或主站页面，返回纯页面内容，不添加任何UI元素
  if (location.pathname === '/login' || location.pathname === '/') {
    return <>{children}</>;
  }

  // 只有功能页面才显示退出按钮
  return (
    <div>
      <div style={{ position: 'fixed', right: 32, top: 24, zIndex: 1000 }}>
        <Button danger onClick={handleLogout}>退出登录</Button>
      </div>
      {children}
    </div>
  );
} 