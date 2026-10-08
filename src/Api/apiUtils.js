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
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.rows)
    ? payload.rows
    : Array.isArray(payload)
    ? payload
    : [];

  const pagination = payload?.pagination
    ? {
        currentPage: payload.pagination.currentPage ?? 1,
        totalPages: payload.pagination.totalPages ?? 1,
        totalCount: payload.pagination.totalCount ?? items.length,
        limit: payload.pagination.limit ?? 10,
      }
    : { currentPage: 1, totalPages: 1, totalCount: items.length, limit: 10 };

  return {
    items,
    data: items, // Ensures compatibility with callers using .data or .items
    pagination,
    counts: payload?.counts ?? null,
  };
};

export const unwrapList = (res) => {
  const payload = res?.data?.data;
  return Array.isArray(payload) ? payload : [];
};
