import React from 'react';
import { Button } from 'antd';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import localeData from 'dayjs/plugin/localeData';
dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(localeData);

export function layout({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  return (
    <div>
      <div style={{ position: 'fixed', right: 32, top: 24, zIndex: 1000 }}>
        <Button danger onClick={handleLogout}>退出登录</Button>
      </div>
      {children}
    </div>
  );
} 