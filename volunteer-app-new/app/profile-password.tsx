import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';

export default function ProfilePassword() {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const router = useRouter();

  const handleSave = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) {
      Alert.alert('请填写完整');
      return;
    }
    if (newPwd !== confirmPwd) {
      Alert.alert('两次输入的新密码不一致');
      return;
    }
    // TODO: 调用后端API修改密码
    Alert.alert('修改成功');
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f6fa', padding: 20 }}>
      <Text style={styles.title}>修改密码</Text>
      <TextInput style={styles.input} placeholder="原密码" value={oldPwd} onChangeText={setOldPwd} secureTextEntry />
      <TextInput style={styles.input} placeholder="新密码" value={newPwd} onChangeText={setNewPwd} secureTextEntry />
      <TextInput style={styles.input} placeholder="再次输入新密码" value={confirmPwd} onChangeText={setConfirmPwd} secureTextEntry />
      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveBtnText}>确定</Text></TouchableOpacity>
      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}><Text style={styles.cancelBtnText}>返回</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: 'bold', color: '#1763a6', marginBottom: 24, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 10, fontSize: 16, borderWidth: 1, borderColor: '#e6e6e6', marginBottom: 16 },
  saveBtn: { backgroundColor: '#1763a6', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cancelBtn: { backgroundColor: '#eee', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 12 },
  cancelBtnText: { color: '#666', fontSize: 16 },
}); 