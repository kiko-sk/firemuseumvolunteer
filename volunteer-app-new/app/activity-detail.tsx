import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ActivityDetail() {
  const { title, content } = useLocalSearchParams();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
      <View style={styles.card}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.content}>{content}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 22,
    color: '#1763a6',
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
}); 