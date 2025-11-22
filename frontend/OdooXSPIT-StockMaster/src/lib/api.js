// Simple API helper for StockMaster frontend
const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function request(path, opts = {}) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, opts);
  const contentType = res.headers.get("content-type") || "";
  let body = null;
  if (contentType.includes("application/json")) {
    body = await res.json();
  } else {
    body = await res.text();
  }
  if (!res.ok) {
    const err = new Error(body.detail || body || res.statusText);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export async function postJSON(path, data, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return request(path, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
}

export async function postFormUrlEncoded(path, params) {
  const body = new URLSearchParams(params).toString();
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
}

export const TOKEN_KEY = "stockmaster_token";

export function saveToken(token) {
  if (!token) return;
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    // ignore storage errors
  }
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (e) {}
}

export default {
  BASE,
  request,
  postJSON,
  postFormUrlEncoded,
  saveToken,
  getToken,
  clearToken,
};
