import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Space, message, Modal, Form, Input, Select, InputNumber, Upload } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { UploadOutlined } from '@ant-design/icons';
// @ts-ignore
import * as XLSX from 'xlsx';
// @ts-ignore
import { saveAs } from 'file-saver';

interface VolunteerItem {
  id: string;
  name: string;
  phone: string;
  volunteerType: string;
  serviceHours: number;
  servicePoints: number;
  lecturePoints: number;
  totalPoints: number;
  registerTime: string;
  lastServiceTime: string;
  registerTimeEditable?: boolean;
  lastServiceTimeEditable?: boolean;
}

const volunteerTypeOptions = [
  { label: '优秀志愿讲解员', value: '优秀志愿讲解员' },
  { label: '志愿讲解员', value: '志愿讲解员' },
  { label: '志愿场馆服务', value: '志愿场馆服务' },
];

const VolunteerForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: VolunteerItem) => void;
  initialValues?: Partial<VolunteerItem>;
  calcServicePoints: (hours: number) => number;
}> = ({ visible, onCancel, onSubmit, initialValues, calcServicePoints }) => {
  const [form] = Form.useForm();
  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues);
    }
  }, [visible, initialValues, form]);

  // 判断是否可编辑
  const registerTimeEditable = initialValues?.registerTimeEditable !== false;
  const lastServiceTimeEditable = initialValues?.lastServiceTimeEditable !== false;

  return (
    <Modal
      open={visible}
      title={initialValues?.id ? '编辑志愿者' : '新建志愿者'}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        const serviceHours = Number(values.serviceHours);
        const lecturePoints = Number(values.lecturePoints);
        const servicePoints = calcServicePoints(serviceHours);
        const totalPoints = servicePoints + lecturePoints;
        onSubmit({
          ...initialValues,
          ...values,
          serviceHours,
          lecturePoints,
          servicePoints,
          totalPoints,
          registerTime: values.registerTime,
          lastServiceTime: values.lastServiceTime,
        } as VolunteerItem);
        form.resetFields();
      }}
      destroyOnHidden
    >
      <Form
        form={form}
        initialValues={{
          volunteerType: '志愿讲解员',
          lecturePoints: 0,
          serviceHours: 4,
          ...initialValues,
        }}
        layout="vertical"
      >
        <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="volunteerType" label="志愿者类别" rules={[{ required: true }]}> 
          <Select options={volunteerTypeOptions} />
        </Form.Item>
        <Form.Item name="serviceHours" label="服务时长（小时）" rules={[{ required: true, type: 'number', min: 0 }]}> 
          <InputNumber min={0} step={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="lecturePoints" label="讲解积分" rules={[{ required: true, type: 'number', min: 0 }]}> 
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="registerTime" label="注册时间" rules={[{ required: true, message: '请选择注册时间' }]}> 
          {registerTimeEditable ? <Input type="datetime-local" /> : <Input value={initialValues?.registerTime} readOnly />} 
        </Form.Item>
        <Form.Item name="lastServiceTime" label="最近一次服务" rules={[{ required: true, message: '请选择最近一次服务时间' }]}> 
          {lastServiceTimeEditable ? <Input type="datetime-local" /> : <Input value={initialValues?.lastServiceTime} readOnly />} 
        </Form.Item>
      </Form>
    </Modal>
  );
};

const VolunteerPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<VolunteerItem[]>([{
    id: '1',
    name: '张三',
    phone: '13800000000',
    volunteerType: '优秀志愿讲解员',
    serviceHours: 8,
    servicePoints: 2,
    lecturePoints: 2,
    totalPoints: 4,
    registerTime: '2024-06-01T10:00',
    lastServiceTime: '2024-06-10T09:30',
    registerTimeEditable: true,
    lastServiceTimeEditable: true,
  }, {
    id: '2',
    name: '李四',
    phone: '13900000001',
    volunteerType: '志愿讲解员',
    serviceHours: 4,
    servicePoints: 1,
    lecturePoints: 1,
    totalPoints: 2,
    registerTime: '2024-06-02T11:00',
    lastServiceTime: '2024-06-11T13:30',
    registerTimeEditable: true,
    lastServiceTimeEditable: true,
  }]);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<VolunteerItem | undefined>();
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<VolunteerItem | undefined>();
  const [adjustValue, setAdjustValue] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // 积分计算：4小时1分
  const calcServicePoints = (hours: number) => Math.floor(hours / 4);
  const calcPoints = (serviceHours: number, lecturePoints: number) => calcServicePoints(serviceHours) + (lecturePoints || 0);

  const handleEdit = (record: VolunteerItem) => {
    setEditing(record);
    setFormVisible(true);
  };
  const handleDelete = (record: VolunteerItem) => {
    Modal.confirm({
      title: `确认删除志愿者「${record.name}」吗？`,
      onOk: () => {
        setDataSource((prev) => prev.filter((item) => item.id !== record.id));
        message.success('删除成功');
      },
    });
  };
  const openAdjustModal = (record: VolunteerItem) => {
    setAdjustTarget(record);
    setAdjustValue(0);
    setAdjustReason('');
    setAdjustModalVisible(true);
  };
  const handleAdd = () => {
    setEditing(undefined);
    setFormVisible(true);
  };
  const handleSubmit = (data: VolunteerItem) => {
    // 判断是否修改了注册时间/最近一次服务时间
    let registerTimeEditable = editing?.registerTimeEditable !== false;
    let lastServiceTimeEditable = editing?.lastServiceTimeEditable !== false;
    if (editing) {
      if (registerTimeEditable && data.registerTime !== editing.registerTime) {
        registerTimeEditable = false;
      }
      if (lastServiceTimeEditable && data.lastServiceTime !== editing.lastServiceTime) {
        lastServiceTimeEditable = false;
      }
    }
    const updated = {
      ...data,
      registerTimeEditable,
      lastServiceTimeEditable,
    };
    if (data.id) {
      setDataSource((prev) => prev.map((item) => (item.id === data.id ? updated : item)));
      message.success('编辑成功');
    } else {
      setDataSource((prev) => [
        ...prev,
        { ...updated, id: (Math.random() * 100000).toFixed(0) },
      ]);
      message.success('新增成功');
    }
    setFormVisible(false);
  };
  const handleAdjustOk = () => {
    if (!adjustTarget) return;
    if (adjustValue === 0) {
      message.warning('请输入调整积分');
      return;
    }
    setDataSource((prev) => prev.map((item) =>
      item.id === adjustTarget.id
        ? { ...item, totalPoints: item.totalPoints + adjustValue }
        : item
    ));
    setAdjustModalVisible(false);
    message.success('积分调整成功');
  };

  // 批量导入功能
  const handleImport = (file: any) => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      // 假设表头与 VolunteerItem 字段一致
      const imported = (jsonData as any[]).map((row, idx) => {
        const serviceHours = Number(row['服务时长（小时）'] || 0);
        const lecturePoints = Number(row['讲解积分'] || 0);
        const servicePoints = calcServicePoints(serviceHours);
        const totalPoints = servicePoints + lecturePoints;
        // 调试输出
        console.log('导入:', { serviceHours, lecturePoints, servicePoints, totalPoints });
        return {
          id: (Math.random() * 100000 + idx).toFixed(0),
          name: row['姓名'] || '',
          phone: row['手机号'] || '',
          volunteerType: row['志愿者类别'] || '',
          serviceHours,
          lecturePoints,
          servicePoints,
          totalPoints,
          registerTime: row['注册时间'] || new Date().toISOString().slice(0, 19).replace('T', ' '),
          lastServiceTime: row['最近一次服务'] || new Date().toISOString().slice(0, 19).replace('T', ' '),
        };
      });
      setDataSource((prev) => [...prev, ...imported]);
      message.success('批量导入成功');
    };
    reader.readAsArrayBuffer(file);
    return false; // 阻止 antd 自动上传
  };

  const exportExcel = (data: VolunteerItem[]) => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      姓名: item.name,
      手机号: item.phone,
      志愿者类别: item.volunteerType,
      服务时长: item.serviceHours,
      服务积分: item.servicePoints,
      讲解积分: item.lecturePoints,
      总积分: item.totalPoints,
      注册时间: item.registerTime,
      最近一次服务: item.lastServiceTime,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '志愿者数据');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '志愿者数据.xlsx');
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['姓名', '手机号', '志愿者类别', '服务时长（小时）', '服务积分', '讲解积分', '总积分', '注册时间', '最近一次服务'],
      ['', '', '', '', '', '', '', '', ''],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '导入模板');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '志愿者导入模板.xlsx');
  };

  const columns: ProColumns<VolunteerItem>[] = [
    { title: '姓名', dataIndex: 'name', width: 100 },
    { title: '手机号', dataIndex: 'phone', width: 120 },
    { title: '志愿者类别', dataIndex: 'volunteerType', width: 120 },
    { title: '服务时长（小时）', dataIndex: 'serviceHours', width: 120 },
    { title: '服务积分', dataIndex: 'servicePoints', width: 100 },
    { title: '讲解积分', dataIndex: 'lecturePoints', width: 100 },
    { title: '总积分', dataIndex: 'totalPoints', width: 100 },
    { title: '注册时间', dataIndex: 'registerTime', width: 160 },
    { title: '最近一次服务', dataIndex: 'lastServiceTime', width: 160 },
    {
      title: '操作',
      valueType: 'option',
      width: 180,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleEdit(record)}>编辑</a>
          <a onClick={() => openAdjustModal(record)}>积分调整</a>
          <a onClick={() => handleDelete(record)}>删除</a>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer header={{ title: '志愿者管理' }}>
      <ProTable<VolunteerItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dataSource={dataSource}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={handleAdd}>新建志愿者</Button>,
          <Upload
            key="import"
            showUploadList={false}
            beforeUpload={handleImport}
            accept=".xlsx,.xls,.csv"
          >
            <Button icon={<UploadOutlined />}>导入数据</Button>
          </Upload>,
          <Button key="export" onClick={() => exportExcel(dataSource)}>导出Excel</Button>,
          <Button key="template" onClick={downloadTemplate}>下载导入模板</Button>,
        ]}
        pagination={{ pageSize: 10 }}
      />
      <VolunteerForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
        calcServicePoints={calcServicePoints}
      />
      <Modal
        open={adjustModalVisible}
        title={`积分调整 - ${adjustTarget?.name || ''}`}
        onCancel={() => setAdjustModalVisible(false)}
        onOk={handleAdjustOk}
        destroyOnHidden
      >
        <Form layout="vertical">
          <Form.Item label="当前积分">
            <Input value={adjustTarget?.totalPoints ?? 0} readOnly />
          </Form.Item>
          <Form.Item label="调整积分" required>
            <InputNumber
              value={adjustValue}
              onChange={v => setAdjustValue(Number(v))}
              style={{ width: '100%' }}
              min={-1000}
              max={1000}
              step={1}
              placeholder="输入正数为加分，负数为扣分"
            />
          </Form.Item>
          <Form.Item label="调整原因">
            <Input.TextArea
              value={adjustReason}
              onChange={e => setAdjustReason(e.target.value)}
              placeholder="可填写本次调整的原因"
              rows={2}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default VolunteerPage; 