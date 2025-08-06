// 云端数据同步工具
export class CloudSync {
  private static instance: CloudSync;
  private syncInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): CloudSync {
    if (!CloudSync.instance) {
      CloudSync.instance = new CloudSync();
    }
    return CloudSync.instance;
  }

  // 保存数据到云端
  async saveToCloud(key: string, data: any): Promise<boolean> {
    try {
      // 模拟云端保存
      localStorage.setItem(`cloud_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
        version: '1.0'
      }));
      
      console.log(`数据已保存到云端: ${key}`);
      return true;
    } catch (error) {
      console.error('云端保存失败:', error);
      return false;
    }
  }

  // 从云端加载数据
  async loadFromCloud(key: string): Promise<any | null> {
    try {
      const cloudData = localStorage.getItem(`cloud_${key}`);
      if (cloudData) {
        const parsed = JSON.parse(cloudData);
        console.log(`从云端加载数据: ${key}`);
        return parsed.data;
      }
      return null;
    } catch (error) {
      console.error('云端加载失败:', error);
      return null;
    }
  }

  // 同步本地数据到云端
  async syncLocalToCloud(): Promise<void> {
    const keys = ['volunteerData', 'signupRecords', 'giftData'];
    
    for (const key of keys) {
      const localData = localStorage.getItem(key);
      if (localData) {
        await this.saveToCloud(key, JSON.parse(localData));
      }
    }
  }

  // 从云端同步到本地
  async syncCloudToLocal(): Promise<void> {
    const keys = ['volunteerData', 'signupRecords', 'giftData'];
    
    for (const key of keys) {
      const cloudData = await this.loadFromCloud(key);
      if (cloudData) {
        localStorage.setItem(key, JSON.stringify(cloudData));
      }
    }
  }

  // 启动自动同步
  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      await this.syncLocalToCloud();
    }, intervalMs);
    
    console.log('自动同步已启动');
  }

  // 停止自动同步
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    console.log('自动同步已停止');
  }

  // 强制同步
  async forceSync(): Promise<void> {
    await this.syncLocalToCloud();
    await this.syncCloudToLocal();
  }
}

export const cloudSync = CloudSync.getInstance(); 