import { supabase } from './supabaseClient';

// 获取当前登录用户ID
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getUser();
    console.log('getCurrentUserId - data:', data, 'error:', error);
    return data.user?.id || null;
  } catch (error) {
    console.error('getCurrentUserId error:', error);
    return null;
  }
}

// 查询志愿者列表（只查当前用户）
export async function fetchVolunteers() {
  try {
    console.log('fetchVolunteers - 开始执行');
    
    const userId = await getCurrentUserId();
    console.log('fetchVolunteers - userId:', userId);
    
    if (!userId) {
      console.log('fetchVolunteers - 用户未登录，返回空数组');
      return [];
    }
    
    console.log('fetchVolunteers - 开始查询Supabase，表名: volunteers');
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('user_id', userId);
    
    console.log('fetchVolunteers - 查询结果:', { data, error });
    
    if (error) {
      console.error('fetchVolunteers - Supabase错误:', error);
      throw error;
    }
    
    // 将数据库中的小写字段名转换为前端期望的格式
    const transformedData = (data || []).map(volunteer => ({
      id: volunteer.id,
      volunteerNo: volunteer.volunteerno,
      name: volunteer.name,
      phone: volunteer.phone,
      gender: volunteer.gender,
      age: volunteer.age,
      type: volunteer.type,
      serviceCount: volunteer.servicecount,
      serviceHours: volunteer.servicehours,
      totalscore: volunteer.totalscore,
      redeemedscore: volunteer.redeemedscore,
      remainingscore: volunteer.remainingscore,
      status: volunteer.status,
      registerdate: volunteer.registerdate,
      lastservicedate: volunteer.lastservicedate,
      remark: volunteer.remark
    }));
    
    console.log('fetchVolunteers - 成功返回数据，数量:', transformedData.length);
    return transformedData;
  } catch (error) {
    console.error('fetchVolunteers - 捕获到异常:', error);
    throw error;
  }
}

// 新增志愿者
export async function addVolunteer(volunteer: any) {
  try {
    const userId = await getCurrentUserId();
    console.log('addVolunteer - userId:', userId, 'volunteer:', volunteer);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    // 转换字段名为小写以匹配数据库结构
    const cleanVolunteer = {
      volunteerno: volunteer.volunteerNo,
      name: volunteer.name,
      phone: volunteer.phone,
      gender: volunteer.gender,
      age: volunteer.age,
      type: volunteer.type,
      servicecount: volunteer.serviceCount,
      servicehours: volunteer.serviceHours,
      totalscore: volunteer.totalscore,
      redeemedscore: volunteer.redeemedscore,
      remainingscore: volunteer.remainingscore,
      status: volunteer.status,
      registerdate: volunteer.registerdate,
      lastservicedate: volunteer.lastservicedate,
      remark: volunteer.remark,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('volunteers')
      .insert([cleanVolunteer]);
    
    console.log('addVolunteer - 插入结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('addVolunteer - 异常:', error);
    throw error;
  }
}

// 编辑志愿者
export async function updateVolunteer(id: string, volunteer: any) {
  try {
    const userId = await getCurrentUserId();
    console.log('updateVolunteer - userId:', userId, 'id:', id);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    // 转换字段名为小写以匹配数据库结构
    const cleanVolunteer = {
      volunteerno: volunteer.volunteerNo,
      name: volunteer.name,
      phone: volunteer.phone,
      gender: volunteer.gender,
      age: volunteer.age,
      type: volunteer.type,
      servicecount: volunteer.serviceCount,
      servicehours: volunteer.serviceHours,
      totalscore: volunteer.totalscore,
      redeemedscore: volunteer.redeemedscore,
      remainingscore: volunteer.remainingscore,
      status: volunteer.status,
      registerdate: volunteer.registerdate,
      lastservicedate: volunteer.lastservicedate,
      remark: volunteer.remark,
      user_id: userId
    };
    
    const { data, error } = await supabase
      .from('volunteers')
      .update(cleanVolunteer)
      .eq('id', id)
      .eq('user_id', userId);
    
    console.log('updateVolunteer - 更新结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('updateVolunteer - 异常:', error);
    throw error;
  }
}

// 删除志愿者
export async function deleteVolunteer(id: string) {
  try {
    const userId = await getCurrentUserId();
    console.log('deleteVolunteer - userId:', userId, 'id:', id);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    const { data, error } = await supabase
      .from('volunteers')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    console.log('deleteVolunteer - 删除结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('deleteVolunteer - 异常:', error);
    throw error;
  }
}

// 批量删除志愿者
export async function batchDeleteVolunteers(ids: string[]) {
  try {
    const userId = await getCurrentUserId();
    console.log('batchDeleteVolunteers - userId:', userId, 'ids:', ids);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    const { data, error } = await supabase
      .from('volunteers')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);
    
    console.log('batchDeleteVolunteers - 批量删除结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('batchDeleteVolunteers - 异常:', error);
    throw error;
  }
}

// 批量插入志愿者
export async function batchAddVolunteers(volunteers: any[]) {
  try {
    const userId = await getCurrentUserId();
    console.log('batchAddVolunteers - userId:', userId, 'count:', volunteers.length);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    // 为每个志愿者添加用户ID，并过滤掉所有不存在的字段
    const volunteersWithUserId = volunteers.map(volunteer => {
      // 创建一个新对象，只包含Supabase数据库中确实存在的字段，使用小写字段名
      const cleanVolunteer: any = {
        volunteerno: volunteer.volunteerNo,
        name: volunteer.name,
        phone: volunteer.phone,
        gender: volunteer.gender,
        age: volunteer.age,
        type: volunteer.type,
        servicecount: volunteer.serviceCount,
        servicehours: volunteer.serviceHours,
        totalscore: volunteer.totalscore,
        redeemedscore: volunteer.redeemedscore,
        remainingscore: volunteer.remainingscore,
        status: volunteer.status,
        registerdate: volunteer.registerdate,
        lastservicedate: volunteer.lastservicedate,
        remark: volunteer.remark,
        user_id: userId
      };
      
      // 移除所有undefined和null值
      Object.keys(cleanVolunteer).forEach(key => {
        if (cleanVolunteer[key] === undefined || cleanVolunteer[key] === null) {
          delete cleanVolunteer[key];
        }
      });
      
      return cleanVolunteer;
    });
    
    const { data, error } = await supabase
      .from('volunteers')
      .insert(volunteersWithUserId);
    
    console.log('batchAddVolunteers - 批量插入结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('batchAddVolunteers - 异常:', error);
    throw error;
  }
}

// 清空所有志愿者数据
export async function clearAllVolunteers() {
  try {
    const userId = await getCurrentUserId();
    console.log('clearAllVolunteers - userId:', userId);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    const { data, error } = await supabase
      .from('volunteers')
      .delete()
      .eq('user_id', userId);
    
    console.log('clearAllVolunteers - 清空结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('clearAllVolunteers - 异常:', error);
    throw error;
  }
} 