import { useEffect, useState } from 'react';
import {
  Typography, Card, Table, Button, Tag, Input, Space, Alert,
  Modal, Form, Switch, Select, Dropdown
} from 'antd';
import {
  PlusOutlined, SearchOutlined, WarningOutlined, MoreOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useAdminErrorCodes } from '../../hooks/useAdmin';
import {
  AdminErrorCodeListDto,
  AdminErrorCodeCreateRequest,
  AdminErrorCodeUpdateRequest
} from '../../services/admin.service';

const { Title, Text } = Typography;

export function AdminErrorCodesPage() {
  const {
    errorCodes, errorSources, loading, error,
    searchErrorCodes, createErrorCode, updateErrorCode, deleteErrorCode, loadErrorSources
  } = useAdminErrorCodes();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<AdminErrorCodeListDto | null>(null);
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  const load = (p = page, q = search) => {
    searchErrorCodes({ pageNumber: p, pageSize: 20, query: q || undefined });
  };

  useEffect(() => {
    load();
    loadErrorSources();
  }, []);

  const handleCreate = async (values: AdminErrorCodeCreateRequest) => {
    const ok = await createErrorCode(values);
    if (ok) { setCreateModalOpen(false); createForm.resetFields(); load(); }
  };

  const handleEdit = (code: AdminErrorCodeListDto) => {
    setEditingCode(code);
    editForm.setFieldsValue({
      code: code.code,
      title: code.title,
      isFreeAccess: code.accessLevel === 'Free',
      isActive: code.isActive,
      isCommonAcrossAllMachines: false,
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async (values: AdminErrorCodeUpdateRequest) => {
    if (!editingCode) return;
    const ok = await updateErrorCode(editingCode.id, values);
    if (ok) { setEditModalOpen(false); load(); }
  };

  const handleDelete = async (id: string) => {
    const ok = await deleteErrorCode(id);
    if (ok) load();
  };

  const columns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => <Text strong style={{ fontFamily: 'monospace' }}>{code}</Text>,
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: AdminErrorCodeListDto) => (
        <div>
          <Text>{title}</Text>
          {record.sourceName && (
            <div><Text type="secondary" style={{ fontSize: 11 }}>{record.sourceName}</Text></div>
          )}
        </div>
      ),
    },
    {
      title: 'Makine',
      dataIndex: 'machineBrand',
      key: 'machine',
      width: 120,
      render: (brand: string) => brand ? <Tag color="blue">{brand}</Tag> : <Tag>Genel</Tag>,
    },
    {
      title: 'Parça',
      dataIndex: 'partName',
      key: 'part',
      width: 120,
      render: (p: string) => p || <Text type="secondary">-</Text>,
    },
    {
      title: 'Erişim',
      dataIndex: 'accessLevel',
      key: 'access',
      width: 100,
      render: (level: string) =>
        level === 'Free'
          ? <Tag color="green">Ücretsiz</Tag>
          : <Tag color="gold">Premium</Tag>,
    },
    {
      title: 'Durum',
      dataIndex: 'isActive',
      key: 'status',
      width: 80,
      render: (active: boolean) => <Tag color={active ? 'success' : 'error'}>{active ? 'Aktif' : 'Pasif'}</Tag>,
    },
    {
      title: 'Eklenme',
      dataIndex: 'createdAt',
      key: 'date',
      width: 110,
      render: (d: string) => new Date(d).toLocaleDateString('tr-TR'),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: (_: any, record: AdminErrorCodeListDto) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Düzenle', onClick: () => handleEdit(record) },
              { type: 'divider' },
              {
                key: 'delete', label: 'Sil', danger: true,
                onClick: () => {
                  Modal.confirm({
                    title: 'Hata kodunu sil',
                    content: `${record.code} - ${record.title} silinecek. Emin misiniz?`,
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

  const codeFormFields = (
    <>
      <Form.Item name="code" label="Hata Kodu" rules={[{ required: true }]}>
        <Input placeholder="E001" style={{ fontFamily: 'monospace' }} />
      </Form.Item>
      <Form.Item name="title" label="Başlık" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="description" label="Açıklama">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="solutions" label="Çözümler">
        <Input.TextArea rows={3} />
      </Form.Item>
      {errorSources.length > 0 && (
        <Form.Item name="errorSourceId" label="Kaynak">
          <Select
            allowClear
            options={errorSources.map((s: any) => ({ value: s.id, label: s.sourceName }))}
          />
        </Form.Item>
      )}
      <Form.Item name="isFreeAccess" label="Ücretsiz Erişim" valuePropName="checked" initialValue={true}>
        <Switch />
      </Form.Item>
      <Form.Item name="isCommonAcrossAllMachines" label="Tüm Makinelere Ortak" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>
    </>
  );

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <WarningOutlined style={{ marginRight: 8, color: '#faad14' }} />
            Hata Kodları
          </Title>
          <Text type="secondary">Toplam {errorCodes?.totalCount ?? 0} hata kodu</Text>
        </div>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => load()}>Yenile</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            Hata Kodu Ekle
          </Button>
        </Space>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable style={{ marginBottom: 16 }} />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="Kod veya başlık ara..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={() => { setPage(1); load(1, search); }}
            style={{ width: 300 }}
            allowClear
          />
          <Button type="primary" onClick={() => { setPage(1); load(1, search); }}>Ara</Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={errorCodes?.items || []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize: 20,
            total: errorCodes?.totalCount || 0,
            showTotal: t => `Toplam ${t}`,
            onChange: p => { setPage(p); load(p); },
            showSizeChanger: false,
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Card>

      <Modal
        title="Yeni Hata Kodu"
        open={createModalOpen}
        onCancel={() => { setCreateModalOpen(false); createForm.resetFields(); }}
        footer={null}
        width={560}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreate} style={{ marginTop: 16 }}>
          {codeFormFields}
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setCreateModalOpen(false)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={loading}>Oluştur</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Hata Kodunu Düzenle"
        open={editModalOpen}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); }}
        footer={null}
        width={560}
      >
        <Form form={editForm} layout="vertical" onFinish={handleUpdate} style={{ marginTop: 16 }}>
          {codeFormFields}
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
