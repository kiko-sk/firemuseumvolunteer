import { supabase } from './supabaseClient';

// 工具：驼峰/下划线映射
const toDbRecord = (r: any) => ({
  id: r.id,
  volunteer_id: r.volunteerId,
  volunteer_name: r.volunteerName,
  volunteer_phone: r.volunteerPhone,
  volunteer_type: r.volunteerType,
  service_slot_id: r.serviceSlotId,
  date: r.date,
  service_type: r.serviceType,
  time_slot: r.timeSlot,
  signup_time: r.signupTime,
  status: r.status,
  points: r.points,
  notes: r.notes,
});
const fromDbRecord = (r: any) => ({
  id: r.id,
  volunteerId: r.volunteer_id,
  volunteerName: r.volunteer_name,
  volunteerPhone: r.volunteer_phone,
  volunteerType: r.volunteer_type,
  serviceSlotId: r.service_slot_id,
  date: r.date,
  serviceType: r.service_type,
  timeSlot: r.time_slot,
  signupTime: r.signup_time,
  status: r.status,
  points: r.points,
  notes: r.notes,
});

const toDbSettings = (s: any) => ({
  id: s.id,
  auto_open: s.autoOpen,
  open_time: s.openTime,
  open_date: s.openDate,
  close_time: s.closeTime,
  close_date: s.closeDate,
  current_week: s.currentWeek,
  status: s.status,
  last_open_time: s.lastOpenTime,
  next_open_time: s.nextOpenTime,
  signup_period_days: s.signupPeriodDays,
  service_start_day: s.serviceStartDay,
  service_end_day: s.serviceEndDay,
});
const fromDbSettings = (s: any) => ({
  id: s.id,
  autoOpen: s.auto_open,
  openTime: s.open_time,
  openDate: s.open_date,
  closeTime: s.close_time,
  closeDate: s.close_date,
  currentWeek: s.current_week,
  status: s.status,
  lastOpenTime: s.last_open_time,
  nextOpenTime: s.next_open_time,
  signupPeriodDays: s.signup_period_days,
  serviceStartDay: s.service_start_day,
  serviceEndDay: s.service_end_day,
});

const toDbSlot = (s: any) => ({
  id: s.id,
  date: s.date,
  day_of_week: s.dayOfWeek,
  service_type: s.serviceType,
  time_slot: s.timeSlot,
  max_capacity: s.maxCapacity,
  current_signups: s.currentSignups,
  waitlist: s.waitlist,
  status: s.status,
  is_weekend: s.isWeekend,
});
const fromDbSlot = (s: any) => ({
  id: s.id,
  date: s.date,
  dayOfWeek: s.day_of_week,
  serviceType: s.service_type,
  timeSlot: s.time_slot,
  maxCapacity: s.max_capacity,
  currentSignups: s.current_signups,
  waitlist: s.waitlist,
  status: s.status,
  isWeekend: s.is_weekend,
});

// 获取当前用户ID
export const getCurrentUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
};

// 获取报名记录（映射字段）
export const fetchSignupRecords = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('signup_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(fromDbRecord);
  } catch (error) {
    console.error('获取报名记录失败:', error);
    throw error;
  }
};

// 添加报名记录
export const addSignupRecord = async (record: any) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('signup_records')
      .insert([
        {
          ...toDbRecord(record),
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ])
      .select();

    if (error) throw error;
    return data?.[0] ? fromDbRecord(data[0]) : null;
  } catch (error) {
    console.error('添加报名记录失败:', error);
    throw error;
  }
};

// 更新报名记录
export const updateSignupRecord = async (id: string, updates: any) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('signup_records')
      .update({
        ...toDbRecord(updates),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select();

    if (error) throw error;
    return data?.[0] ? fromDbRecord(data[0]) : null;
  } catch (error) {
    console.error('更新报名记录失败:', error);
    throw error;
  }
};

// 删除报名记录
export const deleteSignupRecord = async (id: string) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    const { error } = await supabase
      .from('signup_records')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
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
    if (!userId) throw new Error('用户未登录');

    const { error } = await supabase
      .from('signup_records')
      .delete()
      .in('id', ids)
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('批量删除报名记录失败:', error);
    throw error;
  }
};

// 获取报名设置（修复 .single 导致的 406，多行时取最新一条）
export const fetchSignupSettings = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('signup_settings')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(1);

    if (error) throw error;
    const row = (data || [])[0];
    return row ? fromDbSettings(row) : null;
  } catch (error) {
    console.error('获取报名设置失败:', error);
    throw error;
  }
};

// 保存报名设置（字段映射为下划线）
export const saveSignupSettings = async (settings: any) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    const payload = { ...toDbSettings(settings), user_id: userId, updated_at: new Date().toISOString() };
    const { data, error } = await supabase
      .from('signup_settings')
      .upsert([payload], { onConflict: 'user_id' })
      .select();

    if (error) throw error;
    return data?.[0] ? fromDbSettings(data[0]) : null;
  } catch (error) {
    console.error('保存报名设置失败:', error);
    throw error;
  }
};

// 获取服务时段（字段映射）
export const fetchServiceSlots = async () => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    const { data, error } = await supabase
      .from('service_slots')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error) throw error;
    return (data || []).map(fromDbSlot);
  } catch (error) {
    console.error('获取服务时段失败:', error);
    throw error;
  }
};

// 保存服务时段（字段映射）
export const saveServiceSlots = async (slots: any[]) => {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error('用户未登录');

    // 先删除现有的服务时段
    await supabase.from('service_slots').delete().eq('user_id', userId);

    // 插入新的服务时段
    const { data, error } = await supabase
      .from('service_slots')
      .insert(
        slots.map(slot => ({
          ...toDbSlot(slot),
          user_id: userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))
      )
      .select();

    if (error) throw error;
    return data?.map(fromDbSlot) || [];
  } catch (error) {
    console.error('保存服务时段失败:', error);
    throw error;
  }
};