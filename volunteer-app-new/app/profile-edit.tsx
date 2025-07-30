import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useProfile } from '../components/ProfileContext';

const mockProfile = {
  name: '张小明',
  phone: '138****1234',
  serviceHours: 120,
  serviceType: '场馆服务',
  gender: '男',
  emergencyContactName: '',
  emergencyContactPhone: '',
  bio: '',
  address: '',
  avatarUrl: '',
};

const SERVICE_TYPES = ['场馆服务', '讲解服务'];
const GENDERS = ['男', '女'];

export default function ProfileEdit() {
  const { profile, updateProfile } = useProfile();
  const [localProfile, setLocalProfile] = useState(profile);
  const router = useRouter();

  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      setLocalProfile({ ...localProfile, avatarUrl: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    updateProfile(localProfile);
    Alert.alert('保存成功');
    router.back();
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.avatarWrap}>
        <TouchableOpacity onPress={pickAvatar}>
          {localProfile.avatarUrl ? (
            <Image source={{ uri: localProfile.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}> 
              <Text style={{ color: '#bbb', fontSize: 32 }}>+</Text>
            </View>
          )}
          <View style={styles.cameraIcon}><Text style={{ color: '#fff', fontSize: 12 }}>📷</Text></View>
        </TouchableOpacity>
      </View>
      <View style={styles.formItem}><Text style={styles.label}>姓名</Text><TextInput style={styles.input} value={localProfile.name} onChangeText={v => setLocalProfile({ ...localProfile, name: v })} /></View>
      <View style={styles.formItem}><Text style={styles.label}>电话</Text><TextInput style={styles.input} value={localProfile.phone} onChangeText={v => setLocalProfile({ ...localProfile, phone: v })} keyboardType="phone-pad" /></View>
      <View style={styles.formItem}><Text style={styles.label}>服务时长</Text><TextInput style={styles.input} value={String(localProfile.serviceHours)} onChangeText={v => setLocalProfile({ ...localProfile, serviceHours: Number(v) })} keyboardType="numeric" /></View>
      <View style={styles.formItem}><Text style={styles.label}>服务类型</Text>
        <View style={styles.row}>
          {SERVICE_TYPES.map(type => (
            <TouchableOpacity key={type} style={[styles.tab, localProfile.serviceType === type && styles.tabActive]} onPress={() => setLocalProfile({ ...localProfile, serviceType: type })}>
              <Text style={localProfile.serviceType === type ? styles.tabTextActive : styles.tabText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formItem}><Text style={styles.label}>性别</Text>
        <View style={styles.row}>
          {GENDERS.map(gender => (
            <TouchableOpacity key={gender} style={[styles.tab, localProfile.gender === gender && styles.tabActive]} onPress={() => setLocalProfile({ ...localProfile, gender })}>
              <Text style={localProfile.gender === gender ? styles.tabTextActive : styles.tabText}>{gender}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formItem}><Text style={styles.label}>紧急联系人姓名</Text><TextInput style={styles.input} value={localProfile.emergencyContactName} onChangeText={v => setLocalProfile({ ...localProfile, emergencyContactName: v })} /></View>
      <View style={styles.formItem}><Text style={styles.label}>紧急联系人电话</Text><TextInput style={styles.input} value={localProfile.emergencyContactPhone} onChangeText={v => setLocalProfile({ ...localProfile, emergencyContactPhone: v })} keyboardType="phone-pad" /></View>
      <View style={styles.formItem}><Text style={styles.label}>个人简介</Text><TextInput style={styles.input} value={localProfile.bio} onChangeText={v => setLocalProfile({ ...localProfile, bio: v })} multiline /></View>
      <View style={styles.formItem}><Text style={styles.label}>居住地址</Text><TextInput style={styles.input} value={localProfile.address} onChangeText={v => setLocalProfile({ ...localProfile, address: v })} /></View>
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>保存</Text></TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}><Text style={styles.cancelBtnText}>取消</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  avatarWrap: { alignItems: 'center', marginBottom: 18 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee' },
  cameraIcon: { position: 'absolute', right: 0, bottom: 0, backgroundColor: '#1763a6', borderRadius: 12, padding: 4 },
  formItem: { marginBottom: 12 },
  label: { fontSize: 15, color: '#222', marginBottom: 4 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 16, borderWidth: 1, borderColor: '#e6e6e6' },
  row: { flexDirection: 'row', marginTop: 4 },
  tab: { flex: 1, padding: 10, backgroundColor: '#e6e6e6', borderRadius: 8, marginRight: 8, alignItems: 'center' },
  tabActive: { backgroundColor: '#7bb6ea' },
  tabText: { color: '#333', fontSize: 16 },
  tabTextActive: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#1763a6', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 18 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#eee', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
  cancelBtnText: { color: '#666', fontSize: 16 },
}); 