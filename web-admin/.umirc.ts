import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '消防博物馆志愿者管理系统',
  },
  routes: [
    {
      path: '/',
      component: './Landing',
      layout: false, // 主站页面不使用布局
    },
    {
      name: '登录',
      path: '/login',
      component: './Login',
      layout: false, // 登录页不使用布局
    },
    {
      name: '首页',
      path: '/home',
      component: './Home',
    },
    {
      name: '志愿者管理',
      path: '/volunteer',
      component: './Volunteer',
    },
    {
      name: '活动管理',
      path: '/activity',
      component: './Activity',
    },
    {
      name: '礼品管理',
      path: '/gift',
      component: './Gift',
    },
    {
      name: '签到统计',
      path: '/signin-stats',
      component: './SigninStats',
    },
    {
      name: '报名管理',
      path: '/signup',
      component: './Signup',
    },
    {
      name: '志愿者风采',
      path: '/volunteer-style',
      component: './VolunteerStyle',
    },
    {
      name: '系统设置',
      path: '/system',
      component: './System',
    },
    {
      name: '统计分析',
      path: '/statistics',
      component: './Statistics',
    },
    {
      name: '积分管理',
      path: '/score',
      component: './Score',
    },
  ],
  npmClient: 'npm',
  esbuildMinifyIIFE: true,
  mfsu: false,
  hash: true,
  publicPath: '/',
  targets: {
    chrome: 80,
    firefox: 80,
    safari: 14,
    edge: 80,
  },
  chainWebpack: (config) => {
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        vendor: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial',
        },
      },
    });
  },
});

