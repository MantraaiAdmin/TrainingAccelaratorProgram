function getApiBaseUrl(): string {
  // Use same-origin requests in the browser (Vercel rewrites proxy to Render API).
  // Avoids CORS issues and is more reliable for production.
  if (typeof window !== 'undefined') return '';
  const publicUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (publicUrl) return publicUrl;
  return (process.env.API_URL || 'http://localhost:4000').replace(/\/$/, '');
}

const API_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  token?: string;
  skipAuthRetry?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const accessToken = token || this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    };

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/api/v1${endpoint}`, {
        ...fetchOptions,
        headers,
      });
    } catch (err) {
      const message = (err as Error).message || '';
      if (message === 'Failed to fetch' || err instanceof TypeError) {
        throw new Error(
          'Cannot reach the server. Wait 60 seconds and try again, or check your internet connection.',
        );
      }
      throw err;
    }

    if (response.status === 401 && !options.skipAuthRetry) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        return this.fetch(endpoint, options);
      }
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!response.ok) return false;
      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      return true;
    } catch {
      return false;
    }
  }

  // Auth
  login(email: string, password: string) {
    return this.fetch<{ user: unknown; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      token: '',
      skipAuthRetry: true,
    });
  }

  // Tracks
  getTracks() {
    return this.fetch<unknown[]>('/tracks');
  }

  getTrack(slug: string) {
    return this.fetch<unknown>(`/tracks/${slug}`);
  }

  getSubsection(id: string) {
    return this.fetch<unknown>(`/tracks/subsection/${id}`);
  }

  // Progress
  getDashboard() {
    return this.fetch<unknown>('/progress/dashboard');
  }

  markComplete(subsectionId: string) {
    return this.fetch(`/progress/complete/${subsectionId}`, { method: 'POST' });
  }

  // Code
  runCode(code: string, input?: string) {
    return this.fetch('/code/run', { method: 'POST', body: JSON.stringify({ code, input }) });
  }

  submitCode(exerciseId: string, code: string) {
    return this.fetch(`/code/submit/${exerciseId}`, { method: 'POST', body: JSON.stringify({ code }) });
  }

  // Quizzes
  submitQuiz(quizId: string, answers: Record<string, string>) {
    return this.fetch(`/quizzes/${quizId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) });
  }

  // AI
  aiChat(message: string, chatId?: string, context?: Record<string, unknown>) {
    return this.fetch<{ chatId: string; content: string }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, chatId, context }),
    });
  }

  getAiHint(exerciseId: string, code?: string, error?: string) {
    return this.fetch('/ai/hint/' + exerciseId, {
      method: 'POST',
      body: JSON.stringify({ code, error }),
    });
  }

  mockInterview(type: string, message: string, sessionId?: string) {
    return this.fetch('/ai/mock-interview', {
      method: 'POST',
      body: JSON.stringify({ type, message, sessionId }),
    });
  }

  // Gamification
  getLeaderboard() {
    return this.fetch<unknown[]>('/gamification/leaderboard');
  }

  getAchievements() {
    return this.fetch<unknown[]>('/gamification/achievements');
  }

  // Admin
  getAdminAnalytics() {
    return this.fetch('/admin/analytics');
  }

  getAdminFinance() {
    return this.fetch('/admin/finance');
  }

  getAdminAiUsage(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    collegeId?: string;
    year?: number;
    days?: number;
  } = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.search) q.set('search', params.search);
    if (params.collegeId) q.set('collegeId', params.collegeId);
    if (params.year) q.set('year', String(params.year));
    if (params.days) q.set('days', String(params.days));
    const qs = q.toString();
    return this.fetch(`/admin/ai-usage${qs ? `?${qs}` : ''}`);
  }

  getStudents(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    collegeId?: string;
    departmentId?: string;
    year?: number;
    trackId?: string;
    status?: 'active' | 'inactive' | 'all';
  } = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.search) q.set('search', params.search);
    if (params.sortBy) q.set('sortBy', params.sortBy);
    if (params.sortOrder) q.set('sortOrder', params.sortOrder);
    if (params.collegeId) q.set('collegeId', params.collegeId);
    if (params.departmentId) q.set('departmentId', params.departmentId);
    if (params.year) q.set('year', String(params.year));
    if (params.trackId) q.set('trackId', params.trackId);
    if (params.status && params.status !== 'all') q.set('status', params.status);
    const qs = q.toString();
    return this.fetch(`/admin/students${qs ? `?${qs}` : ''}`);
  }

  createStudent(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    collegeId?: string;
    departmentId?: string;
    collegeName?: string;
    departmentName?: string;
    year?: number;
    commissionTier?: 'AUTO' | 'STANDARD' | 'PREMIUM';
  }) {
    return this.fetch('/admin/students', { method: 'POST', body: JSON.stringify(data) });
  }

  updateStudentCommissionTier(userId: string, commissionTier: 'AUTO' | 'STANDARD' | 'PREMIUM') {
    return this.fetch(`/admin/students/${userId}/commission-tier`, {
      method: 'PUT',
      body: JSON.stringify({ commissionTier }),
    });
  }

  getColleges() {
    return this.fetch<Array<{
      id: string;
      name: string;
      departments: Array<{ id: string; name: string; code: string }>;
    }>>('/colleges');
  }

  async bulkUploadStudents(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const accessToken = this.getToken();
    const response = await fetch(`${this.baseUrl}/api/v1/admin/students/bulk-upload`, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  assignTrack(userId: string, trackId: string) {
    return this.fetch(`/admin/students/${userId}/assign-track`, {
      method: 'POST',
      body: JSON.stringify({ trackId }),
    });
  }

  unassignTrack(userId: string, trackId: string) {
    return this.fetch(`/admin/students/${userId}/unassign-track`, {
      method: 'PUT',
      body: JSON.stringify({ trackId }),
    });
  }

  bulkAssignTrack(userIds: string[], trackId: string) {
    return this.fetch('/admin/students/bulk-assign-track', {
      method: 'POST',
      body: JSON.stringify({ userIds, trackId }),
    });
  }

  deactivateStudent(userId: string) {
    return this.fetch(`/admin/students/${userId}/deactivate`, { method: 'PUT' });
  }

  getAdminUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    status?: 'active' | 'inactive' | 'all';
    role?: 'ADMIN' | 'SUPER_ADMIN' | 'all';
  } = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set('page', String(params.page));
    if (params.pageSize) q.set('pageSize', String(params.pageSize));
    if (params.search) q.set('search', params.search);
    if (params.sortBy) q.set('sortBy', params.sortBy);
    if (params.sortOrder) q.set('sortOrder', params.sortOrder);
    if (params.status && params.status !== 'all') q.set('status', params.status);
    if (params.role && params.role !== 'all') q.set('role', params.role);
    const qs = q.toString();
    return this.fetch(`/admin/users${qs ? `?${qs}` : ''}`);
  }

  createAdminUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'SUPER_ADMIN';
  }) {
    return this.fetch('/admin/users', { method: 'POST', body: JSON.stringify(data) });
  }

  deleteAdminUser(userId: string) {
    return this.fetch(`/admin/users/${userId}`, { method: 'DELETE' });
  }

  getAdminTracks() {
    return this.fetch('/admin/tracks');
  }

  createAdminTrack(data: {
    name: string;
    slug: string;
    tagline?: string;
    description?: string;
    priceInr?: number;
  }) {
    return this.fetch('/admin/tracks', { method: 'POST', body: JSON.stringify(data) });
  }

  updateAdminTrack(id: string, data: Record<string, unknown>) {
    return this.fetch(`/admin/tracks/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  deleteAdminTrack(id: string) {
    return this.fetch(`/admin/tracks/${id}`, { method: 'DELETE' });
  }

  getCommissions() {
    return this.fetch<{
      defaults: import('./commission-types').CommissionConfig;
      colleges: Array<import('./commission-types').CommissionConfig & {
        id: string;
        name: string;
        code: string;
        _count: { users: number };
      }>;
    }>('/admin/commissions');
  }

  updateDefaultCommission(data: import('./commission-types').CommissionConfig) {
    return this.fetch('/admin/commissions/defaults', { method: 'PUT', body: JSON.stringify(data) });
  }

  updateCollegeCommission(collegeId: string, data: import('./commission-types').CommissionConfig) {
    return this.fetch(`/admin/commissions/college/${collegeId}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  // Certificates
  getCertificates() {
    return this.fetch('/certificates/my');
  }

  generateCertificate(trackId: string) {
    return this.fetch(`/certificates/generate/${trackId}`, { method: 'POST' });
  }
}

export const api = new ApiClient(API_URL);
