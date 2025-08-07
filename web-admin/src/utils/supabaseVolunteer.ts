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
    
    console.log('fetchVolunteers - 成功返回数据，数量:', data?.length || 0);
    return data || [];
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
    
    const { data, error } = await supabase
      .from('volunteers')
      .insert([{ ...volunteer, user_id: userId }]);
    
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
    
    const { data, error } = await supabase
      .from('volunteers')
      .update({ ...volunteer, user_id: userId })
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
    
    // 为每个志愿者添加用户ID
    const volunteersWithUserId = volunteers.map(volunteer => ({
      ...volunteer,
      user_id: userId
    }));
    
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