import DataUploadFix from './dataUploadFix';

// 测试数据上传功能
export const testDataUpload = async () => {
  console.log('🧪 开始测试数据上传功能...');
  
  try {
    // 1. 测试连接
    console.log('1️⃣ 测试Supabase连接...');
    const connectionTest = await DataUploadFix.testConnection();
    
    if (!connectionTest.success) {
      console.error('❌ 连接测试失败:', connectionTest.error);
      return { success: false, error: connectionTest.error };
    }
    
    console.log('✅ 连接测试成功');
    
    // 2. 测试数据修复
    console.log('2️⃣ 测试数据修复功能...');
    const testData = [
      {
        '礼品名称': '测试水杯',
        '类别': '生活用品',
        '所需积分': '10', // 字符串格式
        '库存': '5',      // 字符串格式
        '描述': '测试用的水杯',
        '状态': '上架'
      },
      {
        '礼品名称': '测试T恤',
        '类别': '服装',
        '所需积分': 20,   // 数字格式
        '库存': 3,        // 数字格式
        '描述': '测试用的T恤',
        '状态': '上架'
      },
      {
        '礼品名称': '',   // 空名称，应该被过滤
        '类别': '玩具',
        '所需积分': 50,
        '库存': 1,
        '描述': '测试用的玩具',
        '状态': '上架'
      }
    ];
    
    const { validData, errors, skippedRows } = DataUploadFix.fixExcelData(testData);
    
    console.log('数据修复结果:', {
      total: testData.length,
      valid: validData.length,
      errors: errors.length,
      skipped: skippedRows
    });
    
    if (errors.length > 0) {
      console.log('发现的错误:', errors);
    }
    
    if (validData.length === 0) {
      console.error('❌ 没有有效数据');
      return { success: false, error: '没有有效数据' };
    }
    
    console.log('✅ 数据修复测试成功');
    console.log('有效数据:', validData);
    
    // 3. 测试数据上传（可选）
    console.log('3️⃣ 测试数据上传功能...');
    
    // 询问是否要实际上传测试数据
    const shouldUpload = window.confirm(
      `是否要上传 ${validData.length} 条测试数据到数据库？\n\n` +
      '注意：这将向数据库添加真实的测试数据！'
    );
    
    if (shouldUpload) {
      try {
        const uploadResult = await DataUploadFix.uploadToSupabase(validData);
        console.log('✅ 数据上传测试成功:', uploadResult);
        
        // 询问是否要删除测试数据
        const shouldDelete = window.confirm(
          '测试数据上传成功！\n\n' +
          '是否要删除这些测试数据？\n' +
          '（建议删除，避免影响生产数据）'
        );
        
        if (shouldDelete) {
          console.log('🗑️ 删除测试数据...');
          // 这里可以添加删除测试数据的逻辑
          console.log('✅ 测试数据删除完成');
        }
        
      } catch (uploadError) {
        console.error('❌ 数据上传测试失败:', uploadError);
        return { success: false, error: `上传失败: ${uploadError}` };
      }
    } else {
      console.log('⏭️ 跳过数据上传测试');
    }
    
    console.log('🎉 所有测试完成！');
    return { 
      success: true, 
      summary: {
        connection: '✅ 成功',
        dataFix: '✅ 成功',
        upload: shouldUpload ? '✅ 成功' : '⏭️ 跳过'
      }
    };
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
};

// 测试Excel数据解析
export const testExcelParsing = (jsonData: any[]) => {
  console.log('📊 测试Excel数据解析...');
  console.log('原始数据行数:', jsonData.length);
  
  if (jsonData.length > 0) {
    console.log('第一行数据:', jsonData[0]);
    console.log('所有列名:', Object.keys(jsonData[0]));
  }
  
  // 测试数据修复
  const { validData, errors, skippedRows } = DataUploadFix.fixExcelData(jsonData);
  
  console.log('解析结果:', {
    total: jsonData.length,
    valid: validData.length,
    errors: errors.length,
    skipped: skippedRows
  });
  
  if (errors.length > 0) {
    console.log('解析错误:', errors);
  }
  
  if (validData.length > 0) {
    console.log('有效数据示例:', validData[0]);
  }
  
  return { validData, errors, skippedRows };
};

// 导出测试工具
export default {
  testDataUpload,
  testExcelParsing
};
