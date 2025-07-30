import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Space, message, Modal, Form, Input, Select, InputNumber, DatePicker, Table } from 'antd';
import React, { useRef, useState } from 'react';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(weekday);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
const { RangePicker } = DatePicker;

interface SignupItem {
  id: string;
  dayType: string;
  signupStart: string;
  signupEnd: string;
  serviceType: string;
  timeSlot: string;
  requiredCount: number;
  signedCount: number;
  status: string;
}

const timeSlotOptions = [
  { label: '9:30-12:30', value: '9:30-12:30' },
  { label: '13:30-16:30', value: '13:30-16:30' },
  { label: '全天', value: '全天' },
];

// 带日期的选项，用于显示
const timeSlotWithDateOptions = [
  { label: '上午 (9:30-12:30)', value: '上午' },
  { label: '下午 (13:30-16:30)', value: '下午' },
  { label: '全天', value: '全天' },
];
const serviceTypeOptions = [
  { label: '场馆服务', value: '场馆服务' },
  { label: '讲解服务', value: '讲解服务' },
];
const statusOptions = [
  { label: '未开始', value: '未开始' },
  { label: '报名中', value: '报名中' },
  { label: '已截止', value: '已截止' },
];

const dayTypeOptions = [
  { label: '工作日', value: '工作日' },
  { label: '双休日', value: '双休日' },
];

// 自动判断状态
function getSignupStatus(signupStart: string, signupEnd: string) {
  const now = dayjs();
  if (now.isBefore(dayjs(signupStart))) {
    return '未开始';
  }
  if (now.isAfter(dayjs(signupEnd))) {
    return '已截止';
  }
  return '报名中';
}

// 在 columns 之前声明 handleViewSignups
function handleViewSignups(record: SignupItem) {
  // 这里的实现会在组件内被覆盖，这里只做类型兜底，防止未定义报错
}

const columns: ProColumns<SignupItem>[] = [
  { title: '班次类型', dataIndex: 'dayType', width: 100 },
  { title: '报名开始时间', dataIndex: 'signupStart', width: 160 },
  { title: '报名截止时间', dataIndex: 'signupEnd', width: 160 },
  { title: '报名类型', dataIndex: 'serviceType', width: 120 },
  { title: '时间段', dataIndex: 'timeSlot', width: 120 },
  { title: '所需人数', dataIndex: 'requiredCount', width: 100 },
  { title: '已报名人数', dataIndex: 'signedCount', width: 100 },
  {
    title: '状态',
    dataIndex: 'status',
    width: 100,
    render: (_, record) => getSignupStatus(record.signupStart, record.signupEnd),
  },
  {
    title: '操作',
    valueType: 'option',
    width: 180,
    render: (_, record) => (
      <Space>
        <a onClick={() => handleEdit(record)}>编辑</a>
        <a onClick={() => handleViewSignups(record)}>查看报名</a>
      </Space>
    ),
  },
];

// 获取本周最近的周日19:00
function getNextSunday19() {
  const now = dayjs();
  const daysToSunday = (7 - now.day()) % 7;
  let sunday = now.add(daysToSunday, 'day').hour(19).minute(0).second(0).millisecond(0);
  if (now.isAfter(sunday)) {
    sunday = sunday.add(7, 'day');
  }
  return sunday;
}
// 获取本周最近的周三12:00
function getNextWednesday12() {
  const now = dayjs();
  const daysToWednesday = (3 - now.day() + 7) % 7;
  let wednesday = now.add(daysToWednesday, 'day').hour(12).minute(0).second(0).millisecond(0);
  if (now.isAfter(wednesday)) {
    wednesday = wednesday.add(7, 'day');
  }
  return wednesday;
}

const SignupForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: SignupItem) => void;
  initialValues?: Partial<SignupItem>;
}> = ({ visible, onCancel, onSubmit, initialValues }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      if (initialValues && Object.keys(initialValues).length > 0) {
        // 处理时间段的映射，将标准格式转换为显示格式
        let timeSlotValue = initialValues.timeSlot ?? '上午';
        if (initialValues.timeSlot === '9:30-12:30') {
          timeSlotValue = '上午';
        } else if (initialValues.timeSlot === '13:30-16:30') {
          timeSlotValue = '下午';
        } else if (initialValues.timeSlot === '全天') {
          timeSlotValue = '全天';
        }
        
        form.setFieldsValue({
          dayType: initialValues.dayType ?? '工作日',
          shiftDate: dayjs(),
          signupStart: initialValues.signupStart
            ? (dayjs.isDayjs(initialValues.signupStart) ? initialValues.signupStart : dayjs(initialValues.signupStart))
            : getNextSunday19(),
          signupEnd: initialValues.signupEnd
            ? (dayjs.isDayjs(initialValues.signupEnd) ? initialValues.signupEnd : dayjs(initialValues.signupEnd))
            : getNextWednesday12(),
          serviceType: initialValues.serviceType ?? '场馆服务',
          timeSlot: timeSlotValue,
          requiredCount: Number(initialValues.requiredCount ?? 1),
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues]);

  return (
    <Modal
      open={visible}
      title={initialValues?.id ? '编辑班次' : '新增班次'}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        const signupStart = dayjs.isDayjs(values.signupStart) ? values.signupStart : dayjs(values.signupStart);
        const signupEnd = dayjs.isDayjs(values.signupEnd) ? values.signupEnd : dayjs(values.signupEnd);
        onSubmit({
          ...initialValues,
          ...values,
          requiredCount: Number(values.requiredCount),
          signupStart: signupStart.format('YYYY-MM-DD HH:mm:ss'),
          signupEnd: signupEnd.format('YYYY-MM-DD HH:mm:ss'),
        } as SignupItem);
        form.resetFields();
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" initialValues={{}}>
        <Form.Item name="dayType" label="班次类型" rules={[{ required: true }]}> 
          <Select options={dayTypeOptions} />
        </Form.Item>
        <Form.Item name="shiftDate" label="班次日期" rules={[{ required: true, message: '请选择班次日期' }]}> 
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="signupStart" label="报名开始时间" rules={[{ required: true, message: '请输入报名开始时间' }]}> 
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="signupEnd" label="报名截止时间" rules={[{ required: true, message: '请输入报名截止时间' }]}> 
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="serviceType" label="报名类型" rules={[{ required: true }]}> 
          <Select options={serviceTypeOptions} />
        </Form.Item>
        <Form.Item name="timeSlot" label="时间段" rules={[{ required: true }]}> 
          <Select options={timeSlotOptions} />
        </Form.Item>
        <Form.Item name="requiredCount" label="所需人数" rules={[{ required: true, type: 'number', min: 1 }]}> 
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const BatchSignupForm: React.FC<{
  visible: boolean;
  onCancel: () => void;
  onSubmit: (data: any) => void;
}> = ({ visible, onCancel, onSubmit }) => {
  const [form] = Form.useForm();

  React.useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        dateRange: [dayjs().startOf('week').add(2, 'day'), dayjs().endOf('week')],
        dayTypes: ['工作日', '双休日'],
        serviceTypes: ['讲解服务', '场馆服务'],
        timeSlots: ['9:30-12:30', '13:30-16:30', '全天'],
        signupStart: getNextSunday19(),
        signupEnd: getNextWednesday12(),
      });
    }
  }, [visible]);

  return (
    <Modal
      open={visible}
      title="批量新增班次"
      width={600}
      onCancel={onCancel}
      onOk={async () => {
        const values = await form.validateFields();
        const signupStart = dayjs.isDayjs(values.signupStart) ? values.signupStart : dayjs(values.signupStart);
        const signupEnd = dayjs.isDayjs(values.signupEnd) ? values.signupEnd : dayjs(values.signupEnd);
        onSubmit({
          ...values,
          signupStart,
          signupEnd,
        });
        form.resetFields();
      }}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item name="dateRange" label="日期范围" rules={[{ required: true, message: '请选择日期范围' }]}>
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="dayTypes" label="班次类型" rules={[{ required: true, message: '请选择班次类型' }]}>
          <Select mode="multiple" options={dayTypeOptions} placeholder="请选择班次类型" />
        </Form.Item>
        <Form.Item name="serviceTypes" label="服务类型" rules={[{ required: true, message: '请选择服务类型' }]}>
          <Select mode="multiple" options={serviceTypeOptions} placeholder="请选择服务类型" />
        </Form.Item>
        <Form.Item name="timeSlots" label="时间段" rules={[{ required: true, message: '请选择时间段' }]}>
          <Select mode="multiple" options={[
            { label: '上午 (9:30-12:30)', value: '9:30-12:30' },
            { label: '下午 (13:30-16:30)', value: '13:30-16:30' },
            { label: '全天', value: '全天' },
          ]} placeholder="请选择时间段" />
        </Form.Item>
        <Form.Item name="signupStart" label="报名开始时间" rules={[{ required: true, message: '请输入报名开始时间' }]}>
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="signupEnd" label="报名截止时间" rules={[{ required: true, message: '请输入报名截止时间' }]}>
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>
        <div style={{ background: '#f5f5f5', padding: 12, borderRadius: 6, marginTop: 16 }}>
          <div style={{ color: '#666', fontSize: 12 }}>
            <div>📋 批量新增说明：</div>
            <div>• 工作日：讲解服务上午/下午各2人，全天1人；场馆服务上午/下午各2人</div>
            <div>• 双休日：讲解服务全天共5人；场馆服务上午/下午各5人，全天1人</div>
            <div>• 系统会自动跳过周一（闭馆日）</div>
            <div>• 所有班次将使用相同的报名时间窗口</div>
          </div>
        </div>
      </Form>
    </Modal>
  );
};

let handleEdit: (record: SignupItem) => void;

const generateShifts = (): SignupItem[] => {
  const shifts: SignupItem[] = [];
  const today = dayjs();
  // 本周二~周日
  const weekStart = today.startOf('week').add(2, 'day'); // 周二
  const weekEnd = today.startOf('week').add(7, 'day'); // 下周一
  // 上一周周日19:00
  const startSunday = today.startOf('week').subtract(1, 'week').add(0, 'day').hour(19).minute(0).second(0);
  // 本周周三12:00
  const endWednesday = today.startOf('week').add(3, 'day').hour(12).minute(0).second(0);
  let cur = weekStart;
  while (cur.isBefore(weekEnd)) {
    if (cur.day() === 1) { cur = cur.add(1, 'day'); continue; } // 跳过周一
    const date = cur.format('YYYY-MM-DD');
    const day = cur.day();
    if (day >= 2 && day <= 5) { // 工作日（周二~周五）
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '9:30-12:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-讲解-上午` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '13:30-16:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-讲解-下午` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '全天', requiredCount: 1, signedCount: 0, status: '未开始', id: `${date}-讲解-全天` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '9:30-12:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-场馆-上午` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '13:30-16:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-场馆-下午` });
    } else { // 双休日（周六、周日）
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '全天', requiredCount: 5, signedCount: 0, status: '未开始', id: `${date}-讲解-全天` });
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '9:30-12:30', requiredCount: 5, signedCount: 0, status: '未开始', id: `${date}-场馆-上午` });
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '13:30-16:30', requiredCount: 5, signedCount: 0, status: '未开始', id: `${date}-场馆-下午` });
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '全天', requiredCount: 1, signedCount: 0, status: '未开始', id: `${date}-场馆-全天` });
    }
    cur = cur.add(1, 'day');
  }
  return shifts;
};

const generateShiftsByRange = (range: [dayjs.Dayjs, dayjs.Dayjs]): SignupItem[] => {
  const shifts: SignupItem[] = [];
  if (!range) return shifts;
  // 计算上一周周日19:00
  const startSunday = range[0].startOf('week').subtract(1, 'week').add(0, 'day').hour(19).minute(0).second(0);
  // 计算本周周三12:00
  const endWednesday = range[1].startOf('week').add(3, 'day').hour(12).minute(0).second(0);
  let cur = range[0].startOf('day');
  const end = range[1].endOf('day');
  while (cur.isBefore(end) || cur.isSame(end, 'day')) {
    if (cur.day() === 1) { cur = cur.add(1, 'day'); continue; } // 跳过周一
    const date = cur.format('YYYY-MM-DD');
    const day = cur.day();
    if (day >= 2 && day <= 5) { // 工作日（周二~周五）
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '9:30-12:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-讲解-上午` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '13:30-16:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-讲解-下午` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '全天', requiredCount: 1, signedCount: 0, status: '未开始', id: `${date}-讲解-全天` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '9:30-12:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-场馆-上午` });
      shifts.push({ dayType: '工作日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '13:30-16:30', requiredCount: 2, signedCount: 0, status: '未开始', id: `${date}-场馆-下午` });
    } else if (day === 0 || day === 6) { // 双休日（周六、周日）
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '讲解服务', timeSlot: '全天', requiredCount: 5, signedCount: 0, status: '未开始', id: `${date}-讲解-全天` });
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '9:30-12:30', requiredCount: 5, signedCount: 0, status: '未开始', id: `${date}-场馆-上午` });
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '13:30-16:30', requiredCount: 5, signedCount: 0, status: '未开始', id: `${date}-场馆-下午` });
      shifts.push({ dayType: '双休日', signupStart: startSunday.format('YYYY-MM-DD HH:mm:ss'), signupEnd: endWednesday.format('YYYY-MM-DD HH:mm:ss'), serviceType: '场馆服务', timeSlot: '全天', requiredCount: 1, signedCount: 0, status: '未开始', id: `${date}-场馆-全天` });
    }
    cur = cur.add(1, 'day');
  }
  return shifts;
};

const SignupPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = useState<SignupItem[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [batchFormVisible, setBatchFormVisible] = useState(false);
  const [editing, setEditing] = useState<SignupItem | undefined>();
  const [range, setRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [viewSignupsModal, setViewSignupsModal] = useState(false);
  const [currentSignups, setCurrentSignups] = useState<{name: string, time: string}[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  handleEdit = (record: SignupItem) => {
    setEditing(record);
    setFormVisible(true);
  };
  const handleAdd = () => {
    setEditing(undefined);
    setFormVisible(true);
  };
  const handleBatchAdd = () => {
    setBatchFormVisible(true);
  };
  const handleSubmit = (data: any) => {
    if (data.id) {
      setDataSource((prev) => prev.map((item) => (item.id === data.id ? { ...data } : item)));
      message.success('编辑成功');
    } else {
      // 拼接日期和时间段
      const dateDisplay = dayjs(data.shiftDate).format('MM-DD');
      const timeSlotDisplay = `${dateDisplay} ${data.timeSlot}`;
      setDataSource((prev) => [
        ...prev,
        {
          ...data,
          timeSlot: timeSlotDisplay,
          id: (Math.random() * 100000).toFixed(0),
          signedCount: 0,
          status: getSignupStatus(data.signupStart, data.signupEnd),
        },
      ]);
      message.success('新增成功');
    }
    setFormVisible(false);
  };

  const handleBatchSubmit = (data: any) => {
    const { dateRange, dayTypes, serviceTypes, timeSlots, signupStart, signupEnd } = data;
    const shifts: SignupItem[] = [];
    
    let cur = dateRange[0].startOf('day');
    const end = dateRange[1].endOf('day');
    
    while (cur.isBefore(end) || cur.isSame(end, 'day')) {
      if (cur.day() === 1) { cur = cur.add(1, 'day'); continue; } // 跳过周一
      
      const date = cur.format('YYYY-MM-DD');
      const day = cur.day();
      const isWeekday = day >= 2 && day <= 5;
      const isWeekend = day === 0 || day === 6;
      
      // 检查是否包含当前日期类型
      const shouldInclude = (isWeekday && dayTypes.includes('工作日')) || 
                           (isWeekend && dayTypes.includes('双休日'));
      
      if (shouldInclude) {
        serviceTypes.forEach((serviceType: string) => {
          timeSlots.forEach((timeSlot: string) => {
            // 根据日期类型和时间段确定人数
            let requiredCount = 1;
            if (isWeekday) {
              if (timeSlot === '全天') {
                requiredCount = serviceType === '讲解服务' ? 1 : 0; // 工作日场馆服务没有全天
              } else {
                requiredCount = 2;
              }
            } else { // 双休日
              if (timeSlot === '全天') {
                requiredCount = serviceType === '场馆服务' ? 1 : 0; // 双休日讲解服务没有全天
              } else {
                requiredCount = 5;
              }
            }
            
            if (requiredCount > 0) {
              // 格式化日期显示，如 "12-25 上午"
              const dateDisplay = cur.format('MM-DD');
              const timeSlotDisplay = `${dateDisplay} ${timeSlot}`;
              
              shifts.push({
                dayType: isWeekday ? '工作日' : '双休日',
                signupStart: signupStart.format('YYYY-MM-DD HH:mm:ss'),
                signupEnd: signupEnd.format('YYYY-MM-DD HH:mm:ss'),
                serviceType,
                timeSlot: timeSlotDisplay,
                requiredCount,
                signedCount: 0,
                status: '未开始',
                id: `${date}-${serviceType}-${timeSlot}`,
              });
            }
          });
        });
      }
      cur = cur.add(1, 'day');
    }
    
    setDataSource((prev) => [...prev, ...shifts]);
    message.success(`批量新增成功，共创建 ${shifts.length} 个班次`);
    setBatchFormVisible(false);
  };

  const handleViewSignups = (record: SignupItem) => {
    setCurrentSignups((record as any).signups || []);
    setViewSignupsModal(true);
  };

  // 批量删除逻辑
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择要删除的班次');
      return;
    }
    Modal.confirm({
      title: `确认删除选中的 ${selectedRowKeys.length} 个班次吗？`,
      onOk: () => {
        setDataSource(prev => prev.filter(item => !selectedRowKeys.includes(item.id)));
        setSelectedRowKeys([]);
        message.success('批量删除成功');
      },
    });
  };

  // 自动控制报名入口状态（每周日19:00开启，每周三关闭）
  React.useEffect(() => {
    const timer = setInterval(() => {
      setDataSource((prev) => prev.map((item) => {
        const now = dayjs();
        const itemDate = dayjs(item.signupStart);
        // 只处理本周的班次
        if (itemDate.isSame(now, 'week')) {
          // 周日19:00后到周三前，报名中
          if (
            (now.day() === 0 && now.hour() >= 19) ||
            (now.day() > 0 && now.day() < 3)
          ) {
            return { ...item, status: '报名中' };
          }
          // 周三及以后，已截止
          if (now.day() >= 3) {
            return { ...item, status: '已截止' };
          }
          // 其他时间，未开始
          return { ...item, status: '未开始' };
        }
        return item;
      }));
    }, 60000); // 每分钟刷新一次
    return () => clearInterval(timer);
  }, []);

  // 下载导入模板
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['班次类型', '报名开始时间', '报名截止时间', '报名类型', '时间段', '所需人数'],
      ['', '', '', '', '', ''],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '班次导入模板');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '班次导入模板.xlsx');
  };

  // 导出当前表格数据
  const exportExcel = (data: SignupItem[]) => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      班次类型: item.dayType,
      报名开始时间: item.signupStart,
      报名截止时间: item.signupEnd,
      报名类型: item.serviceType,
      时间段: item.timeSlot,
      所需人数: item.requiredCount,
      已报名人数: item.signedCount,
      状态: item.status,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '班次数据');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([wbout], { type: 'application/octet-stream' }), '班次数据.xlsx');
  };

  return (
    <PageContainer header={{ title: '报名管理' }}>
      <ProTable<SignupItem>
        columns={columns}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        dataSource={dataSource}
        toolBarRender={() => [
          <Button key="add" type="primary" onClick={handleAdd}>新增班次</Button>,
          <Button key="batchAdd" type="primary" onClick={handleBatchAdd}>批量新增班次</Button>,
          <Button key="batchDelete" danger disabled={selectedRowKeys.length === 0} onClick={handleBatchDelete}>批量删除</Button>,
          <Button key="template" onClick={downloadTemplate}>下载模板</Button>,
          <Button key="export" onClick={() => exportExcel(dataSource)}>导出数据</Button>,
        ]}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        pagination={{ pageSize: 10 }}
      />
      <div style={{ marginBottom: 16 }}>
        {/* <RangePicker value={range} onChange={v => setRange(v as [dayjs.Dayjs, dayjs.Dayjs] | null)} /> */}
        {/* <Button type="primary" style={{ marginLeft: 8 }} disabled={!range} onClick={() => setDataSource(generateShiftsByRange(range!))}>生成所选日期范围班次</Button> */}
      </div>
      <SignupForm
        visible={formVisible}
        onCancel={() => setFormVisible(false)}
        onSubmit={handleSubmit}
        initialValues={editing}
      />
      <BatchSignupForm
        visible={batchFormVisible}
        onCancel={() => setBatchFormVisible(false)}
        onSubmit={handleBatchSubmit}
      />
      <Modal
        open={viewSignupsModal}
        onCancel={() => setViewSignupsModal(false)}
        footer={null}
        title="报名志愿者名单"
        width={400}
      >
        <Table
          dataSource={currentSignups}
          rowKey={(row) => row.name + row.time}
          columns={[
            { title: '姓名', dataIndex: 'name', key: 'name' },
            { title: '报名时间', dataIndex: 'time', key: 'time' },
          ]}
          pagination={false}
          size="small"
        />
      </Modal>
    </PageContainer>
  );
};

export default SignupPage; 