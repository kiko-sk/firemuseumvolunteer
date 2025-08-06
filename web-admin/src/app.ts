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

export const layout = () => {
  // 检查当前路径，如果是登录页则不使用布局
  const isLoginPage = window.location.pathname === '/login';
  
  if (isLoginPage) {
    return false; // 登录页不使用布局
  }
  
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: false,
    },
  };
};
