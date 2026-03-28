import { useEffect, useState } from 'react';
import {
  Typography, Card, Table, Button, Tag, Input, Space, Alert,
  Modal, Form, Select, Switch, Dropdown
} from 'antd';
import {
  PlusOutlined, SearchOutlined, MoreOutlined, UserOutlined,
  CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useAdminUsers } from '../../hooks/useAdmin';
import { AdminUserListDto, AdminCreateUserRequest, AdminUpdateUserRequest } from '../../services/admin.service';

const { Title, Text } = Typography;

export function AdminUsersPage() {
  const {
    users, loading, error,
    searchUsers, createUser, updateUser, deleteUser,
    activateUser, deactivateUser, loadAvailableRoles, availableRoles
  } = useAdminUsers();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserListDto | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const load = (p = page, q = search) => {
    searchUsers({ pageNumber: p, pageSize: 20, query: q || undefined });
  };

  useEffect(() => {
    load();
    loadAvailableRoles();
  }, []);

  const handleCreate = async (values: AdminCreateUserRequest) => {
    const ok = await createUser(values);
    if (ok) {
      setCreateModalOpen(false);
      createForm.resetFields();
      load();
    }
  };

  const handleEdit = (user: AdminUserListDto) => {
    setEditingUser(user);
    editForm.setFieldsValue({
      firstName: user.fullName.split(' ')[0],
      lastName: user.fullName.split(' ').slice(1).join(' '),
      companyName: user.companyName,
      isActive: user.isActive,
      emailConfirmed: user.emailConfirmed,
      roles: user.roles,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: AdminUpdateUserRequest) => {
    if (!editingUser) return;
    const ok = await updateUser(editingUser.id, values);
    if (ok) {
      setEditModalOpen(false);
      load();
    }
  };

  const handleToggleActive = async (user: AdminUserListDto) => {
    const ok = user.isActive ? await deactivateUser(user.id) : await activateUser(user.id);
    if (ok) load();
  };

  const handleDelete = async (userId: string) => {
    const ok = await deleteUser(userId);
    if (ok) load();
  };

  const columns = [
    {
      title: 'Kullanıcı',
      key: 'user',
      render: (_: any, record: AdminUserListDto) => (
        <div>
          <Text strong>{record.fullName}</Text>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text></div>
          {record.companyName && (
            <div><Text type="secondary" style={{ fontSize: 11 }}>{record.companyName}</Text></div>
          )}
        </div>
      ),
    },
    {
      title: 'Plan',
      dataIndex: 'currentPlan',
      key: 'plan',
      width: 110,
      render: (plan: string) => plan ? <Tag color="blue">{plan}</Tag> : <Tag>Ücretsiz</Tag>,
    },
    {
      title: 'Makineler',
      dataIndex: 'selectedMachinesCount',
      key: 'machines',
      width: 90,
      align: 'center' as const,
      render: (c: number) => <Tag color="geekblue">{c}</Tag>,
    },
    {
      title: 'Ödemeler',
      dataIndex: 'totalPayments',
      key: 'payments',
      width: 90,
      align: 'center' as const,
      render: (c: number) => <Text>{c}</Text>,
    },
    {
      title: 'Durum',
      key: 'status',
      width: 130,
      render: (_: any, record: AdminUserListDto) => (
        <Space direction="vertical" size={2}>
          <Tag icon={record.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={record.isActive ? 'success' : 'error'}>
            {record.isActive ? 'Aktif' : 'Pasif'}
          </Tag>
          {record.emailConfirmed
            ? <Tag color="blue" style={{ fontSize: 10 }}>Email Doğrulandı</Tag>
            : <Tag color="orange" style={{ fontSize: 10 }}>Email Bekleniyor</Tag>}
        </Space>
      ),
    },
    {
      title: 'Roller',
      dataIndex: 'roles',
      key: 'roles',
      width: 120,
      render: (roles: string[]) => (
        <Space wrap>
          {roles.map(r => <Tag key={r} color={r === 'Admin' ? 'red' : 'default'}>{r}</Tag>)}
          {roles.length === 0 && <Tag>User</Tag>}
        </Space>
      ),
    },
    {
      title: 'Kayıt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 100,
      render: (d: string) => new Date(d).toLocaleDateString('tr-TR'),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: any, record: AdminUserListDto) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Düzenle', onClick: () => handleEdit(record) },
              {
                key: 'toggle',
                label: record.isActive ? 'Pasifleştir' : 'Aktifleştir',
                onClick: () => handleToggleActive(record),
              },
              { type: 'divider' },
              {
                key: 'delete', label: 'Sil', danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Kullanıcıyı sil',
                    content: `${record.fullName} kullanıcısı silinecek. Emin misiniz?`,
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
            <UserOutlined style={{ marginRight: 8 }} />
            Kullanıcılar
          </Title>
          <Text type="secondary">Toplam {users?.totalCount ?? 0} kullanıcı</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => load()}>Yenile</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Kullanıcı Ekle
          </Button>
        </Space>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable style={{ marginBottom: 16 }} />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Kullanıcı ara..."
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
          dataSource={users?.items || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total: users?.totalCount || 0,
            showTotal: t => `Toplam ${t}`,
            onChange: p => { setPage(p); load(p); },
            showSizeChanger: false,
          }}
          scroll={{ x: 900 }}
          size="small"
        />
      </Card>

      {/* Kullanıcı Oluştur Modal */}
      <Modal
        title="Yeni Kullanıcı"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        width={520}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          <Form.Item name="firstName" label="Ad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Soyad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Şifre" rules={[{ required: true, min: 8 }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="companyName" label="Şirket">
            <Input />
          </Form.Item>
          <Form.Item name="roles" label="Roller">
            <Select mode="multiple" options={availableRoles.map(r => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item name="emailConfirmed" label="Email Doğrulandı" valuePropName="checked" initialValue={false}>
            <Switch />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Oluştur</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Kullanıcı Düzenle Modal */}
      <Modal
        title="Kullanıcıyı Düzenle"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        footer={null}
        width={520}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 16 }}>
          <Form.Item name="firstName" label="Ad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="lastName" label="Soyad" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="companyName" label="Şirket">
            <Input />
          </Form.Item>
          <Form.Item name="roles" label="Roller">
            <Select mode="multiple" options={availableRoles.map(r => ({ value: r, label: r }))} />
          </Form.Item>
          <Form.Item name="isActive" label="Aktif" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="emailConfirmed" label="Email Doğrulandı" valuePropName="checked">
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
