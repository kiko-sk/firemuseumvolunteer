import React, { useState, useEffect } from 'react';
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
  Upload, 
  Image, 
  message, 
  Popconfirm,
  Tooltip,
  Typography
} from 'antd';
import { 
  GiftOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  ExportOutlined, 
  UploadOutlined,
  EyeOutlined,
  PictureOutlined,
  HistoryOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ImportOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { fetchGifts, addGift, updateGift, deleteGift } from '../../utils/supabaseGift';

const { Text } = Typography;
const { Option } = Select;

interface GiftData {
  id: string;
  name: string;
  category: string;
  points: number;
  stock: number;
  exchanged: number;
  image?: string;
  description?: string;
  status: 'active' | 'inactive';
  createTime: string;
  updateTime: string;
}

interface ExchangeRecord {
  id: string;
  giftId: string;
  giftName: string;
  volunteerName: string;
  volunteerPhone: string;
  pointsUsed: number;
  exchangeTime: string;
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
}

const GiftPage: React.FC = () => {
  const [gifts, setGifts] = useState<GiftData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGift, setEditingGift] = useState<GiftData | null>(null);
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [exchangeRecords, setExchangeRecords] = useState<ExchangeRecord[]>([]);
  const [exchangeHistoryVisible, setExchangeHistoryVisible] = useState(false);
  const [currentGift, setCurrentGift] = useState<GiftData | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<string>('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

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

  // 加载礼品数据（云端或本地）
  useEffect(() => {
    const loadData = async () => {
      if (isLocalAdmin()) {
        const savedData = localStorage.getItem('giftData');
        if (savedData) {
          try {
            setGifts(JSON.parse(savedData));
          } catch {
            setGifts([]);
          }
        } else {
          setGifts([]);
        }
      } else {
        try {
          const data = await fetchGifts();
          setGifts(data || []);
        } catch (e) {
          message.error('加载云端数据失败');
          setGifts([]);
        }
      }
    };
    loadData();
  }, []);

  // 新增礼品
  const handleAddGift = async (gift: GiftData) => {
    try {
      if (isLocalAdmin()) {
        const newData = [...gifts, gift];
        setGifts(newData);
        localStorage.setItem('giftData', JSON.stringify(newData));
      } else {
        await addGift(gift);
        const data = await fetchGifts();
        setGifts(data || []);
      }
      message.success('添加成功');
    } catch (e) {
      message.error('添加失败');
    }
  };

  // 编辑礼品
  const handleEditGift = async (id: string, gift: GiftData) => {
    try {
      if (isLocalAdmin()) {
        const newData = gifts.map(g => g.id === id ? { ...g, ...gift } : g);
        setGifts(newData);
        localStorage.setItem('giftData', JSON.stringify(newData));
      } else {
        await updateGift(id, gift);
        const data = await fetchGifts();
        setGifts(data || []);
      }
      message.success('编辑成功');
    } catch (e) {
      message.error('编辑失败');
    }
  };

  // 删除礼品
  const handleDeleteGift = async (id: string) => {
    try {
      if (isLocalAdmin()) {
        const newData = gifts.filter(g => g.id !== id);
        setGifts(newData);
        localStorage.setItem('giftData', JSON.stringify(newData));
      } else {
        await deleteGift(id);
        const data = await fetchGifts();
        setGifts(data || []);
      }
      message.success('删除成功');
    } catch (e) {
      message.error('删除失败');
    }
  };

  // 模拟兑换历史数据
  useEffect(() => {
    const mockExchangeRecords: ExchangeRecord[] = [
      {
        id: '1',
        giftId: '1',
        giftName: '消防主题T恤',
        volunteerName: '张三',
        volunteerPhone: '13800138001',
        pointsUsed: 500,
        exchangeTime: '2024-01-20 14:30:00',
        status: 'completed',
        notes: '正常兑换'
      },
      {
        id: '2',
        giftId: '1',
        giftName: '消防主题T恤',
        volunteerName: '李四',
        volunteerPhone: '13800138002',
        pointsUsed: 500,
        exchangeTime: '2024-01-19 16:20:00',
        status: 'completed',
        notes: '正常兑换'
      },
      {
        id: '3',
        giftId: '2',
        giftName: '消防知识书籍',
        volunteerName: '王五',
        volunteerPhone: '13800138003',
        pointsUsed: 300,
        exchangeTime: '2024-01-18 10:15:00',
        status: 'completed',
        notes: '正常兑换'
      },
      {
        id: '4',
        giftId: '2',
        giftName: '消防知识书籍',
        volunteerName: '赵六',
        volunteerPhone: '13800138004',
        pointsUsed: 300,
        exchangeTime: '2024-01-17 09:45:00',
        status: 'completed',
        notes: '正常兑换'
      },
      {
        id: '5',
        giftId: '3',
        giftName: '消防车模型',
        volunteerName: '孙七',
        volunteerPhone: '13800138005',
        pointsUsed: 800,
        exchangeTime: '2024-01-16 15:30:00',
        status: 'completed',
        notes: '正常兑换'
      },
      {
        id: '6',
        giftId: '4',
        giftName: '消防员徽章',
        volunteerName: '周八',
        volunteerPhone: '13800138006',
        pointsUsed: 200,
        exchangeTime: '2024-01-15 11:20:00',
        status: 'completed',
        notes: '正常兑换'
      }
    ];
    setExchangeRecords(mockExchangeRecords);
  }, []);

  // 下载导入模板
  const handleDownloadTemplate = () => {
    const templateData = [
      ['礼品名称', '类别', '所需积分', '库存', '描述', '状态'],
      ['消防主题T恤', '服装', '500', '50', '印有消防主题图案的舒适T恤', '上架'],
      ['消防知识书籍', '书籍', '300', '30', '消防安全知识普及读物', '上架'],
      ['消防车模型', '玩具', '200', '100', '精美的消防车玩具模型', '上架']
    ];

    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '礼品导入模板');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `礼品导入模板_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    
    message.success('模板下载成功！');
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
      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          const validData: any[] = [];
          const errors: string[] = [];
          let skippedRows = 0;

          // 调试：打印所有列名
          if (jsonData.length > 0) {
            console.log('Excel表格的列名:', Object.keys(jsonData[0] as object));
          }

          // 增强的获取列值函数
          const getColumnValue = (sourceRow: any, columnName: string, isNumeric: boolean = false) => {
            const possibleNames = [
              columnName,
              columnName.trim(),
              columnName.replace(/\s+/g, ''),
              columnName.replace(/\s+/g, ' ').trim()
            ];

            for (const name of possibleNames) {
              if (sourceRow[name] !== undefined && sourceRow[name] !== null && sourceRow[name] !== '') {
                return sourceRow[name];
              }
            }
            return isNumeric ? 0 : '';
          };
          
          jsonData.forEach((row: any, index: number) => {
            try {
              // 调试信息
              console.log(`处理第${index + 1}行数据:`, row);
              console.log(`第${index + 1}行的所有字段:`, Object.keys(row));
              
              // 检查是否为完全空行（所有字段都为空）
              const allFieldsEmpty = Object.values(row).every(value => 
                value === null || value === undefined || value === ''
              );
              
              // 如果是完全空行，直接跳过，不报错
              if (allFieldsEmpty) {
                console.log(`第${index + 1}行为空行，已跳过`);
                skippedRows++;
                return;
              }
              
              // 获取必填字段的值
              const name = getColumnValue(row, '礼品名称');
              const category = getColumnValue(row, '类别');
              const points = parseInt(getColumnValue(row, '所需积分', true) as string) || 0;
              const stock = parseInt(getColumnValue(row, '库存', true) as string) || 0;
              
              // 验证必填字段
              if (!name || !category || points <= 0) {
                console.error(`第${index + 1}行缺少必填字段:`, {
                  '礼品名称': name,
                  '类别': category,
                  '所需积分': points,
                  '可用字段': Object.keys(row)
                });
                errors.push(`第${index + 1}行：礼品名称、类别和所需积分为必填项`);
                return;
              }

              // 验证类别格式 - 移除限制，允许任意类别
              if (!category) {
                errors.push(`第${index + 1}行：类别不能为空`);
                return;
              }

              // 验证积分和库存
              if (points < 1) {
                errors.push(`第${index + 1}行：所需积分必须大于0`);
                return;
              }

              if (stock < 0) {
                errors.push(`第${index + 1}行：库存不能为负数`);
                return;
              }

              // 转换数据
              const status = getColumnValue(row, '状态') === '下架' ? 'inactive' : 'active';
              const description = getColumnValue(row, '描述') as string;
              
              // 构造 gift 对象时不包含 id 字段，交由数据库自动生成
              // 如果 Excel 行里有 id 字段，自动忽略
              const { id: _ignoredId, ...rowWithoutId } = row;
              const gift = {
                name: getColumnValue(rowWithoutId, '礼品名称') as string,
                category: getColumnValue(rowWithoutId, '类别') as string,
                points: parseInt(getColumnValue(rowWithoutId, '所需积分', true) as string) || 0,
                stock: parseInt(getColumnValue(rowWithoutId, '库存', true) as string) || 0,
                exchanged: 0, // 新导入的礼品，已兑换数量为0
                image: '', // 新导入的礼品，暂时没有图片
                description: getColumnValue(rowWithoutId, '描述') as string,
                status: getColumnValue(rowWithoutId, '状态') === '下架' ? 'inactive' : 'active',
                createTime: dayjs().format('YYYY-MM-DD'),
                updateTime: dayjs().format('YYYY-MM-DD')
              };
              // gift 对象本身没有 id 字段，直接 push 即可
              console.log('handleBatchImport - 处理后的 gift:', gift);
              validData.push(gift);
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
            content: `将导入 ${validData.length} 条礼品数据，跳过 ${skippedRows} 条空行，是否继续？`,
            onOk: async () => {
              try {
                if (isLocalAdmin()) {
                  // 本地管理员，使用localStorage
                  const newData = [...gifts, ...validData];
                  setGifts(newData);
                  localStorage.setItem('giftData', JSON.stringify(newData));
                  setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
                } else {
                  // 普通用户，批量写入Supabase
                  for (const gift of validData) {
                    // 再保险：addGift 前剥离 id 字段
                    const { id: _id, ...giftWithoutId } = gift;
                    await addGift(giftWithoutId);
                  }
                  // 重新加载数据
                  const data = await fetchGifts();
                  setGifts(data || []);
                }
                message.success(`成功导入 ${validData.length} 条数据，跳过 ${skippedRows} 条空行！`);
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

  // 导出Excel数据
  const handleExport = async () => {
    try {
      let exportData: GiftData[] = [];
      
      if (isLocalAdmin()) {
        // 本地管理员，从localStorage导出
        exportData = gifts;
      } else {
        // 普通用户，从Supabase获取最新数据
        try {
          exportData = await fetchGifts() || [];
        } catch (error) {
          console.error('获取云端数据失败:', error);
          message.error('获取云端数据失败，使用本地数据导出');
          exportData = gifts;
        }
      }

      // 准备数据
      const data = exportData.map(gift => ({
        '礼品ID': gift.id,
        '礼品名称': gift.name,
        '类别': gift.category,
        '所需积分': gift.points,
        '库存': gift.stock,
        '已兑换': gift.exchanged,
        '状态': gift.status === 'active' ? '上架' : '下架',
        '描述': gift.description || '',
        '创建时间': gift.createTime,
        '更新时间': gift.updateTime
      }));

      // 创建工作簿和工作表
      const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, '礼品数据');

      // 生成Excel文件并下载
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `礼品数据_${dayjs().format('YYYY-MM-DD_HH-mm-ss')}.xlsx`);

      message.success('Excel文件导出成功！');
    } catch (error) {
      console.error('导出错误:', error);
      message.error('导出失败，请重试');
    }
  };

  // 添加礼品
  const handleAdd = () => {
    setEditingGift(null);
    setModalVisible(true);
    setImageUrl('');
    setFileList([]);
    form.resetFields();
  };

  // 编辑礼品
  const handleEdit = (gift: GiftData) => {
    setEditingGift(gift);
    setModalVisible(true);
    setImageUrl(gift.image || '');
    setFileList(gift.image ? [{ uid: '-1', name: 'image.jpg', status: 'done', url: gift.image }] : []);
    form.setFieldsValue({
      ...gift,
      image: gift.image ? [{ uid: '-1', name: 'image.jpg', status: 'done', url: gift.image }] : []
    });
  };

  // 删除礼品
  const handleDelete = async (id: string) => {
    try {
      if (isLocalAdmin()) {
        // 本地管理员，使用localStorage
        const newData = gifts.filter(gift => gift.id !== id);
        setGifts(newData);
        localStorage.setItem('giftData', JSON.stringify(newData));
        setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
      } else {
        // 普通用户，删除Supabase数据
        await deleteGift(id);
        const data = await fetchGifts();
        setGifts(data || []);
      }
      message.success('删除成功');
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请重试');
    }
  };

  // 查看兑换历史
  const handleViewExchangeHistory = (gift: GiftData) => {
    setCurrentGift(gift);
    setExchangeHistoryVisible(true);
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的礼品');
      return;
    }

    Modal.confirm({
      title: '确认批量删除',
      content: `确定要删除选中的 ${selectedRowKeys.length} 个礼品吗？此操作不可恢复！`,
      onOk: async () => {
        try {
          if (isLocalAdmin()) {
            // 本地管理员，使用localStorage
            const newData = gifts.filter(gift => !selectedRowKeys.includes(gift.id));
            setGifts(newData);
            localStorage.setItem('giftData', JSON.stringify(newData));
            setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
          } else {
            // 普通用户，批量删除Supabase数据
            for (const id of selectedRowKeys) {
              await deleteGift(id as string);
            }
            // 重新加载数据
            const data = await fetchGifts();
            setGifts(data || []);
          }
          setSelectedRowKeys([]);
          message.success(`成功删除 ${selectedRowKeys.length} 个礼品！`);
        } catch (error) {
          console.error('批量删除失败:', error);
          message.error('批量删除失败，请重试');
        }
      }
    });
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      const giftData: GiftData = {
        id: editingGift?.id || Date.now().toString(),
        name: values.name,
        category: values.category,
        points: values.points,
        stock: values.stock,
        exchanged: editingGift?.exchanged || 0,
        image: imageUrl,
        description: values.description,
        status: values.status || 'active',
        createTime: editingGift?.createTime || dayjs().format('YYYY-MM-DD'),
        updateTime: dayjs().format('YYYY-MM-DD')
      };

      if (editingGift) {
        // 编辑模式
        if (isLocalAdmin()) {
          // 本地管理员，使用localStorage
          const newData = gifts.map(g => g.id === editingGift.id ? { ...g, ...giftData } : g);
          setGifts(newData);
          localStorage.setItem('giftData', JSON.stringify(newData));
          setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        } else {
          // 普通用户，更新Supabase数据
          await updateGift(editingGift.id, giftData);
          const data = await fetchGifts();
          setGifts(data || []);
        }
        message.success('更新成功');
      } else {
        // 新增模式
        if (isLocalAdmin()) {
          // 本地管理员，使用localStorage
          const newData = [...gifts, giftData];
          setGifts(newData);
          localStorage.setItem('giftData', JSON.stringify(newData));
          setLastSaveTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
        } else {
          // 普通用户，添加到Supabase
          await addGift(giftData);
          const data = await fetchGifts();
          setGifts(data || []);
        }
        message.success('添加成功');
      }
      
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败，请重试');
    }
  };

  // 图片上传处理
  const uploadProps: UploadProps = {
    name: 'file',
    listType: 'picture-card',
    fileList: fileList,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传 JPG/PNG 格式的图片!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过 2MB!');
        return false;
      }
      return false; // 阻止自动上传
    },
    onChange: (info) => {
      setFileList(info.fileList);
      if (info.fileList.length > 0) {
        const file = info.fileList[0];
        if (file.originFileObj) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setImageUrl(e.target?.result as string);
          };
          reader.readAsDataURL(file.originFileObj);
        } else if (file.url) {
          setImageUrl(file.url);
        }
    } else {
        setImageUrl('');
      }
    },
    onRemove: () => {
      setImageUrl('');
      setFileList([]);
    }
  };

  const columns = [
    {
      title: '礼品图片',
      dataIndex: 'image',
      key: 'image',
      width: 100,
      render: (image: string, record: GiftData) => (
        <div style={{ textAlign: 'center' }}>
          {image ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Image
                width={60}
                height={60}
                src={image}
                alt={record.name}
                style={{ objectFit: 'cover', borderRadius: '4px' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
              />
              <Tooltip title="点击更换图片">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0';
                  }}
                  onClick={() => {
                    handleEdit(record);
                    setImageUrl(image);
                    setFileList([{
                      uid: 'current',
                      name: 'current.jpg',
                      status: 'done',
                      url: image
                    }]);
                  }}
                />
              </Tooltip>
            </div>
          ) : (
            <div style={{ 
              width: 60, 
              height: 60, 
              background: '#f5f5f5', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            onClick={() => {
              handleEdit(record);
            }}
            >
              <PictureOutlined style={{ fontSize: 20, color: '#d9d9d9' }} />
            </div>
          )}
        </div>
      )
    },
    {
      title: '礼品名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (text: string, record: GiftData) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.description && (
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.description.length > 20 ? record.description.substring(0, 20) + '...' : record.description}
            </Text>
          )}
        </div>
      )
    },
    {
      title: '类别',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category: string) => {
        // 为任意类别分配颜色
        const getCategoryColor = (cat: string) => {
          const colorMap: { [key: string]: string } = {
            '服装': 'blue',
            '书籍': 'green',
            '玩具': 'orange',
            '纪念品': 'purple',
            '电子产品': 'cyan',
            '其他': 'default'
          };
          
          // 如果类别在预定义映射中，使用对应颜色
          if (colorMap[cat]) {
            return colorMap[cat];
          }
          
          // 为未知类别生成基于字符串的固定颜色
          const colors = ['magenta', 'lime', 'geekblue', 'volcano', 'gold', 'processing'];
          const index = cat.charCodeAt(0) % colors.length;
          return colors[index];
        };
        
        return (
          <Tag color={getCategoryColor(category)}>
            {category}
          </Tag>
        );
      }
    },
    {
      title: '所需积分',
      dataIndex: 'points',
      key: 'points',
      width: 100,
      render: (points: number) => (
        <Tag color="orange" icon={<DollarOutlined />}>
          {points}
        </Tag>
      )
    },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      width: 80,
      render: (stock: number) => (
        <span style={{ color: stock > 10 ? '#52c41a' : stock > 0 ? '#faad14' : '#ff4d4f' }}>
          {stock}
        </span>
      )
    },
    {
      title: '已兑换',
      dataIndex: 'exchanged',
      key: 'exchanged',
      width: 100,
      render: (exchanged: number) => (
        <span style={{ color: '#722ed1' }}>{exchanged}</span>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '上架' : '下架'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
             render: (_: any, record: GiftData) => (
        <Space size="small">
          <Tooltip title="编辑">
            <Button 
              type="link" 
              icon={<EditOutlined />} 
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="查看详情">
            <Button 
              type="link" 
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: record.name,
                  width: 600,
                  content: (
                    <div>
                      {record.image && (
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                          <Image
                            width={200}
                            src={record.image}
                            alt={record.name}
                          />
                        </div>
                      )}
                      <p><strong>描述：</strong>{record.description || '暂无描述'}</p>
                      <p><strong>类别：</strong>{record.category}</p>
                      <p><strong>所需积分：</strong>{record.points}</p>
                      <p><strong>库存：</strong>{record.stock}</p>
                      <p><strong>已兑换：</strong>{record.exchanged}</p>
                      <p><strong>创建时间：</strong>{record.createTime}</p>
                      <p><strong>更新时间：</strong>{record.updateTime}</p>
                    </div>
                  )
                });
              }}
            />
          </Tooltip>
          <Tooltip title="兑换历史">
            <Button 
              type="link" 
              icon={<HistoryOutlined />}
              onClick={() => handleViewExchangeHistory(record)}
            />
          </Tooltip>
          <Popconfirm
            title="确定要删除这个礼品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除">
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const totalGifts = gifts.length;
  const totalStock = gifts.reduce((sum, gift) => sum + gift.stock, 0);
  const totalExchanged = gifts.reduce((sum, gift) => sum + gift.exchanged, 0);
  const activeGifts = gifts.filter(gift => gift.status === 'active').length;

  return (
    <div style={{ padding: '24px' }}>
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
          🎁 礼品管理系统
        </Typography.Title>
        <Typography.Text type="secondary" style={{ fontSize: '16px' }}>
          高效管理礼品信息，精准控制库存兑换
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
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="礼品总数"
              value={totalGifts}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="上架礼品"
              value={activeGifts}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总库存"
              value={totalStock}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已兑换"
              value={totalExchanged}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 礼品管理表格 */}
      <Card 
        title="礼品管理" 
        extra={
          <Space>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleDownloadTemplate}
            >
              下载模板
            </Button>
            <Button 
              icon={<ImportOutlined />} 
              onClick={handleBatchImport}
            >
              批量导入
            </Button>
            <Button 
              icon={<ExportOutlined />} 
              onClick={handleExport}
            >
              导出Excel
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button 
                danger
                icon={<DeleteOutlined />} 
                onClick={handleBatchDelete}
              >
                批量删除 ({selectedRowKeys.length})
              </Button>
            )}
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              添加礼品
            </Button>
          </Space>
        }
      >
        <Table 
          columns={columns} 
          dataSource={gifts} 
        rowKey="id"
        rowSelection={{
          selectedRowKeys,
            onChange: (newSelectedRowKeys) => {
              setSelectedRowKeys(newSelectedRowKeys);
            },
          }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
          }}
        />
      </Card>

      {/* 添加/编辑礼品弹窗 */}
      <Modal
        title={editingGift ? '编辑礼品' : '添加礼品'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ status: 'active' }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="礼品名称"
                rules={[{ required: true, message: '请输入礼品名称' }]}
              >
                <Input placeholder="请输入礼品名称" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="category"
                label="礼品类别"
                rules={[{ required: true, message: '请输入礼品类别' }]}
              >
                <Select 
                  placeholder="请选择或输入礼品类别"
                  showSearch
                  allowClear
                  mode="tags"
                  style={{ width: '100%' }}
                  filterOption={(input, option) =>
                    (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="服装">服装</Option>
                  <Option value="书籍">书籍</Option>
                  <Option value="玩具">玩具</Option>
                  <Option value="纪念品">纪念品</Option>
                  <Option value="电子产品">电子产品</Option>
                  <Option value="其他">其他</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="points"
                label="所需积分"
                rules={[{ required: true, message: '请输入所需积分' }]}
              >
                <InputNumber 
                  min={1} 
                  placeholder="请输入所需积分" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="stock"
                label="库存数量"
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber 
                  min={0} 
                  placeholder="请输入库存数量" 
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="description"
            label="礼品描述"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="请输入礼品描述（可选）"
            />
          </Form.Item>

          <Form.Item
            name="image"
            label="礼品图片"
          >
            <div>
              <Upload {...uploadProps}>
                {fileList.length < 1 && (
                  <div>
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>上传图片</div>
                  </div>
                )}
              </Upload>
              
              {/* 图片预览 */}
              {imageUrl && (
                <div style={{ marginTop: 16 }}>
                  <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
                    当前图片预览：
                  </Typography.Text>
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <Image
                      width={120}
                      height={120}
                      src={imageUrl}
                      alt="礼品图片预览"
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        background: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '50%',
                        width: 24,
                        height: 24,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onClick={() => {
                        setImageUrl('');
                        setFileList([]);
                        form.setFieldsValue({ image: '' });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value="active">上架</Option>
              <Option value="inactive">下架</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingGift ? '更新' : '添加'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 兑换历史弹窗 */}
      <Modal
        title={
          <div>
            <HistoryOutlined style={{ marginRight: 8 }} />
            {currentGift?.name} - 兑换历史
          </div>
        }
        open={exchangeHistoryVisible}
        onCancel={() => setExchangeHistoryVisible(false)}
        footer={null}
        width={800}
      >
        {currentGift && (
          <div>
            {/* 礼品信息摘要 */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="总兑换次数"
                    value={exchangeRecords.filter(record => record.giftId === currentGift.id).length}
                    prefix={<GiftOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="总消耗积分"
                    value={exchangeRecords
                      .filter(record => record.giftId === currentGift.id)
                      .reduce((sum, record) => sum + record.pointsUsed, 0)
                    }
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="当前库存"
                    value={currentGift.stock}
                    prefix={<ShoppingCartOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="已兑换"
                    value={currentGift.exchanged}
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* 兑换记录表格 */}
            <Table
              columns={[
                {
                  title: '志愿者姓名',
                  dataIndex: 'volunteerName',
                  key: 'volunteerName',
                  width: 120,
                  render: (text: string) => (
                    <Space>
                      <UserOutlined />
                      {text}
                    </Space>
                  )
                },
                {
                  title: '手机号',
                  dataIndex: 'volunteerPhone',
                  key: 'volunteerPhone',
                  width: 130
                },
                {
                  title: '消耗积分',
                  dataIndex: 'pointsUsed',
                  key: 'pointsUsed',
                  width: 100,
                  render: (points: number) => (
                    <Tag color="orange" icon={<DollarOutlined />}>
                      {points}
                    </Tag>
                  )
                },
                {
                  title: '兑换时间',
                  dataIndex: 'exchangeTime',
                  key: 'exchangeTime',
                  width: 160,
                  render: (time: string) => (
                    <Space>
                      <ClockCircleOutlined />
                      {time}
                    </Space>
                  )
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  key: 'status',
                  width: 100,
                  render: (status: string) => (
                    <Tag color={
                      status === 'completed' ? 'green' : 
                      status === 'pending' ? 'orange' : 'red'
                    }>
                      {status === 'completed' ? '已完成' : 
                       status === 'pending' ? '待处理' : '已取消'}
                    </Tag>
                  )
                },
                {
                  title: '备注',
                  dataIndex: 'notes',
                  key: 'notes',
                  render: (notes: string) => notes || '-'
                }
              ]}
              dataSource={exchangeRecords.filter(record => record.giftId === currentGift.id)}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条/共 ${total} 条`,
              }}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default GiftPage; 