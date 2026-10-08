/* eslint-disable react-hooks/rules-of-hooks */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from './ApiClient';
import { unwrap, unwrapPaginated, unwrapList } from './apiUtils';

// -------------------------------------------------
//  Auth APIs
// -------------------------------------------------
export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  sendOtp: (data) => apiClient.post('/auth/send-otp', data),
  verifyOtp: (data) => apiClient.post('/auth/verify-otp', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateLanguage: (data) => apiClient.put('/auth/language', data),
  setup2FA: () => apiClient.post('/auth/2fa/setup'),
  verify2FA: (data) => apiClient.post('/auth/2fa/verify', data),
};

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.login(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
};

export const useUpdateLanguageMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.updateLanguage(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: (data) => authApi.register(data),
  });
};

export const useSendOtpMutation = () => {
  return useMutation({
    mutationFn: (data) => authApi.sendOtp(data),
  });
};

export const useVerifyOtpMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => authApi.verifyOtp(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
};

export const useGetProfileQuery = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => unwrap(await authApi.getProfile()),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

// -------------------------------------------------
//  Crop Catalog & Mandi Rate APIs
// -------------------------------------------------
export const cropApi = {
  getCrops: () => apiClient.get('/crops'),
  getPrices: (params) => apiClient.get('/crops/prices', { params }),
};

export const useGetCropsQuery = () => {
  return useQuery({
    queryKey: ['crops'],
    queryFn: async () => unwrapList(await cropApi.getCrops()),
  });
};

export const useGetMandiPricesQuery = (params = {}) => {
  return useQuery({
    queryKey: ['mandi-prices', params],
    queryFn: async () => unwrapList(await cropApi.getPrices(params)),
  });
};

// -------------------------------------------------
//  Product & Marketplace APIs
// -------------------------------------------------
export const productApi = {
  getMarket: (params) => apiClient.get('/products/market', { params }),
  getProductById: (id) => apiClient.get(`/products/market/${id}`),
  getSellerProducts: (params) => apiClient.get('/products/seller', { params }),
  createProduct: (data) => apiClient.post('/products/seller', data),
  updateProduct: (id, data) => apiClient.put(`/products/seller/${id}`, data),
};

export const useGetPublicMarketQuery = (params = {}) => {
  return useQuery({
    queryKey: ['market-products', params],
    queryFn: async () => unwrapPaginated(await productApi.getMarket(params)),
  });
};

export const useGetProductDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => unwrap(await productApi.getProductById(id)),
    enabled: !!id,
  });
};

export const useGetSellerProductsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['seller-products', params],
    queryFn: async () => unwrapPaginated(await productApi.getSellerProducts(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => productApi.createProduct(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-products'] });
      queryClient.invalidateQueries({ queryKey: ['market-products'] });
    },
  });
};

// -------------------------------------------------
//  Order & Escrow APIs
// -------------------------------------------------
export const orderApi = {
  createOrder: (data) => apiClient.post('/orders/buyer', data),
  getBuyerOrders: (params) => apiClient.get('/orders/buyer', { params }),
  getSellerOrders: (params) => apiClient.get('/orders/seller', { params }),
  getOrderById: (id) => apiClient.get(`/orders/${id}`),
  updateOrderStatus: (id, data) => apiClient.patch(`/orders/${id}/status`, data),
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => orderApi.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['market-products'] });
    },
  });
};

export const useGetBuyerOrdersQuery = (params = {}) => {
  return useQuery({
    queryKey: ['buyer-orders', params],
    queryFn: async () => unwrapPaginated(await orderApi.getBuyerOrders(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetSellerOrdersQuery = (params = {}) => {
  return useQuery({
    queryKey: ['seller-orders', params],
    queryFn: async () => unwrapPaginated(await orderApi.getSellerOrders(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetOrderDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['order-detail', id],
    queryFn: async () => unwrap(await orderApi.getOrderById(id)),
    enabled: !!id && !!localStorage.getItem('accessToken'),
  });
};

export const useUpdateOrderStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => orderApi.updateOrderStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['seller-orders'] });
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
    },
  });
};

// -------------------------------------------------
//  Seller & KYC Verification APIs
// -------------------------------------------------
export const sellerApi = {
  getProfile: () => apiClient.get('/seller/profile'),
  submitKYC: (data) => apiClient.put('/seller/kyc', data),
  requestUnlock: (data) => apiClient.post('/seller/kyc/request-unlock', data),
  uploadDocument: (formData) =>
    apiClient.post('/seller/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const useGetSellerProfileQuery = () => {
  return useQuery({
    queryKey: ['seller-profile'],
    queryFn: async () => unwrap(await sellerApi.getProfile()),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useSubmitKYCMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sellerApi.submitKYC(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
    },
  });
};

export const useRequestUnlockMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => sellerApi.requestUnlock(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useUploadDocumentMutation = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('document', file);
      const res = await sellerApi.uploadDocument(formData);
      return unwrap(res);
    },
  });
};

// -------------------------------------------------
//  Admin Control Tower APIs
// -------------------------------------------------
export const adminApi = {
  getMetrics: () => apiClient.get('/admin/metrics'),
  getKYCQueue: (params) => apiClient.get('/admin/kyc/queue', { params }),
  getKYCDetails: (sellerId) => apiClient.get(`/admin/kyc/${sellerId}`),
  moderateKYC: (sellerId, data) => apiClient.patch(`/admin/kyc/${sellerId}/moderate`, data),
  unlockKYC: (sellerId, data) => apiClient.patch(`/admin/kyc/${sellerId}/unlock`, data),
  rejectUnlockKYC: (sellerId, data) => apiClient.patch(`/admin/kyc/${sellerId}/reject-unlock`, data),
  getLedger: (params) => apiClient.get('/admin/finance/ledger', { params }),
  getPayouts: (params) => apiClient.get('/admin/finance/payouts', { params }),
  approvePayout: (id, data) => apiClient.patch(`/admin/finance/payouts/${id}/approve`, data),
  holdPayout: (id, data) => apiClient.patch(`/admin/finance/payouts/${id}/hold`, data),
  getOrders: (params) => apiClient.get('/admin/orders', { params }),
  getOrderDetails: (id) => apiClient.get(`/admin/orders/${id}`),
  orderIntervention: (id, data) => apiClient.patch(`/admin/orders/${id}/intervention`, data),
  getUsers: (params) => apiClient.get('/admin/users', { params }),
  getUserDetails: (id) => apiClient.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => apiClient.patch(`/admin/users/${id}/status`, data),
  permanentlyDeleteUser: (id, data) => apiClient.delete(`/admin/users/${id}`, { data }),
  getListings: (params) => apiClient.get('/admin/listings', { params }),
  moderateListing: (id, data) => apiClient.patch(`/admin/listings/${id}/moderate`, data),
  permanentlyDeleteListing: (id, data) => apiClient.delete(`/admin/listings/${id}`, { data }),
  getDisputes: (params) => apiClient.get('/admin/disputes', { params }),
  getDisputeDetails: (id) => apiClient.get(`/admin/disputes/${id}`),
  resolveDispute: (id, data) => apiClient.patch(`/admin/disputes/${id}/resolve`, data),
  getSettings: () => apiClient.get('/admin/settings'),
  updateSettings: (data) => apiClient.post('/admin/settings', data),
  getAuditLogs: (params) => apiClient.get('/admin/audit-logs', { params }),
};

export const useUnlockKYCMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sellerId, ...data }) => adminApi.unlockKYC(sellerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-detail'] });
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useRejectUnlockKYCMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sellerId, ...data }) => adminApi.rejectUnlockKYC(sellerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-detail'] });
      queryClient.invalidateQueries({ queryKey: ['seller-profile'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useGetKYCDetailsQuery = (sellerId) => {
  return useQuery({
    queryKey: ['admin-kyc-detail', sellerId],
    queryFn: async () => unwrap(await adminApi.getKYCDetails(sellerId)),
    enabled: !!sellerId && !!localStorage.getItem('accessToken'),
  });
};

export const useGetAdminMetricsQuery = () => {
  return useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => unwrap(await adminApi.getMetrics()),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetKYCQueueQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-kyc-queue', params],
    queryFn: async () => unwrapPaginated(await adminApi.getKYCQueue(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useModerateKYCMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sellerId, ...data }) => adminApi.moderateKYC(sellerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-queue'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useGetLedgerQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-ledger', params],
    queryFn: async () => unwrapPaginated(await adminApi.getLedger(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetPayoutsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-payouts', params],
    queryFn: async () => unwrapPaginated(await adminApi.getPayouts(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetAuditLogsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-audit-logs', params],
    queryFn: async () => unwrapPaginated(await adminApi.getAuditLogs(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetAdminOrdersQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-orders', params],
    queryFn: async () => unwrapPaginated(await adminApi.getOrders(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetAdminOrderDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['admin-order-detail', id],
    queryFn: async () => unwrap(await adminApi.getOrderDetails(id)),
    enabled: !!id && !!localStorage.getItem('accessToken'),
  });
};

export const useOrderInterventionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.orderIntervention(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useGetAdminUsersQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-users', params],
    queryFn: async () => unwrapPaginated(await adminApi.getUsers(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetAdminUserDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['admin-user-detail', id],
    queryFn: async () => unwrap(await adminApi.getUserDetails(id)),
    enabled: !!id && !!localStorage.getItem('accessToken'),
  });
};

export const useUpdateUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.updateUserStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
    },
  });
};

export const usePermanentlyDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.permanentlyDeleteUser(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useGetAdminListingsQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-listings', params],
    queryFn: async () => unwrapPaginated(await adminApi.getListings(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useModerateListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.moderateListing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const usePermanentlyDeleteListingMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => adminApi.permanentlyDeleteListing(id, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useGetAdminDisputesQuery = (params = {}) => {
  return useQuery({
    queryKey: ['admin-disputes', params],
    queryFn: async () => unwrapPaginated(await adminApi.getDisputes(params)),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useGetDisputeDetailsQuery = (id) => {
  return useQuery({
    queryKey: ['admin-dispute-detail', id],
    queryFn: async () => unwrap(await adminApi.getDisputeDetails(id)),
    enabled: !!id && !!localStorage.getItem('accessToken'),
  });
};

export const useResolveDisputeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.resolveDispute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dispute-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useApprovePayoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.approvePayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ledger'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useHoldPayoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => adminApi.holdPayout(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

export const useGetPlatformSettingsQuery = () => {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => unwrap(await adminApi.getSettings()),
    enabled: !!localStorage.getItem('accessToken'),
  });
};

export const useUpdatePlatformSettingsMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => adminApi.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] });
    },
  });
};

