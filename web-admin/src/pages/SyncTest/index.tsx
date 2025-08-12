import React, { useState } from 'react';
import { Card, Button, Space, Typography, Alert, Divider } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { runSyncDiagnostic, SyncDiagnostic } from '../../utils/syncDiagnostic';

const { Title, Text, Paragraph } = Typography;

const SyncTest: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleRunDiagnostic = async () => {
    setTesting(true);
    try {
      const diagnosticResults = await runSyncDiagnostic();
      setResults(diagnosticResults);
    } catch (error) {
      console.error('诊断失败:', error);
    } finally {
      setTesting(false);
    }
  };

  const handleTestAuth = async () => {
    setTesting(true);
    try {
      const result = await SyncDiagnostic.checkAuth();
      console.log('认证测试结果:', result);
    } finally {
      setTesting(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const result = await SyncDiagnostic.checkConnection();
      console.log('连接测试结果:', result);
    } finally {
      setTesting(false);
    }
  };

  const handleTestRead = async () => {
    setTesting(true);
    try {
      const result = await SyncDiagnostic.checkReadPermission();
      console.log('读取权限测试结果:', result);
    } finally {
      setTesting(false);
    }
  };

  const handleTestWrite = async () => {
    setTesting(true);
    try {
      const result = await SyncDiagnostic.checkWritePermission();
      console.log('写入权限测试结果:', result);
    } finally {
      setTesting(false);
    }
  };

  const renderResult = (result: any, label: string) => {
    if (!result) return null;
    
    return (
      <div style={{ marginBottom: 8 }}>
        <Text strong>{label}: </Text>
        {result.success ? (
          <Text type="success">
            <CheckCircleOutlined /> 成功
            {result.count !== undefined && ` (${result.count}条记录)`}
            {result.mode && ` (${result.mode}模式)`}
          </Text>
        ) : (
          <Text type="danger">
            <ExclamationCircleOutlined /> 失败: {result.error}
          </Text>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: 24 }}>
      <Card>
        <Title level={2}>🔧 云端同步诊断工具</Title>
        <Paragraph>
          这个工具可以帮助您诊断网页表单数据无法同步到云端的问题。
          请按照以下步骤进行检查：
        </Paragraph>

        <Alert
          message="使用说明"
          description={
            <div>
              <p>1. 点击"完整诊断"按钮运行所有检查</p>
              <p>2. 查看浏览器控制台获取详细信息</p>
              <p>3. 根据检查结果修复相应问题</p>
              <p>4. 如果所有检查都通过，表单同步功能应该正常工作</p>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Space wrap>
          <Button
            type="primary"
            icon={testing ? <LoadingOutlined /> : <CheckCircleOutlined />}
            onClick={handleRunDiagnostic}
            loading={testing}
            size="large"
          >
            完整诊断
          </Button>
          
          <Button
            icon={testing ? <LoadingOutlined /> : <CheckCircleOutlined />}
            onClick={handleTestAuth}
            loading={testing}
          >
            测试认证
          </Button>
          
          <Button
            icon={testing ? <LoadingOutlined /> : <CheckCircleOutlined />}
            onClick={handleTestConnection}
            loading={testing}
          >
            测试连接
          </Button>
          
          <Button
            icon={testing ? <LoadingOutlined /> : <CheckCircleOutlined />}
            onClick={handleTestRead}
            loading={testing}
          >
            测试读取
          </Button>
          
          <Button
            icon={testing ? <LoadingOutlined /> : <CheckCircleOutlined />}
            onClick={handleTestWrite}
            loading={testing}
          >
            测试写入
          </Button>
        </Space>

        {results && (
          <>
            <Divider />
            <Title level={4}>诊断结果</Title>
            <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
              {renderResult(results.userMode, '用户模式')}
              {renderResult(results.auth, '用户认证')}
              {renderResult(results.connection, '数据库连接')}
              {renderResult(results.readPermission, '读取权限')}
              {renderResult(results.writePermission, '写入权限')}
            </div>
            
            {Object.values(results).every((r: any) => r.success) ? (
              <Alert
                message="🎉 所有检查通过！"
                description="云端同步功能正常，表单数据应该可以正常保存到云端数据库。"
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            ) : (
              <Alert
                message="⚠️ 发现问题"
                description="请根据上述错误信息进行修复，或联系技术支持。"
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}

        <Divider />
        <Title level={4}>常见问题解决方案</Title>
        <div>
          <Paragraph>
            <Text strong>用户未登录：</Text>
            <br />
            请重新登录系统，确保认证状态正常。
          </Paragraph>
          
          <Paragraph>
            <Text strong>数据库连接失败：</Text>
            <br />
            检查网络连接，确保可以访问Supabase服务。
          </Paragraph>
          
          <Paragraph>
            <Text strong>权限不足：</Text>
            <br />
            确保当前用户有读写数据库的权限。
          </Paragraph>
          
          <Paragraph>
            <Text strong>本地模式：</Text>
            <br />
            如果显示为本地模式，数据只会保存在浏览器本地存储中，不会同步到云端。
          </Paragraph>
        </div>
      </Card>
    </div>
  );
};

export default SyncTest;
