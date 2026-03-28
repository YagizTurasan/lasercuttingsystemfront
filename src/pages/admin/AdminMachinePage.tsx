import { useEffect, useState } from 'react';
import {
  Typography, Card, Table, Button, Tag, Input, Space, Alert,
  Modal, Form, Switch, Dropdown
} from 'antd';
import {
  PlusOutlined, SearchOutlined, ToolOutlined, MoreOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useAdminMachines } from '../../hooks/useAdmin';
import { AdminMachineListDto, AdminMachineCreateRequest, AdminMachineUpdateRequest } from '../../services/admin.service';

const { Title, Text } = Typography;

export function AdminMachinesPage() {
  const { machines, loading, error, searchMachines, createMachine, updateMachine, deleteMachine } = useAdminMachines();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<AdminMachineListDto | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const load = (p = page, q = search) => {
    searchMachines({ pageNumber: p, pageSize: 20, query: q || undefined });
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (values: AdminMachineCreateRequest) => {
    const ok = await createMachine(values);
    if (ok) { setCreateModalOpen(false); createForm.resetFields(); load(); }
  };

  const handleEdit = (machine: AdminMachineListDto) => {
    setEditingMachine(machine);
    editForm.setFieldsValue({ brand: machine.brand, description: machine.description, isActive: machine.isActive });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: AdminMachineUpdateRequest) => {
    if (!editingMachine) return;
    const ok = await updateMachine(editingMachine.id, values);
    if (ok) { setEditModalOpen(false); load(); }
  };

  const handleDelete = async (machineId: string) => {
    const ok = await deleteMachine(machineId);
    if (ok) load();
  };

  const columns = [
    {
      title: 'Makine',
      key: 'machine',
      render: (_: any, record: AdminMachineListDto) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ToolOutlined style={{ color: '#1890ff' }} />
            <Text strong>{record.brand}</Text>
            {!record.isActive && <Tag color="red">Pasif</Tag>}
          </div>
          {record.description && (
            <Text type="secondary" style={{ fontSize: 12 }}>{record.description}</Text>
          )}
        </div>
      ),
    },
    {
      title: 'Modeller',
      dataIndex: 'modelsCount',
      key: 'models',
      width: 90,
      align: 'center' as const,
      render: (c: number) => <Tag>{c}</Tag>,
    },
    {
      title: 'Hata Kodları',
      dataIndex: 'errorCodesCount',
      key: 'errorCodes',
      width: 110,
      align: 'center' as const,
      render: (c: number) => <Tag color="orange">{c}</Tag>,
    },
    {
      title: 'Kullanıcılar',
      dataIndex: 'usersCount',
      key: 'users',
      width: 100,
      align: 'center' as const,
      render: (c: number) => <Tag color="green">{c}</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      width: 90,
      render: (active: boolean) => <Tag color={active ? 'success' : 'error'}>{active ? 'Aktif' : 'Pasif'}</Tag>,
    },
    {
      title: 'Eklenme',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 110,
      render: (d: string) => new Date(d).toLocaleDateString('tr-TR'),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: any, record: AdminMachineListDto) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Düzenle', onClick: () => handleEdit(record) },
              { type: 'divider' },
              {
                key: 'delete', label: 'Sil', danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Makineyi sil',
                    content: `${record.brand} makinesi silinecek. Emin misiniz?`,
                    okText: 'Sil', cancelText: 'İptal', okButtonProps: { danger: true },
                    onOk: () => handleDelete(record.id),
                  });
                }
              },
            ]
          }}
          trigger={['click']}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <ToolOutlined style={{ marginRight: 8 }} />
            Makineler
          </Title>
          <Text type="secondary">Toplam {machines?.totalCount ?? 0} makine</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => load()}>Yenile</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Makine Ekle
          </Button>
        </Space>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable style={{ marginBottom: 16 }} />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Makine ara..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={() => { setPage(1); load(1, search); }}
            style={{ width: 280 }}
            allowClear
          />
          <Button type="primary" onClick={() => { setPage(1); load(1, search); }}>Ara</Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={machines?.items || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total: machines?.totalCount || 0,
            showTotal: t => `Toplam ${t}`,
            onChange: p => { setPage(p); load(p); },
            showSizeChanger: false,
          }}
          scroll={{ x: 700 }}
          size="small"
        />
      </Card>

      <Modal
        title="Yeni Makine"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item name="brand" label="Marka" rules={[{ required: true }]}>
            <Input placeholder="Makine markası" />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Oluştur</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Makineyi Düzenle"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        footer={null}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 16 }}>
          <Form.Item name="brand" label="Marka" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="isActive" label="Aktif" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setEditModalOpen(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Kaydet</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
