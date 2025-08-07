import { Platform } from 'react-native';

// API配置
export const API_CONFIG = {
  // 开发环境
  development: {
    android: 'http://10.0.2.2:8000',
    ios: 'http://10.0.5.56:8000',
  },
  // 生产环境
  production: {
    api: 'https://api.fmvsh.cn',
    admin: 'https://admin.fmvsh.cn',
    main: 'https://fmvsh.cn',
  },
};

// 获取当前环境的API基础URL
export const getApiBaseUrl = (): string => {
  // 优先使用环境变量
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // 生产环境
  if (__DEV__ === false) {
    return API_CONFIG.production.api;
  }

  // 开发环境
  if (Platform.OS === 'android') {
    return API_CONFIG.development.android;
  } else {
    return API_CONFIG.development.ios;
  }
};

// API端点
export const API_ENDPOINTS = {
  // 志愿者相关
  VOLUNTEER_STYLE: '/api/volunteer-style',
  SIGNUP_LIST: '/api/signup-list',
  SIGNUP: '/api/signup',
  LEAVE: '/api/leave',
  
  // 积分相关
  POINTS: '/api/points',
  
  // 礼品相关
  GIFTS: '/api/gifts',
  EXCHANGE: '/api/exchange',
  EXCHANGE_RECORDS: '/api/exchange-records',
  
  // 活动相关
  ACTIVITIES: '/api/activities',
};

// 获取完整的API URL
export const getApiUrl = (endpoint: string): string => {
  return `${getApiBaseUrl()}${endpoint}`;
};
