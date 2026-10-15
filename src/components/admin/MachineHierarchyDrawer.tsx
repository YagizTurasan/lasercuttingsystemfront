import { useEffect, useState } from 'react';
import {
  Drawer, Tree, Button, Space, Typography, Modal, Form, Input, Tooltip, Empty, Spin, Switch, Tag, message,
} from 'antd';
import type { TreeDataNode } from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, ApartmentOutlined, UndoOutlined,
} from '@ant-design/icons';
import {
  adminService, AdminHierarchyItemDto, AdminHierarchyItemRequest, AdminMachineListDto,
} from '../../services/admin.service';
import { getErrorMessage } from '../../lib/http-client';

const { Text } = Typography;

type NodeKind = 'model' | 'section' | 'part';

const LABELS: Record<NodeKind, { title: string; field: string; child?: NodeKind }> = {
  model: { title: 'Model', field: 'Model kodu', child: 'section' },
  section: { title: 'Bölüm', field: 'Bölüm adı', child: 'part' },
  part: { title: 'Parça', field: 'Parça adı' },
};

// Silme ve geri getirme alt seviyeyi de etkiler (backend AdminMachineService ile aynı kural)
const CASCADE_NOTE: Record<NodeKind, string> = {
  model: 'Modelin bölümleri de etkilenir.',
  section: 'Bölümün parçaları da etkilenir.',
  part: 'Parçaya bağlı hata kodları da etkilenir.',
};

interface EditorState {
  mode: 'create' | 'edit';
  kind: NodeKind;
  /** create: yeni öğenin ebeveyni; edit: listesinin yenileneceği ebeveyn */
  parentId: string;
  id?: string;
}

interface MachineHierarchyDrawerProps {
  machine: AdminMachineListDto | null;
  onClose: () => void;
}

export function MachineHierarchyDrawer({ machine, onClose }: MachineHierarchyDrawerProps) {
  const [models, setModels] = useState<AdminHierarchyItemDto[] | null>(null);
  const [sections, setSections] = useState<Record<string, AdminHierarchyItemDto[]>>({});
  const [parts, setParts] = useState<Record<string, AdminHierarchyItemDto[]>>({});
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [showDeleted, setShowDeleted] = useState(false);
  const [editor, setEditor] = useState<EditorState | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<AdminHierarchyItemRequest>();

  const loadModels = async (machineId: string) => {
    try {
      setModels(await adminService.getMachineModels(machineId));
    } catch (err) {
      message.error(getErrorMessage(err, 'Modeller yüklenemedi'));
      setModels([]);
    }
  };

  const loadSections = async (modelId: string) => {
    try {
      const data = await adminService.getModelSections(modelId);
      setSections(prev => ({ ...prev, [modelId]: data }));
    } catch (err) {
      message.error(getErrorMessage(err, 'Bölümler yüklenemedi'));
    }
  };

  const loadParts = async (sectionId: string) => {
    try {
      const data = await adminService.getSectionParts(sectionId);
      setParts(prev => ({ ...prev, [sectionId]: data }));
    } catch (err) {
      message.error(getErrorMessage(err, 'Parçalar yüklenemedi'));
    }
  };

  const machineId = machine?.id;

  // Farklı bir makine açıldığında ağaç sıfırlanır
  useEffect(() => {
    setModels(null);
    setSections({});
    setParts({});
    setExpandedKeys([]);
    if (machineId) loadModels(machineId);
  }, [machineId]);

  // Bir öğe değiştiğinde ebeveyninin listesi, silme/geri getirme alt seviyeyi de etkilediği için alt liste de yenilenir
  const reloadAfterChange = async (kind: NodeKind, parentId: string, id?: string) => {
    if (kind === 'model') {
      await loadModels(parentId);
      if (id && sections[id]) await loadSections(id);
    } else if (kind === 'section') {
      await loadSections(parentId);
      if (id && parts[id]) await loadParts(id);
    } else {
      await loadParts(parentId);
    }
  };

  const openCreate = (kind: NodeKind, parentId: string) => {
    form.resetFields();
    setEditor({ mode: 'create', kind, parentId });
  };

  const openEdit = (kind: NodeKind, parentId: string, item: AdminHierarchyItemDto) => {
    form.setFieldsValue({ name: item.name, description: item.description });
    setEditor({ mode: 'edit', kind, parentId, id: item.id });
  };

  const handleSave = async (values: AdminHierarchyItemRequest) => {
    if (!editor) return;
    const { mode, kind, parentId, id } = editor;
    try {
      setSaving(true);
      if (mode === 'create') {
        if (kind === 'model') await adminService.createMachineModel(parentId, values);
        if (kind === 'section') await adminService.createMachineSection(parentId, values);
        if (kind === 'part') await adminService.createMachinePart(parentId, values);
      } else {
        if (kind === 'model') await adminService.updateMachineModel(id!, values);
        if (kind === 'section') await adminService.updateMachineSection(id!, values);
        if (kind === 'part') await adminService.updateMachinePart(id!, values);
      }
      message.success(`${LABELS[kind].title} ${mode === 'create' ? 'eklendi' : 'güncellendi'}`);
      setEditor(null);
      await reloadAfterChange(kind, parentId);
      // Yeni çocuk eklenen düğümü açık getir
      if (mode === 'create' && kind !== 'model') {
        const parentKey = `${kind === 'section' ? 'model' : 'section'}:${parentId}`;
        setExpandedKeys(prev => (prev.includes(parentKey) ? prev : [...prev, parentKey]));
      }
    } catch (err) {
      message.error(getErrorMessage(err, 'İşlem başarısız'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (kind: NodeKind, parentId: string, item: AdminHierarchyItemDto) => {
    Modal.confirm({
      title: `${LABELS[kind].title} sil`,
      content: `"${item.name}" silinecek. ${CASCADE_NOTE[kind]} Silinen öğeler "Silinenleri göster" ile geri getirilebilir.`,
      okText: 'Sil',
      cancelText: 'İptal',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          if (kind === 'model') await adminService.deleteMachineModel(item.id);
          if (kind === 'section') await adminService.deleteMachineSection(item.id);
          if (kind === 'part') await adminService.deleteMachinePart(item.id);
          message.success(`${LABELS[kind].title} silindi`);
          await reloadAfterChange(kind, parentId, item.id);
        } catch (err) {
          message.error(getErrorMessage(err, 'Silinemedi'));
        }
      },
    });
  };

  const handleRestore = async (kind: NodeKind, parentId: string, item: AdminHierarchyItemDto) => {
    try {
      if (kind === 'model') await adminService.restoreMachineModel(item.id);
      if (kind === 'section') await adminService.restoreMachineSection(item.id);
      if (kind === 'part') await adminService.restoreMachinePart(item.id);
      message.success(`${LABELS[kind].title} geri getirildi`);
      await reloadAfterChange(kind, parentId, item.id);
    } catch (err) {
      message.error(getErrorMessage(err, 'Geri getirilemedi'));
    }
  };

  const renderTitle = (kind: NodeKind, parentId: string, item: AdminHierarchyItemDto) => {
    const childKind = LABELS[kind].child;
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ opacity: item.isActive ? 1 : 0.5 }}>
          <Text strong delete={!item.isActive}>{item.name}</Text>
          {!item.isActive && <Tag color="red" style={{ marginLeft: 8 }}>Silindi</Tag>}
          {item.description && <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>{item.description}</Text>}
        </span>
        <Space size={0} onClick={e => e.stopPropagation()}>
          {item.isActive ? (
            <>
              {childKind && (
                <Tooltip title={`${LABELS[childKind].title} ekle`}>
                  <Button size="small" type="text" icon={<PlusOutlined />} onClick={() => openCreate(childKind, item.id)} />
                </Tooltip>
              )}
              <Tooltip title="Düzenle">
                <Button size="small" type="text" icon={<EditOutlined />} onClick={() => openEdit(kind, parentId, item)} />
              </Tooltip>
              <Tooltip title="Sil">
                <Button size="small" type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(kind, parentId, item)} />
              </Tooltip>
            </>
          ) : (
            <Tooltip title={`Geri getir. ${CASCADE_NOTE[kind]}`}>
              <Button size="small" type="link" icon={<UndoOutlined />} onClick={() => handleRestore(kind, parentId, item)}>
                Geri getir
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>
    );
  };

  const visible = (items: AdminHierarchyItemDto[] | undefined) =>
    items?.filter(item => showDeleted || item.isActive);

  const treeData: TreeDataNode[] = (visible(models ?? []) ?? []).map(model => ({
    key: `model:${model.id}`,
    title: renderTitle('model', machine!.id, model),
    children: visible(sections[model.id])?.map(section => ({
      key: `section:${section.id}`,
      title: renderTitle('section', model.id, section),
      children: visible(parts[section.id])?.map(part => ({
        key: `part:${part.id}`,
        title: renderTitle('part', section.id, part),
        isLeaf: true,
      })),
    })),
  }));

  // Alt seviyeler düğüm ilk açıldığında yüklenir
  const loadData = async (node: { key: React.Key }) => {
    const [kind, id] = String(node.key).split(':');
    if (kind === 'model' && !sections[id]) await loadSections(id);
    if (kind === 'section' && !parts[id]) await loadParts(id);
  };

  const editorLabels = editor ? LABELS[editor.kind] : null;
  const deletedModelCount = models?.filter(m => !m.isActive).length ?? 0;

  return (
    <Drawer
      title={
        <Space>
          <ApartmentOutlined />
          {machine ? `${machine.brand} — Model / Bölüm / Parça` : ''}
        </Space>
      }
      width={680}
      open={!!machine}
      onClose={onClose}
      extra={
        machine && (
          <Space>
            <Space size={4}>
              <Switch size="small" checked={showDeleted} onChange={setShowDeleted} />
              <Text type="secondary">Silinenleri göster</Text>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openCreate('model', machine.id)}>
              Model Ekle
            </Button>
          </Space>
        )
      }
    >
      {models === null ? (
        <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
      ) : treeData.length === 0 ? (
        <Empty
          description={
            deletedModelCount > 0 && !showDeleted
              ? `Aktif model yok (${deletedModelCount} silinmiş model var)`
              : 'Bu makineye ait model yok'
          }
        />
      ) : (
        <Tree
          blockNode
          selectable={false}
          treeData={treeData}
          loadData={loadData}
          expandedKeys={expandedKeys}
          onExpand={keys => setExpandedKeys(keys)}
        />
      )}

      <Modal
        title={editor && editorLabels ? `${editorLabels.title} ${editor.mode === 'create' ? 'Ekle' : 'Düzenle'}` : ''}
        open={!!editor}
        onCancel={() => setEditor(null)}
        footer={null}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 16 }}>
          <Form.Item name="name" label={editorLabels?.field} rules={[{ required: true, message: 'Bu alan zorunludur' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Açıklama">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Space>
              <Button onClick={() => setEditor(null)}>İptal</Button>
              <Button type="primary" htmlType="submit" loading={saving}>Kaydet</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
}
