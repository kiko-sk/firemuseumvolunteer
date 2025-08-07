import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from 'expo-router';

const SERVICE_TYPES = ['场馆服务', '讲解服务'];
const TIME_SLOTS = ['上午', '下午', '全天'];

interface SignupItem {
  serviceType: string;
  timeSlot: string;
  signupStart: string;
  signupEnd: string;
  signedCount: number;
  requiredCount: number;
  signups?: { name: string; time: string }[];
  // 如有其他字段可补充
}

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  // 生产环境域名
  if (__DEV__ === false) {
    return 'https://api.fmvsh.cn';
  }
  // 开发环境
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  } else {
    return 'http://10.0.5.56:8000';
  }
};
const BASE_URL = getBaseURL();

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [serviceType, setServiceType] = useState(SERVICE_TYPES[0]);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState('上午');
  const [loading, setLoading] = useState(false);

  // 报名时间限制（根据班次的 signupStart/signupEnd 判断）
  const [canSignup, setCanSignup] = useState(false);
  const [signupList, setSignupList] = useState<SignupItem[]>([]);
  const [currentSlotFull, setCurrentSlotFull] = useState(false);

  // 拉取班次
  const fetchSignupList = async () => {
    try {
      console.log('开始获取班次数据...');
      const response = await fetch(`${BASE_URL}/api/signup-list`);
      console.log('班次接口响应状态:', response.status);
      const res = await response.json();
      console.log('班次接口返回:', JSON.stringify(res));
    setSignupList(res.data || []);
    } catch (error) {
      console.error('获取班次数据失败:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSignupList();
    }, [])
  );

  // 检查当前选择的班次是否已满，并获取已报名名单
  const [currentSignups, setCurrentSignups] = useState<{ name: string; time: string }[]>([]);
  const [currentSignupItem, setCurrentSignupItem] = useState<SignupItem | null>(null);
  
  useEffect(() => {
    const dateStr = date.toISOString().slice(0, 10);
    console.log('查找班次 - 当前日期:', dateStr);
    console.log('查找班次 - 服务类型:', serviceType);
    console.log('查找班次 - 时间段:', timeSlot);
    console.log('查找班次 - 可用班次:', signupList.length);
    
    const found = signupList.find(item => {
      const itemDate = item.signupStart.split(' ')[0]; // 提取日期部分
      const matches = item.serviceType === serviceType && 
                     item.timeSlot === timeSlot && 
                     itemDate === dateStr;
      
      console.log('班次匹配检查:', {
        itemServiceType: item.serviceType,
        itemTimeSlot: item.timeSlot,
        itemDate: itemDate,
        matches: matches
      });
      
      return matches;
    });
    
    console.log('找到的班次:', found);
    setCurrentSignupItem(found || null);
    setCurrentSlotFull(found ? found.signedCount >= found.requiredCount : false);
    setCurrentSignups(found ? found.signups || [] : []);
  }, [signupList, serviceType, timeSlot, date]);

  // 根据班次的 signupStart/signupEnd 判断是否可报名
  useEffect(() => {
    if (!currentSignupItem) {
      setCanSignup(false);
      return;
    }

    const now = new Date();
    const signupStart = new Date(currentSignupItem.signupStart);
    const signupEnd = new Date(currentSignupItem.signupEnd);
    
    // 当前时间在报名时间范围内且班次未满
    const isInSignupTime = now >= signupStart && now <= signupEnd;
    const isNotFull = currentSignupItem.signedCount < currentSignupItem.requiredCount;
    
    setCanSignup(isInSignupTime && isNotFull);
  }, [currentSignupItem, currentSlotFull]);

  const handleSignup = async () => {
    if (!name) return Alert.alert('请输入姓名');
    setLoading(true);
    const res = await fetch(`${BASE_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, serviceType, date: date.toISOString().slice(0, 10), timeSlot }),
    }).then(r => r.json());
    setLoading(false);
    if (res.code === 0) {
      Alert.alert('报名成功');
      // 报名成功后刷新数据
      fetchSignupList();
    } else {
      Alert.alert('报名失败', res.msg || '');
    }
  };

  const handleLeave = async () => {
    if (!name) return Alert.alert('请输入姓名');
    setLoading(true);
    const res = await fetch(`${BASE_URL}/api/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, serviceType, date: date.toISOString().slice(0, 10), timeSlot, reason: '请假' }),
    }).then(r => r.json());
    setLoading(false);
    if (res.code === 0) {
      Alert.alert('请假成功');
      // 请假成功后刷新数据
      fetchSignupList();
    } else {
      Alert.alert('请假失败', res.msg || '');
    }
  };

  // 获取报名时间提示
  const getSignupTimeTip = () => {
    if (!currentSignupItem) return '未找到该班次信息';
    
    const signupStart = new Date(currentSignupItem.signupStart);
    const signupEnd = new Date(currentSignupItem.signupEnd);
    const now = new Date();
    
    if (now < signupStart) {
      return `报名时间：${signupStart.toLocaleString()} - ${signupEnd.toLocaleString()}`;
    } else if (now > signupEnd) {
      return '报名时间已结束';
    } else if (currentSlotFull) {
      return '该班次已满员';
    } else {
      return '可以报名';
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#f5f6fa' }}
      contentContainerStyle={{ padding: 20, paddingTop: 100, paddingBottom: 40 }}
    >
      <View style={styles.header}>
      <Text style={styles.title}>志愿者报名</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchSignupList}>
          <Text style={styles.refreshBtnText}>刷新</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.tip}>{getSignupTimeTip()}</Text>
      
      <Text style={styles.label}>姓名：</Text>
      <TextInput
        style={styles.input}
        placeholder="请输入您的姓名"
        value={name}
        onChangeText={setName}
        keyboardType="default"
        autoCorrect={false}
      />
      <Text style={styles.label}>服务类型：</Text>
      <View style={styles.row}>
        {SERVICE_TYPES.map(type => (
          <TouchableOpacity
            key={type}
            style={[styles.tab, serviceType === type && styles.tabActive]}
            onPress={() => setServiceType(type)}
          >
            <Text style={serviceType === type ? styles.tabTextActive : styles.tabText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>选择日期：</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(_, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}
      <Text style={styles.label}>选择时间段：</Text>
      <View style={styles.row}>
        {TIME_SLOTS.map(slot => (
          <TouchableOpacity
            key={slot}
            style={[styles.timeBtn, timeSlot === slot && styles.timeBtnActive]}
            onPress={() => setTimeSlot(slot)}
          >
            <Text style={timeSlot === slot ? styles.timeTextActive : styles.timeText}>{slot}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* 当前班次已报名名单 */}
      {currentSignups.length > 0 && (
        <View style={styles.signupListCard}>
          <Text style={styles.signupListTitle}>已报名志愿者（{currentSignups.length}人）</Text>
          {currentSignups.map((s, idx) => (
            <View key={idx} style={styles.signupListItem}>
              <Text style={styles.signupListName}>{s.name}</Text>
              <Text style={styles.signupListTime}>{s.time}</Text>
            </View>
          ))}
        </View>
      )}
      <TouchableOpacity
        style={[styles.signupBtn, (!canSignup || currentSlotFull || loading) && { backgroundColor: '#b5c8d6' }]}
        onPress={handleSignup}
        disabled={!canSignup || currentSlotFull || loading}
      >
        <Text style={styles.signupBtnText}>{currentSlotFull ? '已满' : '确认报名'}</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.leaveBtn}
        onPress={handleLeave}
        disabled={loading}
      >
        <Text style={styles.leaveBtnText}>请假</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    color: '#1763a6',
    fontWeight: 'bold',
  },
  refreshBtn: {
    backgroundColor: '#7bb6ea',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  refreshBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 18,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tip: {
    color: '#e67c5a',
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#222',
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#f5f6fa',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#7bb6ea',
  },
  tabText: {
    color: '#333',
    fontSize: 16,
  },
  tabTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeBtn: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e6e6e6',
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  timeBtnActive: {
    backgroundColor: '#7bb6ea',
  },
  timeText: {
    color: '#333',
    fontSize: 16,
  },
  timeTextActive: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupBtn: {
    backgroundColor: '#7bb6ea',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 18,
  },
  signupBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaveBtn: {
    backgroundColor: '#666',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  leaveBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signupListCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    marginBottom: 8,
    elevation: 1,
  },
  signupListTitle: {
    fontSize: 15,
    color: '#1763a6',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  signupListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  signupListName: {
    color: '#333',
    fontSize: 15,
  },
  signupListTime: {
    color: '#888',
    fontSize: 13,
  },
}); 