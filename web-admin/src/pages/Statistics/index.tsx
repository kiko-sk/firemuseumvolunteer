import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Select, DatePicker, Button, Space, message } from 'antd';
import * as XLSX from 'xlsx';
import dayjs, { Dayjs } from 'dayjs';
import quarterOfYear from 'dayjs/plugin/quarterOfYear';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import zhCN from 'antd/es/date-picker/locale/zh_CN';
dayjs.extend(quarterOfYear);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);

const { Option } = Select;

// mock数据
const mockData = [
  {
    id: '1',
    type: '场馆服务',
    signupTime: '2025-06-10 09:00',
    checkin: '已签到',
  },
  {
    id: '2',
    type: '讲解服务',
    signupTime: '2025-06-10 13:30',
    checkin: '未签到',
  },
];

const columns = [
  { title: '报名类型', dataIndex: 'type' },
  { title: '报名时间', dataIndex: 'signupTime' },
  { title: '签到', dataIndex: 'checkin' },
];

const STAT_TYPES = [
  { label: '周统计', value: 'week' },
  { label: '月统计', value: 'month' },
  { label: '季度统计', value: 'quarter' },
  { label: '年统计', value: 'year' },
  { label: '自定义', value: 'custom' },
];

const customQuarterLocale = {
  ...zhCN,
  quarterFormat: 'Q季度',
};

const StatisticsPage: React.FC = () => {
  const [statType, setStatType] = useState('week');
  const [date, setDate] = useState<Dayjs | undefined>(dayjs());
  const [range, setRange] = useState<[Dayjs, Dayjs] | undefined>(undefined);
  const [data, setData] = useState(mockData);

  const handleRangeChange = (dates: (Dayjs | null)[] | null) => {
    if (Array.isArray(dates) && dates.length === 2 && dates[0] && dates[1]) {
      setRange([dates[0], dates[1]]);
    } else {
      setRange(undefined);
    }
  };

  // 查询按钮事件（后续可对接后端）
  const handleQuery = () => {
    // TODO: 调用后端接口，传递statType和date/range参数
    message.success('已查询（mock数据，后续可对接后端）');
    setData(mockData); // 实际应为接口返回数据
  };

  // 导出Excel
  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '报名统计');
    XLSX.writeFile(wb, '报名统计.xlsx');
  };

  // 快捷选择预设
  const rangePresets = [
    {
      label: '本周',
      value: () => [dayjs().startOf('week'), dayjs().endOf('week')] as [Dayjs, Dayjs],
    },
    {
      label: '本月',
      value: () => [dayjs().startOf('month'), dayjs().endOf('month')] as [Dayjs, Dayjs],
    },
    {
      label: '本季度',
      value: () => [dayjs().startOf('quarter'), dayjs().endOf('quarter')] as [Dayjs, Dayjs],
    },
    {
      label: '本年',
      value: () => [dayjs().startOf('year'), dayjs().endOf('year')] as [Dayjs, Dayjs],
    },
  ];

  // 时间选择控件
  let timeSelector = null;
  if (statType === 'week') {
    timeSelector = (
      <DatePicker
        picker="week"
        value={date}
        onChange={d => setDate(d ?? undefined)}
        format={val => val ? `${val.year()}年第${val.week()}周` : ''}
      />
    );
  } else if (statType === 'month') {
    timeSelector = (
      <DatePicker
        picker="month"
        value={date}
        onChange={d => setDate(d ?? undefined)}
        format="YYYY年MM月"
      />
    );
  } else if (statType === 'quarter') {
    timeSelector = (
      <DatePicker
        picker="quarter"
        value={date}
        onChange={d => setDate(d ?? undefined)}
        format={val => val ? `${val.year()}-Q${val.quarter()}` : ''}
        locale={customQuarterLocale}
      />
    );
  } else if (statType === 'year') {
    timeSelector = (
      <DatePicker
        picker="year"
        value={date}
        onChange={d => setDate(d ?? undefined)}
        format="YYYY年"
      />
    );
  } else if (statType === 'custom') {
    timeSelector = (
      <DatePicker.RangePicker
        value={range}
        onChange={handleRangeChange}
        presets={rangePresets}
        format="YYYY-MM-DD"
      />
    );
  }

  return (
    <PageContainer header={{ title: '报名统计' }}>
      <div style={{ background: '#fff', padding: 24, borderRadius: 8, marginBottom: 24 }}>
        <Space>
          <Select value={statType} onChange={setStatType} style={{ width: 120 }}>
            {STAT_TYPES.map(opt => <Option key={opt.value} value={opt.value}>{opt.label}</Option>)}
          </Select>
          {timeSelector}
          <Button type="primary" onClick={handleQuery}>查询</Button>
          <Button onClick={handleExport}>导出Excel</Button>
        </Space>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        locale={{ emptyText: <div style={{ textAlign: 'center', color: '#ccc' }}><div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>No data</div> }}
        pagination={false}
      />
    </PageContainer>
  );
};

export default StatisticsPage; 