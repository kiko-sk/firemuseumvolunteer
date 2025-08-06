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
  const { data, error } = await supabase
    .from('gifts')
    .insert([{ ...gift, user_id: userId }]);
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