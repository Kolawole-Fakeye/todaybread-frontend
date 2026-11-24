const BASE = (import.meta.env.VITE_API_URL || 'https://jekaplay-backend.onrender.com').replace(/\/$/, '');
const KEY = 'jekaplay_session';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

let session = null;
try {
  session = JSON.parse(localStorage.getItem(KEY) || 'null');
} catch {
  session = null;
}
const listeners = new Set();
export const onSession = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getSession = () => session;

function setSession(s) {
  session = s;
  try {
    if (s) localStorage.setItem(KEY, JSON.stringify(s));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage can be unavailable; the app still works for this visit */
  }
  listeners.forEach((fn) => fn(session));
}

async function raw(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && session) headers.Authorization = 'Bearer ' + session.accessToken;
  let res;
  try {
    res = await fetch(BASE + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { res, data };
}

let refreshing = null;
function refresh() {
  if (!session?.refreshToken) return Promise.resolve(false);
  if (!refreshing) {
    refreshing = (async () => {
      const { res, data } = await raw('/api/auth/refresh', { method: 'POST', body: { refreshToken: session.refreshToken }, auth: false });
      if (res.ok && data?.accessToken) {
        setSession(data);
        return true;
      }
      if (res.status === 401) setSession(null);
      return false;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

// Calls the API with the saved login, renewing it quietly when it has expired.
export async function api(path, opts = {}) {
  let { res, data } = await raw(path, opts);
  if (res.status === 401 && opts.auth !== false && session && (await refresh())) {
    ({ res, data } = await raw(path, opts));
  }
  if (!res.ok) throw new ApiError(data?.error || 'Something went wrong. Please try again.', res.status);
  return data;
}

export async function login(phone, pin) {
  const { res, data } = await raw('/api/auth/login', { method: 'POST', body: { phone, pin }, auth: false });
  if (!res.ok) throw new ApiError(data?.error || 'Login failed. Please try again.', res.status);
  setSession(data);
  return data;
}

export async function logout() {
  const token = session?.refreshToken;
  setSession(null);
  if (token) {
    try {
      await raw('/api/auth/logout', { method: 'POST', body: { refreshToken: token }, auth: false });
    } catch {
      /* already signed out on this device */
    }
  }
}

export async function changePin(currentPin, newPin) {
  const data = await api('/api/auth/set-pin', { method: 'POST', body: { currentPin, newPin } });
  setSession(data);
  return data;
}

export const naira = (kobo) => '₦' + Math.round(Number(kobo || 0) / 100).toLocaleString('en-NG');
export const lagosTime = (iso) =>
  new Date(iso).toLocaleString('en-NG', { timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short' });
