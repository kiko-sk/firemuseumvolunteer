import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import protocols from '../assets/docs/protocols.json';

export default function LoginScreen() {
  const [loginType, setLoginType] = useState<'password' | 'code'>('password');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [forgotVisible, setForgotVisible] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPwd, setForgotNewPwd] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const [protocolChecked, setProtocolChecked] = useState(false);
  const [protocolModal, setProtocolModal] = useState<{visible: boolean, type: 'rule'|'faq'|'privacy'|null}>({visible: false, type: null});
  const router = useRouter();

  const handleLogin = () => {
    if (loginType === 'password') {
    if (phone === 'test' && password === '123456') {
      router.replace('/');
    } else {
      Alert.alert('登录失败', '手机号或密码错误（测试账号 test / 123456）');
    }
    } else {
      if (phone === 'test' && code === '123456') {
        router.replace('/');
      } else {
        Alert.alert('登录失败', '手机号或验证码错误（测试验证码 123456）');
      }
    }
  };

  const handleSendCode = () => {
    if (!phone) {
      Alert.alert('请输入手机号');
      return;
    }
    if (phone.length !== 11) {
      Alert.alert('请输入正确的手机号');
      return;
    }
    
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    Alert.alert('验证码已发送', '测试验证码：123456');
  };

  const handleForgotSendCode = () => {
    if (!forgotPhone) {
      Alert.alert('请输入手机号');
      return;
    }
    if (forgotPhone.length !== 11) {
      Alert.alert('请输入正确的手机号');
      return;
    }
    setForgotCountdown(60);
    const timer = setInterval(() => {
      setForgotCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    Alert.alert('验证码已发送', '测试验证码：123456');
  };

  const handleResetPwd = () => {
    if (!forgotPhone || !forgotCode || !forgotNewPwd) {
      Alert.alert('请填写完整信息');
      return;
    }
    if (forgotCode !== '123456') {
      Alert.alert('验证码错误');
      return;
    }
    // 这里可以调用后端API重置密码
    Alert.alert('密码重置成功', '请使用新密码登录');
    setForgotVisible(false);
    setForgotPhone('');
    setForgotCode('');
    setForgotNewPwd('');
    setForgotCountdown(0);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Logo 和应用名称 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/homepage.png')} style={styles.logo} resizeMode="cover" />
        </View>
        <Text style={styles.appName}>上海消防博物馆志愿者</Text>
        <Text style={styles.appSubtitle}>Volunteer Management System</Text>
      </View>

      {/* 登录表单 */}
      <View style={styles.formContainer}>
        <Text style={styles.welcomeText}>欢迎登录</Text>
        
        {/* 登录方式切换 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, loginType === 'password' && styles.tabActive]}
            onPress={() => setLoginType('password')}
          >
            <Text style={[styles.tabText, loginType === 'password' && styles.tabTextActive]}>密码登录</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, loginType === 'code' && styles.tabActive]}
            onPress={() => setLoginType('code')}
          >
            <Text style={[styles.tabText, loginType === 'code' && styles.tabTextActive]}>验证码登录</Text>
          </TouchableOpacity>
        </View>

        {/* 手机号输入 */}
      <TextInput
        style={styles.input}
          placeholder="请输入手机号"
        value={phone}
        onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={11}
      />

        {/* 密码登录 */}
        {loginType === 'password' && (
          <>
      <TextInput
        style={styles.input}
              placeholder="请输入密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
            <TouchableOpacity style={styles.forgotPwdBtn} onPress={() => setForgotVisible(true)}> 
              <Text style={styles.forgotPwdText}>忘记密码？</Text>
            </TouchableOpacity>
          </>
        )}

        {/* 验证码登录 */}
        {loginType === 'code' && (
          <View style={styles.codeContainer}>
            <TextInput
              style={styles.codeInput}
              placeholder="请输入验证码"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <TouchableOpacity 
              style={[styles.sendCodeBtn, countdown > 0 && styles.sendCodeBtnDisabled]}
              onPress={handleSendCode}
              disabled={countdown > 0}
            >
              <Text style={[styles.sendCodeText, countdown > 0 && styles.sendCodeTextDisabled]}>
                {countdown > 0 ? `${countdown}s` : '发送验证码'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 登录按钮 */}
        <TouchableOpacity style={[styles.loginBtn, !protocolChecked && { backgroundColor: '#ccc' }]} onPress={handleLogin} disabled={!protocolChecked}>
        <Text style={styles.loginBtnText}>登录</Text>
      </TouchableOpacity>
        {/* 协议勾选与弹窗（移动到此处） */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, marginBottom: 0 }}>
          <TouchableOpacity onPress={() => setProtocolChecked(!protocolChecked)} style={{ marginRight: 6 }}>
            <View style={[styles.checkbox, protocolChecked && styles.checkboxChecked]} />
          </TouchableOpacity>
          <Text style={{ fontSize: 13 }}>
            我已阅读并同意
            <Text style={styles.protocolLink} onPress={() => setProtocolModal({visible: true, type: 'rule'})}>《服务细则》</Text>、
            <Text style={styles.protocolLink} onPress={() => setProtocolModal({visible: true, type: 'faq'})}>《常见问题》</Text>、
            <Text style={styles.protocolLink} onPress={() => setProtocolModal({visible: true, type: 'privacy'})}>《隐私保护》</Text>
        </Text>
        </View>
      </View>

      {/* 忘记密码弹窗 */}
      <Modal
        visible={forgotVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setForgotVisible(false)}
      >
        <View style={styles.modalMask}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>重置密码</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入手机号"
              value={forgotPhone}
              onChangeText={setForgotPhone}
              keyboardType="phone-pad"
              maxLength={11}
            />
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="请输入验证码"
                value={forgotCode}
                onChangeText={setForgotCode}
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity 
                style={[styles.sendCodeBtn, forgotCountdown > 0 && styles.sendCodeBtnDisabled]}
                onPress={handleForgotSendCode}
                disabled={forgotCountdown > 0}
              >
                <Text style={[styles.sendCodeText, forgotCountdown > 0 && styles.sendCodeTextDisabled]}>
                  {forgotCountdown > 0 ? `${forgotCountdown}s` : '发送验证码'}
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="请输入新密码"
              value={forgotNewPwd}
              onChangeText={setForgotNewPwd}
              secureTextEntry
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
              <TouchableOpacity style={[styles.loginBtn, { flex: 1, marginRight: 8, backgroundColor: '#ccc' }]} onPress={() => setForgotVisible(false)}>
                <Text style={[styles.loginBtnText, { color: '#333' }]}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.loginBtn, { flex: 1, marginLeft: 8 }]} onPress={handleResetPwd}>
                <Text style={styles.loginBtnText}>重置密码</Text>
              </TouchableOpacity>
            </View>
          </View>
    </View>
      </Modal>

      {/* 协议弹窗 */}
      <Modal
        visible={protocolModal.visible}
        animationType="slide"
        transparent
        onRequestClose={() => setProtocolModal({visible: false, type: null})}
      >
        <View style={styles.modalMask}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}> 
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12, textAlign: 'center' }}>
              {protocolModal.type === 'rule' ? '服务细则' : protocolModal.type === 'faq' ? '常见问题' : '隐私保护'}
            </Text>
            <ScrollView style={{ flex: 1, minHeight: 300 }} showsVerticalScrollIndicator={true}>
              <Text style={{ fontSize: 12, color: '#888', marginBottom: 8, textAlign: 'center' }}>
                内容较多，可上下滑动查看全部
              </Text>
              {protocolModal.type && protocols[protocolModal.type]
                ? protocols[protocolModal.type].split('\n\n').map((para, idx) => (
                    <Text key={idx} style={{ fontSize: 15, lineHeight: 26, color: '#333', marginBottom: 10 }}>
                      {para.trim()}
                    </Text>
                  ))
                : null}
            </ScrollView>
            <TouchableOpacity style={[styles.loginBtn, { marginTop: 18 }]} onPress={() => setProtocolModal({visible: false, type: null})}>
              <Text style={styles.loginBtnText}>我已阅读</Text>
            </TouchableOpacity>
          </View>
    </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 32,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    shadowColor: '#1763a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1763a6',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  formContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 20,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  tabTextActive: {
    color: '#1763a6',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  codeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  codeInput: {
    flex: 1,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e6e6e6',
    marginRight: 12,
  },
  sendCodeBtn: {
    backgroundColor: '#1763a6',
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
    minWidth: 100,
  },
  sendCodeBtnDisabled: {
    backgroundColor: '#ccc',
  },
  sendCodeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sendCodeTextDisabled: {
    color: '#999',
  },
  loginBtn: {
    backgroundColor: '#1763a6',
    borderRadius: 25,
    width: '100%',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#1763a6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tip: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  forgotPwdBtn: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  forgotPwdText: {
    color: '#1763a6',
    fontSize: 14,
  },
  modalMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '95%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    maxHeight: '95%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1763a6',
    marginBottom: 18,
    textAlign: 'center',
  },
  checkbox: {
    width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#aaa', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#1763a6', borderColor: '#1763a6',
  },
  protocolLink: {
    color: '#1763a6', textDecorationLine: 'underline',
  },
}); 