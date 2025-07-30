import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

// 动态 baseURL 适配 Android/iOS
const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  } else {
    return 'http://10.0.5.56:8000'; // 你的电脑局域网 IP
  }
};
const BASE_URL = getBaseURL();

// API endpoints
const API_POINTS = `${BASE_URL}/api/points`;
const API_GIFTS = `${BASE_URL}/api/gifts`;
const API_EXCHANGE = `${BASE_URL}/api/exchange`;

interface GiftItem {
  id: string;
  name: string;
  points: number;
  stock: number;
  image?: string;
}

export const tabBarLabel = '礼品兑换';

export default function GiftExchange() {
  const [points, setPoints] = useState(0);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exchanging, setExchanging] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const pointsRes = await fetch(API_POINTS).then(r => r.json());
      const giftsRes = await fetch(API_GIFTS).then(r => r.json());
      setPoints(pointsRes.points || 0);
      setGifts(giftsRes.data || []);
    } catch (error) {
      Alert.alert('加载失败', '请检查网络或稍后重试');
    }
    setLoading(false);
  };

  const handleExchange = (gift: GiftItem) => {
    if (points < gift.points) {
      Alert.alert('积分不足', '您的积分不足，无法兑换该礼品');
      return;
    }
    if (gift.stock <= 0) {
      Alert.alert('库存不足', '该礼品已兑完');
      return;
    }
    Alert.alert(
      '确认兑换',
      `您确定要花费 ${gift.points} 积分兑换 ${gift.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        { text: '确定', onPress: () => doExchange(gift) },
      ]
    );
  };

  const doExchange = async (gift: GiftItem) => {
    setExchanging(true);
    try {
      const res = await fetch(API_EXCHANGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: gift.id }),
      }).then(r => r.json());
      if (res.code === 0) {
        Alert.alert('兑换成功');
        fetchData();
      } else {
        Alert.alert('兑换失败', res.msg || '');
      }
    } catch (error) {
      Alert.alert('兑换失败', '请检查网络或稍后重试');
    }
    setExchanging(false);
  };

  const renderGift = ({ item }: { item: GiftItem }) => (
    <View style={styles.giftCard}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.giftImage} resizeMode="cover" />
      )}
      <Text style={styles.giftName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.giftPoints}>所需积分：{item.points}</Text>
      <Text style={styles.giftStock}>库存：{item.stock}</Text>
      <TouchableOpacity
        style={[styles.exchangeBtn, (exchanging || item.stock <= 0 || points < item.points) && styles.exchangeBtnDisabled]}
        onPress={() => handleExchange(item)}
        disabled={exchanging || item.stock <= 0 || points < item.points}
      >
        <Text style={styles.exchangeBtnText}>{item.stock <= 0 ? '已兑完' : '兑换'}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>礼品兑换</Text>
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>当前可用积分：</Text>
        <Text style={styles.pointsValue}>{points}</Text>
      </View>
      <Text style={styles.sectionTitle}>可兑换礼品</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1763a6" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={gifts}
          keyExtractor={item => String(item.id)}
          renderItem={renderGift}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 12 }}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      <TouchableOpacity style={styles.recordBtn} onPress={() => router.push('/gift-exchange-records')}>
        <Text style={styles.recordBtnText}>查看兑换记录</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa', padding: 0 },
  header: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 18, marginBottom: 8 },
  pointsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
  },
  pointsLabel: { fontSize: 16, color: '#888' },
  pointsValue: { fontSize: 40, color: '#1763a6', fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginLeft: 18, marginBottom: 10 },
  giftCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 14,
    padding: 12,
    width: '48%',
    alignItems: 'center',
    elevation: 1,
  },
  giftName: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  giftPoints: { color: '#1763a6', fontSize: 15, marginBottom: 2 },
  giftStock: { color: '#888', fontSize: 13, marginBottom: 10 },
  giftImage: {
    width: 110,
    height: 160,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#eee',
  },
  exchangeBtn: {
    width: '90%',
    backgroundColor: '#1763a6',
    borderRadius: 22,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#1763a6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  exchangeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  exchangeBtnDisabled: {
    backgroundColor: '#b5c8d6',
    shadowOpacity: 0,
  },
  recordBtn: {
    backgroundColor: '#fff',
    borderRadius: 10,
    margin: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
  },
  recordBtnText: { color: '#222', fontSize: 16 },
}); 