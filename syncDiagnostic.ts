import { supabase } from './supabaseClient';
import { getCurrentUserId, fetchVolunteers, addVolunteer, updateVolunteer } from './supabaseVolunteer';

// 云端同步诊断工具
export class SyncDiagnostic {
  
  // 1. 检查用户认证状态
  static async checkAuth() {
    console.log('🔍 检查用户认证状态...');
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('❌ 认证检查失败:', error);
        return { success: false, error: error.message };
      }
      
      if (!user) {
        console.error('❌ 用户未登录');
        return { success: false, error: '用户未登录' };
      }
      
      console.log('✅ 用户认证成功:', {
        id: user.id,
        email: user.email,
        phone: user.phone,
        created_at: user.created_at
      });
      
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ 认证检查异常:', error);
      return { success: false, error: '认证检查异常' };
    }
  }
  
  // 2. 检查数据库连接
  static async checkConnection() {
    console.log('🔍 检查数据库连接...');
    
    try {
      const { data, error } = await supabase
        .from('volunteers')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('❌ 数据库连接失败:', error);
        return { success: false, error: error.message };
      }
      
      console.log('✅ 数据库连接成功');
      return { success: true };
      
    } catch (error) {
      console.error('❌ 数据库连接异常:', error);
      return { success: false, error: '数据库连接异常' };
    }
  }
  
  // 3. 检查数据读取权限
  static async checkReadPermission() {
    console.log('🔍 检查数据读取权限...');
    
    try {
      const data = await fetchVolunteers();
      console.log('✅ 数据读取成功，记录数:', data.length);
      return { success: true, count: data.length };
      
    } catch (error) {
      console.error('❌ 数据读取失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '数据读取失败' };
    }
  }
  
  // 4. 检查数据写入权限（测试新增）
  static async checkWritePermission() {
    console.log('🔍 检查数据写入权限...');
    
    const testVolunteer = {
      id: `test_${Date.now()}`,
      volunteerNo: `TEST_${Date.now()}`,
      name: '测试志愿者',
      phone: '13800000000',
      gender: '男',
      age: 25,
      type: '场馆服务',
      serviceCount: 0,
      serviceHours: 0,
      serviceHours2025: 0,
      serviceScore: 0,
      explainScore: 0,
      bonusScore: 0,
      totalscore: 0,
      redeemedscore: 0,
      remainingscore: 0,
      status: 'active',
      registerdate: new Date().toISOString().split('T')[0],
      lastservicedate: '',
      remark: '测试数据'
    };
    
    try {
      // 尝试添加测试数据
      await addVolunteer(testVolunteer);
      console.log('✅ 数据写入测试成功');
      
      // 立即删除测试数据
      const userId = await getCurrentUserId();
      if (userId) {
        await supabase
          .from('volunteers')
          .delete()
          .eq('volunteerno', testVolunteer.volunteerNo)
          .eq('user_id', userId);
        console.log('🗑️ 测试数据已清理');
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ 数据写入失败:', error);
      return { success: false, error: error instanceof Error ? error.message : '数据写入失败' };
    }
  }
  
  // 5. 检查用户模式
  static checkUserMode() {
    console.log('🔍 检查用户模式...');
    
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      console.log('❌ 未找到用户信息');
      return { success: false, mode: 'unknown' };
    }
    
    try {
      const user = JSON.parse(currentUser);
      const isLocal = user.phone === 'test';
      
      console.log('✅ 用户模式检查完成:', {
        mode: isLocal ? 'local' : 'cloud',
        user: user
      });
      
      return { 
        success: true, 
        mode: isLocal ? 'local' : 'cloud',
        user 
      };
      
    } catch (error) {
      console.error('❌ 用户信息解析失败:', error);
      return { success: false, mode: 'unknown' };
    }
  }
  
  // 6. 完整诊断
  static async runFullDiagnostic() {
    console.log('🚀 开始完整的云端同步诊断...');
    console.log('='.repeat(50));
    
    const results = {
      userMode: this.checkUserMode(),
      auth: await this.checkAuth(),
      connection: await this.checkConnection(),
      readPermission: await this.checkReadPermission(),
      writePermission: await this.checkWritePermission()
    };
    
    console.log('='.repeat(50));
    console.log('📊 诊断结果汇总:');
    console.log('用户模式:', results.userMode.success ? `✅ ${results.userMode.mode}` : '❌ 检查失败');
    console.log('用户认证:', results.auth.success ? '✅ 成功' : `❌ ${results.auth.error}`);
    console.log('数据库连接:', results.connection.success ? '✅ 成功' : `❌ ${results.connection.error}`);
    console.log('读取权限:', results.readPermission.success ? `✅ 成功 (${results.readPermission.count}条记录)` : `❌ ${results.readPermission.error}`);
    console.log('写入权限:', results.writePermission.success ? '✅ 成功' : `❌ ${results.writePermission.error}`);
    
    // 判断整体状态
    const allSuccess = Object.values(results).every(r => r.success);
    
    if (allSuccess) {
      console.log('🎉 所有检查通过！云端同步功能正常');
    } else {
      console.log('⚠️ 发现问题，请根据上述错误信息进行修复');
    }
    
    console.log('='.repeat(50));
    
    return results;
  }
}

// 导出便捷函数
export const runSyncDiagnostic = () => SyncDiagnostic.runFullDiagnostic();

// 在浏览器控制台中可用的全局函数
if (typeof window !== 'undefined') {
  (window as any).runSyncDiagnostic = runSyncDiagnostic;
  (window as any).SyncDiagnostic = SyncDiagnostic;
}
