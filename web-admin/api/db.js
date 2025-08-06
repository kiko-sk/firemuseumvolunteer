import { kv } from '@vercel/kv';

// 数据库操作函数
export const db = {
  // 获取志愿者数据
  async getVolunteers() {
    try {
      const data = await kv.get('volunteers');
      return data || [];
    } catch (error) {
      console.error('获取志愿者数据失败:', error);
      return [];
    }
  },

  // 保存志愿者数据
  async saveVolunteers(data) {
    try {
      await kv.set('volunteers', data);
      return true;
    } catch (error) {
      console.error('保存志愿者数据失败:', error);
      return false;
    }
  },

  // 获取报名记录
  async getSignups() {
    try {
      const data = await kv.get('signups');
      return data || [];
    } catch (error) {
      console.error('获取报名记录失败:', error);
      return [];
    }
  },

  // 保存报名记录
  async saveSignups(data) {
    try {
      await kv.set('signups', data);
      return true;
    } catch (error) {
      console.error('保存报名记录失败:', error);
      return false;
    }
  },

  // 获取礼品数据
  async getGifts() {
    try {
      const data = await kv.get('gifts');
      return data || [];
    } catch (error) {
      console.error('获取礼品数据失败:', error);
      return [];
    }
  },

  // 保存礼品数据
  async saveGifts(data) {
    try {
      await kv.set('gifts', data);
      return true;
    } catch (error) {
      console.error('保存礼品数据失败:', error);
      return false;
    }
  },

  // 获取积分数据
  async getScores() {
    try {
      const data = await kv.get('scores');
      return data || [];
    } catch (error) {
      console.error('获取积分数据失败:', error);
      return [];
    }
  },

  // 保存积分数据
  async saveScores(data) {
    try {
      await kv.set('scores', data);
      return true;
    } catch (error) {
      console.error('保存积分数据失败:', error);
      return false;
    }
  }
}; 