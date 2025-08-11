import { supabase } from './supabaseClient';

// 数据上传修复工具
export class DataUploadFix {
  
  // 测试Supabase连接和认证状态
  static async testConnection() {
    try {
      console.log('🔍 测试Supabase连接...');
      
      // 测试基本连接
      const { data: testData, error: testError } = await supabase
        .from('gifts')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('❌ Supabase连接失败:', testError);
        return { success: false, error: testError.message };
      }
      
      console.log('✅ Supabase连接成功');
      
      // 测试用户认证状态
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ 用户未认证:', authError);
        return { success: false, error: '用户未登录，请先登录' };
      }
      
      console.log('✅ 用户认证成功:', user.id);
      return { success: true, userId: user.id };
      
    } catch (error) {
      console.error('❌ 连接测试异常:', error);
      return { success: false, error: '连接测试失败' };
    }
  }
  
  // 修复Excel数据解析
  static fixExcelData(jsonData: any[]) {
    console.log('🔧 开始修复Excel数据...');
    
    const validData: any[] = [];
    const errors: string[] = [];
    let skippedRows = 0;
    
    // 安全的数字转换函数
    const safeParseInt = (value: any, defaultValue: number = 0): number => {
      if (value === null || value === undefined || value === '') {
        return defaultValue;
      }
      
      const cleanValue = String(value).trim().replace(/[^\d.-]/g, '');
      if (cleanValue === '') return defaultValue;
      
      const parsed = parseInt(cleanValue, 10);
      return isNaN(parsed) ? defaultValue : parsed;
    };
    
    jsonData.forEach((row: any, index: number) => {
      try {
        // 检查是否为空行
        const allFieldsEmpty = Object.values(row).every(value => 
          value === null || value === undefined || value === ''
        );
        
        if (allFieldsEmpty) {
          skippedRows++;
          return;
        }
        
        // 获取必填字段值
        const name = row['礼品名称'] || row['名称'] || row['name'];
        const category = row['类别'] || row['分类'] || row['category'];
        const points = safeParseInt(row['所需积分'] || row['积分'] || row['points'], 0);
        const stock = safeParseInt(row['库存'] || row['数量'] || row['stock'], 0);
        
        // 验证必填字段
        if (!name || !category || points <= 0) {
          errors.push(`第${index + 1}行：礼品名称、类别和所需积分为必填项`);
          return;
        }
        
        // 构造礼品对象
        const gift = {
          name: name.toString().trim(),
          category: category.toString().trim(),
          points: points,
          stock: stock,
          exchanged: 0,
          image: '',
          description: row['描述'] || '',
          status: 'active',
          createTime: new Date().toISOString().split('T')[0],
          updateTime: new Date().toISOString().split('T')[0]
        };
        
        validData.push(gift);
        
      } catch (error) {
        errors.push(`第${index + 1}行：数据格式错误 - ${error instanceof Error ? error.message : '未知错误'}`);
      }
    });
    
    return { validData, errors, skippedRows };
  }
  
  // 批量上传到Supabase
  static async uploadToSupabase(gifts: any[]) {
    try {
      // 测试连接
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        throw new Error(connectionTest.error);
      }
      
      const userId = connectionTest.userId;
      
      // 为每个礼品添加用户ID
      const giftsWithUserId = gifts.map(gift => ({
        ...gift,
        user_id: userId
      }));
      
      // 批量插入
      const { data, error } = await supabase
        .from('gifts')
        .insert(giftsWithUserId);
      
      if (error) throw error;
      
      return { success: true, data };
      
    } catch (error) {
      console.error('数据上传失败:', error);
      throw error;
    }
  }
}

export default DataUploadFix;
