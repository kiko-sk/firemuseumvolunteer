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
      volunteerNo: volunteer.volunteerno || '',
      name: volunteer.name || '',
      phone: volunteer.phone || '',
      gender: volunteer.gender || '',
      age: volunteer.age || 0,
      type: volunteer.type || '场馆服务',
      serviceCount: volunteer.servicecount || 0,
      serviceHours: volunteer.servicehours || 0,
      serviceHours2025: volunteer.servicehours2025 || 0, // 服务时长2025
      serviceScore: volunteer.servicescore || 0, // 服务积分
      explainScore: volunteer.explainscore || 0, // 讲解积分
      bonusScore: volunteer.bonusscore || 0, // 附加积分
      totalscore: volunteer.totalscore || 0,
      redeemedscore: volunteer.redeemedscore || 0,
      remainingscore: volunteer.remainingscore || 0,
      status: volunteer.status || 'active',
      registerdate: volunteer.registerdate || '',
      lastservicedate: volunteer.lastservicedate || '',
      remark: volunteer.remark || ''
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
      volunteerno: volunteer.volunteerNo || '',
      name: volunteer.name || '',
      phone: volunteer.phone || '',
      gender: volunteer.gender || '',
      age: volunteer.age || 0,
      type: volunteer.type || '场馆服务',
      servicecount: volunteer.serviceCount || 0,
      servicehours: volunteer.serviceHours || 0,
      servicehours2025: volunteer.serviceHours2025 || 0, // 服务时长2025
      servicescore: volunteer.serviceScore || 0, // 服务积分
      explainscore: volunteer.explainScore || 0, // 讲解积分
      bonusscore: volunteer.bonusScore || 0, // 附加积分
      totalscore: volunteer.totalscore || 0,
      redeemedscore: volunteer.redeemedscore || 0,
      remainingscore: volunteer.remainingscore || 0,
      status: volunteer.status || 'active',
      // 日期字段：空值用 null，避免传 "" 导致数据库类型错误
      registerdate: volunteer.registerdate ? volunteer.registerdate : null,
      lastservicedate: volunteer.lastServiceDate || volunteer.lastservicedate ? (volunteer.lastServiceDate || volunteer.lastservicedate) : null,
      remark: volunteer.remark || '',
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
      volunteerno: volunteer.volunteerNo || '',
      name: volunteer.name || '',
      phone: volunteer.phone || '',
      gender: volunteer.gender || '',
      age: volunteer.age || 0,
      type: volunteer.type || '场馆服务',
      servicecount: volunteer.serviceCount || 0,
      servicehours: volunteer.serviceHours || 0,
      servicehours2025: volunteer.serviceHours2025 || 0, // 服务时长2025
      servicescore: volunteer.serviceScore || 0, // 服务积分
      explainscore: volunteer.explainScore || 0, // 讲解积分
      bonusscore: volunteer.bonusScore || 0, // 附加积分
      totalscore: volunteer.totalscore || 0,
      redeemedscore: volunteer.redeemedscore || 0,
      remainingscore: volunteer.remainingscore || 0,
      status: volunteer.status || 'active',
      // 日期字段：空值用 null，避免传 "" 导致数据库类型错误
      registerdate: volunteer.registerdate ? volunteer.registerdate : null,
      lastservicedate: volunteer.lastServiceDate || volunteer.lastservicedate ? (volunteer.lastServiceDate || volunteer.lastservicedate) : null,
      remark: volunteer.remark || '',
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
    const toNumber = (v: any, def: number = 0) => {
      if (v === '' || v === undefined || v === null) return def;
      const n = Number(String(v).replace('小时','').trim());
      return Number.isFinite(n) ? n : def;
    };

    const volunteersWithUserId = volunteers.map(volunteer => {
      // 兼容两种输入：表单（驼峰）与导入（蛇形）
      const cleanVolunteer: any = {
        volunteerno: (volunteer.volunteerNo ?? volunteer.volunteerno ?? '').toString().trim(),
        name: (volunteer.name ?? '').toString().trim(),
        phone: (volunteer.phone ?? '').toString().trim(),
        gender: (volunteer.gender ?? '').toString().trim(),
        age: toNumber(volunteer.age, 0),
        type: (volunteer.type ?? '场馆服务').toString().trim(),
        servicecount: toNumber(volunteer.serviceCount ?? volunteer.servicecount, 0),
        servicehours: toNumber(volunteer.serviceHours ?? volunteer.servicehours, 0),
        servicehours2025: toNumber(volunteer.serviceHours2025 ?? volunteer.servicehours2025, 0),
        servicescore: toNumber(volunteer.serviceScore ?? volunteer.servicescore, 0),
        explainscore: toNumber(volunteer.explainScore ?? volunteer.explainscore, 0),
        bonusscore: toNumber(volunteer.bonusScore ?? volunteer.bonusscore, 0),
        totalscore: toNumber(volunteer.totalscore, 0),
        redeemedscore: toNumber(volunteer.redeemedscore, 0),
        remainingscore: toNumber(volunteer.remainingscore, 0),
        status: (volunteer.status ?? 'active').toString().trim(),
        // 日期字段：空值用 null，兼容 lastServiceDate / lastservicedate
        registerdate: volunteer.registerdate ? volunteer.registerdate : null,
        lastservicedate: (volunteer.lastServiceDate ?? volunteer.lastservicedate) ? (volunteer.lastServiceDate ?? volunteer.lastservicedate) : null,
        remark: (volunteer.remark ?? '').toString(),
        user_id: userId
      };

      // 移除所有 undefined / null
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