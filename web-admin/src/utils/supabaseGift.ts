import { supabase } from './supabaseClient';

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

export async function fetchGifts() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function addGift(gift: any) {
  const userId = await getCurrentUserId();
  // 日志：输出 gift
  console.log('addGift - 最终入库 gift:', gift);
  // 强制剥离 id 字段
  const { id, ...giftWithoutId } = gift;
  const { data, error } = await supabase
    .from('gifts')
    .insert([{ ...giftWithoutId, user_id: userId }]);
  if (error) throw error;
  return data;
}

export async function updateGift(id: string, gift: any) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('gifts')
    .update({ ...gift, user_id: userId })
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

export async function deleteGift(id: string) {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('gifts')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  if (error) throw error;
  return data;
}

// 批量插入礼品
export async function batchAddGifts(gifts: any[]) {
  try {
    const userId = await getCurrentUserId();
    console.log('batchAddGifts - userId:', userId, 'count:', gifts.length);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    // 为每个礼品添加用户ID并剥离ID字段
    const giftsWithUserId = gifts.map(gift => {
      const { id, ...giftWithoutId } = gift;
      return {
        ...giftWithoutId,
        user_id: userId
      };
    });
    
    const { data, error } = await supabase
      .from('gifts')
      .insert(giftsWithUserId);
    
    console.log('batchAddGifts - 批量插入结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('batchAddGifts - 异常:', error);
    throw error;
  }
}

// 批量删除礼品
export async function batchDeleteGifts(ids: string[]) {
  try {
    const userId = await getCurrentUserId();
    console.log('batchDeleteGifts - userId:', userId, 'ids:', ids);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    const { data, error } = await supabase
      .from('gifts')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('batchDeleteGifts - 异常:', error);
    throw error;
  }
}

// 清空所有礼品数据
export async function clearAllGifts() {
  try {
    const userId = await getCurrentUserId();
    console.log('clearAllGifts - userId:', userId);
    
    if (!userId) {
      throw new Error('用户未登录');
    }
    
    const { data, error } = await supabase
      .from('gifts')
      .delete()
      .eq('user_id', userId);
    
    console.log('clearAllGifts - 清空结果:', { data, error });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('clearAllGifts - 异常:', error);
    throw error;
  }
} 