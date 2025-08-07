import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Upload,
  Tooltip,
  Tag,
  Row,
  Col,
  Statistic,
  Progress,
  Dropdown,
  Menu,
  Checkbox,
  Typography,
  Alert,
  Divider,
  Drawer
} from 'antd';
import {
  PlusOutlined,
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  FilterOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SearchOutlined,
  FileExcelOutlined,
  GiftOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cloudSync } from '../../utils/cloudSync';
import { fetchVolunteers, addVolunteer, updateVolunteer, deleteVolunteer } from '../../utils/supabaseVolunteer';
import { testSupabaseConnection } from '../../utils/supabaseClient';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Text } = Typography;
const { Search } = Input;

interface VolunteerData {
  id: string;
  volunteerNo: string; // 志愿者编号
  name: string;
  phone: string; // 电话
  gender: string; // 性别
  age: number;
  type: '场馆服务' | '讲解服务';
  serviceCount: number; // 服务次数
  serviceHours: number; // 总服务时长（小时）
  serviceHours2025: number; // 服务时长2025
  serviceScore: number; // 服务积分
  explainScore: number;
  bonusScore: number; // 附加积分
  totalscore: number; // 当前总积分 = 服务积分 + 讲解积分 + 附加积分
  redeemedscore: number; // 已兑换积分
  remainingscore: number; // 剩余积分 = 总积分 - 已兑换积分
  status: 'active' | 'inactive' | 'need_review';
  registerdate: string;
  lastservicedate: string;
  remark: string; // 备注
}

const VolunteerPage: React.FC = () => {
  const [volunteers, setVolunteers] = useState<VolunteerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<VolunteerData | null>(null);
  const [form] = Form.useForm();
  const [timeRange, setTimeRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
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

  // 加载志愿者数据（云端或本地）
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log('开始加载志愿者数据...');
      
      if (isLocalAdmin()) {
        console.log('使用本地管理员模式');
        // 本地管理员账号，走localStorage
        const savedData = localStorage.getItem('volunteerData');
        if (savedData) {
          try {
            setVolunteers(JSON.parse(savedData));
          } catch {
            setVolunteers([]);
          }
        } else {
          setVolunteers([]);
        }
      } else {
        console.log('使用云端模式');
        // 普通用户，走Supabase云端
        try {
          // 先测试Supabase连接
          const connectionOk = await testSupabaseConnection();
          if (!connectionOk) {
            console.error('Supabase连接失败');
            message.error('云端连接失败，请检查网络或联系管理员');
            setVolunteers([]);
            setLoading(false);
            return;
          }
          
          console.log('Supabase连接正常，开始获取数据');
          const data = await fetchVolunteers();
          console.log('获取到的志愿者数据:', data);
          setVolunteers(data || []);
        } catch (e) {
          console.error('加载云端数据失败:', e);
          message.error('加载云端数据失败: ' + (e instanceof Error ? e.message : '未知错误'));
          setVolunteers([]);
        }
      }
      setLoading(false);
    };
    loadData();
  }, []);

  // 新增志愿者
  const handleAddVolunteer = async (volunteer: VolunteerData) => {
    setLoading(true);
    try {
      if (isLocalAdmin()) {
        // 本地
        const newData = [...volunteers, volunteer];
        setVolunteers(newData);
        localStorage.setItem('volunteerData', JSON.stringify(newData));
      } else {
        // 云端
        await addVolunteer(volunteer);
        const data = await fetchVolunteers();
        setVolunteers(data || []);
      }
      message.success('添加成功');
    } catch (e) {
      message.error('添加失败');
    } finally {
      setLoading(false);
    }
  };

  // 编辑志愿者
  const handleEditVolunteer = async (id: string, volunteer: VolunteerData) => {
    setLoading(true);
    try {
      if (isLocalAdmin()) {
        const newData = volunteers.map(v => v.id === id ? { ...v, ...volunteer } : v);
        setVolunteers(newData);
        localStorage.setItem('volunteerData', JSON.stringify(newData));
      } else {
        await updateVolunteer(id, volunteer);
        const data = await fetchVolunteers();
        setVolunteers(data || []);
      }
      message.success('编辑成功');
    } catch (e) {
      message.error('编辑失败');
    } finally {
      setLoading(false);
    }
  };

  // 删除志愿者
  const handleDeleteVolunteer = async (id: string) => {
    setLoading(true);
    try {
      if (isLocalAdmin()) {
        const newData = volunteers.filter(v => v.id !== id);
        setVolunteers(newData);
        localStorage.setItem('volunteerData', JSON.stringify(newData));
      } else {
        await deleteVolunteer(id);
        const data = await fetchVolunteers();
        setVolunteers(data || []);
      }
      message.success('删除成功');
    } catch (e) {
      message.error('删除失败');
    } finally {
      setLoading(false);
    }
  };

  // 保存数据到localStorage
  const saveDataToStorage = (data: VolunteerData[]) => {
    try {
      localStorage.setItem('volunteerData', JSON.stringify(data));
      setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    } catch (error) {
      console.error('保存数据失败:', error);
      message.error('数据保存失败，请检查浏览器存储空间');
    }
  };

  // 监听数据变化，自动保存
  useEffect(() => {
    if (volunteers.length > 0) {
      saveDataToStorage(volunteers);
    }
  }, [volunteers]);

  // 过滤后的数据
  const filteredVolunteers = volunteers.filter(volunteer => {
    const matchesSearch = volunteer.name.includes(searchText) || 
                         volunteer.gender.includes(searchText) ||
                         volunteer.phone.includes(searchText) ||
                         volunteer.volunteerNo.includes(searchText);
    const matchesType = filterType === 'all' || volunteer.type === filterType;
    
    // 时间筛选逻辑
    let matchesTime = true;
    if (timeRange && timeRange[0] && timeRange[1]) {
      const volunteerDate = dayjs(volunteer.registerdate);
      const startDate = timeRange[0];
      const endDate = timeRange[1];
      matchesTime = volunteerDate.isAfter(startDate.subtract(1, 'day')) && volunteerDate.isBefore(endDate.add(1, 'day'));
    }
    
    return matchesSearch && matchesType && matchesTime;
  });

  // 计算统计数据
  const stats = {
    total: volunteers.length,
    active: volunteers.filter(v => v.status === 'active').length,
    needReview: volunteers.filter(v => v.status === 'need_review').length,
    totalScore: volunteers.reduce((sum, v) => sum + v.totalscore, 0)
  };

  // 检查是否需要重新考核
  const checkNeedReview = (lastExplainDate: string) => {
    const lastDate = dayjs(lastExplainDate);
    const now = dayjs();
    return now.diff(lastDate, 'month') > 6;
  };

  // 表格列定义
  const columns: ColumnsType<VolunteerData> = [
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>志愿者编号</div>,
      dataIndex: 'volunteerNo',
      key: 'volunteerNo',
      width: 120,
      render: (text) => <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>姓名</div>,
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text) => <span style={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>电话</div>,
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
      render: (text) => <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>性别</div>,
      dataIndex: 'gender',
      key: 'gender',
      width: 60,
      render: (gender) => (
        <Tag color={gender === '男' ? '#1890ff' : '#eb2f96'}>{gender}</Tag>
      )
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>年龄</div>,
      dataIndex: 'age',
      key: 'age',
      width: 60,
      render: (text) => <span>{Number(text) || 0}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>类型</div>,
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type) => <Tag color={type === '讲解服务' ? '#667eea' : '#11998e'}>{type}</Tag>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>服务次数</div>,
      dataIndex: 'serviceCount',
      key: 'serviceCount',
      width: 80,
      render: (text) => <span>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>总服务小时</div>,
      dataIndex: 'serviceHours',
      key: 'serviceHours',
      width: 100,
      render: (text) => <span>{text}小时</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>服务时长2025</div>,
      dataIndex: 'serviceHours2025',
      key: 'serviceHours2025',
      width: 100,
      render: (text) => <span>{text}小时</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>服务积分</div>,
      dataIndex: 'serviceScore',
      key: 'serviceScore',
      width: 80,
      render: (text) => <span>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>讲解积分</div>,
      dataIndex: 'explainScore',
      key: 'explainScore',
      width: 80,
      render: (text) => <span>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>附加积分</div>,
      dataIndex: 'bonusScore',
      key: 'bonusScore',
      width: 80,
      render: (text) => <span>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>累计获得积分</div>,
      dataIndex: 'totalscore',
      key: 'totalscore',
      width: 100,
      render: (text) => <span>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>已兑换积分</div>,
      dataIndex: 'redeemedscore',
      key: 'redeemedscore',
      width: 80,
      render: (text) => <span>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>剩余积分</div>,
      dataIndex: 'remainingscore',
      key: 'remainingscore',
      width: 80,
      render: (text) => <span>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>备注</div>,
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      render: (text) => <span style={{ whiteSpace: 'nowrap' }}>{text}</span>
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>状态</div>,
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: 'active' | 'inactive' | 'need_review') => {
        const statusMap: Record<'active' | 'inactive' | 'need_review', { color: string; text: string }> = {
          active: { color: 'green', text: '活跃' },
          inactive: { color: 'gray', text: '非活跃' },
          need_review: { color: 'red', text: '需考核' }
        };
        const config = statusMap[status];
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: <div style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>操作</div>,
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      )
    }
  ];

  // 新增志愿者
  const handleAdd = () => {
    setEditingVolunteer(null);
    // 重置表单并设置默认值
        form.resetFields();
    form.setFieldsValue({
      status: 'active',
      serviceHours: 0,
      explainScore: 0,
      volunteerNo: '', // 新增志愿者编号
      phone: '', // 新增电话
      serviceCount: 0, // 新增服务次数
      serviceHours2025: 0, // 新增服务时长2025
      accumulateds: 0, // 新增累计获得积分
      remark: ''
    });
    setModalVisible(true);
  };



  // 编辑志愿者
  const handleEdit = (volunteer: VolunteerData) => {
    setEditingVolunteer(volunteer);
    // 处理日期字段，将字符串转换为dayjs对象
    const formData = {
      ...volunteer,
      lastexplaindat: volunteer.lastexplaindat ? dayjs(volunteer.lastexplaindat) : null
    };
    form.setFieldsValue(formData);
    setModalVisible(true);
  };

  // 删除志愿者
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个志愿者吗？',
      onOk: () => {
        setVolunteers(prev => prev.filter(v => v.id !== id));
        message.success('删除成功');
      }
    });
  };

  // 下载Excel模板
  const handleDownloadTemplate = () => {
    try {
      const templateData = [
        {
          志愿者编号: 'V001',
          姓名: '张三',
          电话: '13800138000',
          性别: '男',
          年龄: 25,
          服务类型: '讲解服务',
          服务次数: 10,
          总服务小时: '30小时',
          服务时长2025: '10小时',
          服务积分: 7,
          讲解积分: 8,
          附加积分: 2,
          累计获得积分: 15,
          已兑换积分: 5,
          剩余积分: 12,
          备注: '表现优秀，积极参与活动'
        },
        {
          志愿者编号: 'V002',
          姓名: '李四',
          电话: '13800138001',
          性别: '女',
          年龄: 30,
          服务类型: '场馆服务',
          服务次数: 5,
          总服务小时: '24小时',
          服务时长2025: '5小时',
          服务积分: 6,
          讲解积分: 0,
          附加积分: 0,
          累计获得积分: 6,
          已兑换积分: 0,
          剩余积分: 6,
          备注: '需要重新考核讲解技能'
        }
      ];

      // 创建工作簿
      const wb = XLSX.utils.book_new();
      
      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(templateData);
      
      // 设置列宽
      const colWidths = [
        { wch: 10 }, // 志愿者编号
        { wch: 10 }, // 姓名
        { wch: 10 }, // 电话
        { wch: 8 },  // 性别
        { wch: 8 },  // 年龄
        { wch: 12 }, // 服务类型
        { wch: 10 }, // 服务次数
        { wch: 10 }, // 总服务小时
        { wch: 10 }, // 服务时长2025
        { wch: 10 }, // 服务积分
        { wch: 10 }, // 讲解积分
        { wch: 10 }, // 附加积分
        { wch: 10 }, // 累计获得积分
        { wch: 10 }, // 已兑换积分
        { wch: 10 }, // 剩余积分
        { wch: 30 }, // 备注
        { wch: 10 }  // 状态
      ];
      ws['!cols'] = colWidths;

      // 添加工作表到工作簿
      XLSX.utils.book_append_sheet(wb, ws, '志愿者数据模板');

      // 生成Excel文件并下载
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `志愿者数据导入模板_${dayjs().format('YYYY-MM-DD')}.xlsx`);

      message.success('Excel模板下载成功！');
    } catch (error) {
      console.error('模板下载错误:', error);
      message.error('模板下载失败，请重试');
    }
  };

  // 批量导入Excel数据
  const handleBatchImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

    const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

          // 验证和转换数据
          const validData: VolunteerData[] = [];
          const errors: string[] = [];

          let skippedRows = 0; // 统计跳过的空行数量
          
          // 调试：打印所有列名
          if (jsonData.length > 0) {
            console.log('Excel表格的列名:', Object.keys(jsonData[0] as object));
          }
          
          // 创建列名映射，处理可能的格式问题
          const createColumnMapping = (row: any) => {
            const mapping: { [key: string]: string } = {};
            Object.keys(row).forEach(key => {
              const cleanKey = key.trim(); // 去除前后空格
              mapping[cleanKey] = key; // 原始key -> 清理后的key
            });
            return mapping;
          };
          
          const columnMapping = jsonData.length > 0 ? createColumnMapping(jsonData[0]) : {};
          console.log('列名映射:', columnMapping);
          
          jsonData.forEach((row: any, index: number) => {
            try {
              // 调试信息
              console.log(`处理第${index + 1}行数据:`, row);
              console.log(`第${index + 1}行的所有字段:`, Object.keys(row));
              
              // 处理空值：将所有空值、null、undefined转换为空字符串或0
              const safeRow = Object.keys(row).reduce((acc, key) => {
                const value = row[key];
                if (value === null || value === undefined || value === '') {
                  // 数字字段默认为0，字符串字段默认为空字符串
                  const numericFields = ['年龄', '服务次数', '总服务小时', '服务时长2025', '服务积分', '讲解积分', '附加积分', '累计获得积分', '总积分', '已兑换积分', '剩余积分'];
                  acc[key] = numericFields.includes(key) ? 0 : '';
                } else {
                  acc[key] = value;
                }
                return acc;
              }, {} as any);
              
              // 检查是否为完全空行（所有字段都为空）
              const allFieldsEmpty = Object.values(safeRow).every(value => 
                value === '' || value === 0 || value === null || value === undefined
              );
              
              // 如果是完全空行，直接跳过，不报错
              if (allFieldsEmpty) {
                console.log(`第${index + 1}行为空行，已跳过`);
                skippedRows++;
                return;
              }
              
              // 使用映射获取正确的列值
              const getColumnValue = (columnName: string) => {
                // 尝试多种可能的列名格式
                const possibleNames = [
                  columnName,
                  columnName.trim(),
                  columnName.replace(/\s+/g, ''),
                  columnName.replace(/\s+/g, ' ').trim()
                ];
                
                for (const name of possibleNames) {
                  if (row[name] !== undefined) {
                    return row[name];
                  }
                }
                
                // 如果找不到，返回空字符串
                return '';
              };
              
              // 验证必填字段 - 如果不是空行但缺少必填字段，则报错
              const volunteerNo = getColumnValue('志愿者编号');
              const name = getColumnValue('姓名');
              const gender = getColumnValue('性别');
              
              if (!volunteerNo || !name || !gender) {
                console.error(`第${index + 1}行缺少必填字段:`, {
                  '志愿者编号': volunteerNo,
                  '姓名': name, 
                  '性别': gender,
                  '可用字段': Object.keys(row)
                });
                errors.push(`第${index + 1}行：志愿者编号、姓名和性别为必填项`);
                return;
              }

              // 验证性别格式
              if (!['男', '女'].includes(gender)) {
                errors.push(`第${index + 1}行：性别只能是"男"或"女"`);
                return;
              }

              // 验证年龄 - 如果年龄为空或无效，使用默认值0
              let age = parseInt(getColumnValue('年龄')) || 0;
              if (isNaN(age) || age < 0 || age > 120) {
                console.warn(`第${index + 1}行：年龄值异常(${getColumnValue('年龄')})，使用默认值0`);
                age = 0;
              }

              // 转换数据 - 确保所有数值字段都有默认值
              const serviceHours = parseInt(String(getColumnValue('总服务小时') || '0').replace('小时', '')) || 0;
              const serviceHours2025 = parseInt(String(getColumnValue('服务时长2025') || '0').replace('小时', '')) || 0;
              const type = getColumnValue('服务类型') === '讲解服务' ? '讲解服务' : '场馆服务';
              const lastServiceDate = getColumnValue('最后服务日期') || '';
              const autoStatus = determineStatusByServiceHours(serviceHours2025, lastServiceDate);
              
              const volunteer = {
                id: Date.now().toString() + index,
                volunteerNo: getColumnValue('志愿者编号') || '',
                name: getColumnValue('姓名') || '',
                phone: getColumnValue('电话') || '',
                gender: getColumnValue('性别') || '',
                age: parseInt(getColumnValue('年龄')) || 0,
                type: getColumnValue('服务类型') === '讲解服务' ? '讲解服务' : '场馆服务',
                serviceCount: parseInt(getColumnValue('服务次数')) || 0,
                serviceHours: parseInt(String(getColumnValue('总服务小时') || '0').replace('小时', '')) || 0,
                serviceHours2025: parseInt(String(getColumnValue('服务时长2025') || '0').replace('小时', '')) || 0,
                serviceScore: parseInt(getColumnValue('服务积分')) || 0,
                explainScore: parseInt(getColumnValue('讲解积分')) || 0,
                bonusScore: parseInt(getColumnValue('附加积分')) || 0,
                totalscore: parseInt(getColumnValue('累计获得积分')) || 0,
                redeemedscore: parseInt(getColumnValue('已兑换积分')) || 0,
                remainingscore: parseInt(getColumnValue('剩余积分')) || 0,
                status: autoStatus, // 使用自动判定的状态
                registerdate: dayjs().format('YYYY-MM-DD'),
                lastservicedate: lastServiceDate,
                remark: getColumnValue('备注') || ''
              } as VolunteerData;

              validData.push(volunteer);
            } catch (error) {
              console.error(`第${index + 1}行处理错误:`, error);
              const errorMessage = error instanceof Error ? error.message : '未知错误';
              errors.push(`第${index + 1}行：数据格式错误 - ${errorMessage}`);
            }
          });

          if (errors.length > 0) {
            Modal.error({
              title: '导入失败',
              content: (
                <div>
                  <p>以下数据存在问题：</p>
                  <ul>
                    {errors.map((error, index) => (
                      <li key={index} style={{ color: 'red' }}>{error}</li>
                    ))}
                  </ul>
                </div>
              )
            });
      return;
    }

          // 确认导入
          Modal.confirm({
            title: '确认导入',
            content: `将导入 ${validData.length} 条志愿者数据，是否继续？`,
            onOk: async () => {
              try {
                if (isLocalAdmin()) {
                  // 本地管理员，使用localStorage
                  const newData = [...volunteers, ...validData];
                  setVolunteers(newData);
                  localStorage.setItem('volunteerData', JSON.stringify(newData));
                  message.success(`成功导入 ${validData.length} 条数据！`);
                } else {
                  // 普通用户，批量写入Supabase
                  for (const volunteer of validData) {
                    await addVolunteer(volunteer);
                  }
                  // 重新加载数据
                  const data = await fetchVolunteers();
                  setVolunteers(data || []);
                  message.success(`成功导入 ${validData.length} 条数据！`);
                }
              } catch (error) {
                console.error('批量导入失败:', error);
                message.error('批量导入失败，请重试');
              }
            }
          });

        } catch (error) {
          console.error('导入错误:', error);
          message.error('文件格式错误，请检查Excel文件');
        }
    };
    reader.readAsArrayBuffer(file);
    };
    input.click();
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的志愿者');
      return;
    }
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个志愿者吗？`,
      onOk: async () => {
        try {
          if (isLocalAdmin()) {
            // 本地管理员，使用localStorage
            const newData = volunteers.filter(v => !selectedRowKeys.includes(v.id));
            setVolunteers(newData);
            localStorage.setItem('volunteerData', JSON.stringify(newData));
            setSelectedRowKeys([]);
            message.success('删除成功');
          } else {
            // 普通用户，批量删除Supabase数据
            for (const id of selectedRowKeys) {
              await deleteVolunteer(String(id));
            }
            // 重新加载数据
            const data = await fetchVolunteers();
            setVolunteers(data || []);
            setSelectedRowKeys([]);
            message.success('删除成功');
          }
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败，请重试');
        }
      }
    });
  };

  // 批量更新状态
  const handleBatchUpdateStatus = async () => {
    Modal.confirm({
      title: '批量更新状态',
      content: '确定要根据2025年服务时长和最后服务日期重新计算所有志愿者的状态吗？',
      onOk: async () => {
        try {
          const updatedData = volunteers.map(volunteer => ({
            ...volunteer,
            status: determineStatusByServiceHours(volunteer.serviceHours2025, volunteer.lastservicedate)
          }));
          
          if (isLocalAdmin()) {
            // 本地管理员，使用localStorage
            setVolunteers(updatedData);
            localStorage.setItem('volunteerData', JSON.stringify(updatedData));
            message.success('状态更新成功');
          } else {
            // 普通用户，批量更新Supabase数据
            for (const volunteer of updatedData) {
              await updateVolunteer(volunteer.id, volunteer);
            }
            // 重新加载数据
            const data = await fetchVolunteers();
            setVolunteers(data || []);
            message.success('状态更新成功');
          }
        } catch (error) {
          console.error('批量更新状态失败:', error);
          message.error('批量更新状态失败，请重试');
        }
      }
    });
  };

  // 清空所有数据
  const handleClearAllData = async () => {
    Modal.confirm({
      title: '清空所有数据',
      content: '确定要清空所有志愿者数据吗？此操作不可恢复！',
      onOk: async () => {
        try {
          if (isLocalAdmin()) {
            // 本地管理员，使用localStorage
            setVolunteers([]);
            localStorage.removeItem('volunteerData');
            message.success('数据已清空');
          } else {
            // 普通用户，清空Supabase数据
            const data = await fetchVolunteers();
            for (const volunteer of data || []) {
              await deleteVolunteer(volunteer.id);
            }
            setVolunteers([]);
            message.success('数据已清空');
          }
        } catch (error) {
          console.error('清空数据失败:', error);
          message.error('清空数据失败，请重试');
        }
      }
    });
  };

  // 重置为默认数据
  const handleResetToDefault = async () => {
    Modal.confirm({
      title: '重置为默认数据',
      content: '确定要重置为默认的示例数据吗？当前数据将被覆盖！',
      onOk: async () => {
        try {
          if (isLocalAdmin()) {
            // 本地管理员，使用localStorage
            const defaultData = [
              {
                id: '1',
                volunteerNo: 'V001',
                name: '张三',
                phone: '13800138001',
                gender: '男',
                age: 25,
                type: '场馆服务' as const,
                serviceCount: 10,
                serviceHours: 50,
                serviceHours2025: 20,
                serviceScore: 100,
                explainScore: 0,
                bonusScore: 20,
                accumulateds: 120,
                totalscore: 120,
                redeemedscor: 30,
                remainingscor: 90,
                lastexplaindat: '',
                status: 'active' as const,
                registerdate: '2024-01-01',
                lastservicedat: '2025-01-15',
                remark: '示例数据'
              },
              {
                id: '2',
                volunteerNo: 'V002',
                name: '李四',
                phone: '13800138002',
                gender: '女',
                age: 28,
                type: '讲解服务',
                serviceCount: 15,
                serviceHours: 120,
                serviceHours2025: 30,
                serviceScore: 80,
                explainScore: 0,
                bonusScore: 20,
                accumulateds: 120,
                totalscore: 120,
                redeemedscor: 30,
                remainingscor: 90,
                lastexplaindat: '',
                status: 'active',
                registerdate: '2024-01-01',
                lastservicedat: '2025-01-15',
                remark: '示例数据'
              }
            ];
            setVolunteers(defaultData);
            localStorage.setItem('volunteerData', JSON.stringify(defaultData));
            message.success('已重置为默认数据');
          } else {
            // 普通用户，先清空再添加默认数据
            const data = await fetchVolunteers();
            for (const volunteer of data || []) {
              await deleteVolunteer(volunteer.id);
            }
            
            const defaultData = [
              {
                id: '1',
                volunteerNo: 'V001',
                name: '张三',
                phone: '13800138001',
                gender: '男',
                age: 25,
                type: '场馆服务' as const,
                serviceCount: 10,
                serviceHours: 50,
                serviceHours2025: 20,
                serviceScore: 100,
                explainScore: 0,
                bonusScore: 20,
                accumulateds: 120,
                totalscore: 120,
                redeemedscor: 30,
                remainingscor: 90,
                lastexplaindat: '',
                status: 'active' as const,
                registerdate: '2024-01-01',
                lastservicedat: '2025-01-15',
                remark: '示例数据'
              },
              {
                id: '2',
                volunteerNo: 'V002',
                name: '李四',
                phone: '13800138002',
                gender: '女',
                age: 28,
                type: '讲解服务',
                serviceCount: 15,
                serviceHours: 120,
                serviceHours2025: 30,
                serviceScore: 80,
                explainScore: 0,
                bonusScore: 20,
                accumulateds: 120,
                totalscore: 120,
                redeemedscor: 30,
                remainingscor: 90,
                lastexplaindat: '',
                status: 'active',
                registerdate: '2024-01-01',
                lastservicedat: '2025-01-15',
                remark: '示例数据'
              }
            ];
            
            for (const volunteer of defaultData) {
              await addVolunteer(volunteer);
            }
            
            const newData = await fetchVolunteers();
            setVolunteers(newData || []);
            message.success('已重置为默认数据');
          }
        } catch (error) {
          console.error('重置数据失败:', error);
          message.error('重置数据失败，请重试');
        }
      }
    });
  };

  // 导出数据备份
  const handleExportBackup = () => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        data: volunteers,
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      saveAs(blob, `志愿者数据备份_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.json`);
      
      message.success('数据备份导出成功！');
    } catch (error) {
      console.error('备份导出失败:', error);
      message.error('备份导出失败，请重试');
    }
  };

  // 导入数据备份
  const handleImportBackup = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const backupData = JSON.parse(event.target?.result as string);
          
          if (backupData.data && Array.isArray(backupData.data)) {
            Modal.confirm({
              title: '导入数据备份',
              content: `确定要导入备份数据吗？将覆盖当前所有数据！备份时间：${dayjs(backupData.timestamp).format('YYYY-MM-DD HH:mm:ss')}`,
              onOk: async () => {
                try {
                  if (isLocalAdmin()) {
                    // 本地管理员，使用localStorage
                    setVolunteers(backupData.data);
                    localStorage.setItem('volunteerData', JSON.stringify(backupData.data));
                    message.success('数据备份导入成功！');
                  } else {
                    // 普通用户，先清空再导入到Supabase
                    const currentData = await fetchVolunteers();
                    for (const volunteer of currentData || []) {
                      await deleteVolunteer(volunteer.id);
                    }
                    
                    for (const volunteer of backupData.data) {
                      await addVolunteer(volunteer);
                    }
                    
                    const newData = await fetchVolunteers();
                    setVolunteers(newData || []);
                    message.success('数据备份导入成功！');
                  }
                } catch (error) {
                  console.error('备份导入失败:', error);
                  message.error('备份导入失败，请重试');
                }
              }
            });
          } else {
            message.error('备份文件格式错误');
          }
        } catch (error) {
          console.error('备份导入失败:', error);
          message.error('备份文件解析失败，请检查文件格式');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // 导出Excel数据
  const handleExport = () => {
    try {
      // 准备数据
      const data = filteredVolunteers.map(v => ({
        志愿者编号: v.volunteerNo,
        姓名: v.name,
        电话: v.phone,
        性别: v.gender,
        年龄: v.age,
        服务类型: v.type,
        服务次数: v.serviceCount,
        总服务小时: `${v.serviceHours}小时`,
        服务时长2025: `${v.serviceHours2025}小时`,
        服务积分: v.serviceScore,
        讲解积分: v.explainScore,
        附加积分: v.bonusScore,
        累计获得积分: v.totalscore,
                  已兑换积分: v.redeemedscore,
          剩余积分: v.remainingscore,
        备注: v.remark || '',
        状态: v.status === 'active' ? '活跃' : v.status === 'inactive' ? '非活跃' : '需考核'
      }));

      // 创建工作簿
    const wb = XLSX.utils.book_new();
      
      // 创建工作表
      const ws = XLSX.utils.json_to_sheet(data);
      
      // 设置列宽
      const colWidths = [
        { wch: 10 }, // 志愿者编号
        { wch: 10 }, // 姓名
        { wch: 10 }, // 电话
        { wch: 8 },  // 性别
        { wch: 8 },  // 年龄
        { wch: 12 }, // 服务类型
        { wch: 10 }, // 服务次数
        { wch: 10 }, // 总服务小时
        { wch: 10 }, // 服务时长2025
        { wch: 10 }, // 服务积分
        { wch: 10 }, // 讲解积分
        { wch: 10 }, // 附加积分
        { wch: 10 }, // 累计获得积分
        { wch: 10 }, // 已兑换积分
        { wch: 10 }, // 剩余积分
        { wch: 30 }, // 备注
        { wch: 10 }  // 状态
      ];
      ws['!cols'] = colWidths;

      // 添加工作表到工作簿
    XLSX.utils.book_append_sheet(wb, ws, '志愿者数据');

      // 生成Excel文件并下载
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `志愿者数据_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);

      message.success('Excel文件导出成功！');
    } catch (error) {
      console.error('导出错误:', error);
      message.error('导出失败，请重试');
    }
  };

  // 时间筛选
  const handleTimeFilter = (type: string) => {
    const now = dayjs();
    let range: [dayjs.Dayjs, dayjs.Dayjs] | null = null;
    
    switch (type) {
      case 'today':
        range = [now.startOf('day'), now.endOf('day')];
        break;
      case 'week':
        range = [now.startOf('week'), now.endOf('week')];
        break;
      case 'month':
        range = [now.startOf('month'), now.endOf('month')];
        break;
      case 'year':
        range = [now.startOf('year'), now.endOf('year')];
        break;
      case 'custom':
        // 自定义时间范围
        break;
    }
    setTimeRange(range);
  };

  // 计算服务积分（根据服务时长）
  const calculateServiceScore = (serviceHours: number): number => {
    // 每4小时服务获得1积分
    // 例如：4小时=1积分，8小时=2积分，12小时=3积分
    return Math.floor(serviceHours / 4);
  };

  // 根据2025年服务时长和最后服务日期自动判定状态
  const determineStatusByServiceHours = (serviceHours2025: number, lastServiceDate: string): 'active' | 'inactive' | 'need_review' => {
    // 如果2025年服务时长为0，直接判定为非活跃
    if (serviceHours2025 === 0) {
      return 'inactive';
    }
    
    // 如果有最后服务日期，检查是否超过6个月没有服务
    if (lastServiceDate) {
      const lastService = dayjs(lastServiceDate);
      const now = dayjs();
      const monthsDiff = now.diff(lastService, 'month');
      
      // 如果超过6个月没有服务，判定为需考核
      if (monthsDiff >= 6) {
        return 'need_review';
      }
    }
    
    // 其他情况判定为活跃
    return 'active';
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      const serviceHours = values.serviceHours || 0;
      const serviceScore = calculateServiceScore(serviceHours);
      const explainScore = values.explainScore || 0;
      const bonusScore = values.bonusScore || 0; // 附加积分
      const totalScore = serviceScore + explainScore + bonusScore; // 总积分 = 服务积分 + 讲解积分 + 附加积分

      // 根据2025年服务时长和最后服务日期自动判定状态
      const autoStatus = determineStatusByServiceHours(parseInt(values.serviceHours2025) || 0, values.lastServiceDate || '');
      
      const newVolunteer: VolunteerData = {
        id: editingVolunteer?.id || Date.now().toString(),
        volunteerNo: values.volunteerNo || '', // 新增志愿者编号
        name: values.name,
        phone: values.phone || '', // 新增电话
        gender: values.gender,
        age: Number(values.age) || 0,
        type: values.type,
        serviceCount: parseInt(values.serviceCount) || 0, // 新增服务次数
        serviceHours: serviceHours,
        serviceHours2025: parseInt(values.serviceHours2025) || 0, // 新增服务时长2025
        serviceScore: serviceScore,
        explainScore: explainScore,
        bonusScore: bonusScore,
        accumulateds: parseInt(values.accumulateds) || 0, // 新增累计获得积分
        totalscore: totalScore,
        redeemedscore: values.redeemedScore || 0,
        remainingscore: totalScore - (values.redeemedScore || 0),
        lastexplaindat: values.lastExplainDate ? values.lastExplainDate.format('YYYY-MM-DD') : '',
        status: autoStatus, // 使用自动判定的状态
        registerdate: editingVolunteer?.registerdate || dayjs().format('YYYY-MM-DD'),
        lastservicedat: values.lastServiceDate || '',
        remark: values.remark || ''
      };

      if (editingVolunteer) {
        setVolunteers(prev => prev.map(v => v.id === editingVolunteer.id ? { ...v, ...newVolunteer } : v));
        message.success('更新成功');
      } else {
        setVolunteers(prev => [...prev, newVolunteer]);
        message.success('添加成功');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh'
    }}>
      {/* 页面标题 */}
      <div style={{ 
        marginBottom: '32px',
        textAlign: 'center',
        padding: '24px 0'
      }}>
        <Typography.Title 
          level={2} 
          style={{ 
            margin: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold'
          }}
        >
          🏆 志愿者管理系统
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
          高效管理志愿者信息，精准计算积分奖励
        </Typography.Text>
        {lastSaveTime && (
          <div style={{ 
            marginTop: '8px',
            padding: '8px 16px',
            background: 'rgba(82, 196, 26, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(82, 196, 26, 0.3)',
            display: 'inline-block'
          }}>
            <Text style={{ fontSize: '14px', color: '#52c41a' }}>
              💾 数据已自动保存 (最后保存: {lastSaveTime})
            </Text>
          </div>
        )}
      </div>

      {/* 统计卡片 */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                  👥 总志愿者数
                </span>
              }
              value={stats.total}
              valueStyle={{ 
                color: 'white', 
                fontSize: '32px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              prefix={<UserOutlined style={{ color: 'white', fontSize: '24px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                  ✅ 活跃志愿者
                </span>
              }
              value={stats.active}
              valueStyle={{ 
                color: 'white', 
                fontSize: '32px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              prefix={<UserOutlined style={{ color: 'white', fontSize: '24px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                  ⚠️ 需考核志愿者
                </span>
              }
              value={stats.needReview}
              valueStyle={{ 
                color: 'white', 
                fontSize: '32px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              prefix={<ExclamationCircleOutlined style={{ color: 'white', fontSize: '24px' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card 
            hoverable
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              border: 'none',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
            }}
            bodyStyle={{ padding: '24px' }}
          >
            <Statistic
              title={
                <span style={{ color: 'white', fontSize: '16px', fontWeight: '500' }}>
                  🏅 总积分
                </span>
              }
              value={stats.totalScore}
              valueStyle={{ 
                color: 'white', 
                fontSize: '32px', 
                fontWeight: 'bold',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              prefix={<TrophyOutlined style={{ color: 'white', fontSize: '24px' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 积分规则说明 */}
      <Card
        style={{ 
          marginBottom: '16px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: 'none',
          background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <TrophyOutlined style={{ color: 'white', fontSize: '20px' }} />
          </div>
          <Typography.Title level={4} style={{ margin: 0, color: '#2c3e50' }}>
            积分规则说明
          </Typography.Title>
        </div>
        <Row gutter={[16, 8]}>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#667eea',
                marginRight: '12px'
              }} />
              <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
                每4小时服务时长获得1积分
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#764ba2',
                marginRight: '12px'
              }} />
              <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
                讲解一场额外获得1积分
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#11998e',
                marginRight: '12px'
              }} />
              <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
                附加积分由工作人员手动添加
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f093fb',
                marginRight: '12px'
              }} />
              <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
                总积分 = 服务积分 + 讲解积分 + 附加积分
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff9a9e',
                marginRight: '12px'
              }} />
              <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
                积分在志愿服务完成并经管理员确认后自动计算
              </Text>
            </div>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#fecfef',
                marginRight: '12px'
              }} />
              <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
                超过6个月没有讲解，需要重新考核
              </Text>
            </div>
          </Col>
          <Col xs={24}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f5576c',
                marginRight: '12px'
              }} />
              <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
                积分可以兑换奖品，使用后总积分自动更新
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* 状态规则说明 */}
      <Card
        style={{ 
          marginBottom: '32px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: 'none',
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <CheckCircleOutlined style={{ color: 'white', fontSize: '20px' }} />
          </div>
          <Typography.Title level={4} style={{ margin: 0, color: '#2c3e50' }}>
            状态判定规则
          </Typography.Title>
        </div>
        <Row gutter={[16, 8]}>
          <Col xs={24} md={8}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px',
              padding: '12px',
              background: 'rgba(82, 196, 26, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(82, 196, 26, 0.3)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#52c41a',
                marginRight: '12px'
              }} />
              <div>
                <Text strong style={{ fontSize: '14px', color: '#52c41a' }}>活跃状态</Text>
                <br />
                <Text style={{ fontSize: '12px', color: '#666' }}>服务时长 ≥ 10小时</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px',
              padding: '12px',
              background: 'rgba(250, 173, 20, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(250, 173, 20, 0.3)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#faad14',
                marginRight: '12px'
              }} />
              <div>
                <Text strong style={{ fontSize: '14px', color: '#faad14' }}>需考核状态</Text>
                <br />
                <Text style={{ fontSize: '12px', color: '#666' }}>服务时长 &lt; 10小时</Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px',
              padding: '12px',
              background: 'rgba(255, 77, 79, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 77, 79, 0.3)'
            }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#ff4d4f',
                marginRight: '12px'
              }} />
              <div>
                <Text strong style={{ fontSize: '14px', color: '#ff4d4f' }}>非活跃状态</Text>
                <br />
                <Text style={{ fontSize: '12px', color: '#666' }}>服务时长 = 0小时</Text>
              </div>
            </div>
          </Col>
        </Row>
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(102, 126, 234, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <Text style={{ fontSize: '14px', color: '#2c3e50' }}>
            💡 <strong>说明：</strong>状态会根据服务时长自动判定，无需手动设置。您可以使用"更新状态"按钮重新计算所有志愿者的状态。
          </Text>
        </div>
      </Card>

      {/* 操作栏 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col>
            <Card size="small" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ fontSize: '14px', color: '#262626' }}>数据管理</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />} 
                    onClick={handleAdd}
                    size="small"
                    style={{ borderRadius: '6px' }}
                  >
                    新增志愿者
                  </Button>
                  <Button 
                    icon={<FileExcelOutlined />} 
                    onClick={handleBatchImport}
                    size="small"
                    style={{ borderRadius: '6px' }}
                  >
                    导入Excel
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleDownloadTemplate}
                    size="small"
                    style={{ borderRadius: '6px' }}
                  >
                    下载模板
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={handleBatchDelete}
                    disabled={selectedRowKeys.length === 0}
                    size="small"
                    style={{ borderRadius: '6px' }}
                  >
                    批量删除 ({selectedRowKeys.length})
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleBatchUpdateStatus}
                    size="small"
                    style={{ borderRadius: '6px' }}
                    title="根据服务时长重新计算所有志愿者状态"
                  >
                    更新状态
                  </Button>
                  <Button 
                    icon={<DownloadOutlined />} 
                    onClick={handleExportBackup}
                    size="small"
                    style={{ borderRadius: '6px' }}
                    title="导出数据备份"
                  >
                    导出备份
                  </Button>
                  <Button 
                    icon={<UploadOutlined />} 
                    onClick={handleImportBackup}
                    size="small"
                    style={{ borderRadius: '6px' }}
                    title="导入数据备份"
                  >
                    导入备份
                  </Button>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={handleResetToDefault}
                    size="small"
                    style={{ borderRadius: '6px' }}
                    title="重置为默认数据"
                  >
                    重置数据
                  </Button>
                  <Button 
                    danger
                    icon={<DeleteOutlined />} 
                    onClick={handleClearAllData}
                    size="small"
                    style={{ borderRadius: '6px' }}
                    title="清空所有数据"
                  >
                    清空数据
                  </Button>
                  <Button 
                    icon={<CloudUploadOutlined />} 
                    onClick={async () => {
                      try {
                        await cloudSync.syncLocalToCloud();
                        message.success('数据已同步到云端');
                      } catch (error) {
                        message.error('云端同步失败');
                      }
                    }}
                    size="small"
                    style={{ borderRadius: '6px' }}
                    title="同步到云端"
                  >
                    云端同步
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
          <Col flex="auto">
            <Card size="small" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SearchOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ fontSize: '14px', color: '#262626' }}>搜索</Text>
                </div>
                <Search
                  placeholder="搜索志愿者姓名或手机号"
                  allowClear
                  onSearch={setSearchText}
                  style={{ width: '100%', borderRadius: '6px' }}
                  size="small"
                />
              </Space>
            </Card>
          </Col>
          <Col>
            <Card size="small" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ fontSize: '14px', color: '#262626' }}>时间范围</Text>
                </div>
                <RangePicker 
                  size="small"
                  onChange={(dates) => {
                    setTimeRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                    if (dates) {
                      message.success('已设置时间范围');
                    }
                  }}
                  placeholder={['开始日期', '结束日期']}
                  style={{ borderRadius: '6px', width: '100%' }}
                  format="YYYY-MM-DD"
                  ranges={{
                    '今日': [dayjs().startOf('day'), dayjs().endOf('day')],
                    '本周': [dayjs().startOf('week'), dayjs().endOf('week')],
                    '本月': [dayjs().startOf('month'), dayjs().endOf('month')],
                    '本年': [dayjs().startOf('year'), dayjs().endOf('year')],
                  }}
                  onCalendarChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      message.success('已设置时间范围');
                    }
                  }}
                />
              </Space>
            </Card>
          </Col>
          <Col>
            <Card size="small" style={{ background: '#f8f9fa', border: '1px solid #e9ecef' }}>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FilterOutlined style={{ color: '#1890ff' }} />
                  <Text strong style={{ fontSize: '14px', color: '#262626' }}>数据操作</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <Select
                    placeholder="类型筛选"
                    style={{ width: 120, borderRadius: '6px' }}
                    onChange={setFilterType}
                    value={filterType}
                    size="small"
                  >
                    <Option value="all">全部</Option>
                    <Option value="场馆服务">场馆服务</Option>
                    <Option value="讲解服务">讲解服务</Option>
                  </Select>
                  <Button 
                    icon={<ReloadOutlined />} 
                    size="small"
                    style={{ borderRadius: '6px' }}
                  >
                    刷新
                  </Button>
                  <Button 
                    icon={<FileExcelOutlined />} 
                    onClick={handleExport}
                    size="small"
                    type="primary"
                    style={{ borderRadius: '6px' }}
                  >
                    导出Excel
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 数据表格 */}
      <Card
        style={{ 
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: 'none',
          background: 'white'
        }}
        bodyStyle={{ padding: '24px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Typography.Title level={4} style={{ margin: 0, color: '#2c3e50' }}>
            📊 志愿者数据列表
          </Typography.Title>
          <Typography.Text type="secondary">
            共 {filteredVolunteers.length} 条记录
          </Typography.Text>
        </div>
        <Table
        columns={columns}
          dataSource={filteredVolunteers}
        rowKey="id"
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          style={{
            borderRadius: '12px',
            overflow: 'hidden'
          }}
          pagination={{
            total: filteredVolunteers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/总共 ${total} 条`,
            style: {
              marginTop: '16px',
              textAlign: 'center'
            }
          }}
          scroll={{ x: 1200 }}
          className="volunteer-table"
        />
      </Card>

      {/* 新增/编辑模态框 */}
      <Modal
        title={editingVolunteer ? '编辑志愿者' : '新增志愿者'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={editingVolunteer ? {
            ...editingVolunteer,
            lastexplaindat: editingVolunteer.lastexplaindat ? dayjs(editingVolunteer.lastexplaindat) : null,
            serviceHours2025: editingVolunteer.serviceHours2025 || 0, // 新增服务时长2025
            accumulateds: editingVolunteer.accumulateds || 0, // 新增累计获得积分
          } : {
            status: 'active',
            serviceHours: 0,
            explainScore: 0,
            bonusScore: 0,
            volunteerNo: '', // 新增志愿者编号
            phone: '', // 新增电话
            serviceCount: 0, // 新增服务次数
            serviceHours2025: 0, // 新增服务时长2025
            accumulateds: 0, // 新增累计获得积分
            remark: ''
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="volunteerNo"
                label="志愿者编号"
                rules={[{ required: true, message: '请输入志愿者编号' }]}
              >
                <Input placeholder="请输入志愿者编号" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="电话"
                rules={[{ required: true, message: '请输入电话' }]}
              >
                <Input placeholder="请输入电话" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="性别"
                rules={[{ required: true, message: '请选择性别' }]}
              >
                <Select placeholder="请选择性别">
                  <Option value="男">男</Option>
                  <Option value="女">女</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="age"
                label="年龄"
                rules={[{ required: true, message: '请输入年龄' }]}
              >
                <InputNumber
                  min={16}
                  max={70}
                  placeholder="请输入年龄"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="type"
                label="服务类型"
                rules={[{ required: true, message: '请选择服务类型' }]}
              >
                <Select placeholder="请选择服务类型">
                  <Option value="场馆服务">场馆服务</Option>
                  <Option value="讲解服务">讲解服务</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="serviceCount"
                label="服务次数"
                rules={[{ required: true, message: '请输入服务次数' }]}
              >
                <InputNumber
                  min={0}
                  placeholder="请输入服务次数"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="serviceHours"
                label="服务时长（小时）"
              >
            <InputNumber
                  min={0}
                  placeholder="请输入服务时长"
              style={{ width: '100%' }}
            />
          </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="serviceHours2025"
                label="服务时长2025"
              >
            <InputNumber
                  min={0}
                  placeholder="请输入服务时长2025"
              style={{ width: '100%' }}
            />
          </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="accumulateds"
                label="累计获得积分"
              >
                <InputNumber
                  min={0}
                  placeholder="请输入累计获得积分"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="explainScore"
                label="讲解积分"
              >
                <InputNumber
                  min={0}
                  placeholder="请输入讲解积分"
                  style={{ width: '100%' }}
                />
          </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="bonusScore"
                label="附加积分"
                tooltip="由工作人员手动添加的积分"
              >
            <InputNumber
                  min={0}
                  placeholder="请输入附加积分"
              style={{ width: '100%' }}
            />
          </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="redeemedScore"
                label="已兑换积分"
              >
                <InputNumber
                  min={0}
                  placeholder="请输入已兑换积分"
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="lastExplainDate"
                label="最后讲解日期"
              >
                <DatePicker style={{ width: '100%' }} placeholder="选择日期" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                name="remark"
                label="备注"
              >
            <Input.TextArea
                  placeholder="请输入备注信息"
                  rows={3}
                  maxLength={200}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingVolunteer ? '更新' : '添加'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>


    </div>
  );
};

export default VolunteerPage; 