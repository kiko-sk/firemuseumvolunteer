import { createClient } from '@supabase/supabase-js';

// Supabase配置 - 当前使用Supabase作为数据存储
// 生产环境可以考虑迁移到自建数据库
const supabaseUrl = 'https://owzfhscgcnpvkgcquyzl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emZoc2NnY25wdmtnY3F1eXpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzY1MTgsImV4cCI6MjA2OTk1MjUxOH0.QJyugyuPxMwHxjRYe1erwWwkdc7GZOvh2Dzuzd8aoqE';
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 生产环境API配置
export const PRODUCTION_CONFIG = {
  API_BASE_URL: 'https://api.fmvsh.cn',
  ADMIN_URL: 'https://admin.fmvsh.cn',
  MAIN_URL: 'https://fmvsh.cn',
};

// 测试Supabase连接
export const testSupabaseConnection = async () => {
  try {
    console.log('测试Supabase连接...');
    console.log('URL:', supabaseUrl);
    console.log('Key:', supabaseAnonKey.substring(0, 20) + '...');
    
    // 测试基本连接
    const { data, error } = await supabase.from('volunteers').select('count').limit(1);
    console.log('Supabase连接测试结果:', { data, error });
    
    if (error) {
      console.error('Supabase连接失败:', error);
      return false;
    }
    
    console.log('Supabase连接成功');
    return true;
  } catch (error) {
    console.error('Supabase连接异常:', error);
    return false;
  }
}; 