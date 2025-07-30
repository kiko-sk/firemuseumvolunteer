import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const MUSEUM_LAT = 31.22874;
const MUSEUM_LNG = 121.47564;
const ALLOW_RADIUS = 500; // 米

const museumIntro = `上海消防博物馆于 2007 年 11 月 9 日正式对外开放，总面积 2400 平方米，共分为两大版块：三楼是历史史展示馆，展陈了上海消防近两百年来所经历的沧桑巨变，各位来宾可以从历史沿革、组织架构、人员编制、器材装备等各方面，对上海消防有个全面的了解；二楼是科普教育馆，学习消防科普常识。`;

function getDistanceFromLatLonInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const screenWidth = Dimensions.get('window').width;

// 定义志愿者风采类型
interface VolunteerBanner {
  imageUrl: string;
  name: string;
  desc: string;
}

// 默认志愿者风采数据（当API失败时使用）
const defaultVolunteerBanners = [
  { imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80', name: '张三', desc: '优秀志愿者' },
  { imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80', name: '李四', desc: '服务之星' },
  { imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80', name: '王五', desc: '热心公益' },
  { imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80', name: '赵六', desc: '志愿先锋' },
  { imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80', name: '钱七', desc: '微笑天使' },
  { imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80', name: '孙八', desc: '青春榜样' },
];

const getBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  } else {
    return 'http://10.0.5.56:8000';
  }
};
const BASE_URL = getBaseURL();

export default function HomeScreen() {
  const [now, setNow] = useState(new Date());
  const [signed, setSigned] = useState(false);
  const router = useRouter();
  const [volunteerBanners, setVolunteerBanners] = useState<VolunteerBanner[]>(defaultVolunteerBanners);
  const [activity, setActivity] = useState<{ title: string; image: string; content: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/volunteer-style`)
      .then(res => {
        console.log('志愿者风采接口响应状态:', res.status);
        return res.json();
      })
      .then(res => {
        console.log('志愿者风采接口返回:', res);
        if (res.code === 0 && Array.isArray(res.data)) {
          setVolunteerBanners(res.data);
        } else {
          console.log('志愿者风采数据格式不正确，使用默认数据');
          setVolunteerBanners(defaultVolunteerBanners);
        }
      })
      .catch(error => {
        console.log('志愿者风采接口调用失败，使用默认数据:', error);
        setVolunteerBanners(defaultVolunteerBanners);
      });
  }, []);

  useEffect(() => {
    fetch(`${BASE_URL}/api/activities`)
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // 取 createdAt 最新的活动
          const sorted = data.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setActivity({
            title: sorted[0].title,
            image: sorted[0].image,
            content: sorted[0].content,
          });
        } else {
          setActivity(null);
        }
      })
      .catch(() => setActivity(null));
  }, []);

  // 日期格式 yyyy年MM月dd日
  const dateStr = `${now.getFullYear()}年${String(now.getMonth()+1).padStart(2,'0')}月${String(now.getDate()).padStart(2,'0')}日`;

  const handleSign = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('无法获取定位权限', '请在设置中允许定位权限');
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;
    const distance = getDistanceFromLatLonInMeters(latitude, longitude, MUSEUM_LAT, MUSEUM_LNG);
    if (distance > ALLOW_RADIUS) {
      Alert.alert('未到博物馆现场，无法签到');
      return;
    }
    setSigned(true);
    Alert.alert('签到成功', '已同步到web端（模拟）');
  };

  const handleBannerPress = () => {
    if (!activity) return;
    router.push({ pathname: '/activity-detail', params: { title: activity.title, content: activity.content } } as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <ScrollView contentContainerStyle={{ paddingTop: 36 }} style={{ flex: 1 }}>
        {/* 顶部日期卡片 */}
        <View style={styles.dateCard}>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        {/* 最新活动 Banner */}
        {activity ? (
        <TouchableOpacity style={styles.bannerWrap} activeOpacity={0.85} onPress={handleBannerPress}>
            <Image source={{ uri: activity!.image }} style={styles.bannerImg} resizeMode="cover" />
            <View style={styles.bannerTitleWrap}>
              <Text style={styles.bannerTitle}>{activity!.title}</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.bannerWrap} activeOpacity={0.85}>
            <Image source={require('../../assets/images/homepage.png')} style={styles.bannerImg} resizeMode="cover" />
          <View style={styles.bannerTitleWrap}>
              <Text style={styles.bannerTitle}>暂无最新活动</Text>
          </View>
        </TouchableOpacity>
        )}
        {/* 志愿者风采大图横滑 Banner */}
        <View style={{ marginBottom: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginLeft: 18, marginRight: 18, marginBottom: 8 }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1763a6' }}>志愿者风采</Text>
            <TouchableOpacity 
              onPress={() => {
                console.log('手动刷新志愿者风采数据');
                fetch(`${BASE_URL}/api/volunteer-style`)
                  .then(res => res.json())
                  .then(res => {
                    console.log('手动刷新返回:', res);
                    if (res.code === 0 && Array.isArray(res.data)) {
                      setVolunteerBanners(res.data);
                    }
                  })
                  .catch(error => {
                    console.log('手动刷新失败:', error);
                  });
              }}
              style={{ padding: 4 }}
            >
              <Text style={{ color: '#1763a6', fontSize: 12 }}>刷新</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={{ height: 180 }}
          >
            {volunteerBanners.map((item: VolunteerBanner, idx: number) => (
              <View key={idx} style={{ width: screenWidth, alignItems: 'center', justifyContent: 'center' }}>
                <Image 
                  source={{ uri: item.imageUrl }} 
                  style={{ width: screenWidth * 0.92, height: 160, borderRadius: 16 }}
                  resizeMode="cover"
                  onError={(error: unknown) => console.log('图片加载失败:', item.imageUrl, error)}
                />
                <View style={{ position: 'absolute', bottom: 28, left: 36 }}>
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, textShadowColor: '#000', textShadowRadius: 6 }}>{item.name}</Text>
                  <Text style={{ color: '#fff', fontSize: 14, textShadowColor: '#000', textShadowRadius: 6 }}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
        {/* 签到卡片 */}
        <View style={styles.signCard}>
          <Text style={styles.signTitle}>志愿者签到（到馆定位打卡）</Text>
          <TouchableOpacity
            style={[styles.signBtn, signed && styles.signBtnDisabled]}
            onPress={handleSign}
            disabled={signed}
          >
            <Text style={styles.signBtnText}>{signed ? '✔ 已签到' : '立即签到'}</Text>
          </TouchableOpacity>
        </View>
        {/* 博物馆介绍卡片 */}
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>博物馆介绍</Text>
          <Text style={styles.introContent}>{museumIntro}</Text>
        </View>
        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 18,
    marginHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 18,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  dateText: {
    fontSize: 32,
    color: '#1763a6',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  bannerWrap: {
    width: '92%',
    height: 160,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 18,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  bannerTitleWrap: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  bannerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 6,
  },
  signCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  signTitle: {
    fontSize: 18,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 18,
  },
  signBtn: {
    backgroundColor: '#1763a6',
    borderRadius: 24,
    width: 220,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: '#1763a6',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  signBtnDisabled: {
    backgroundColor: '#b5c8d6',
  },
  signBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  introCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 10,
  },
  introContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 24,
    textAlign: 'left',
  },
});
