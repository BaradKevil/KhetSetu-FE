/**
 * ===========================================
 *  API Utilities - Response Unwrapper
 * ===========================================
 */

export const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

export const unwrapPaginated = (res) => {
  const payload = res?.data?.data;
  const items = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.rows)
    ? payload.rows
    : Array.isArray(payload)
    ? payload
    : [];

  return {
    items,
    pagination: payload?.pagination
      ? {
          currentPage: payload.pagination.currentPage ?? 1,
          totalPages: payload.pagination.totalPages ?? 1,
          totalCount: payload.pagination.totalCount ?? items.length,
        }
      : { currentPage: 1, totalPages: 1, totalCount: items.length },
  };
};

export const unwrapList = (res) => {
  const payload = res?.data?.data;
  return Array.isArray(payload) ? payload : [];
};
