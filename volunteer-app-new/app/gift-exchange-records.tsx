import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';

interface ExchangeRecord {
  giftName: string;
  points: number;
  date: string;
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

const API_RECORDS = `${BASE_URL}/api/exchange-records`;

export default function GiftExchangeRecords() {
  const [records, setRecords] = useState<ExchangeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_RECORDS).then(r => r.json());
      setRecords(res.data || []);
    } catch (error) {
      Alert.alert('加载失败', '请检查网络或稍后重试');
    }
    setLoading(false);
  };

  const renderItem = ({ item }: { item: ExchangeRecord }) => (
    <View style={styles.recordCard}>
      <Text style={styles.giftName}>{item.giftName}</Text>
      <Text style={styles.points}>兑换积分：{item.points}</Text>
      <Text style={styles.date}>兑换日期：{item.date}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>兑换记录</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1763a6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(_, idx) => String(idx)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 18, marginBottom: 8 },
  recordCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 18,
    elevation: 1,
  },
  giftName: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  points: { color: '#1763a6', fontSize: 15, marginBottom: 2 },
  date: { color: '#888', fontSize: 13 },
}); 