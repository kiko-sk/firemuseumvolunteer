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
  },

  // 获取积分数据（points别名）
  async getPoints() {
    try {
      const data = await kv.get('points');
      return data || { points: 100 };
    } catch (error) {
      console.error('获取积分数据失败:', error);
      return { points: 100 };
    }
  },

  // 保存积分数据（points别名）
  async savePoints(data) {
    try {
      await kv.set('points', data);
      return true;
    } catch (error) {
      console.error('保存积分数据失败:', error);
      return false;
    }
  },

  // 获取志愿者风采数据
  async getVolunteerStyle() {
    try {
      const data = await kv.get('volunteer-style');
      return data || [];
    } catch (error) {
      console.error('获取志愿者风采数据失败:', error);
      return [];
    }
  },

  // 保存志愿者风采数据
  async saveVolunteerStyle(data) {
    try {
      await kv.set('volunteer-style', data);
      return true;
    } catch (error) {
      console.error('保存志愿者风采数据失败:', error);
      return false;
    }
  },

  // 获取报名列表数据
  async getSignupList() {
    try {
      const data = await kv.get('signup-list');
      return data || [];
    } catch (error) {
      console.error('获取报名列表数据失败:', error);
      return [];
    }
  },

  // 保存报名列表数据
  async saveSignupList(data) {
    try {
      await kv.set('signup-list', data);
      return true;
    } catch (error) {
      console.error('保存报名列表数据失败:', error);
      return false;
    }
  },

  // 获取兑换记录数据
  async getExchangeRecords() {
    try {
      const data = await kv.get('exchange-records');
      return data || [];
    } catch (error) {
      console.error('获取兑换记录数据失败:', error);
      return [];
    }
  },

  // 保存兑换记录数据
  async saveExchangeRecords(data) {
    try {
      await kv.set('exchange-records', data);
      return true;
    } catch (error) {
      console.error('保存兑换记录数据失败:', error);
      return false;
    }
  },

  // 获取活动数据
  async getActivities() {
    try {
      const data = await kv.get('activities');
      return data || [];
    } catch (error) {
      console.error('获取活动数据失败:', error);
      return [];
    }
  },

  // 保存活动数据
  async saveActivities(data) {
    try {
      await kv.set('activities', data);
      return true;
    } catch (error) {
      console.error('保存活动数据失败:', error);
      return false;
    }
  }
}; 