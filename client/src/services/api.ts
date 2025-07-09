import axios, { AxiosResponse, AxiosError } from 'axios';

// API基础配置
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.token) {
          config.headers.Authorization = `Bearer ${authData.state.token}`;
        }
      } catch (error) {
        console.error('Token解析失败:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token过期，清除本地存储并跳转到登录页
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 通用接口类型定义
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 用户相关接口
export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

// 设备相关接口
export interface Device {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'offline';
  resolution: string;
  lastHeartbeat: string;
  ipAddress?: string;
  macAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 内容相关接口
export interface Content {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text';
  url?: string;
  content?: string;
  duration?: number;
  size?: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

// 活动相关接口
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'scheduled';
  startDate: string;
  endDate: string;
  devices: string[];
  content: string[];
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

// 统计数据接口
export interface AnalyticsData {
  totalDevices: number;
  onlineDevices: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalContent: number;
  deviceStatusChart: Array<{ name: string; value: number }>;
  campaignPerformance: Array<{ name: string; impressions: number; clicks: number }>;
}

// MQTT消息接口
export interface MQTTMessage {
  topic: string;
  message: any;
  qos?: 0 | 1 | 2;
}

// ======================== API方法定义 ========================

// 认证相关API
export const authAPI = {
  // 用户登录
  login: async (credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  // 用户注册
  register: async (userData: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> => {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  // 退出登录
  logout: async (): Promise<ApiResponse> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // 获取当前用户信息
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },
};

// 用户管理API
export const userAPI = {
  // 获取用户列表
  getUsers: async (params?: { page?: number; limit?: number; role?: string }): Promise<ApiResponse<{ users: User[]; total: number }>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // 获取用户详情
  getUser: async (id: string): Promise<ApiResponse<User>> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // 创建用户
  createUser: async (userData: Omit<RegisterData, 'password'> & { password?: string }): Promise<ApiResponse<User>> => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // 更新用户
  updateUser: async (id: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  },

  // 删除用户
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

// 设备管理API
export const deviceAPI = {
  // 获取设备列表
  getDevices: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ devices: Device[]; total: number }>> => {
    const response = await apiClient.get('/devices', { params });
    return response.data;
  },

  // 获取设备详情
  getDevice: async (id: string): Promise<ApiResponse<Device>> => {
    const response = await apiClient.get(`/devices/${id}`);
    return response.data;
  },

  // 创建设备
  createDevice: async (deviceData: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Device>> => {
    const response = await apiClient.post('/devices', deviceData);
    return response.data;
  },

  // 更新设备
  updateDevice: async (id: string, deviceData: Partial<Device>): Promise<ApiResponse<Device>> => {
    const response = await apiClient.put(`/devices/${id}`, deviceData);
    return response.data;
  },

  // 删除设备
  deleteDevice: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/devices/${id}`);
    return response.data;
  },

  // 获取设备状态
  getDeviceStatus: async (id: string): Promise<ApiResponse<{ status: string; lastHeartbeat: string }>> => {
    const response = await apiClient.get(`/devices/${id}/status`);
    return response.data;
  },
};

// 内容管理API
export const contentAPI = {
  // 获取内容列表
  getContents: async (params?: { page?: number; limit?: number; type?: string }): Promise<ApiResponse<{ contents: Content[]; total: number }>> => {
    const response = await apiClient.get('/content', { params });
    return response.data;
  },

  // 获取内容详情
  getContent: async (id: string): Promise<ApiResponse<Content>> => {
    const response = await apiClient.get(`/content/${id}`);
    return response.data;
  },

  // 创建内容
  createContent: async (contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Content>> => {
    const response = await apiClient.post('/content', contentData);
    return response.data;
  },

  // 更新内容
  updateContent: async (id: string, contentData: Partial<Content>): Promise<ApiResponse<Content>> => {
    const response = await apiClient.put(`/content/${id}`, contentData);
    return response.data;
  },

  // 删除内容
  deleteContent: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/content/${id}`);
    return response.data;
  },

  // 上传文件
  uploadFile: async (file: File): Promise<ApiResponse<{ url: string; size: number }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/content/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

// 活动管理API
export const campaignAPI = {
  // 获取活动列表
  getCampaigns: async (params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<{ campaigns: Campaign[]; total: number }>> => {
    const response = await apiClient.get('/campaigns', { params });
    return response.data;
  },

  // 获取活动详情
  getCampaign: async (id: string): Promise<ApiResponse<Campaign>> => {
    const response = await apiClient.get(`/campaigns/${id}`);
    return response.data;
  },

  // 创建活动
  createCampaign: async (campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Campaign>> => {
    const response = await apiClient.post('/campaigns', campaignData);
    return response.data;
  },

  // 更新活动
  updateCampaign: async (id: string, campaignData: Partial<Campaign>): Promise<ApiResponse<Campaign>> => {
    const response = await apiClient.put(`/campaigns/${id}`, campaignData);
    return response.data;
  },

  // 删除活动
  deleteCampaign: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.delete(`/campaigns/${id}`);
    return response.data;
  },

  // 启动活动
  startCampaign: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.post(`/campaigns/${id}/start`);
    return response.data;
  },

  // 停止活动
  stopCampaign: async (id: string): Promise<ApiResponse> => {
    const response = await apiClient.post(`/campaigns/${id}/stop`);
    return response.data;
  },
};

// 统计分析API
export const analyticsAPI = {
  // 获取总览数据
  getOverview: async (): Promise<ApiResponse<AnalyticsData>> => {
    const response = await apiClient.get('/analytics/overview');
    return response.data;
  },

  // 获取设备统计
  getDeviceStats: async (timeRange?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/devices', { params: { timeRange } });
    return response.data;
  },

  // 获取活动统计
  getCampaignStats: async (timeRange?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/campaigns', { params: { timeRange } });
    return response.data;
  },

  // 获取内容统计
  getContentStats: async (timeRange?: string): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/analytics/content', { params: { timeRange } });
    return response.data;
  },
};

// MQTT相关API
export const mqttAPI = {
  // 发送MQTT消息
  publishMessage: async (messageData: MQTTMessage): Promise<ApiResponse> => {
    const response = await apiClient.post('/mqtt/publish', messageData);
    return response.data;
  },

  // 获取MQTT状态
  getStatus: async (): Promise<ApiResponse<{ status: string; connectedClients: number }>> => {
    const response = await apiClient.get('/mqtt/status');
    return response.data;
  },

  // 获取MQTT统计信息
  getStats: async (): Promise<ApiResponse<any>> => {
    const response = await apiClient.get('/mqtt/stats');
    return response.data;
  },

  // 获取在线设备
  getOnlineDevices: async (): Promise<ApiResponse<Device[]>> => {
    const response = await apiClient.get('/mqtt/devices/online');
    return response.data;
  },
};

// 默认导出所有API
export default {
  auth: authAPI,
  user: userAPI,
  device: deviceAPI,
  content: contentAPI,
  campaign: campaignAPI,
  analytics: analyticsAPI,
  mqtt: mqttAPI,
};

// 也导出axios实例，以便在需要时使用
export { apiClient };
