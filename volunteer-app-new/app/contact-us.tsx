import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';

export default function ContactUsScreen() {
  const handleCall = () => {
    Linking.openURL('tel:021-28955751');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:volunteer@museum.com');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>联系我们</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.contactItem}>
          <Text style={styles.label}>客服电话</Text>
          <TouchableOpacity onPress={handleCall}>
            <Text style={styles.value}>021-28955751</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.label}>邮箱地址</Text>
          <TouchableOpacity onPress={handleEmail}>
            <Text style={styles.value}>volunteer@museum.com</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.label}>工作时间</Text>
          <Text style={styles.value}>周一至周五 9:00-18:00</Text>
        </View>
        <View style={styles.contactItem}>
          <Text style={styles.label}>地址</Text>
          <Text style={styles.value}>上海市长宁区中山西路229号</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    padding: 20,
  },
  contactItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#1763a6',
    fontWeight: '500',
  },
}); 