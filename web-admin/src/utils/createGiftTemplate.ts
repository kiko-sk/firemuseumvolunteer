import * as XLSX from 'xlsx';

// 创建礼品导入模板
export const createGiftTemplate = () => {
  // 模板数据
  const templateData = [
    {
      '礼品名称': '博物馆定制水杯',
      '类别': '生活用品',
      '所需积分': 10,
      '库存': 5,
      '描述': '印有博物馆logo的定制水杯',
      '状态': '上架'
    },
    {
      '礼品名称': '消防文创T恤',
      '类别': '服装',
      '所需积分': 20,
      '库存': 3,
      '描述': '消防主题文创T恤',
      '状态': '上架'
    },
    {
      '礼品名称': '消防车模型',
      '类别': '玩具模型',
      '所需积分': 50,
      '库存': 1,
      '描述': '精致的消防车模型',
      '状态': '上架'
    },
    {
      '礼品名称': '消防员主题徽章',
      '类别': '配饰',
      '所需积分': 5,
      '库存': 10,
      '描述': '消防员主题纪念徽章',
      '状态': '上架'
    }
  ];

  // 创建工作簿
  const workbook = XLSX.utils.book_new();
  
  // 创建工作表
  const worksheet = XLSX.utils.json_to_sheet(templateData);
  
  // 设置列宽
  const columnWidths = [
    { wch: 20 }, // 礼品名称
    { wch: 15 }, // 类别
    { wch: 12 }, // 所需积分
    { wch: 10 }, // 库存
    { wch: 30 }, // 描述
    { wch: 10 }  // 状态
  ];
  worksheet['!cols'] = columnWidths;
  
  // 添加工作表到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, '礼品导入模板');
  
  // 生成Excel文件
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // 创建Blob对象
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // 下载文件
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '礼品导入模板.xlsx';
  link.click();
  
  // 清理URL
  window.URL.revokeObjectURL(url);
};

// 验证Excel数据格式
export const validateGiftData = (data: any[]) => {
  const errors: string[] = [];
  const validData: any[] = [];
  
  data.forEach((row: any, index: number) => {
    try {
      // 检查必填字段
      const name = row['礼品名称'];
      const category = row['类别'];
      const points = row['所需积分'];
      const stock = row['库存'];
      
      if (!name || name.toString().trim() === '') {
        errors.push(`第${index + 1}行：礼品名称不能为空`);
        return;
      }
      
      if (!category || category.toString().trim() === '') {
        errors.push(`第${index + 1}行：类别不能为空`);
        return;
      }
      
      if (!points || isNaN(Number(points)) || Number(points) <= 0) {
        errors.push(`第${index + 1}行：所需积分必须为正数`);
        return;
      }
      
      if (stock !== undefined && stock !== null && stock !== '') {
        if (isNaN(Number(stock)) || Number(stock) < 0) {
          errors.push(`第${index + 1}行：库存不能为负数`);
          return;
        }
      }
      
      // 数据有效，添加到有效数据列表
      validData.push({
        name: name.toString().trim(),
        category: category.toString().trim(),
        points: Number(points),
        stock: stock !== undefined && stock !== null && stock !== '' ? Number(stock) : 0,
        description: row['描述'] || '',
        status: row['状态'] === '下架' ? 'inactive' : 'active'
      });
      
    } catch (error) {
      errors.push(`第${index + 1}行：数据格式错误 - ${error instanceof Error ? error.message : '未知错误'}`);
    }
  });
  
  return { validData, errors };
};

export default {
  createGiftTemplate,
  validateGiftData
};
