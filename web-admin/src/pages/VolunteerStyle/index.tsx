import React, { useRef } from 'react';
import { Button, Image, message, Modal } from 'antd';
import ProTable, { ProColumns, ActionType } from '@ant-design/pro-table';
import { PlusOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText, ProFormTextArea, ProFormUploadButton } from '@ant-design/pro-form';

interface VolunteerStyleItem {
  id: string;
  name: string;
  desc: string;
  imageUrl: string;
  sort: number;
}

// mock 数据和接口
const mockData: VolunteerStyleItem[] = [
  {
    id: '1',
    name: '张三',
    desc: '优秀志愿者',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    sort: 1,
  },
  {
    id: '2',
    name: '李四',
    desc: '服务之星',
    imageUrl: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    sort: 2,
  },
];

export default function VolunteerStyle() {
  const actionRef = useRef<ActionType>();
  const [dataSource, setDataSource] = React.useState<VolunteerStyleItem[]>(mockData);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editing, setEditing] = React.useState<VolunteerStyleItem | undefined>();

  const columns: ProColumns<VolunteerStyleItem>[] = [
    {
      title: '序号',
      dataIndex: 'sort',
      width: 60,
      align: 'center',
      editable: false,
    },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      width: 120,
      render: (_, row) => <Image src={row.imageUrl} width={80} height={60} style={{ objectFit: 'cover', borderRadius: 8 }} />,
      editable: false,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
    },
    {
      title: '简介',
      dataIndex: 'desc',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 120,
      render: (_, row) => [
        <a key="edit" onClick={() => { setEditing(row); setModalVisible(true); }}>编辑</a>,
        <a key="delete" style={{ color: 'red', marginLeft: 12 }} onClick={() => handleDelete(row)}>删除</a>,
      ],
    },
  ];

  async function handleSubmit(values: any) {
    if (editing) {
      setDataSource(ds => ds.map(item => item.id === editing.id ? { ...item, ...values, imageUrl: values.imageUrl?.[0]?.url || item.imageUrl } : item));
      message.success('编辑成功');
    } else {
      setDataSource(ds => [
        ...ds,
        {
          id: Date.now().toString(),
          ...values,
          imageUrl: values.imageUrl?.[0]?.url || '',
          sort: ds.length + 1,
        },
      ]);
      message.success('新增成功');
    }
    setModalVisible(false);
    setEditing(undefined);
    return true;
  }

  // 新增 handleDelete 方法
  function handleDelete(row: VolunteerStyleItem) {
    Modal.confirm({
      title: `确认删除风采「${row.name}」吗？`,
      onOk: () => {
        setDataSource(ds => ds.filter(item => item.id !== row.id));
        message.success('删除成功');
      },
    });
  }

  return (
    <>
      <ProTable<VolunteerStyleItem>
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        actionRef={actionRef}
        search={false}
        pagination={{ pageSize: 10 }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => { setEditing(undefined); setModalVisible(true); }}>
            新增风采
          </Button>,
        ]}
      />
      <ModalForm
        title={editing ? '编辑风采' : '新增风采'}
        open={modalVisible}
        initialValues={editing ? { ...editing, imageUrl: [{ url: editing.imageUrl }] } : {}}
        onFinish={handleSubmit}
        onOpenChange={setModalVisible}
        modalProps={{ destroyOnHidden: true }}
      >
        <ProFormText name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]} />
        <ProFormTextArea name="desc" label="简介" rules={[{ required: true, message: '请输入简介' }]} />
        <ProFormUploadButton
          name="imageUrl"
          label="图片"
          max={1}
          fieldProps={{ listType: 'picture-card', accept: 'image/*' }}
          rules={[{ required: true, message: '请上传图片' }]}
          transform={v => ({ imageUrl: v && v[0] && v[0].url })}
        />
      </ModalForm>
    </>
  );
} 