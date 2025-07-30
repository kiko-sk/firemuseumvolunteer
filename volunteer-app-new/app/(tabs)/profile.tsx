import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProfile } from '../../components/ProfileContext';

const mockProfile = {
  name: '志愿者小明',
  phone: '138****1234',
  serviceHours: 120,
  points: 85,
  serviceType: '场馆服务',
  gender: '男',
  avatarUrl: '',
};

export default function ProfileScreen() {
  const { profile } = useProfile();
  const router = useRouter();

  // TODO: useEffect 拉取后端 profile 数据

  const handleLogout = () => {
    Alert.alert(
      '确认退出',
      '确定要退出登录吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定', 
          style: 'destructive',
          onPress: () => {
            // 清除登录状态（这里可以添加清除 token 等逻辑）
            router.replace('/login');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.card}>
        <TouchableOpacity onPress={() => router.push('/profile-edit')} style={styles.avatarWrap}>
          <Image source={profile.avatarUrl ? { uri: profile.avatarUrl } : { uri: 'https://i.pravatar.cc/100' }} style={styles.avatar} />
          <View style={styles.cameraIcon}><Text style={{ color: '#fff', fontSize: 12 }}>📷</Text></View>
        </TouchableOpacity>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.phone}>{profile.phone}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>{profile.serviceHours}</Text><Text style={styles.statLabel}>志愿时长</Text></View>
          <View style={styles.statItem}><Text style={styles.statValue}>{profile.points}</Text><Text style={styles.statLabel}>累计积分</Text></View>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>个人信息管理</Text>
        <TouchableOpacity style={styles.sectionItem} onPress={() => router.push('/profile-edit')}><Text>编辑资料</Text></TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem} onPress={() => router.push('/profile-password')}><Text>修改密码</Text></TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我的志愿</Text>
        <TouchableOpacity style={styles.sectionItem} onPress={() => router.push('/my-signup')}><Text>我的报名</Text></TouchableOpacity>
        <TouchableOpacity style={styles.sectionItem} onPress={() => router.push('/history-records')}><Text>历史记录</Text></TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>设置与帮助</Text>
        <TouchableOpacity style={styles.sectionItem} onPress={() => router.push('/contact-us')}><Text>联系我们</Text></TouchableOpacity>
      </View>
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', padding: 24, marginBottom: 18 },
  avatarWrap: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
  cameraIcon: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#1763a6', borderRadius: 12, padding: 4 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 2 },
  phone: { color: '#888', marginBottom: 10 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', width: '100%', marginTop: 8 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, color: '#1763a6', fontWeight: 'bold' },
  statLabel: { color: '#888', fontSize: 13 },
  section: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, padding: 12 },
  sectionTitle: { fontSize: 15, color: '#1763a6', fontWeight: 'bold', marginBottom: 8 },
  sectionItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  logoutButton: { 
    backgroundColor: '#ff4757', 
    borderRadius: 8, 
    padding: 16, 
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
}); 