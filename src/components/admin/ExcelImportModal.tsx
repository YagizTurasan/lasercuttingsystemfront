import { useState } from 'react';
import { Modal, Upload, Button, Alert, Table, Typography, List, Space, message } from 'antd';
import type { UploadFile } from 'antd';
import { InboxOutlined, FileExcelOutlined, DownloadOutlined } from '@ant-design/icons';
import { adminService, ExcelImportResult } from '../../services/admin.service';
import { getErrorMessage } from '../../lib/http-client';

const { Text } = Typography;

// Backend ExcelUploadController'ın beklediği sütun sırası (ilk satır başlıktır)
const COLUMNS = [
  { col: 1, name: 'Code', required: true, note: 'Aynı kod varsa güncellenir' },
  { col: 2, name: 'Title', required: true, note: '' },
  { col: 3, name: 'Description', required: false, note: '' },
  { col: 4, name: 'Solutions', required: false, note: '' },
  { col: 5, name: 'IsFreeAccess', required: false, note: '1 = ücretsiz' },
  { col: 6, name: 'Brand', required: true, note: 'Yoksa makine oluşturulur' },
  { col: 7, name: 'Model', required: false, note: 'Yoksa oluşturulur' },
  { col: 8, name: 'Section', required: false, note: 'Model gerekli' },
  { col: 9, name: 'Part', required: false, note: 'Section gerekli' },
  { col: 10, name: 'ErrorSource', required: false, note: 'Yoksa oluşturulur' },
];

interface ExcelImportModalProps {
  open: boolean;
  onClose: () => void;
  /** En az bir satır başarıyla aktarıldığında çağrılır */
  onImported: () => void;
}

export function ExcelImportModal({ open, onClose, onImported }: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ExcelImportResult | null>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const res = await adminService.importErrorCodesFromExcel(file);
      setResult(res);
      if (res.successCount > 0) onImported();
    } catch (err) {
      message.error(getErrorMessage(err, 'Excel içe aktarılamadı'));
    } finally {
      setUploading(false);
    }
  };

  const [downloading, setDownloading] = useState(false);

  // Doğru sütun sırasına ve örnek bir satıra sahip boş şablon backend'de üretilir
  const handleDownloadTemplate = async () => {
    try {
      setDownloading(true);
      const blob = await adminService.downloadExcelTemplate();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'hata-kodlari-sablon.xlsx';
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      message.error(getErrorMessage(err, 'Şablon indirilemedi'));
    } finally {
      setDownloading(false);
    }
  };

  const fileList: UploadFile[] = file ? [{ uid: '-1', name: file.name, status: 'done' }] : [];

  return (
    <Modal
      title={<Space><FileExcelOutlined style={{ color: '#52c41a' }} />Excel'den Hata Kodu İçe Aktar</Space>}
      open={open}
      onCancel={handleClose}
      width={720}
      footer={
        result ? (
          <Space>
            <Button onClick={reset}>Yeni Dosya</Button>
            <Button type="primary" onClick={handleClose}>Kapat</Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={handleClose}>İptal</Button>
            <Button type="primary" onClick={handleImport} loading={uploading} disabled={!file}>
              İçe Aktar
            </Button>
          </Space>
        )
      }
    >
      {result ? (
        <>
          <Alert
            type={result.failureCount === 0 ? 'success' : result.successCount === 0 ? 'error' : 'warning'}
            showIcon
            message={result.message}
            style={{ marginBottom: 16 }}
          />
          {result.errors.length > 0 && (
            <List
              size="small"
              bordered
              header={<Text strong>Hatalı satırlar</Text>}
              dataSource={result.errors}
              renderItem={e => <List.Item><Text type="danger">{e}</Text></List.Item>}
              style={{ maxHeight: 300, overflow: 'auto' }}
            />
          )}
        </>
      ) : (
        <>
          <Upload.Dragger
            accept=".xlsx,.xls"
            maxCount={1}
            fileList={fileList}
            // Dosya hemen yüklenmez; "İçe Aktar" ile gönderilir
            beforeUpload={f => { setFile(f); return false; }}
            onRemove={() => { setFile(null); }}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Excel dosyasını sürükleyin veya seçmek için tıklayın</p>
            <p className="ant-upload-hint">.xlsx veya .xls — ilk satır başlık, veriler 2. satırdan başlar</p>
          </Upload.Dragger>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 8px' }}>
            <Text strong>Sütun sırası</Text>
            <Button size="small" icon={<DownloadOutlined />} onClick={handleDownloadTemplate} loading={downloading}>
              Şablonu İndir
            </Button>
          </div>
          <Table
            size="small"
            pagination={false}
            rowKey="col"
            dataSource={COLUMNS}
            columns={[
              { title: '#', dataIndex: 'col', width: 40 },
              { title: 'Sütun', dataIndex: 'name' },
              { title: 'Zorunlu', dataIndex: 'required', width: 80, render: (r: boolean) => (r ? '✔' : '') },
              { title: 'Not', dataIndex: 'note' },
            ]}
          />
        </>
      )}
    </Modal>
  );
}
