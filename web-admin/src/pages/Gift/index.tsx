import React, { useRef, useState, useEffect } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Space, Modal, Form, Input, InputNumber, Upload, message, Table } from 'antd';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import * as XLSX from 'xlsx';

interface GiftItem {
  id: string;
  image: string;
  name: string;
  stock: number;
  points: number;
}

interface GiftExchangeRecord {
  id: string;
  giftId: string;
  volunteerName: string;
  exchangeTime: string;
  quantity: number;
}

const API_GIFTS = '/api/gifts';

const mockData: GiftItem[] = [];

// mock兑换记录数据
const mockExchangeRecords: GiftExchangeRecord[] = [
  { id: '1', giftId: '1001', volunteerName: '张三', exchangeTime: '2024-07-02 10:00', quantity: 1 },
  { id: '2', giftId: '1001', volunteerName: '李四', exchangeTime: '2024-07-02 11:30', quantity: 2 },
  { id: '3', giftId: '1002', volunteerName: '王五', exchangeTime: '2024-07-03 09:20', quantity: 1 },
];

const columns: ProColumns<GiftItem>[] = [
  {
    title: '图片',
    dataIndex: 'image',
    render: (_: React.ReactNode, entity: GiftItem) =>
      entity.image ? (
        <img
          src={entity.image}
          alt="礼品"
          style={{ width: 48, height: 48, objectFit: 'cover' }}
          onError={e => { e.currentTarget.src = require('@/assets/logo.png'); }}
        />
      ) : (
        <img src={require('@/assets/logo.png')} alt="礼品" style={{ width: 48, height: 48, objectFit: 'cover' }} />
      ),
  },
  { title: '名称', dataIndex: 'name' },
  { title: '剩余数量', dataIndex: 'stock' },
  { title: '所需积分', dataIndex: 'points' },
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

let handleEdit: (record: GiftItem) => void;
let handleDelete: (record: GiftItem) => void;

const GiftForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: GiftItem) => void;
  initialValues?: Partial<GiftItem>;
}> = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState(initialValues?.image || '');

  React.useEffect(() => {
    if (visible) {
      form.resetFields();
      setImageUrl(initialValues?.image || '');
      form.setFieldsValue({
        name: initialValues?.name || '',
        stock: initialValues?.stock ?? 0,
        points: initialValues?.points ?? 0,
      });
    }
  }, [visible, initialValues]);

  // 修正 initialValues 传递给表单时图片字段格式
  const mergedInitialValues = initialValues ? { ...initialValues, image: initialValues.image ? [{ url: initialValues.image }] : [] } : {};

  const uploadProps = {
    showUploadList: false,
    beforeUpload: (file: File) => {
      const reader = new FileReader();
      reader.onload = e => {
        setImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      return false;
    },
  };

  return (
    <Modal
      open={visible}
      title={initialValues?.id ? '编辑礼品' : '新增礼品'}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        console.log('GiftForm values:', values);
        if (!imageUrl) {
          message.error('请上传图片');
          return;
        }
        // 合并所有字段，确保不会丢失
        onSubmit({
          ...initialValues,
          ...values,
          image: imageUrl,
        } as GiftItem);
        form.resetFields();
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={mergedInitialValues}>
        <Form.Item label="图片" required>
          <Upload {...uploadProps} accept="image/*">
            {imageUrl ? (
              <img src={imageUrl} alt="礼品" style={{ width: 80, height: 80, objectFit: 'cover' }} />
            ) : (
              <Button icon={<PlusOutlined />}>上传图片</Button>
            )}
          </Upload>
        </Form.Item>
        <Form.Item name="name" label="名称" rules={[{ required: true, message: '请输入名称' }]}> 
          <Input />
        </Form.Item>
        <Form.Item name="stock" label="剩余数量" rules={[{ required: true, type: 'number', min: 0, message: '请输入剩余数量' }]}> 
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="points" label="所需积分" rules={[{ required: true, type: 'number', min: 0, message: '请输入所需积分' }]}> 
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const ExchangeRecordModal: React.FC<{
  visible: boolean;
  onCancel: () => void;
  records: GiftExchangeRecord[];
}> = ({ visible, onCancel, records }) => {
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(records.map(r => ({
      '志愿者姓名': r.volunteerName,
      '兑换时间': r.exchangeTime,
      '兑换数量': r.quantity,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '兑换记录');
    XLSX.writeFile(wb, '兑换记录.xlsx');
  };
  return (
    <Modal open={visible} onCancel={onCancel} footer={null} title="兑换记录" width={600}>
      <Button type="primary" onClick={handleExport} style={{ marginBottom: 16 }}>导出Excel</Button>
      <Table
        dataSource={records}
        rowKey="id"
        columns={[
          { title: '志愿者姓名', dataIndex: 'volunteerName' },
          { title: '兑换时间', dataIndex: 'exchangeTime' },
          { title: '兑换数量', dataIndex: 'quantity' },
        ]}
        pagination={false}
      />
    </Modal>
  );
};

const GiftPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<GiftItem[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<GiftItem | undefined>();
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [currentGiftId, setCurrentGiftId] = useState<string | undefined>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 查询礼品列表
  const fetchGifts = async () => {
    const res = await fetch(API_GIFTS).then(r => r.json());
    setDataSource(res.data || []);
  };
  useEffect(() => { fetchGifts(); }, []);

  handleEdit = (record: GiftItem) => {
    setEditing(record);
    setFormVisible(true);
  };
  handleDelete = (record: GiftItem) => {
    Modal.confirm({
      title: `确认删除礼品「${record.name}」吗？`,
      onOk: async () => {
        await fetch(`${API_GIFTS}/${record.id}`, { method: 'DELETE' });
        message.success('删除成功');
        fetchGifts();
      },
    });
  };
  const handleAdd = () => {
    setEditing(undefined);
    setFormVisible(true);
  };
  const handleSubmit = async (data: GiftItem) => {
    if (data.id) {
      await fetch(`${API_GIFTS}/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      message.success('编辑成功');
    } else {
      await fetch(API_GIFTS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      message.success('新增成功');
    }
    setFormVisible(false);
    fetchGifts();
  };
  const handleShowRecords = (giftId: string) => {
    setCurrentGiftId(giftId);
    setRecordModalVisible(true);
  };

  // 导出功能
  const handleExport = () => {
    const exportData = selectedRowKeys.length > 0
      ? dataSource.filter(item => selectedRowKeys.includes(item.id))
      : dataSource;
    if (exportData.length === 0) {
      message.warning('没有可导出的数据');
      return;
    }
    const ws = XLSX.utils.json_to_sheet(exportData.map(item => ({
      '名称': item.name,
      '剩余数量': item.stock,
      '所需积分': item.points,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '礼品数据');
    XLSX.writeFile(wb, '礼品数据.xlsx');
  };

  const columnsWithRecord: ProColumns<GiftItem>[] = [
    ...columns.slice(0, -1),
    {
      ...columns[columns.length - 1],
      render: (_, record) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => handleDelete(record)}>删除</a>
          <a onClick={() => handleShowRecords(record.id)}>兑换记录</a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '礼品兑换管理' }}>
      <ProTable<GiftItem>
        columns={columnsWithRecord}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dataSource={dataSource}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={handleAdd}>新增礼品</Button>,
          <Button key="export" onClick={handleExport} disabled={dataSource.length === 0}>导出数据{selectedRowKeys.length > 0 ? '（导出所选）' : ''}</Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: <div style={{ textAlign: 'center', color: '#ccc' }}><div style={{ fontSize: 32, marginBottom: 8 }}>• • • •</div>No data</div> }}
      />
      <GiftForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
      />
      <ExchangeRecordModal
        visible={recordModalVisible}
        onCancel={() => setRecordModalVisible(false)}
        records={mockExchangeRecords.filter(r => r.giftId === currentGiftId)}
      />
    </PageContainer>
  );
};

export default GiftPage; 