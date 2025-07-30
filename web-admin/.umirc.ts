import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  mfsu: false,
  routes: [
    {
      name: '登录',
      path: '/login',
      component: './Login',
      layout: false,
    },
    // 删除首页重定向和首页、权限演示、CRUD 示例页面
    // {
    //   path: '/',
    //   redirect: '/home',
    // },
    // {
    //   name: '首页',
    //   path: '/home',
    //   component: './Home',
    // },
    // {
    //   name: '权限演示',
    //   path: '/access',
    //   component: './Access',
    // },
    // {
    //   name: ' CRUD 示例',
    //   path: '/table',
    //   component: './Table',
    // },
    {
      name: '志愿者管理',
      path: '/volunteer',
      component: './Volunteer',
    },
    {
      name: '志愿者风采',
      path: '/volunteer-style',
      component: './VolunteerStyle',
    },
    {
      name: '报名管理',
      path: '/signup',
      component: './Signup',
    },
    {
      name: '礼品兑换管理',
      path: '/gift',
      component: './Gift',
    },
    {
      name: '报名统计',
      path: '/statistics',
      component: './Statistics',
    },
    {
      name: '签到统计',
      path: '/signin-stats',
      component: './SigninStats',
    },
    {
      name: '活动管理',
      path: '/activity',
      component: './Activity',
    },
    {
      name: '系统管理',
      path: '/system',
      component: './System',
    },
  ],
  npmClient: 'pnpm',
});

