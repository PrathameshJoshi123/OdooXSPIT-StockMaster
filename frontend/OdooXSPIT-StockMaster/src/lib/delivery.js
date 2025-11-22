import api, { postJSON, getToken } from "./api";

export async function listDeliveryMoves({ skip = 0, limit = 200 } = {}) {
  // Back-compat: list moves by document_type
  const path = `/moves?skip=${skip}&limit=${limit}&document_type=delivery`;
  return api.request(path);
}

export async function listOperations({
  skip = 0,
  limit = 200,
  search = "",
  status = "",
} = {}) {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const qs = new URLSearchParams();
  if (skip) qs.set("skip", String(skip));
  if (limit) qs.set("limit", String(limit));
  if (search) qs.set("search", search);
  if (status) qs.set("status", status);
  const path = `/operations?${qs.toString()}`;
  return api.request(path, { headers });
}

export async function getOperation(operationId) {
  const token = getToken();
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return api.request(`/operations/${operationId}`, { headers });
}

export async function checkOperation(operationId) {
  return postJSON(`/operations/${operationId}/check`, {});
}

export async function validateOperation(operationId) {
  return postJSON(`/operations/${operationId}/validate`, {});
}

export async function createOperation(opData) {
  return postJSON(`/operations`, opData);
}

export default {
  listDeliveryMoves,
  listOperations,
  getOperation,
  checkOperation,
  validateOperation,
  createOperation,
};
