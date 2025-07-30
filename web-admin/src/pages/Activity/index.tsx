import React, { useRef, useEffect } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Modal, Form, Input, Upload, message, Space } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { useState } from 'react';

interface ActivityItem {
  id: string;
  title: string;
  image: string;
  content: string;
  createdAt: string;
  status: string;
}

const ActivityForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: Partial<ActivityItem>) => void;
  initialValues?: Partial<ActivityItem>;
}> = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = React.useState(initialValues?.image || '');
  const [uploading, setUploading] = useState(false);

  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      setImageUrl(initialValues?.image || '');
      form.setFieldsValue(initialValues || {});
    }
  }, [visible, initialValues]);

  const uploadProps = {
    showUploadList: false,
    beforeUpload: async (file: File) => {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await resp.json();
        if (data && data.url) {
          setImageUrl(data.url);
          message.success('图片上传成功');
        } else {
          // 降级：用本地预览
          const localUrl = URL.createObjectURL(file);
          setImageUrl(localUrl);
          message.warning('后端未返回图片地址，已用本地预览');
        }
      } catch (e) {
        message.error('图片上传失败，请检查网络或接口');
      } finally {
        setUploading(false);
      }
      return false;
    },
  };

  return (
    <Modal
      open={visible}
      title={initialValues?.id ? '编辑活动' : '新增活动'}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        if (!imageUrl) {
          message.error('请上传活动图片');
          return;
        }
        onSubmit({ ...initialValues, ...values, image: imageUrl });
        form.resetFields();
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item label="活动图片" required>
          <Upload {...uploadProps} accept="image/*">
            {imageUrl ? (
              <img src={imageUrl} alt="活动图片" style={{ width: 120, height: 80, objectFit: 'cover' }} />
            ) : (
              <Button icon={<UploadOutlined />} loading={uploading}>上传图片</Button>
            )}
          </Upload>
        </Form.Item>
        <Form.Item name="title" label="活动标题" rules={[{ required: true, message: '请输入活动标题' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="content" label="活动内容" rules={[{ required: true, message: '请输入活动内容' }]}> 
          <Input.TextArea rows={4} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ActivityPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [formVisible, setFormVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<Partial<ActivityItem> | undefined>();
  const [dataSource, setDataSource] = React.useState<ActivityItem[]>([]);

  // 自动化接口对接
  useEffect(() => {
    fetch('/api/activities')
      .then(res => res.json())
      .then(data => setDataSource(data || []));
  }, []);

  const handleAdd = () => {
    setEditing(undefined);
    setFormVisible(true);
  };

  const handleEdit = (record: ActivityItem) => {
    setEditing(record);
    setFormVisible(true);
  };

  const handleDelete = async (record: ActivityItem) => {
    Modal.confirm({
      title: `确认删除活动「${record.title}」吗？`,
      onOk: async () => {
        await fetch(`/api/activities/${record.id}`, { method: 'DELETE' });
        setDataSource((prev) => prev.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = async (data: Partial<ActivityItem>) => {
    if (data.id) {
      await fetch(`/api/activities/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      setDataSource((prev) => prev.map((item) => (item.id === data.id ? { ...item, ...data } as ActivityItem : item)));
      message.success('编辑成功');
    } else {
      const resp = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const newItem = await resp.json();
      setDataSource((prev) => [
        ...prev,
        newItem,
      ]);
      message.success('新增成功');
    }
    setFormVisible(false);
  };

  const columns: ProColumns<ActivityItem>[] = [
    {
      title: '图片',
      dataIndex: 'image',
      render: (_, record) => <img src={record.image} alt="活动" style={{ width: 80, height: 50, objectFit: 'cover' }} />, 
    },
    { title: '标题', dataIndex: 'title' },
    { title: '内容', dataIndex: 'content', ellipsis: true },
    { title: '创建时间', dataIndex: 'createdAt' },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<ActivityItem>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        dataSource={dataSource}
        search={false}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增活动
          </Button>,
        ]}
        pagination={{ pageSize: 10 }}
      />
      <ActivityForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
      />
    </PageContainer>
  );
};

export default ActivityPage; 