import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Switch,
  TimePicker,
  message,
  Alert,
  Descriptions,
  Badge,
  Tooltip,
  Popconfirm,
  Typography,
  Divider
} from 'antd';
import {
  UserAddOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SettingOutlined,
  BellOutlined,
  CalendarOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  ExportOutlined,
  DownloadOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/zh-cn';
import isoWeek from 'dayjs/plugin/isoWeek';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  fetchSignupRecords,
  addSignupRecord,
  updateSignupRecord,
  deleteSignupRecord,
  batchDeleteSignupRecords,
  fetchSignupSettings,
  saveSignupSettings,
  fetchServiceSlots,
  saveServiceSlots
} from '../../utils/supabaseSignup';

// 配置 dayjs
dayjs.extend(isoWeek);
dayjs.extend(dayOfYear);
dayjs.locale('zh-cn');
import type { ColumnsType } from 'antd/es/table';

const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface SignupSettings {
  id: string;
  autoOpen: boolean;
  openTime: string; // 格式: "19:00"
  openDate: string; // 格式: "YYYY-MM-DD"
  closeTime: string; // 格式: "12:00"
  closeDate: string; // 格式: "YYYY-MM-DD"
  currentWeek: string; // 当前开放报名的周次
  status: 'open' | 'closed' | 'pending';
  lastOpenTime: string;
  nextOpenTime: string;
  // 新增：可报名时间段设置
  signupPeriodDays: number; // 提前多少天开放报名，默认7天
  serviceStartDay: number; // 服务开始日期（0-6，0是周日），默认6（周六）
  serviceEndDay: number; // 服务结束日期（0-6，0是周日），默认5（周五）
}

interface ServiceSlot {
  id: string;
  date: string;
  dayOfWeek: number;
  serviceType: '场馆服务' | '讲解服务';
  timeSlot: '上午' | '下午' | '全天';
  maxCapacity: number;
  currentSignups: number;
  waitlist: number;
  status: 'open' | 'full' | 'closed';
  isWeekend: boolean;
}

interface SignupRecord {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  volunteerType: '学生志愿者' | '社会志愿者'; // 新增：志愿者类型
  serviceSlotId: string;
  date: string;
  serviceType: '场馆服务' | '讲解服务';
  timeSlot: '上午' | '下午' | '全天';
  signupTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'waitlist';
  points: number;
  notes?: string;
}

interface LeaveNotification {
  id: string;
  volunteerId: string;
  volunteerName: string;
  volunteerPhone: string;
  serviceSlotId: string;
  date: string;
  serviceType: '场馆服务' | '讲解服务';
  timeSlot: '上午' | '下午' | '全天';
  leaveTime: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

const SignupPage: React.FC = () => {
  // 计算本周日和本周三的日期
  const now = dayjs();
  const thisSunday = now.day(0); // 本周日
  const thisWednesday = now.day(3); // 本周三

  const [signupSettings, setSignupSettings] = useState<SignupSettings>({
    id: '1',
    autoOpen: true,
    openTime: '19:00',
    openDate: thisSunday.format('YYYY-MM-DD'), // 本周日
    closeTime: '12:00',
    closeDate: thisWednesday.format('YYYY-MM-DD'), // 本周三
    currentWeek: '',
    status: 'closed',
    lastOpenTime: '',
    nextOpenTime: '',
    signupPeriodDays: 7, // 提前7天开放报名
    serviceStartDay: 6, // 周六开始服务
    serviceEndDay: 5 // 周五结束服务
  });

  // 筛选状态
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterServiceType, setFilterServiceType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [searchText, setSearchText] = useState<string>('');

  const [serviceSlots, setServiceSlots] = useState<ServiceSlot[]>([]);
  const [signupRecords, setSignupRecords] = useState<SignupRecord[]>([]);
  const [leaveNotifications, setLeaveNotifications] = useState<LeaveNotification[]>([]);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState<Dayjs>(dayjs());
  const [form] = Form.useForm();
  const [signupForm] = Form.useForm();
  const [signupModalVisible, setSignupModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SignupRecord | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');

  // 判断是否为本地管理员账号
  const isLocalAdmin = () => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) return false;
    try {
      const user = JSON.parse(currentUser);
      return user.phone === 'test';
    } catch {
      return false;
    }
  };

  // 加载数据（云端或本地）
  useEffect(() => {
    const loadData = async () => {
      try {
        if (isLocalAdmin()) {
          // 本地管理员，使用localStorage
          const savedSignupRecords = localStorage.getItem('signupRecords');
          const savedSignupSettings = localStorage.getItem('signupSettings');

          if (savedSignupRecords) {
            setSignupRecords(JSON.parse(savedSignupRecords));
          }

          if (savedSignupSettings) {
            setSignupSettings(JSON.parse(savedSignupSettings));
          }

          // 生成本周的服务时段
          await generateServiceSlots();
        } else {
          // 普通用户，从Supabase加载数据
          try {
            const [records, settings, slots] = await Promise.all([
              fetchSignupRecords(),
              fetchSignupSettings(),
              fetchServiceSlots()
            ]);

            if (records) {
              setSignupRecords(records);
            }

            if (settings) {
              setSignupSettings(settings);
            }

            if (slots && slots.length > 0) {
              setServiceSlots(slots);
            } else {
                          // 如果没有服务时段数据，生成本周的
            await generateServiceSlots();
            }
          } catch (error) {
            console.error('加载云端数据失败:', error);
            message.error('加载云端数据失败，使用本地数据');

            // 生成本周的服务时段
            await generateServiceSlots();
          }
        }
      } catch (error) {
        console.error('数据加载失败:', error);
      }
    };

    loadData();
  }, []);

  // 时间检测定时器
  useEffect(() => {
    // 页面加载时立即检查一次
    const now = dayjs();
    setCurrentTime(now);
    console.log('页面加载，立即检查时间');
    checkAutoOpenTime(now);

    const timer = setInterval(() => {
      const now = dayjs();
      setCurrentTime(now);

      // 调试信息
      console.log('时间检查:', {
        currentDate: now.format('YYYY-MM-DD'),
        currentTime: now.format('HH:mm'),
        openDate: signupSettings.openDate,
        openTime: signupSettings.openTime,
        closeDate: signupSettings.closeDate,
        closeTime: signupSettings.closeTime,
        status: signupSettings.status
      });

      checkAutoOpenTime(now);
    }, 60000); // 每分钟检查一次

    return () => clearInterval(timer);
  }, [signupSettings]);

  // 监听系统状态变化，同步更新服务时段状态
  useEffect(() => {
    if (serviceSlots.length > 0) {
      // 将pending状态映射为closed
      const slotStatus = signupSettings.status === 'pending' ? 'closed' : signupSettings.status;
      updateServiceSlotsStatus(slotStatus as 'open' | 'closed');
    }
  }, [signupSettings.status]);

  // 生成服务时段
  const generateServiceSlots = async () => {
    const slots: ServiceSlot[] = [];
    const now = dayjs();

    // 计算本周的周日
    const thisSunday = now.day(0); // 本周日

    // 计算服务开始和结束日期（从本周六到下周五）
    const serviceStartDate = thisSunday.add(6, 'day'); // 本周六
    const serviceEndDate = thisSunday.add(12, 'day'); // 下周五

    // 生成从服务开始到结束日期的所有时段
    let currentDate = serviceStartDate;
    while (currentDate.isSame(serviceEndDate) || currentDate.isBefore(serviceEndDate)) {
      const dayOfWeek = currentDate.day();
      const dateStr = currentDate.format('YYYY-MM-DD');
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 周日或周六

      // 跳过周一（闭馆日）
      if (dayOfWeek === 1) {
        currentDate = currentDate.add(1, 'day');
        continue;
      }

      // 上午时段
      slots.push({
        id: `slot_${dateStr}_am_venue`,
        date: dateStr,
        dayOfWeek,
        serviceType: '场馆服务',
        timeSlot: '上午',
        maxCapacity: isWeekend ? 3 : 3, // 周末和工作日都是3人（只针对社会志愿者）
        currentSignups: 0,
        waitlist: 0,
        status: signupSettings.status === 'open' ? 'open' : 'closed',
        isWeekend
      });

      slots.push({
        id: `slot_${dateStr}_am_explain`,
        date: dateStr,
        dayOfWeek,
        serviceType: '讲解服务',
        timeSlot: '上午',
        maxCapacity: isWeekend ? 5 : 2, // 周末5人，工作日2人（只针对社会志愿者）
        currentSignups: 0,
        waitlist: 0,
        status: signupSettings.status === 'open' ? 'open' : 'closed',
        isWeekend
      });

      // 下午时段
      slots.push({
        id: `slot_${dateStr}_pm_venue`,
        date: dateStr,
        dayOfWeek,
        serviceType: '场馆服务',
        timeSlot: '下午',
        maxCapacity: isWeekend ? 3 : 3,
        currentSignups: 0,
        waitlist: 0,
        status: signupSettings.status === 'open' ? 'open' : 'closed',
        isWeekend
      });

      slots.push({
        id: `slot_${dateStr}_pm_explain`,
        date: dateStr,
        dayOfWeek,
        serviceType: '讲解服务',
        timeSlot: '下午',
        maxCapacity: isWeekend ? 5 : 2,
        currentSignups: 0,
        waitlist: 0,
        status: signupSettings.status === 'open' ? 'open' : 'closed',
        isWeekend
      });

      // 全天时段（只在周末提供）
      if (isWeekend) {
        slots.push({
          id: `slot_${dateStr}_full_venue`,
          date: dateStr,
          dayOfWeek,
          serviceType: '场馆服务',
          timeSlot: '全天',
          maxCapacity: 3, // 全天场馆服务3人（只针对社会志愿者）
          currentSignups: 0,
          waitlist: 0,
          status: signupSettings.status === 'open' ? 'open' : 'closed',
          isWeekend
        });

        slots.push({
          id: `slot_${dateStr}_full_explain`,
          date: dateStr,
          dayOfWeek,
          serviceType: '讲解服务',
          timeSlot: '全天',
          maxCapacity: 5, // 全天讲解服务5人（只针对社会志愿者）
          currentSignups: 0,
          waitlist: 0,
          status: signupSettings.status === 'open' ? 'open' : 'closed',
          isWeekend
        });
      }

      currentDate = currentDate.add(1, 'day');
    }

    console.log('生成服务时段:', slots.length, '个时段');
    setServiceSlots(slots);

    // 如果不是本地管理员，保存到云端
    if (!isLocalAdmin()) {
      try {
        await saveServiceSlots(slots);
      } catch (error) {
        console.error('保存服务时段到云端失败:', error);
      }
    }
  };

  // 更新服务时段状态
  const updateServiceSlotsStatus = (newStatus: 'open' | 'closed') => {
    setServiceSlots(prev => prev.map(slot => ({
      ...slot,
      status: newStatus
    })));
  };

  // 检查自动开启时间
  const checkAutoOpenTime = (now: Dayjs) => {
    if (!signupSettings.autoOpen) {
      console.log('自动开启已禁用');
      return;
    }

    const currentDate = now.format('YYYY-MM-DD');
    const currentTimeStr = now.format('HH:mm');

    console.log('检查自动开启时间:', {
      currentDate,
      currentTimeStr,
      openDate: signupSettings.openDate,
      openTime: signupSettings.openTime,
      closeDate: signupSettings.closeDate,
      closeTime: signupSettings.closeTime,
      status: signupSettings.status
    });

    // 检查是否到了开启时间
    if (currentDate === signupSettings.openDate && currentTimeStr === signupSettings.openTime) {
      console.log('触发自动开启报名');
      openSignup();
    }

    // 检查是否到了关闭时间
    if (currentDate === signupSettings.closeDate && currentTimeStr === signupSettings.closeTime) {
      console.log('触发自动关闭报名');
      closeSignup();
    }

    // 额外检查：如果当前时间已经过了开启时间但状态还是closed，则自动开启
    if (signupSettings.status === 'closed' &&
        currentDate === signupSettings.openDate &&
        currentTimeStr >= signupSettings.openTime) {
      console.log('检测到应该开启但未开启，自动开启报名');
      openSignup();
    }
  };

  // 开启报名
  const openSignup = () => {
    setSignupSettings(prev => ({
      ...prev,
      status: 'open',
      lastOpenTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      currentWeek: `第${Math.ceil(dayjs().dayOfYear() / 7)}周`
    }));

    // 推送通知到APP
    pushNotificationToApp('报名开启', '新一轮志愿服务报名已开启，请及时报名！');

    message.success('报名系统已自动开启！');

    // 更新服务时段状态
    setTimeout(() => updateServiceSlotsStatus('open'), 100);
  };

  // 关闭报名
  const closeSignup = () => {
    setSignupSettings(prev => ({
      ...prev,
      status: 'closed'
    }));

    // 推送通知到APP
    pushNotificationToApp('报名截止', '本周报名已截止，请关注下周报名时间！');

    message.warning('报名系统已自动关闭！');

    // 更新服务时段状态
    setTimeout(() => updateServiceSlotsStatus('closed'), 100);
  };

  // 推送到APP（模拟）
  const pushNotificationToApp = (title: string, content: string) => {
    console.log('推送到APP:', { title, content, time: dayjs().format('YYYY-MM-DD HH:mm:ss') });
    // 这里应该调用实际的推送API
  };

  // 手动开启报名
  const handleManualOpen = () => {
    openSignup();
  };

  // 手动关闭报名
  const handleManualClose = () => {
    closeSignup();
  };

  // 导出报名数据
  const handleExport = () => {
    const csvContent = [
      ['报名ID', '志愿者姓名', '志愿者类型', '手机号', '服务日期', '服务类型', '时间段', '状态', '报名时间'],
      ...signupRecords.map(record => [
        record.id,
        record.volunteerName,
        record.volunteerType,
        record.volunteerPhone,
        record.date,
        record.serviceType,
        record.timeSlot,
        record.status === 'confirmed' ? '已确认' :
        record.status === 'pending' ? '待确认' :
        record.status === 'cancelled' ? '已取消' : '候补',
        record.signupTime
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `报名数据_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success('报名数据导出成功！');
  };

  // 导入报名数据
  const handleImport = () => {
    message.info('导入功能开发中，请手动添加报名记录');
  };

  // 确认报名（云端模式写入Supabase）
  const handleConfirmSignup = async (recordId: string) => {
    const updatedRecords = signupRecords.map(record => {
      if (record.id === recordId) {
        return { ...record, status: 'confirmed' as const };
      }
      return record;
    });
    setSignupRecords(updatedRecords);
    try {
      if (!isLocalAdmin()) {
        const rec = updatedRecords.find(r => r.id === recordId);
        if (rec) await updateSignupRecord(recordId, rec);
      } else {
        localStorage.setItem('signupRecords', JSON.stringify(updatedRecords));
        setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      }
      message.success('报名已确认');
    } catch (e) {
      message.error('云端写入失败，请重试');
    }
  };

  // 取消/拒绝报名（云端模式写入Supabase）
  const handleCancelSignup = async (recordId: string) => {
    const updatedRecords = signupRecords.map(record => {
      if (record.id === recordId) {
        return { ...record, status: 'cancelled' as const };
      }
      return record;
    });
    setSignupRecords(updatedRecords);
    try {
      if (!isLocalAdmin()) {
        const rec = updatedRecords.find(r => r.id === recordId);
        if (rec) await updateSignupRecord(recordId, rec);
      } else {
        localStorage.setItem('signupRecords', JSON.stringify(updatedRecords));
        setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      }
      message.success('报名已取消');
    } catch (e) {
      message.error('云端写入失败，请重试');
    }
  };

  // 查看报名详情
  const handleViewDetails = (record: SignupRecord) => {
    Modal.info({
      title: '报名详情',
      width: 600,
      content: (
        <div>
          <Descriptions column={2} bordered>
            <Descriptions.Item label="志愿者姓名">{record.volunteerName}</Descriptions.Item>
            <Descriptions.Item label="志愿者类型">{record.volunteerType}</Descriptions.Item>
            <Descriptions.Item label="手机号">{record.volunteerPhone}</Descriptions.Item>
            <Descriptions.Item label="服务日期">{record.date}</Descriptions.Item>
            <Descriptions.Item label="服务类型">{record.serviceType}</Descriptions.Item>
            <Descriptions.Item label="时间段">{record.timeSlot}</Descriptions.Item>
            <Descriptions.Item label="状态">
              {record.status === 'confirmed' ? '已确认' :
               record.status === 'pending' ? '待确认' :
               record.status === 'cancelled' ? '已取消' : '候补'}
            </Descriptions.Item>
            <Descriptions.Item label="报名时间">{record.signupTime}</Descriptions.Item>
            {record.notes && (
              <Descriptions.Item label="备注" span={2}>{record.notes}</Descriptions.Item>
            )}
          </Descriptions>
        </div>
      )
    });
  };

  // 处理请假申请
  const handleLeaveRequest = async (record: SignupRecord, reason: string) => {
    const leaveNotification: LeaveNotification = {
      id: `leave_${Date.now()}`,
      volunteerId: record.volunteerId,
      volunteerName: record.volunteerName,
      volunteerPhone: record.volunteerPhone,
      serviceSlotId: record.serviceSlotId,
      date: record.date,
      serviceType: record.serviceType,
      timeSlot: record.timeSlot,
      leaveTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      reason,
      status: 'pending'
    };

    setLeaveNotifications(prev => [...prev, leaveNotification]);

    // 将原报名记录状态改为已取消
    const updatedRecords = signupRecords.map(r => {
      if (r.id === record.id) {
        return { ...r, status: 'cancelled' as const };
      }
      return r;
    });
    setSignupRecords(updatedRecords);

    try {
      if (!isLocalAdmin()) {
        const rec = updatedRecords.find(r => r.id === record.id);
        if (rec) await updateSignupRecord(record.id, rec);
      } else {
        localStorage.setItem('signupRecords', JSON.stringify(updatedRecords));
        setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      }
    } catch (e) {
      message.error('云端写入失败，请重试');
    }

    // 推送通知给其他志愿者
    pushNotificationToApp(
      '新的服务机会',
      `${record.date} ${record.timeSlot} ${record.serviceType}有空缺，请及时报名！`
    );

    message.success('请假申请已提交，空缺位置已开放给其他志愿者报名');
  };

  // 批准请假申请
  const handleApproveLeave = (leaveId: string) => {
    setLeaveNotifications(prev =>
      prev.map(leave =>
        leave.id === leaveId ? { ...leave, status: 'approved' as const } : leave
      )
    );
    message.success('请假申请已批准');
  };

  // 拒绝请假申请
  const handleRejectLeave = async (leaveId: string) => {
    const leave = leaveNotifications.find(l => l.id === leaveId);
    if (leave) {
      // 恢复原报名记录
      const updatedRecords = signupRecords.map(r => {
        if (r.serviceSlotId === leave.serviceSlotId && r.date === leave.date) {
          return { ...r, status: 'confirmed' as const };
        }
        return r;
      });
      setSignupRecords(updatedRecords);
      try {
        if (!isLocalAdmin()) {
          const rec = updatedRecords.find(r => r.serviceSlotId === leave.serviceSlotId && r.date === leave.date);
          if (rec) await updateSignupRecord(rec.id, rec);
        } else {
          localStorage.setItem('signupRecords', JSON.stringify(updatedRecords));
          setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        }
      } catch (e) {
        message.error('云端写入失败，请重试');
      }
    }

    setLeaveNotifications(prev =>
      prev.map(l =>
        l.id === leaveId ? { ...l, status: 'rejected' as const } : l
      )
    );
    message.success('请假申请已拒绝');
  };

  // 批量删除报名记录
  const handleBatchDelete = async () => {
    if (selectedRecords.length === 0) {
      message.warning('请选择要删除的报名记录');
      return;
    }

    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRecords.length} 条报名记录吗？`,
      okText: '确定',
      cancelText: '取消',
      onOk: async () => {
        try {
          if (isLocalAdmin()) {
            // 本地管理员，使用localStorage
            const updatedRecords = signupRecords.filter(record => !selectedRecords.includes(record.id));
            setSignupRecords(updatedRecords);
            localStorage.setItem('signupRecords', JSON.stringify(updatedRecords));
            setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
          } else {
            // 普通用户，批量删除Supabase数据
            await batchDeleteSignupRecords(selectedRecords);
            const data = await fetchSignupRecords();
            setSignupRecords(data || []);
          }
          setSelectedRecords([]);
          message.success('报名记录批量删除成功！');
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败，请重试');
        }
      },
    });
  };

  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = signupRecords.map(record => record.id);
      setSelectedRecords(allIds);
      setSelectAll(true);
    } else {
      setSelectedRecords([]);
      setSelectAll(false);
    }
  };

  // 更新全选框的indeterminate状态
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selectedRecords.length > 0 && selectedRecords.length < signupRecords.length;
    }
  }, [selectedRecords.length, signupRecords.length]);

  // 测试当前设置
  const handleTestSettings = () => {
        const now = dayjs();
    const currentDate = now.format('YYYY-MM-DD');
    const currentTimeStr = now.format('HH:mm');

    let testResult = '';

    if (currentDate === signupSettings.openDate && currentTimeStr === signupSettings.openTime) {
      testResult = '✅ 当前时间符合开启条件，系统将自动开启报名';
    } else if (currentDate === signupSettings.closeDate && currentTimeStr === signupSettings.closeTime) {
      testResult = '✅ 当前时间符合关闭条件，系统将自动关闭报名';
    } else {
      const nextOpen = calculateNextOpenTime(signupSettings);
      testResult = `⏰ 当前时间不符合自动操作条件，下次开启时间：${nextOpen}`;
    }

    Modal.info({
      title: '设置测试结果',
      content: (
        <div>
          <p><strong>当前时间：</strong>{now.format('YYYY-MM-DD HH:mm:ss')}</p>
          <p><strong>当前日期：</strong>{currentDate}</p>
          <p><strong>测试结果：</strong></p>
          <p>{testResult}</p>
          <br />
          <p><strong>当前设置：</strong></p>
          <p>• 开启时间：{signupSettings.openDate} {signupSettings.openTime}</p>
          <p>• 关闭时间：{signupSettings.closeDate} {signupSettings.closeTime}</p>
          <p>• 自动开启：{signupSettings.autoOpen ? '已启用' : '已禁用'}</p>
        </div>
      )
    });
  };

  // 筛选报名记录
  const filteredSignupRecords = signupRecords.filter(record => {
    const matchesSearch = record.volunteerName.includes(searchText) ||
                         record.volunteerPhone.includes(searchText);
    const matchesStatus = filterStatus === 'all' || record.status === filterStatus;
    const matchesServiceType = filterServiceType === 'all' || record.serviceType === filterServiceType;

    let matchesDate = true;
    if (filterDateRange && filterDateRange[0] && filterDateRange[1]) {
      const recordDate = dayjs(record.date);
      const startDate = filterDateRange[0];
      const endDate = filterDateRange[1];
      matchesDate = recordDate.isAfter(startDate.subtract(1, 'day')) &&
                   recordDate.isBefore(endDate.add(1, 'day'));
    }

    return matchesSearch && matchesStatus && matchesServiceType && matchesDate;
  });

  // 保存设置
  const handleSaveSettings = async (values: any) => {
    try {
      const updatedSettings = {
        ...signupSettings,
        ...values,
        openDate: values.openDate ? values.openDate.format('YYYY-MM-DD') : signupSettings.openDate,
        closeDate: values.closeDate ? values.closeDate.format('YYYY-MM-DD') : signupSettings.closeDate,
        openTime: values.openTime ? values.openTime.format('HH:mm') : signupSettings.openTime,
        closeTime: values.closeTime ? values.closeTime.format('HH:mm') : signupSettings.closeTime,
        nextOpenTime: calculateNextOpenTime(values)
      };

      if (isLocalAdmin()) {
        // 本地管理员，使用localStorage
        setSignupSettings(updatedSettings);
        localStorage.setItem('signupSettings', JSON.stringify(updatedSettings));
        setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      } else {
        // 普通用户，保存到Supabase
        await saveSignupSettings(updatedSettings);
        setSignupSettings(updatedSettings);
      }

      setSettingsModalVisible(false);
      message.success('设置已保存！');

      // 重新生成服务时段以更新状态
      setTimeout(async () => await generateServiceSlots(), 100);
    } catch (error) {
      console.error('保存设置错误:', error);
      message.error('保存设置失败，请重试');
    }
  };

  // 计算下次开启时间
  const calculateNextOpenTime = (settings: any) => {
    const now = dayjs();
    const openDateTime = dayjs(settings.openDate + ' ' + settings.openTime);

    // 如果开启时间已经过了，返回下一个开启时间
    if (openDateTime.isBefore(now)) {
      // 这里可以根据需要设置下一次开启时间
      // 暂时返回当前开启时间加7天
      return openDateTime.add(7, 'day').format('YYYY-MM-DD HH:mm:ss');
    }

    return openDateTime.format('YYYY-MM-DD HH:mm:ss');
  };

  // 获取状态标签
  const getStatusTag = (status: string) => {
    const statusMap = {
      open: { color: 'green', text: '报名中' },
      closed: { color: 'red', text: '已关闭' },
      pending: { color: 'orange', text: '等待开启' }
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // 服务时段表格列
  const serviceSlotColumns: ColumnsType<ServiceSlot> = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string, record: ServiceSlot) => (
        <div>
          <div>{date}</div>
          <Text type="secondary">
            {record.isWeekend ? '周末' : '工作日'}
          </Text>
        </div>
      )
    },
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      key: 'serviceType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === '讲解服务' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: '时间段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 80,
      render: (slot: string) => {
        const timeMap = {
          '上午': '9:30-12:30',
          '下午': '13:30-16:30',
          '全天': '9:30-16:30'
        };
  return (
          <div>
            <div>{slot}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {timeMap[slot as keyof typeof timeMap]}
            </Text>
          </div>
        );
      }
    },
    {
      title: '人数限制',
      dataIndex: 'maxCapacity',
      key: 'maxCapacity',
      width: 100,
      render: (max: number) => (
        <div>
          <Text strong>{max}人</Text>
          <div style={{ fontSize: '12px', color: '#666' }}>（社会志愿者）</div>
        </div>
      )
    },
    {
      title: '已报名',
      dataIndex: 'currentSignups',
      key: 'currentSignups',
      width: 100,
      render: (current: number, record: ServiceSlot) => (
        <div>
          <Text style={{ color: current >= record.maxCapacity ? '#ff4d4f' : '#52c41a' }}>
            {current}/{record.maxCapacity}
          </Text>
          <div style={{ fontSize: '12px', color: '#666' }}>（社会志愿者）</div>
        </div>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap = {
          open: { color: 'green', text: '可报名' },
          full: { color: 'orange', text: '已满员' },
          closed: { color: 'red', text: '已关闭' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    }
  ];

  // 报名记录表格列
  const signupRecordColumns: ColumnsType<SignupRecord> = [
    {
      title: (
        <input
          type="checkbox"
          onChange={(e) => handleSelectAll(e.target.checked)}
          checked={selectAll && signupRecords.length > 0}
          ref={selectAllRef}
        />
      ),
      dataIndex: 'selection',
      key: 'selection',
      width: 60,
      render: (_, record: SignupRecord) => (
        <input
          type="checkbox"
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedRecords(prev => [...prev, record.id]);
            } else {
              setSelectedRecords(prev => prev.filter(id => id !== record.id));
            }
          }}
          checked={selectedRecords.includes(record.id)}
        />
      )
    },
    {
      title: '志愿者',
      dataIndex: 'volunteerName',
      key: 'volunteerName',
      width: 100,
      ellipsis: true
    },
    {
      title: '类型',
      dataIndex: 'volunteerType',
      key: 'volunteerType',
      width: 90,
      render: (type: string) => (
        <Tag color={type === '学生志愿者' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: '手机号',
      dataIndex: 'volunteerPhone',
      key: 'volunteerPhone',
      width: 110,
      ellipsis: true
    },
    {
      title: '服务日期',
      dataIndex: 'date',
      key: 'date',
      width: 100
    },
    {
      title: '服务类型',
      dataIndex: 'serviceType',
      key: 'serviceType',
      width: 90,
      render: (type: string) => (
        <Tag color={type === '讲解服务' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: '时间段',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 70
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const statusMap = {
          confirmed: { color: 'green', text: '已确认' },
          pending: { color: 'orange', text: '待确认' },
          cancelled: { color: 'red', text: '已取消' },
          waitlist: { color: 'purple', text: '候补' }
        };
        const config = statusMap[status as keyof typeof statusMap];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: '报名时间',
      dataIndex: 'signupTime',
      key: 'signupTime',
      width: 140,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record: SignupRecord) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                onClick={() => handleConfirmSignup(record.id)}
              >
                确认
              </Button>
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleCancelSignup(record.id)}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'confirmed' && (
            <Button
              type="link"
              size="small"
              onClick={() => {
                Modal.confirm({
                  title: '请假申请',
                  content: (
                    <Input.TextArea
                      placeholder="请输入请假原因"
                      rows={3}


                      id="leaveReason"
                    />
                  ),
                  onOk: () => {
                    const reason = (document.getElementById('leaveReason') as HTMLTextAreaElement)?.value;
                    if (reason) {
                      handleLeaveRequest(record, reason);
                    } else {
                      message.error('请输入请假原因');
                    }
                  }
                });
              }}
            >
              请假
            </Button>
          )}
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            详情
          </Button>
        </Space>
      )
    }
  ];

  const totalSignups = signupRecords.length;
  const confirmedSignups = signupRecords.filter(s => s.status === 'confirmed').length;
  const pendingSignups = signupRecords.filter(s => s.status === 'pending').length;
  const waitlistSignups = signupRecords.filter(s => s.status === 'waitlist').length;

  return (
    <div style={{
      padding: '16px',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* 系统状态卡片 */}
      <Card
        style={{
          marginBottom: 16,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ margin: '0 0 8px 0' }}>报名系统状态</Title>
              <div style={{ marginBottom: 8 }}>
                {getStatusTag(signupSettings.status)}
              </div>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                当前时间: {currentTime.format('YYYY-MM-DD HH:mm:ss')}
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="自动开启">
                <Switch
                  checked={signupSettings.autoOpen}
                  disabled
                />
              </Descriptions.Item>
              <Descriptions.Item label="开启时间">
                <Text style={{ fontSize: '12px' }}>
                  {signupSettings.openDate} {signupSettings.openTime}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="关闭时间">
                <Text style={{ fontSize: '12px' }}>
                  {signupSettings.closeDate} {signupSettings.closeTime}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                onClick={handleManualOpen}
                disabled={signupSettings.status === 'open'}
                size="small"
              >
                手动开启报名
              </Button>
              <Button
                danger
                icon={<PauseCircleOutlined />}
                onClick={handleManualClose}
                disabled={signupSettings.status === 'closed'}
                size="small"
              >
                手动关闭报名
              </Button>
              <Button
                icon={<SettingOutlined />}
                onClick={() => setSettingsModalVisible(true)}
                size="small"
              >
                报名设置
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="总报名数"
              value={totalSignups}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="已确认"
              value={confirmedSignups}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="待确认"
              value={pendingSignups}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ borderRadius: '8px' }}>
            <Statistic
              title="候补"
              value={waitlistSignups}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#722ed1', fontSize: '20px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  height: 120,
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                  <div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>学生志愿者</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                      {signupRecords.filter(r => r.volunteerType === '学生志愿者').length}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>报名人数</div>
                  </div>
                  <div style={{ fontSize: 32, opacity: 0.3 }}>🎓</div>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  height: 120,
                  borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(240, 147, 251, 0.3)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                  <div>
                    <div style={{ fontSize: 14, opacity: 0.9 }}>社会志愿者</div>
                    <div style={{ fontSize: 24, fontWeight: 'bold', marginTop: 8 }}>
                      {signupRecords.filter(r => r.volunteerType === '社会志愿者').length}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>报名人数</div>
                  </div>
                  <div style={{ fontSize: 32, opacity: 0.3 }}>👥</div>
                </div>
              </Card>
            </Col>
      </Row>

      {/* 服务时段管理 */}
      <Card
        title="服务时段管理"
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={generateServiceSlots}
          >
            重新生成
          </Button>
        }
        style={{ marginBottom: 24 }}
      >
        <Alert
          message="服务时段说明"
          description="人数限制仅针对社会志愿者（有APP的志愿者）。学生志愿者通过导入数据方式管理，不计入报名人数限制。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Table
          columns={serviceSlotColumns}
          dataSource={serviceSlots}
          rowKey="id"
          pagination={false}
          size="small"
        />
      </Card>

      {/* 请假通知管理 */}
      {leaveNotifications.length > 0 && (
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BellOutlined style={{ color: '#ff4d4f' }} />
              <span>请假通知管理</span>
              <Badge count={leaveNotifications.filter(l => l.status === 'pending').length} />
            </div>
          }
          style={{
            marginBottom: 16,
            borderRadius: '12px',
            border: '1px solid #ffccc7',
            backgroundColor: '#fff2f0'
          }}
        >
          <Table
            columns={[
              {
                title: '志愿者',
                dataIndex: 'volunteerName',
                key: 'volunteerName',
                width: 100
              },
              {
                title: '服务日期',
                dataIndex: 'date',
                key: 'date',
                width: 100
              },
              {
                title: '服务类型',
                dataIndex: 'serviceType',
                key: 'serviceType',
                width: 100,
                render: (type: string) => (
                  <Tag color={type === '讲解服务' ? 'blue' : 'green'}>
                    {type}
                  </Tag>
                )
              },
              {
                title: '时间段',
                dataIndex: 'timeSlot',
                key: 'timeSlot',
                width: 80
              },
              {
                title: '请假原因',
                dataIndex: 'reason',
                key: 'reason',
                width: 150,
                ellipsis: true
              },
              {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                width: 80,
                render: (status: string) => {
                  const statusMap = {
                    pending: { color: 'orange', text: '待处理' },
                    approved: { color: 'green', text: '已批准' },
                    rejected: { color: 'red', text: '已拒绝' }
                  };
                  const config = statusMap[status as keyof typeof statusMap];
                  return <Tag color={config.color}>{config.text}</Tag>;
                }
              },
              {
                title: '操作',
                key: 'action',
                width: 120,
                render: (_, record: LeaveNotification) => (
                  <Space size="small">
                    {record.status === 'pending' && (
                      <>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => handleApproveLeave(record.id)}
                        >
                          批准
                        </Button>
                        <Button
                          type="link"
                          size="small"
                          danger
                          onClick={() => handleRejectLeave(record.id)}
                        >
                          拒绝
                        </Button>
                      </>
                    )}
                  </Space>
                )
              }
            ]}
            dataSource={leaveNotifications}
            rowKey="id"
            pagination={false}
            size="small"
            scroll={{ x: 650 }}
          />
        </Card>
      )}

      {/* 报名记录 */}
      <Card
        title="报名记录"
        extra={
          <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={handleImport}
            >
              导入学生志愿者
            </Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
            >
              导出报名数据
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRecords.length === 0}
            >
              批量删除
              {selectedRecords.length > 0 && ` (${selectedRecords.length})`}
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => { setEditingRecord(null); signupForm.resetFields(); setSignupModalVisible(true); }}
            >
              添加报名记录
            </Button>
          </div>
        }
        style={{ borderRadius: '12px' }}
      >
        {/* 筛选区域 */}
        <div style={{
          marginBottom: 16,
          padding: 12,
          background: '#f8f9fa',
          borderRadius: 6
        }}>
          <Row gutter={[12, 12]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="搜索志愿者姓名或手机号"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                size="small"
              />
            </Col>
            <Col xs={12} sm={12} md={4}>
              <Select
                placeholder="状态筛选"
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="all">全部状态</Option>
                <Option value="confirmed">已确认</Option>
                <Option value="pending">待确认</Option>
                <Option value="cancelled">已取消</Option>
                <Option value="waitlist">候补</Option>
              </Select>
            </Col>
            <Col xs={12} sm={12} md={4}>
              <Select
                placeholder="服务类型"
                value={filterServiceType}
                onChange={setFilterServiceType}
                style={{ width: '100%' }}
                size="small"
              >
                <Option value="all">全部类型</Option>
                <Option value="场馆服务">场馆服务</Option>
                <Option value="讲解服务">讲解服务</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: '600', color: '#2c3e50' }}>志愿者类型</div>
                <Select
                  placeholder="选择志愿者类型"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(value) => {
                    // 这里可以添加筛选逻辑
                    console.log('筛选志愿者类型:', value);
                  }}
                >
                  <Select.Option value="学生志愿者">学生志愿者</Select.Option>
                  <Select.Option value="社会志愿者">社会志愿者</Select.Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ marginBottom: 8, fontWeight: '600', color: '#2c3e50' }}>服务类型</div>
                <Select
                  placeholder="选择服务类型"
                  style={{ width: '100%' }}
                  allowClear
                  onChange={(value) => {
                    // 这里可以添加筛选逻辑
                    console.log('筛选服务类型:', value);
                  }}
                >
                  <Select.Option value="场馆服务">场馆服务</Select.Option>
                  <Select.Option value="讲解服务">讲解服务</Select.Option>
                </Select>
              </div>
            </Col>
            <Col xs={24} sm={24} md={8}>
              <RangePicker
                placeholder={['开始日期', '结束日期']}
                value={filterDateRange}
                onChange={(dates) => setFilterDateRange(dates as [Dayjs, Dayjs])}
                style={{ width: '100%' }}
                size="small"
              />
            </Col>
            <Col xs={24} sm={24} md={2}>
              <Button
                onClick={() => {
                  setSearchText('');
                  setFilterStatus('all');
                  setFilterServiceType('all');
                  setFilterDateRange(null);
                }}
                size="small"
                style={{ width: '100%' }}
              >
                重置
              </Button>
            </Col>
          </Row>
        </div>

        <Table
          columns={signupRecordColumns}
          dataSource={filteredSignupRecords}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
            size: 'small'
          }}
          scroll={{ x: 1200 }}
          size="small"
        />
      </Card>

      {/* 报名设置弹窗 */}
      <Modal
        title="报名系统设置"
        open={settingsModalVisible}
        onCancel={() => setSettingsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            ...signupSettings,
            openDate: signupSettings.openDate ? dayjs(signupSettings.openDate) : dayjs(),
            closeDate: signupSettings.closeDate ? dayjs(signupSettings.closeDate) : dayjs(),
            openTime: signupSettings.openTime ? dayjs(signupSettings.openTime, 'HH:mm') : dayjs('19:00', 'HH:mm'),
            closeTime: signupSettings.closeTime ? dayjs(signupSettings.closeTime, 'HH:mm') : dayjs('12:00', 'HH:mm')
          }}
          onFinish={handleSaveSettings}
        >
          <Alert
            message="自动报名设置"
            description="设置系统自动开启和关闭报名的时间规则"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            name="autoOpen"
            label="启用自动报名"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Divider orientation="left">报名开启设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="openDate"
                label="开启日期"
                rules={[{ required: true, message: '请选择开启日期' }]}
              >
                <DatePicker
                  placeholder="选择开启日期"
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    // 禁用过去的日期
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="openTime"
                label="开启时间"
                rules={[{ required: true, message: '请选择开启时间' }]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="选择开启时间"
                  minuteStep={5}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">报名截止设置</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="closeDate"
                label="关闭日期"
                rules={[{ required: true, message: '请选择关闭日期' }]}
              >
                <DatePicker
                  placeholder="选择关闭日期"
                  format="YYYY-MM-DD"
                  style={{ width: '100%' }}
                  disabledDate={(current) => {
                    // 禁用过去的日期
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="closeTime"
                label="关闭时间"
                rules={[{ required: true, message: '请选择关闭时间' }]}
              >
                <TimePicker
                  format="HH:mm"
                  placeholder="选择关闭时间"
                  minuteStep={5}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">可报名时间段设置</Divider>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="signupPeriodDays"
                label="提前报名天数"
                rules={[{ required: true, message: '请设置提前报名天数' }]}
              >
                <InputNumber
                  min={1}
                  max={30}
                  placeholder="默认7天"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="serviceStartDay"
                label="服务开始日期"
                rules={[{ required: true, message: '请选择服务开始日期' }]}
              >
                <Select placeholder="选择服务开始日期">
                  <Option value={0}>周日</Option>
                  <Option value={1}>周一</Option>
                  <Option value={2}>周二</Option>
                  <Option value={3}>周三</Option>
                  <Option value={4}>周四</Option>
                  <Option value={5}>周五</Option>
                  <Option value={6}>周六</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="serviceEndDay"
                label="服务结束日期"
                rules={[{ required: true, message: '请选择服务结束日期' }]}
              >
                <Select placeholder="选择服务结束日期">
                  <Option value={0}>周日</Option>
                  <Option value={1}>周一</Option>
                  <Option value={2}>周二</Option>
                  <Option value={3}>周三</Option>
                  <Option value={4}>周四</Option>
                  <Option value={5}>周五</Option>
                  <Option value={6}>周六</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">当前设置预览</Divider>

          <Descriptions column={2} size="small" bordered>
            <Descriptions.Item label="下次开启时间">
              {signupSettings.nextOpenTime || '未设置'}
            </Descriptions.Item>
            <Descriptions.Item label="上次开启时间">
              {signupSettings.lastOpenTime || '未开启'}
            </Descriptions.Item>
            <Descriptions.Item label="当前状态">
              {getStatusTag(signupSettings.status)}
            </Descriptions.Item>
            <Descriptions.Item label="自动开启">
              <Switch checked={signupSettings.autoOpen} disabled />
            </Descriptions.Item>
          </Descriptions>

          <Alert
            message="业务规则说明"
            description={
              <div>
                <p><strong>时间规则：</strong></p>
                <p>• 默认报名开启时间：每周日晚上19:00</p>
                <p>• 默认报名关闭时间：每周三中午12:00</p>
                <p>• 周一闭馆日不开放报名</p>
                <p>• 可报名时间段：本周日报名的是下周六到下下周五的服务</p>
                <br />
                <p><strong>人数限制：</strong></p>
                <p>• 工作日：讲解服务2人/时段，场馆服务3人/时段</p>
                <p>• 双休日：讲解服务5人/时段，场馆服务3人/时段</p>
                <p>• 支持候补机制，自动递补</p>
                <br />
                <p><strong>服务时段：</strong></p>
                <p>• 上午：9:30-12:30（半天服务）</p>
                <p>• 下午：13:30-16:30（半天服务）</p>
                <p>• 全天：9:30-16:30（连续服务）</p>
                <br />
                <p><strong>请假机制：</strong></p>
                <p>• 已确认的志愿者可以申请请假</p>
                <p>• 请假后空缺位置会自动开放给其他志愿者报名</p>
                <p>• 系统会推送通知给所有志愿者</p>
                <p>• 管理员可以批准或拒绝请假申请</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleTestSettings}>
                测试设置
              </Button>
              <Button onClick={() => setSettingsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                保存设置
              </Button>

      {/* 新增/编辑报名记录弹窗 */}
      <Modal
        title={editingRecord ? '编辑报名记录' : '新增报名记录'}
        open={signupModalVisible}
        onCancel={() => { setSignupModalVisible(false); setEditingRecord(null); }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={signupForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              const payload = {
                id: editingRecord?.id || `${Date.now()}`,
                volunteerId: values.volunteerId || '',
                volunteerName: values.volunteerName,
                volunteerPhone: values.volunteerPhone,
                volunteerType: values.volunteerType,
                serviceSlotId: values.serviceSlotId || '',
                date: values.date ? values.date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
                serviceType: values.serviceType,
                timeSlot: values.timeSlot,
                signupTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
                status: values.status || 'pending',
                points: Number(values.points || 0),
                notes: values.notes || '',
              };
              if (isLocalAdmin()) {
                // 本地
                let newList = [] as any[];
                if (editingRecord) {
                  newList = signupRecords.map(r => r.id === editingRecord.id ? payload : r);
                } else {
                  newList = [payload, ...signupRecords];
                }
                setSignupRecords(newList);
                localStorage.setItem('signupRecords', JSON.stringify(newList));
                setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
              } else {
                // 云端
                if (editingRecord) {
                  await updateSignupRecord(editingRecord.id, payload);
                } else {
                  await addSignupRecord(payload);
                }
                const list = await fetchSignupRecords();
                setSignupRecords(list || []);
              }
              setSignupModalVisible(false);
              setEditingRecord(null);
              signupForm.resetFields();
              message.success('保存成功');
            } catch (err) {
              console.error(err);
              message.error('保存失败，请重试');
            }
          }}
          initialValues={{
            volunteerType: '学生志愿者',
            serviceType: '场馆服务',
            timeSlot: '上午',
            status: 'pending',
          }}
        >
          <Form.Item name="volunteerName" label="志愿者姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="volunteerPhone" label="手机号码" rules={[{ required: true, message: '请输入手机号码' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="volunteerType" label="志愿者类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="学生志愿者">学生志愿者</Select.Option>
              <Select.Option value="社会志愿者">社会志愿者</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="serviceType" label="服务类型" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="场馆服务">场馆服务</Select.Option>
              <Select.Option value="讲解服务">讲解服务</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="date" label="服务日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="timeSlot" label="时段" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="上午">上午</Select.Option>
              <Select.Option value="下午">下午</Select.Option>
              <Select.Option value="全天">全天</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="points" label="积分" >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="status" label="状态" >
            <Select>
              <Select.Option value="pending">待确认</Select.Option>
              <Select.Option value="confirmed">已确认</Select.Option>
              <Select.Option value="cancelled">已取消</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button onClick={() => { setSignupModalVisible(false); setEditingRecord(null); }}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SignupPage;