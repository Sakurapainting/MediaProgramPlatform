import React, { useState, useEffect } from 'react';
import { Card, Button, Upload, Form, Input, List, message, Modal, Progress, Select } from 'antd';
import { UploadOutlined, PlayCircleOutlined, SendOutlined } from '@ant-design/icons';
import { contentAPI, deviceAPI } from '../services/api';
import type { UploadFile } from 'antd/es/upload/interface';

const { Option } = Select;

const ContentManagement: React.FC = () => {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [pushModalVisible, setPushModalVisible] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [onlineDevices, setOnlineDevices] = useState<any[]>([]);
  const [form] = Form.useForm();
  const [pushForm] = Form.useForm();

  // 获取视频列表
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await contentAPI.getVideos();
      if (res.success) {
        setVideos(res.data);
      } else {
        message.error(res.message || '获取视频列表失败');
      }
    } catch (err: any) {
      console.error('获取视频列表失败:', err);
      message.error('获取视频列表失败: ' + (err.response?.data?.message || err.message));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // 获取在线设备列表
  const fetchOnlineDevices = async () => {
    try {
      const res = await contentAPI.getOnlineDevices();
      if (res.success) {
        setOnlineDevices(res.data || []);
      } else {
        message.error(res.message || '获取在线设备列表失败');
      }
    } catch (err: any) {
      console.error('获取在线设备列表失败:', err);
      message.error('获取在线设备列表失败: ' + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    fetchOnlineDevices();
  }, []);

  // 处理文件选择
  const handleFileChange = (info: any) => {
    if (info.fileList && info.fileList.length > 0) {
      const file = info.fileList[0];
      // 验证文件类型
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        message.error('不支持的文件类型，请选择MP4、WebM、OGG、AVI或MOV格式的视频文件');
        setSelectedFile(null);
        return;
      }
      // 验证文件大小 (1GB = 1024 * 1024 * 1024 bytes)
      if (file.size > 1024 * 1024 * 1024) {
        message.error('文件太大，最大支持1GB');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  // 重置表单
  const resetForm = () => {
    form.resetFields();
    setSelectedFile(null);
    setUploadProgress(0);
  };

  // 关闭上传弹窗
  const handleCloseUpload = () => {
    resetForm();
    setUploadModalVisible(false);
  };

  // 上传视频表单提交
  const handleUpload = async (values: any) => {
    if (!selectedFile || !selectedFile.originFileObj) {
      message.warning('请先选择视频文件');
      return;
    }

    // 验证必填字段
    if (!values.title?.trim()) {
      message.warning('请输入视频标题');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    const formData = new FormData();
    formData.append('video', selectedFile.originFileObj);
    formData.append('title', values.title.trim());
    formData.append('description', values.description?.trim() || '');
    formData.append('category', values.category?.trim() || '');
    formData.append('tags', values.tags?.trim() || '');

    try {
      console.log('开始上传视频...');
      const res = await contentAPI.uploadVideo(formData, (percent) => {
        setUploadProgress(percent);
      });
      
      if (res.success) {
        message.success('视频上传成功！');
        handleCloseUpload();
        fetchVideos();
      } else {
        console.error('上传失败:', res);
        message.error(res.message || '上传失败');
      }
    } catch (err: any) {
      console.error('上传异常:', err);
      const errorMsg = err.response?.data?.message || err.message || '上传失败';
      message.error('上传失败: ' + errorMsg);
    }
    setUploading(false);
    setUploadProgress(0);
  };

  // 打开下发弹窗
  const handleOpenPush = (content: any) => {
    setSelectedContent(content);
    setPushModalVisible(true);
    fetchOnlineDevices(); // 重新获取最新的在线设备
  };

  // 关闭下发弹窗
  const handleClosePush = () => {
    setPushModalVisible(false);
    setSelectedContent(null);
    pushForm.resetFields();
  };

  // 下发视频到设备
  const handlePushToDevice = async (values: any) => {
    if (!selectedContent) {
      message.error('未选择内容');
      return;
    }

    const { deviceId } = values;
    if (!deviceId) {
      message.error('请选择目标设备');
      return;
    }

    // 查找设备信息获取clientId
    const device = onlineDevices.find(d => d.id === deviceId);
    const clientId = device?.clientId || deviceId;

    setPushing(true);
    try {
      const res = await contentAPI.pushToDevice(selectedContent._id, deviceId, clientId);
      
      if (res.success) {
        message.success(`视频 "${selectedContent.title}" 已成功下发到设备 ${deviceId}`);
        handleClosePush();
      } else {
        message.error(res.message || '下发失败');
      }
    } catch (err: any) {
      console.error('下发失败:', err);
      const errorMsg = err.response?.data?.message || err.message || '下发失败';
      message.error('下发失败: ' + errorMsg);
    }
    setPushing(false);
  };

  return (
    <Card title="内容管理" extra={<Button type="primary" onClick={() => setUploadModalVisible(true)}>上传视频</Button>}>
      <List
        loading={loading}
        itemLayout="horizontal"
        dataSource={videos}
        renderItem={item => (
          <List.Item
            actions={[
              <Button icon={<PlayCircleOutlined />} onClick={() => setPreviewUrl(item.fileUrl)} type="link">预览</Button>,
              <Button 
                icon={<SendOutlined />} 
                onClick={() => {
                  handleOpenPush(item);
                }} 
                type="link"
              >
                下发
              </Button>
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={<>
                <div>类型: {item.format}</div>
                <div>大小: {(item.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                <div>上传时间: {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</div>
              </>}
            />
          </List.Item>
        )}
      />

      <Modal
        open={!!previewUrl}
        title="视频预览"
        footer={null}
        onCancel={() => setPreviewUrl(null)}
        width={720}
      >
        {previewUrl && (
          <video src={previewUrl} controls style={{ width: '100%' }} />
        )}
      </Modal>

      <Modal
        open={uploadModalVisible}
        title="上传视频"
        onCancel={handleCloseUpload}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="category" label="分类">
            <Input />
          </Form.Item>
          <Form.Item name="tags" label="标签（逗号分隔）">
            <Input />
          </Form.Item>
          <Form.Item
            label="选择视频"
            required
            help={!selectedFile && '请选择视频文件'}
            validateStatus={!selectedFile ? 'error' : 'success'}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="video/*"
              fileList={selectedFile ? [selectedFile] : []}
              onChange={handleFileChange}
              onRemove={() => setSelectedFile(null)}
            >
              <Button icon={<UploadOutlined />}>选择视频</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              disabled={!selectedFile}
              block
            >
              上传
            </Button>
          </Form.Item>
          {uploading && (
            <Form.Item>
              <Progress percent={uploadProgress} />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <Modal
        open={pushModalVisible}
        title={`下发视频：${selectedContent?.title || ''}`}
        onCancel={handleClosePush}
        footer={null}
        destroyOnClose
      >
        <Form form={pushForm} layout="vertical" onFinish={handlePushToDevice}>
          <Form.Item>
            <div style={{ marginBottom: 16 }}>
              <strong>视频信息：</strong>
              <div>标题：{selectedContent?.title}</div>
              <div>格式：{selectedContent?.format}</div>
              <div>大小：{selectedContent ? (selectedContent.fileSize / 1024 / 1024).toFixed(2) : 0} MB</div>
            </div>
          </Form.Item>
          <Form.Item
            name="deviceId"
            label="选择目标设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select 
              placeholder="请选择设备" 
              loading={onlineDevices.length === 0}
              notFoundContent={onlineDevices.length === 0 ? "暂无在线设备" : "未找到设备"}
            >
              {onlineDevices.map(device => (
                <Option key={device.id} value={device.id}>
                  {device.id} - {device.status === 'online' ? '在线' : '离线'}
                  {device.lastSeen && ` (${new Date(device.lastSeen).toLocaleString()})`}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={pushing}
              block
            >
              下发到设备
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ContentManagement;
