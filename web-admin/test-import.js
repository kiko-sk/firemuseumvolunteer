// 测试志愿者数据导入功能
console.log('开始测试志愿者数据导入功能...');

// 模拟Excel数据
const mockExcelData = [
  {
    '志愿者编号': 'V001',
    '姓名': '张三',
    '电话': '13800138001',
    '性别': '男',
    '年龄': 25,
    '服务类型': '场馆服务',
    '服务次数': 10,
    '总服务小时': '50小时',
    '服务积分': 100,
    '讲解积分': 0,
    '附加积分': 20,
    '累计获得积分': 120,
    '已兑换积分': 30,
    '剩余积分': 90,
    '备注': '测试数据1'
  },
  {
    '志愿者编号': 'V002',
    '姓名': '李四',
    '电话': '13800138002',
    '性别': '女',
    '年龄': 30,
    '服务类型': '讲解服务',
    '服务次数': 15,
    '总服务小时': '75小时',
    '服务积分': 150,
    '讲解积分': 80,
    '附加积分': 30,
    '累计获得积分': 260,
    '已兑换积分': 50,
    '剩余积分': 210,
    '备注': '测试数据2'
  }
];

console.log('模拟Excel数据:', mockExcelData);

// 测试数据转换逻辑
const testDataConversion = () => {
  console.log('\n=== 测试数据转换逻辑 ===');
  
  mockExcelData.forEach((row, index) => {
    console.log(`\n处理第${index + 1}行数据:`);
    
    // 模拟getColumnValue函数
    const getColumnValue = (columnName) => {
      return row[columnName] || '';
    };
    
    // 转换数据
    const volunteer = {
      volunteerno: getColumnValue('志愿者编号') || '',
      name: getColumnValue('姓名') || '',
      phone: getColumnValue('电话') || '',
      gender: getColumnValue('性别') || '',
      age: parseInt(getColumnValue('年龄')) || 0,
      type: getColumnValue('服务类型') === '讲解服务' ? '讲解服务' : '场馆服务',
      servicecount: parseInt(getColumnValue('服务次数')) || 0,
      servicehours: parseInt(String(getColumnValue('总服务小时') || '0').replace('小时', '')) || 0,
      servicescore: parseInt(getColumnValue('服务积分')) || 0,
      explainscore: parseInt(getColumnValue('讲解积分')) || 0,
      bonusscore: parseInt(getColumnValue('附加积分')) || 0,
      totalscore: parseInt(getColumnValue('累计获得积分')) || 0,
      redeemedscore: parseInt(getColumnValue('已兑换积分')) || 0,
      remainingscore: parseInt(getColumnValue('剩余积分')) || 0,
      status: 'active',
      registerdate: new Date().toISOString().split('T')[0],
      lastservicedate: '',
      remark: getColumnValue('备注') || ''
    };
    
    console.log('转换后的数据:', volunteer);
    
    // 验证关键字段
    console.log('验证结果:');
    console.log(`- 志愿者编号: ${volunteer.volunteerno} (期望: ${row['志愿者编号']})`);
    console.log(`- 服务次数: ${volunteer.servicecount} (期望: ${row['服务次数']})`);
    console.log(`- 总服务小时: ${volunteer.servicehours} (期望: ${row['总服务小时'].replace('小时', '')})`);
    console.log(`- 服务积分: ${volunteer.servicescore} (期望: ${row['服务积分']})`);
    console.log(`- 讲解积分: ${volunteer.explainscore} (期望: ${row['讲解积分']})`);
    console.log(`- 附加积分: ${volunteer.bonusscore} (期望: ${row['附加积分']})`);
    console.log(`- 总积分: ${volunteer.totalscore} (期望: ${row['累计获得积分']})`);
  });
};

// 测试本地存储
const testLocalStorage = () => {
  console.log('\n=== 测试本地存储 ===');
  
  // 检查是否为本地管理员
  const currentUser = localStorage.getItem('currentUser');
  console.log('当前用户:', currentUser);
  
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      const isLocalAdmin = user.phone === 'test';
      console.log('是否为本地管理员:', isLocalAdmin);
      
      if (isLocalAdmin) {
        // 保存测试数据到本地存储
        const testData = mockExcelData.map((row, index) => ({
          id: Date.now().toString() + index,
          volunteerNo: row['志愿者编号'],
          name: row['姓名'],
          phone: row['电话'],
          gender: row['性别'],
          age: parseInt(row['年龄']) || 0,
          type: row['服务类型'] === '讲解服务' ? '讲解服务' : '场馆服务',
          serviceCount: parseInt(row['服务次数']) || 0,
          serviceHours: parseInt(String(row['总服务小时'] || '0').replace('小时', '')) || 0,
          serviceScore: parseInt(row['服务积分']) || 0,
          explainScore: parseInt(row['讲解积分']) || 0,
          bonusScore: parseInt(row['附加积分']) || 0,
          totalscore: parseInt(row['累计获得积分']) || 0,
          redeemedscore: parseInt(row['已兑换积分']) || 0,
          remainingscore: parseInt(row['剩余积分']) || 0,
          status: 'active',
          registerdate: new Date().toISOString().split('T')[0],
          lastservicedate: '',
          remark: row['备注'] || ''
        }));
        
        localStorage.setItem('volunteerData', JSON.stringify(testData));
        console.log('测试数据已保存到本地存储');
        
        // 读取并验证
        const savedData = localStorage.getItem('volunteerData');
        const parsedData = JSON.parse(savedData);
        console.log('从本地存储读取的数据:', parsedData);
        
        // 验证数据完整性
        parsedData.forEach((volunteer, index) => {
          console.log(`\n验证第${index + 1}条数据:`);
          console.log(`- 志愿者编号: ${volunteer.volunteerNo}`);
          console.log(`- 服务次数: ${volunteer.serviceCount}`);
          console.log(`- 总服务小时: ${volunteer.serviceHours}`);
          console.log(`- 服务积分: ${volunteer.serviceScore}`);
          console.log(`- 讲解积分: ${volunteer.explainScore}`);
          console.log(`- 附加积分: ${volunteer.bonusScore}`);
          console.log(`- 总积分: ${volunteer.totalscore}`);
        });
      }
    } catch (error) {
      console.error('解析用户数据失败:', error);
    }
  } else {
    console.log('未找到用户信息，请先登录');
  }
};

// 运行测试
testDataConversion();
testLocalStorage();

console.log('\n测试完成！');
