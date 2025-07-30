import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import rawProtocols from '../assets/docs/protocols.json';

const protocols: Record<string, string> = rawProtocols;

export default function TextDocViewer() {
  const { file } = useLocalSearchParams();
  const content = protocols[file as string] || '文档加载失败';

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.text}>{content}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  text: { fontSize: 16, color: '#333', lineHeight: 24 },
}); 