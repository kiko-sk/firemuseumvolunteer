import { supabase } from './supabaseClient';

// 获取当前用户ID
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// 获取报名记录
export const fetchSignupRecords = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { data, error } = await supabase
      .from('signup_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取报名记录失败:', error);
    throw error;
  }
};

// 添加报名记录
export const addSignupRecord = async (record: any) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { data, error } = await supabase
      .from('signup_records')
      .insert([
        {
          ...record,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('添加报名记录失败:', error);
    throw error;
  }
};

// 更新报名记录
export const updateSignupRecord = async (id: string, updates: any) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { data, error } = await supabase
      .from('signup_records')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) {
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('更新报名记录失败:', error);
    throw error;
  }
};

// 删除报名记录
export const deleteSignupRecord = async (id: string) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { error } = await supabase
      .from('signup_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('删除报名记录失败:', error);
    throw error;
  }
};

// 批量删除报名记录
export const batchDeleteSignupRecords = async (ids: string[]) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { error } = await supabase
      .from('signup_records')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('批量删除报名记录失败:', error);
    throw error;
  }
};

// 获取报名设置
export const fetchSignupSettings = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { data, error } = await supabase
      .from('signup_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 表示没有找到记录
      throw error;
    }

    return data;
  } catch (error) {
    console.error('获取报名设置失败:', error);
    throw error;
  }
};

// 保存报名设置
export const saveSignupSettings = async (settings: any) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { data, error } = await supabase
      .from('signup_settings')
      .upsert([
        {
          ...settings,
          user_id: userId,
          updated_at: new Date().toISOString()
        }
      ], {
        onConflict: 'user_id'
      })
      .select();

    if (error) {
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('保存报名设置失败:', error);
    throw error;
  }
};

// 获取服务时段
export const fetchServiceSlots = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    const { data, error } = await supabase
      .from('service_slots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('获取服务时段失败:', error);
    throw error;
  }
};

// 保存服务时段
export const saveServiceSlots = async (slots: any[]) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      throw new Error('用户未登录');
    }

    // 先删除现有的服务时段
    await supabase
      .from('service_slots')
      .delete()
      .eq('user_id', userId);

    // 插入新的服务时段
    const { data, error } = await supabase
      .from('service_slots')
      .insert(
        slots.map(slot => ({
          ...slot,
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
      )
      .select();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('保存服务时段失败:', error);
    throw error;
  }
}; 