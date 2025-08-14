import { supabase } from './supabaseClient';

export async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

// 规范化类别：兼容数组或 JSON 字符串，输出单个字符串
function normalizeCategory(input: any): string {
  try {
    if (Array.isArray(input)) return input[0] ?? '';
    if (typeof input === 'string') {
      const s = input.trim();
      if (s.startsWith('[') && s.endsWith(']')) {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed[0] ?? '';
      }
      return s.replace(/^\["|\[\'|\]|\"|\'$/g, '') || s; // 宽松兜底
    }
    return input ?? '';
  } catch {
    return typeof input === 'string' ? input : '';
  }
}


export async function fetchGifts() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('gifts')
    .select('*')
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map((g:any)=>({ ...g, category: normalizeCategory(g.category) }));
}

export async function addGift(gift: any) {
  const userId = await getCurrentUserId();
  // 日志：输出 gift
  console.log('addGift - 最终入库 gift:', gift);
  // 强制剥离 id 字段
  const { id, ...giftWithoutId } = gift;
  // 入库前规范化类别
  const normalized = { ...giftWithoutId, category: normalizeCategory(giftWithoutId.category) };
  const { data, error } = await supabase
    .from('gifts')
    .insert([{ ...normalized, user_id: userId }]);
  if (error) throw error;
  return data;
}

export async function updateGift(id: string, gift: any) {
  const userId = await getCurrentUserId();
  // 更新前规范化类别
  const normalized = { ...gift, category: normalizeCategory(gift.category) };
  const { data, error } = await supabase
    .from('gifts')
    .update({ ...normalized, user_id: userId })
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

    // 为每个礼品添加用户ID，不包含ID字段让数据库自动生成
    const giftsWithUserId = gifts.map(gift => {
      console.log('处理礼品数据:', { original: gift, processed: { ...gift, user_id: userId } });
      return {
        ...gift,
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

// 兑换历史：查询
export async function fetchExchangeRecords() {
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('gift_exchange_records')
    .select('*')
    .eq('user_id', userId)
    .order('exchange_time', { ascending: false });
  if (error) throw error;
  return data;
}

// 兑换历史：新增记录
export async function addExchangeRecord(record: any) {
  const userId = await getCurrentUserId();
  const payload = { ...record, user_id: userId };
  const { data, error } = await supabase
    .from('gift_exchange_records')
    .insert([payload])
    .select();
  if (error) throw error;
  return data?.[0] || null;
}

// 兑换礼品：扣减库存、增加已兑换，并写入兑换记录
export async function redeemGift(giftId: string, params: {
  giftName: string;
  volunteerName: string;
  volunteerPhone: string;
  pointsUsed: number;
  notes?: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error('用户未登录');

  // 读取当前礼品库存与已兑换
  const { data: giftRows, error: gErr } = await supabase
    .from('gifts')
    .select('*')
    .eq('id', giftId)
    .eq('user_id', userId)
    .limit(1);
  if (gErr) throw gErr;
  const gift = giftRows?.[0];
  if (!gift) throw new Error('礼品不存在');
  if ((gift.stock ?? 0) <= 0) throw new Error('库存不足');

  // 更新礼品库存与已兑换
  const { error: uErr } = await supabase
    .from('gifts')
    .update({ stock: (gift.stock || 0) - 1, exchanged: (gift.exchanged || 0) + 1 })
    .eq('id', giftId)
    .eq('user_id', userId);
  if (uErr) throw uErr;

  // 写入兑换记录
  const exchange = {
    gift_id: giftId,
    gift_name: params.giftName,
    volunteer_name: params.volunteerName,
    volunteer_phone: params.volunteerPhone,
    points_used: params.pointsUsed,
    exchange_time: new Date().toISOString(),
    status: 'completed',
    notes: params.notes || '',
    user_id: userId,
  };
  const { data: exRows, error: eErr } = await supabase
    .from('gift_exchange_records')
    .insert([exchange])
    .select();
  if (eErr) throw eErr;
  return exRows?.[0] || null;
}
