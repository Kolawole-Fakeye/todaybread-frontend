import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Fuel, Droplet, Package, TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, MessageCircle, Lock, Clock, ChevronRight, Plus, Minus,
  ShoppingCart, BarChart3, Wallet, Boxes, Wrench, Link2, Check, Sparkles, ArrowUp, ArrowDown, Timer, ArchiveX, Award,
  Wifi, WifiOff, LogOut, Server, CloudUpload, AlertCircle, Users, ClipboardList, Camera, Type, Printer,
  Image as ImageIcon
} from 'lucide-react';
// New dependency — run: npm install @simplewebauthn/browser
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';

/* ---------------------------------------------------------------
   DESIGN TOKENS — grounded in the auto-fluids import trade:
   instrument-cluster dark panel, hazard amber + antifreeze teal,
   brass-fitting gold, caution red. Mono digits everywhere a real
   number lives (prices, SKUs, gauges, ticker) — body text in a
   plain grotesk so the data always reads as the "real" layer.
----------------------------------------------------------------*/
const C = {
  ink: '#14151A',
  panel: '#1D1F25',
  panel2: '#262932',
  line: '#33363F',
  paper: '#ECE7DD',
  paperDim: '#A9A6A0',
  amber: '#F2A93B',
  teal: '#3FA796',
  red: '#E2584C',
  brass: '#C9A05C',
  blue: '#5B8FA8',
};

const FONT_DISPLAY = "'Oswald', sans-serif";
const FONT_BODY = "'Inter', sans-serif";
const FONT_MONO = "'JetBrains Mono', monospace";

const CATEGORY_COLOR = {
  'Transmission Fluid': C.amber,
  'Brake Fluid': C.red,
  'Engine Oil': C.brass,
  'Coolant': C.teal,
  'Dashboard & Interior': C.blue,
  'Power Steering': C.amber,
  'Grease & Sealant': C.brass,
  'Cleaner & Degreaser': C.blue,
};

const CATEGORY_ICON = {
  'Transmission Fluid': Fuel,
  'Brake Fluid': Droplet,
  'Engine Oil': Droplet,
  'Coolant': Droplet,
  'Dashboard & Interior': Wrench,
  'Power Steering': Fuel,
  'Grease & Sealant': Boxes,
  'Cleaner & Degreaser': Droplet,
};

// A small rotating palette so categories a tenant makes up themselves
// (outside the auto-parts starter set above) still get a distinct,
// consistent color/icon instead of all collapsing to the same gray.
const FALLBACK_PALETTE = [C.teal, C.blue, C.brass, C.amber, C.red];
function colorForCategory(category) {
  if (CATEGORY_COLOR[category]) return CATEGORY_COLOR[category];
  if (!category) return C.paperDim;
  let hash = 0;
  for (let i = 0; i < category.length; i++) hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  return FALLBACK_PALETTE[hash % FALLBACK_PALETTE.length];
}
function iconForCategory(category) {
  return CATEGORY_ICON[category] || Package;
}

// Keys must match the backend's INDUSTRY_CATEGORIES map exactly — this is
// what determines which starter category set gets seeded at signup.
const INDUSTRY_OPTIONS = [
  { value: 'auto_parts', label: 'Auto Spare Parts & Mechanicals' },
  { value: 'building_materials', label: 'Building Materials, Tiles & Sanitary Ware' },
  { value: 'solar_energy', label: 'Solar, Inverters & Energy Systems' },
  { value: 'electrical_cables', label: 'Electrical Cables & Industrial Fittings' },
  { value: 'electronics', label: 'IT, Electronics & Phone Accessories' },
  { value: 'cosmetics', label: 'Cosmetics & Personal Care' },
  { value: 'pharmacy', label: 'Pharmacy & Healthcare' },
  { value: 'groceries', label: 'Groceries & Provisions' },
  { value: 'fashion', label: 'Fashion & Accessories' },
  { value: 'other', label: 'Other / General' },
];

function naira(n) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
}

// TodayBread's own WhatsApp number — new signups and "Contact us" /
// "Message support" messages land here.
const TODAYBREAD_WHATSAPP_NUMBER = '2349127897702';

// Click-to-chat (wa.me) is just a link — it opens WhatsApp with a message
// pre-filled, but a human still has to tap Send. There's no way to make a
// message arrive in someone's WhatsApp with zero taps without going through
// the official Business API (which is what we're deliberately avoiding for
// now). Omit `number` to let the person pick who to send it to, instead of
// a fixed recipient — useful for "share your catalogue with a customer".
function waLink(text, number) {
  const base = number ? `https://wa.me/${number}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

function StockGauge({ stock, reorder }) {
  const max = reorder * 3;
  const pct = Math.max(0, Math.min(1, stock / max));
  const status = stock <= reorder ? C.red : stock <= reorder * 1.5 ? C.amber : C.teal;
  const r = 18, circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - pct);
  return (
    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx="24" cy="24" r={r} fill="none" stroke={C.line} strokeWidth="5" />
        <circle
          cx="24" cy="24" r={r} fill="none" stroke={status} strokeWidth="5"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 24 24)"
          style={{ transition: 'stroke-dashoffset 0.4s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: FONT_MONO, fontSize: 11, fontWeight: 600, color: status,
      }}>{stock}</div>
    </div>
  );
}

// For items with no known starting count (born straight from a Snapshot
// photo) — a running sold total instead of a stock gauge, since there's no
// honest baseline to show progress against.
function SoldCounter({ totalSold }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%', border: `2px solid ${C.line}`, flexShrink: 0,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.panel2,
    }}>
      <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: C.amber, lineHeight: 1 }}>{totalSold}</div>
      <div style={{ fontSize: 7, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 2 }}>sold</div>
    </div>
  );
}

function useStorage(key, fallback) {
  const [value, setValue] = useState(fallback);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw));
    } catch (e) {
      // key doesn't exist yet, or storage unavailable — keep fallback
    } finally {
      setLoaded(true);
    }
  }, [key]);

  const persist = useCallback((next) => {
    setValue(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch (e) {
      console.error('storage set failed', key, e);
    }
  }, [key]);

  return [value, persist, loaded];
}

function useApiUrl() {
  // Backend URL is fixed — no need to ask users for it
  const API_URL = 'https://todaybread.onrender.com';
  const setApiUrlState = () => {}; // no-op, URL is fixed
  return [API_URL, setApiUrlState, true];
}

function useAuth() {
  const [auth, setAuthState, loaded] = useStorage('todaybread-auth', null);
  return [auth, setAuthState, loaded];
}

async function apiRequest(apiUrl, path, { method = 'GET', token, body } = {}) {
  const res = await fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.debug = data.debug; // present on some endpoints (e.g. OCR parsing) — the real underlying reason
    throw err;
  }
  return data;
}

export default function TodayBread() {
  const [apiUrl, setApiUrl, apiUrlLoaded] = useApiUrl();
  const [auth, setAuth, authLoaded] = useAuth();
  const [inventory, setInventoryLocal] = useState([]);
  const [sales, setSalesLocal] = useState([]);
  const [categories, setCategories] = useState([]); // [{ category, item_count }] — seeded + in-use, from GET /inventory/categories
  const [brands, setBrands] = useState([]); // [{ brand, item_count }] — same idea, for the Brand field's autocomplete
  const [pending, setPending, pendingLoaded] = useStorage('todaybread-pending-sales', []);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | error
  const [loadError, setLoadError] = useState('');
  // Owners land on the daily ledger by default now — that's the primary
  // workflow (photograph the sales book, review, done). Staff don't have
  // access to Snapshot, so they still land on Record Sale.
  const [tab, setTab] = useState(() => (auth?.user?.role === 'owner' ? 'notebook' : 'sale'));
  const [now, setNow] = useState(new Date());
  const [rates, setRates] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(false);

  const role = auth?.user?.role || 'staff';
  const token = auth?.token;

  // live clock
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchRates = useCallback(async () => {
    setRateLoading(true);
    setRateError(false);
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD');
      const data = await res.json();
      if (data?.rates?.NGN && data?.rates?.CNY) {
        const usdNgn = data.rates.NGN;
        const cnyNgn = data.rates.NGN / data.rates.CNY;
        const next = { usdNgn, cnyNgn, fetchedAt: new Date().toISOString() };
        setRates(prev => ({ ...next, prevUsdNgn: prev?.usdNgn, prevCnyNgn: prev?.cnyNgn }));
        try { localStorage.setItem('todaybread-rates', JSON.stringify(next)); } catch (e) {}
      } else throw new Error('bad payload');
    } catch (e) {
      setRateError(true);
    } finally {
      setRateLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('todaybread-rates');
      if (cached) setRates(JSON.parse(cached));
    } catch (e) {}
    fetchRates();
  }, [fetchRates]);

  const fmtTime = (tz) => now.toLocaleTimeString('en-US', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true });

  // load real inventory + sales from the live backend once logged in
  const loadData = useCallback(async () => {
    if (!apiUrl || !token) return;
    setLoadError('');
    try {
      const [invRes, salesRes] = await Promise.all([
        apiRequest(apiUrl, '/inventory', { token }),
        apiRequest(apiUrl, '/sales', { token }),
      ]);
      const mappedInventory = invRes.items.map(i => ({
        id: i.sku, dbId: i.id, name: i.name, brand: i.brand, size: i.size, category: i.category,
        cost: Number(i.cost_price || 0), price: Number(i.sale_price), stock: i.stock,
        warehouseStock: i.warehouse_stock != null ? Number(i.warehouse_stock) : null,
        reorder: i.reorder_level, origin: i.origin, isPublic: !!i.is_public,
        expiryDate: i.expiry_date || '', batchNumber: i.batch_number || '',
        totalSold: Number(i.total_sold || 0), stockTracked: i.stock_tracked !== false,
      }));
      const mappedSales = salesRes.sales.map(s => ({
        id: s.id, itemId: s.item_id, itemName: s.item_name, qty: s.qty,
        unitPrice: Number(s.unit_price), unitCost: Number(s.unit_cost || 0), payment: s.payment_method, timestamp: s.occurred_at,
        voided: !!s.voided_at,
      }));
      setInventoryLocal(mappedInventory);
      setSalesLocal(mappedSales);
      setDataLoaded(true);
    } catch (e) {
      setLoadError(e.message);
      setDataLoaded(true); // still show UI with whatever we have locally
    }
  }, [apiUrl, token]);

  useEffect(() => { loadData(); }, [loadData]);

  // categories are fetched separately from inventory items — this is what lets
  // pre-seeded categories show up as suggestions even before any item exists
  const loadCategories = useCallback(async () => {
    if (!apiUrl || !token) return;
    try {
      const res = await apiRequest(apiUrl, '/inventory/categories', { token });
      setCategories(res.categories || []);
    } catch (e) {
      // non-critical — the category datalist just falls back to empty/item-derived
      console.error('[categories] load failed:', e.message);
    }
  }, [apiUrl, token]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const loadBrands = useCallback(async () => {
    if (!apiUrl || !token) return;
    try {
      const res = await apiRequest(apiUrl, '/inventory/brands', { token });
      setBrands(res.brands || []);
    } catch (e) {
      console.error('[brands] load failed:', e.message);
    }
  }, [apiUrl, token]);

  useEffect(() => { loadBrands(); }, [loadBrands]);

  // try to flush queued offline sales whenever we have a connection
  const syncPending = useCallback(async () => {
    if (!apiUrl || !token || pending.length === 0) return;
    setSyncStatus('syncing');
    try {
      await apiRequest(apiUrl, '/sales/sync', { method: 'POST', token, body: { sales: pending } });
      setPending([]);
      await loadData();
      setSyncStatus('idle');
    } catch (e) {
      setSyncStatus('error');
    }
  }, [apiUrl, token, pending, setPending, loadData]);

  useEffect(() => {
    syncPending();
    const onOnline = () => syncPending();
    window.addEventListener('online', onOnline);
    const interval = setInterval(syncPending, 30000);
    return () => { window.removeEventListener('online', onOnline); clearInterval(interval); };
  }, [syncPending]);

  const lowStockItems = useMemo(() => inventory.filter(i => i.stockTracked !== false && i.stock <= i.reorder), [inventory]);

  // staff never have access to owner-only tabs — fall back to Record Sale if one is somehow active
  useEffect(() => {
    if (dataLoaded && role === 'staff' && !['sale', 'inventory', 'analytics'].includes(tab)) {
      setTab('sale');
    }
    if (dataLoaded && role === 'owner' && tab === 'sale') {
      setTab('reports');
    }
  }, [dataLoaded, role]);

  // record a sale — try live, fall back to offline queue if the network call fails.
  // Ledger-first: this never refuses to log a sale for lack of stock — deductStock
  // (default true) controls whether the running stock count moves at all.
  const recordSale = async (itemId, qty, payment, deductStock = true) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;
    const clientUuid = crypto.randomUUID();
    const occurredAt = new Date().toISOString();

    // optimistic local update so the UI feels instant either way
    const willDeductStock = deductStock && item.stockTracked !== false;
    setInventoryLocal(inv => inv.map(i => i.id === itemId
      ? { ...i, stock: willDeductStock ? i.stock - qty : i.stock, totalSold: (i.totalSold || 0) + qty }
      : i
    ));
    setSalesLocal(s => [{ id: clientUuid, itemId: item.id, itemName: item.name, qty, unitPrice: item.price, unitCost: item.cost, payment, timestamp: occurredAt }, ...s]);

    try {
      const result = await apiRequest(apiUrl, '/sales', { method: 'POST', token, body: { itemId: item.dbId, qty, paymentMethod: payment, clientUuid, deductStock } });
      // Correct the optimistic entry's id to the real backend id — voiding
      // a sale later needs the actual database id, not the client UUID.
      if (result?.sale?.id) {
        setSalesLocal(s => s.map(x => x.id === clientUuid ? { ...x, id: result.sale.id } : x));
      }
    } catch (e) {
      // offline or server unreachable — queue it, it'll sync automatically later
      setPending(p => [...p, { itemId: item.dbId, qty, paymentMethod: payment, clientUuid, occurredAt, deductStock }]);
    }
  };

  // Reverses a mistaken sale — restores stock, marks it voided (never
  // deleted, stays visible crossed out in the log). Owner only.
  const voidSale = async (saleId) => {
    try {
      await apiRequest(apiUrl, `/sales/${saleId}/void`, { method: 'POST', token });
      setSalesLocal(s => s.map(x => x.id === saleId ? { ...x, voided: true } : x));
      await loadData(); // authoritative refresh — restored stock comes from here, not a hand-patched guess
    } catch (e) {
      alert(`Could not void sale: ${e.message}`);
    }
  };

  // owner-only inventory CRUD, talking straight to the live API
  const saveItem = async (formItem) => {
    // ItemForm passes an explicit isNew flag; other callers (e.g. Notebook's
    // stock-arrival flow, which always edits an existing item) don't, so fall
    // back to checking for a dbId in that case.
    const isNew = formItem.isNew !== undefined ? formItem.isNew : !formItem.dbId;
    try {
      let savedLocal;
      if (isNew) {
        const res = await apiRequest(apiUrl, '/inventory', {
          method: 'POST', token, body: {
            name: formItem.name, brand: formItem.brand, size: formItem.size, category: formItem.category,
            costPrice: formItem.cost, salePrice: formItem.price, stock: formItem.stock,
            warehouseStock: formItem.warehouseStock || 0, reorderLevel: formItem.reorder, origin: formItem.origin,
            expiryDate: formItem.expiryDate || null, batchNumber: formItem.batchNumber || null,
            stockTracked: formItem.stockTracked !== false,
          },
        });
        // SKU is generated server-side now — use it as this item's local id.
        savedLocal = {
          ...formItem, id: res.item.sku, dbId: res.item.id,
          expiryDate: res.item.expiry_date, batchNumber: res.item.batch_number,
          totalSold: Number(res.item.total_sold || 0), stockTracked: res.item.stock_tracked !== false,
        };
        setInventoryLocal(inv => [...inv, savedLocal]);
      } else {
        await apiRequest(apiUrl, `/inventory/${formItem.dbId}`, {
          method: 'PUT', token, body: {
            name: formItem.name, brand: formItem.brand, size: formItem.size, category: formItem.category,
            costPrice: formItem.cost, salePrice: formItem.price, stock: formItem.stock,
            warehouseStock: formItem.warehouseStock || 0, reorderLevel: formItem.reorder, origin: formItem.origin,
            expiryDate: formItem.expiryDate || null, batchNumber: formItem.batchNumber || null,
          },
        });
        savedLocal = formItem;
        setInventoryLocal(inv => inv.map(i => i.id === formItem.id ? formItem : i));
      }
      if (formItem.category) loadCategories();
      if (formItem.brand) loadBrands();
      return savedLocal;
    } catch (e) {
      alert(`Could not save: ${e.message}`);
      return undefined;
    }
  };

  const deleteItem = async (id) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;
    try {
      await apiRequest(apiUrl, `/inventory/${item.dbId}`, { method: 'DELETE', token });
      setInventoryLocal(inv => inv.filter(i => i.id !== id));
    } catch (e) {
      alert(`Could not delete: ${e.message}`);
    }
  };

  const clearAllItems = async () => {
    for (const item of inventory) {
      try {
        await apiRequest(apiUrl, `/inventory/${item.dbId}`, { method: 'DELETE', token });
      } catch (e) {
        console.error('Could not delete item', item.id, e.message);
      }
    }
    setInventoryLocal([]);
  };

  const togglePublic = async (item) => {
    try {
      const res = await apiRequest(apiUrl, `/inventory/${item.dbId}/visibility`, {
        method: 'PATCH', token, body: { isPublic: !item.isPublic },
      });
      setInventoryLocal(inv => inv.map(i => i.id === item.id ? { ...i, isPublic: res.isPublic } : i));
    } catch (e) {
      alert(`Could not update visibility: ${e.message}`);
    }
  };

  const restockItem = async (item, qty) => {
    try {
      const res = await apiRequest(apiUrl, `/inventory/${item.dbId}/restock`, {
        method: 'PATCH', token, body: { qty },
      });
      setInventoryLocal(inv => inv.map(i => i.id === item.id
        ? { ...i, stock: res.stock, warehouseStock: res.warehouseStock }
        : i
      ));
      return true;
    } catch (e) {
      alert(`Could not restock: ${e.message}`);
      return false;
    }
  };

  // A real delivery arriving (as opposed to restockItem above, which just
  // moves stock already owned between warehouse and shop floor). Cost gets
  // recalculated as a weighted average server-side if unitCost is given and
  // differs from the current cost; expiry/batch only fill in if currently
  // empty on that item.
  const receiveStock = async (item, qty, unitCost, expiryDate, batchNumber) => {
    try {
      const res = await apiRequest(apiUrl, `/inventory/${item.dbId}/receive-stock`, {
        method: 'PATCH', token, body: { qty, unitCost: unitCost || null, expiryDate: expiryDate || null, batchNumber: batchNumber || null },
      });
      const updated = {
        ...item, stock: res.item.stock, cost: Number(res.item.cost_price),
        expiryDate: res.item.expiry_date || '', batchNumber: res.item.batch_number || '',
      };
      setInventoryLocal(inv => inv.map(i => i.id === item.id ? updated : i));
      return updated;
    } catch (e) {
      alert(`Could not receive stock: ${e.message}`);
      return undefined;
    }
  };

  // Converts an item that's been running as a pure sold-counter (no real
  // starting count) into normally tracked stock, once the owner has actually
  // counted what's on the shelf. From this point it behaves exactly like any
  // other item — the count they enter here becomes both stock and the
  // baseline (seed_quantity).
  const startTrackingStock = async (item, startingStock) => {
    try {
      const res = await apiRequest(apiUrl, `/inventory/${item.dbId}/start-tracking`, {
        method: 'PATCH', token, body: { startingStock },
      });
      const updated = { ...item, stock: res.item.stock, stockTracked: true };
      setInventoryLocal(inv => inv.map(i => i.id === item.id ? updated : i));
      return updated;
    } catch (e) {
      alert(`Could not start tracking stock: ${e.message}`);
      return undefined;
    }
  };

  const handleLogout = () => setAuth(null);
  const [authMode, setAuthMode] = useState('login');

  if (!apiUrlLoaded || !authLoaded || !pendingLoaded) {
    return <LoadingScreen />;
  }
  if (!auth) {
    return authMode === 'signup'
      ? <SignupScreen apiUrl={apiUrl} onSignup={setAuth} onBackToLogin={() => setAuthMode('login')} />
      : <LoginScreen apiUrl={apiUrl} onLogin={setAuth} onShowSignup={() => setAuthMode('signup')} />;
  }

  // Super admin sees a completely different dashboard
  if (auth.user?.isSuperAdmin) {
    return <AdminDashboard apiUrl={apiUrl} token={token} onLogout={handleLogout} />;
  }

  if (!dataLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ background: C.ink, backgroundImage: 'radial-gradient(circle, rgba(242,169,59,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px', minHeight: '100vh', color: C.paper, fontFamily: FONT_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        ::-webkit-scrollbar { height: 0; width: 0; }
        body {
          background-color: #14151A;
          background-image: radial-gradient(circle, rgba(242,169,59,0.07) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      <TickerBar fmtTime={fmtTime} rates={rates} rateLoading={rateLoading} rateError={rateError} onRefresh={fetchRates} />

      <SyncBar pendingCount={pending.length} syncStatus={syncStatus} loadError={loadError} onRetry={() => { loadData(); syncPending(); }} />

      <Header business={auth.business} onLogout={handleLogout} />

      {role === 'owner' && <SubscriptionBanner business={auth.business} />}

      {role === 'owner' && (
        <BiometricEnrollPrompt
          apiUrl={apiUrl} token={token} enrolled={!!auth.user?.biometricsEnrolled}
          onEnrolledChange={(val) => setAuth(a => ({ ...a, user: { ...a.user, biometricsEnrolled: val } }))}
        />
      )}

      <TabBar role={role} tab={tab} setTab={setTab} lowStockCount={lowStockItems.length} />

      <div style={{ padding: '16px', maxWidth: 720, margin: '0 auto' }}>
        {tab === 'inventory' && (
          <InventoryView inventory={inventory} categories={categories} brands={brands} role={role} onSave={saveItem} onDelete={deleteItem} onClearAll={clearAllItems} onTogglePublic={togglePublic} onRestock={restockItem} onStartTracking={startTrackingStock} apiUrl={apiUrl} token={token} loadCategories={loadCategories} loadBrands={loadBrands} loadData={loadData} />
        )}
        {tab === 'sale' && (
          <SaleView inventory={inventory} onSubmit={recordSale} sales={sales} role={role} onVoid={voidSale} />
        )}
        {tab === 'analytics' && (
          <AnalyticsView sales={sales} role={role} />
        )}
        {tab === 'insights' && role === 'owner' && (
          <InsightsView sales={sales} inventory={inventory} business={auth.business} apiUrl={apiUrl} token={token} onBusinessUpdated={(patch) => setAuth(a => ({ ...a, business: { ...a.business, ...patch } }))} />
        )}
        {tab === 'reports' && role === 'owner' && (
          <ReportsView sales={sales} inventory={inventory} onVoid={voidSale} apiUrl={apiUrl} token={token} />
        )}
        {tab === 'whatsapp' && role === 'owner' && (
          <WhatsAppView sales={sales} inventory={inventory} lowStockItems={lowStockItems} business={auth.business} apiUrl={apiUrl} token={token} onBusinessUpdated={(patch) => setAuth(a => ({ ...a, business: { ...a.business, ...patch } }))} />
        )}
        {tab === 'staff' && role === 'owner' && (
          <StaffView apiUrl={apiUrl} token={token} />
        )}
        {tab === 'notebook' && role === 'owner' && (
          <NotebookView inventory={inventory} categories={categories} apiUrl={apiUrl} token={token} onRecordSales={recordSale} onAddStock={saveItem} onReceiveStock={receiveStock} />
        )}
        <LegalFooterLinks />
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ background: C.ink, backgroundImage: 'radial-gradient(circle, rgba(242,169,59,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.paper, fontFamily: FONT_BODY }}>
      Loading TodayBread…
    </div>
  );
}

function ApiSetupScreen({ onSave }) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  const handleConnect = async () => {
    const clean = url.trim().replace(/\/$/, '');
    if (!clean) return setError('Paste your Render URL first');
    setChecking(true);
    setError('');
    try {
      const res = await fetch(`${clean}/health`);
      if (!res.ok) throw new Error(`Server responded with status ${res.status}`);
      const data = await res.json();
      if (!data?.ok) throw new Error('Server reached but /health did not return ok:true');
      await onSave(clean);
    } catch (e) {
      // TEMP diagnostic: show the real browser error, not a generic message
      setError(`Connection failed — raw error: "${e.message || e.name || 'unknown'}". This usually means CORS, a network block, or a typo in the URL.`);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ background: C.ink, backgroundImage: 'radial-gradient(circle, rgba(242,169,59,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT_BODY }}>
      <div style={{ maxWidth: 360, width: '100%' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.paper, textTransform: 'uppercase', marginBottom: 6 }}>
          Today<span style={{ color: C.amber }}>Bread</span>
        </div>
        <div style={{ color: C.paperDim, fontSize: 13, marginBottom: 20 }}>Connect to your live backend to get started.</div>
        <label style={{ fontSize: 11, color: C.paperDim, fontWeight: 600 }}>Backend URL (from Render)</label>
        <input
          value={url} onChange={e => setUrl(e.target.value)} placeholder="https://your-app.onrender.com"
          style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, fontFamily: FONT_MONO, fontSize: 13, marginTop: 6, marginBottom: 12 }}
        />
        {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button
          onClick={handleConnect} disabled={checking}
          style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
        >
          {checking ? 'Checking…' : 'Connect'}
        </button>
      </div>
    </div>
  );
}

function LoginScreen({ apiUrl, onLogin, onShowSignup }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const handleLogin = async () => {
    if (!phone || !pin) return setError('Enter your phone and PIN');
    setLoading(true); setError('');
    try {
      const data = await apiRequest(apiUrl, '/auth/login', { method: 'POST', body: { phone, pin } });
      // No .catch(() => null) here on purpose — if this fails, the person
      // would otherwise get dropped into the app under a fake "TodayBread"
      // placeholder business with a broken catalogue link and no real data.
      // Better to show a clear error and let them retry.
      const me = await apiRequest(apiUrl, '/me', { token: data.token });
      const adminCheck = await apiRequest(apiUrl, '/admin/check', { token: data.token }).catch(() => ({ isSuperAdmin: false }));
      await onLogin({ token: data.token, user: { ...data.user, isSuperAdmin: adminCheck.isSuperAdmin, biometricsEnrolled: me.user?.biometricsEnrolled }, business: me.business });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Face ID / biometric login — owner-only accounts will have this set up.
  // Requires the phone field to be filled in (that's how the backend knows
  // whose enrolled credentials to check against).
  const handleFaceIdLogin = async () => {
    if (!phone.trim()) return setError('Enter your phone number first, then tap Face ID');
    setBioLoading(true); setError('');
    try {
      const options = await apiRequest(apiUrl, '/auth/webauthn/login-options', { method: 'POST', body: { phone: phone.trim() } });
      // NOTE: @simplewebauthn/browser v9+ expects { optionsJSON: options }.
      // If you're on an older version, this may just be `options` directly —
      // check that package's docs if this throws a shape error.
      const authResponse = await startAuthentication({ optionsJSON: options });
      const data = await apiRequest(apiUrl, '/auth/webauthn/login-verify', { method: 'POST', body: { phone: phone.trim(), response: authResponse } });
      const me = await apiRequest(apiUrl, '/me', { token: data.token });
      const adminCheck = await apiRequest(apiUrl, '/admin/check', { token: data.token }).catch(() => ({ isSuperAdmin: false }));
      await onLogin({ token: data.token, user: { ...data.user, isSuperAdmin: adminCheck.isSuperAdmin, biometricsEnrolled: me.user?.biometricsEnrolled }, business: me.business });
    } catch (e) {
      setError(e.message || 'Biometric login failed or was cancelled');
    } finally {
      setBioLoading(false);
    }
  };

  const handleForgotPin = async () => {
    if (!forgotPhone.trim()) return setForgotError('Enter your phone number');
    setForgotLoading(true); setForgotError('');
    try {
      await apiRequest(apiUrl, '/auth/forgot-pin', { method: 'POST', body: { phone: forgotPhone.trim() } });
      setForgotSent(true);
    } catch (e) {
      setForgotError(e.message || 'Could not find that account');
    } finally {
      setForgotLoading(false);
    }
  };

  const inputStyle = { width: '100%', padding: '11px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, fontFamily: FONT_MONO, fontSize: 13, marginTop: 6, marginBottom: 12 };

  return (
    <div style={{ background: C.ink, backgroundImage: 'radial-gradient(circle, rgba(242,169,59,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT_BODY }}>
      <div style={{ maxWidth: 360, width: '100%' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.paper, textTransform: 'uppercase', marginBottom: 6 }}>
          Today<span style={{ color: C.amber }}>Bread</span>
        </div>

        {!forgotMode ? (
          <>
            <div style={{ color: C.paperDim, fontSize: 13, marginBottom: 20 }}>Sign in with your phone and PIN.</div>
            <label style={{ fontSize: 11, color: C.paperDim, fontWeight: 600 }}>Phone number</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="2348012345678" style={inputStyle} />
            <label style={{ fontSize: 11, color: C.paperDim, fontWeight: 600 }}>PIN</label>
            <input value={pin} onChange={e => setPin(e.target.value)} type="password" placeholder="••••" style={inputStyle} />
            {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}
            <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            {browserSupportsWebAuthn() && (
              <button onClick={handleFaceIdLogin} disabled={bioLoading} style={{ width: '100%', padding: '11px 0', borderRadius: 8, border: `1px solid ${C.teal}66`, background: `${C.teal}14`, color: C.teal, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Lock size={14} /> {bioLoading ? 'Verifying…' : 'Sign in with Face ID / biometrics'}
              </button>
            )}
            <button onClick={() => setForgotMode(true)} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'transparent', color: C.paperDim, fontSize: 12, cursor: 'pointer', marginBottom: 4 }}>
              Forgot PIN?
            </button>
            <button onClick={onShowSignup} style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.amber, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
              New shop? Create your business
            </button>

          </>
        ) : forgotSent ? (
          <>
            <div style={{ background: `${C.teal}18`, border: `1px solid ${C.teal}55`, borderRadius: 10, padding: 16, marginTop: 10, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.teal, marginBottom: 6 }}>Request received ✓</div>
              <div style={{ fontSize: 13, color: C.paperDim, lineHeight: 1.6 }}>
                Your PIN reset request has been sent to TodayBread. We'll contact you on WhatsApp to verify your identity and set a new PIN.
              </div>
            </div>
            <button onClick={() => { setForgotMode(false); setForgotSent(false); setForgotPhone(''); }} style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <div style={{ color: C.paperDim, fontSize: 13, marginBottom: 20 }}>Enter your phone number and we'll send your reset request to TodayBread.</div>
            <label style={{ fontSize: 11, color: C.paperDim, fontWeight: 600 }}>Your phone number</label>
            <input value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} placeholder="2348012345678" style={inputStyle} />
            {forgotError && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{forgotError}</div>}
            <button onClick={handleForgotPin} disabled={forgotLoading} style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
              {forgotLoading ? 'Sending…' : 'Send reset request'}
            </button>
            <button onClick={() => { setForgotMode(false); setForgotError(''); }} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'transparent', color: C.paperDim, fontSize: 12, cursor: 'pointer' }}>
              ← Back to sign in
            </button>
          </>
        )}
        <LegalFooterLinks />
      </div>
    </div>
  );
}

function SignupScreen({ apiUrl, onSignup, onBackToLogin }) {
  const [form, setForm] = useState({ businessName: '', ownerName: '', address: '', phone: '', pin: '', whatsappNumber: '', inviteCode: '', industry: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSignup = async () => {
    if (!form.inviteCode.trim()) return setError('Invite code is required — contact TodayBread to get one');
    if (!form.businessName.trim()) return setError('Business name is required');
    if (!form.ownerName.trim()) return setError('Your name is required');
    if (!form.phone.trim()) return setError('Phone number is required');
    if (!form.pin || form.pin.length < 4) return setError('Choose a PIN of at least 4 digits');
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(apiUrl, '/auth/signup', {
        method: 'POST',
        body: {
          businessName: form.businessName.trim(),
          ownerName: form.ownerName.trim(),
          address: form.address.trim() || null,
          phone: form.phone.trim(),
          pin: form.pin,
          whatsappNumber: form.whatsappNumber.trim() || form.phone.trim(),
          inviteCode: form.inviteCode.trim(),
          industry: form.industry || 'other',
        },
      });
      await onSignup({ token: data.token, user: data.user, business: data.business });
      // Opens WhatsApp with an introduction message ready to send to TodayBread
      // support — this is the "welcome" touchpoint for now: it can't arrive in
      // their WhatsApp with zero taps without the official Business API, so
      // instead it's one tap for THEM to say hello, and a real person can
      // reply with the actual welcome message.
      const introText = `Hi TodayBread! 👋 ${form.businessName.trim()} just signed up — excited to get started!`;
      window.open(waLink(introText, TODAYBREAD_WHATSAPP_NUMBER), '_blank');
    } catch (e) {
      setError(e.message || 'Could not create your business');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '11px 12px', borderRadius: 8, border: `1px solid ${C.line}`,
    background: C.panel, color: C.paper, fontFamily: FONT_BODY, fontSize: 13, marginTop: 6, marginBottom: 12,
  };
  const labelStyle = { fontSize: 11, color: C.paperDim, fontWeight: 600 };

  return (
    <div style={{ background: C.ink, backgroundImage: 'radial-gradient(circle, rgba(242,169,59,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT_BODY }}>
      <div style={{ maxWidth: 360, width: '100%' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.paper, textTransform: 'uppercase', marginBottom: 6 }}>
          Today<span style={{ color: C.amber }}>Bread</span>
        </div>
        <div style={{ color: C.paperDim, fontSize: 13, marginBottom: 20 }}>Set up your shop on TodayBread.</div>

        <div style={{ background: `${C.amber}14`, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: '10px 12px', marginBottom: 16 }}>
          <label style={{ fontSize: 11, color: C.amber, fontWeight: 700 }}>Invite code</label>
          <input
            style={{ ...inputStyle, border: `1px solid ${C.amber}66`, background: C.ink, marginBottom: 0 }}
            value={form.inviteCode}
            onChange={e => set('inviteCode', e.target.value)}
            placeholder="Enter your TodayBread invite code"
          />
          <div style={{ fontSize: 10, color: C.paperDim, marginTop: 5 }}>Don't have a code? Contact TodayBread to get access.</div>
        </div>

        <label style={labelStyle}>Business name</label>
        <input style={inputStyle} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Your Business Name Ltd" />

        <label style={labelStyle}>What kind of business is this?</label>
        <select style={inputStyle} value={form.industry} onChange={e => set('industry', e.target.value)}>
          <option value="">Select an industry</option>
          {INDUSTRY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div style={{ fontSize: 10, color: C.paperDim, marginTop: -8, marginBottom: 12 }}>Gives you a starter set of categories — you can add, rename, or remove any of them later.</div>

        <label style={labelStyle}>Shop address</label>
        <input style={inputStyle} value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. Block C, Shop 14, Trade Fair Complex, Lagos" />

        <label style={labelStyle}>Your name</label>
        <input style={inputStyle} value={form.ownerName} onChange={e => set('ownerName', e.target.value)} placeholder="e.g. Kola Fakeye" />

        <label style={labelStyle}>Phone number (this is your login)</label>
        <input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="2348012345678" />

        <label style={labelStyle}>Choose a PIN</label>
        <input style={inputStyle} type="password" value={form.pin} onChange={e => set('pin', e.target.value)} placeholder="At least 4 digits" />

        <label style={labelStyle}>WhatsApp number for daily summary (optional)</label>
        <input style={inputStyle} value={form.whatsappNumber} onChange={e => set('whatsappNumber', e.target.value)} placeholder="Leave blank to use phone number above" />

        {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <button
          onClick={handleSignup} disabled={loading}
          style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}
        >
          {loading ? 'Creating your business…' : 'Create business'}
        </button>
        <button
          onClick={onBackToLogin}
          style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'transparent', color: C.paperDim, fontSize: 12, cursor: 'pointer' }}
        >
          Already have an account? Sign in
        </button>
        <LegalFooterLinks />
      </div>
    </div>
  );
}

function SyncBar({ pendingCount, syncStatus, loadError, onRetry }) {
  if (!pendingCount && !loadError) return null;
  return (
    <div style={{
      background: loadError ? `${C.red}22` : `${C.amber}1A`, borderBottom: `1px solid ${C.line}`,
      padding: '7px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
      maxWidth: 720, margin: '0 auto',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: loadError ? C.red : C.amber }}>
        {loadError ? <AlertCircle size={13} /> : <CloudUpload size={13} />}
        {loadError
          ? `Couldn't reach the server: "${loadError}" — showing last known data`
          : `${pendingCount} sale${pendingCount === 1 ? '' : 's'} saved offline, ${syncStatus === 'syncing' ? 'syncing now…' : 'waiting to sync'}`
        }
      </div>
      <button onClick={onRetry} style={{ background: 'none', border: 'none', color: C.paperDim, cursor: 'pointer', padding: 2 }}>
        <RefreshCw size={13} />
      </button>
    </div>
  );
}

function TickerBar({ fmtTime, rates, rateLoading, rateError, onRefresh }) {
  const trend = (curr, prev) => {
    if (prev == null || curr === prev) return null;
    return curr > prev ? 'up' : 'down';
  };
  const usdTrend = rates ? trend(rates.usdNgn, rates.prevUsdNgn) : null;
  const cnyTrend = rates ? trend(rates.cnyNgn, rates.prevCnyNgn) : null;

  const Cell = ({ label, value, sub }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 76, flexShrink: 0 }}>
      <div style={{ fontFamily: FONT_BODY, fontSize: 9, letterSpacing: '0.12em', color: C.paperDim, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 14, color: C.amber, fontWeight: 600, marginTop: 2 }}>{value}</div>
      {sub && <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.paperDim }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{
      background: '#0E0F12',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='40'%3E%3Cpath d='M0 20 Q25 8 50 20 Q75 32 100 20 Q125 8 150 20 Q175 32 200 20' fill='none' stroke='rgba(242,169,59,0.06)' stroke-width='1'/%3E%3Cpath d='M0 28 Q25 16 50 28 Q75 40 100 28 Q125 16 150 28 Q175 40 200 28' fill='none' stroke='rgba(242,169,59,0.04)' stroke-width='1'/%3E%3Cpath d='M0 12 Q25 0 50 12 Q75 24 100 12 Q125 0 150 12 Q175 24 200 12' fill='none' stroke='rgba(242,169,59,0.03)' stroke-width='1'/%3E%3C/svg%3E")`,
      backgroundSize: '200px 40px',
      borderBottom: `1px solid ${C.line}`,
      display: 'flex', alignItems: 'center', overflowX: 'auto',
      padding: '8px 12px', gap: 18,
    }}>
      <Cell label="Lagos" value={fmtTime('Africa/Lagos')} />
      <Cell label="New York" value={fmtTime('America/New_York')} />
      <Cell label="Shanghai" value={fmtTime('Asia/Shanghai')} />
      <div style={{ width: 1, height: 28, background: C.line, flexShrink: 0 }} />
      <Cell
        label="USD → NGN"
        value={rates ? `₦${rates.usdNgn.toFixed(0)}` : '—'}
        sub={usdTrend === 'up' ? '▲' : usdTrend === 'down' ? '▼' : rateError ? 'cached' : ' '}
      />
      <Cell
        label="CNY → NGN"
        value={rates ? `₦${rates.cnyNgn.toFixed(1)}` : '—'}
        sub={cnyTrend === 'up' ? '▲' : cnyTrend === 'down' ? '▼' : rateError ? 'cached' : ' '}
      />
      <button
        onClick={onRefresh}
        style={{ background: 'none', border: 'none', color: C.paperDim, cursor: 'pointer', flexShrink: 0, padding: 4 }}
        aria-label="Refresh rates"
      >
        <RefreshCw size={14} className={rateLoading ? 'spin' : ''} />
      </button>
    </div>
  );
}

function Header({ business, onLogout }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '16px 16px 12px', maxWidth: 720, margin: '0 auto' }}>
      <div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase',
          color: C.paperDim, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: C.amber, display: 'inline-block' }} />
          Today<span style={{ color: C.amber }}>Bread</span> platform
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 600, letterSpacing: '0.02em', textTransform: 'uppercase', lineHeight: 1 }}>
          {business?.name || 'Your Business'}
        </div>
        {business?.address && (
          <div style={{ fontSize: 11, color: C.paperDim, marginTop: 3 }}>{business.address}</div>
        )}
        <div style={{ fontSize: 11, color: C.paperDim, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Server size={11} /> Connected to live backend
        </div>
      </div>
      <button
        onClick={onLogout}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8,
          border: `1px solid ${C.line}`, background: C.panel, color: C.paperDim, cursor: 'pointer',
          fontSize: 11, fontWeight: 600, flexShrink: 0, marginTop: 2,
        }}
      >
        <LogOut size={12} /> Log out
      </button>
    </div>
  );
}

function SubscriptionBanner({ business }) {
  if (!business?.trial_ends_at && !business?.next_due_date) return null;

  const now = new Date();
  const trialEndsAt = business.trial_ends_at ? new Date(business.trial_ends_at) : null;
  const nextDueDate = business.next_due_date ? new Date(business.next_due_date) : null;
  const fee = business.monthly_fee != null ? Number(business.monthly_fee) : 10000;

  const inTrial = trialEndsAt && now < trialEndsAt;
  const daysLeftInTrial = inTrial ? Math.ceil((trialEndsAt - now) / 86400000) : null;
  const overdue = !inTrial && nextDueDate && now > nextDueDate;
  const daysUntilDue = nextDueDate ? Math.ceil((nextDueDate - now) / 86400000) : null;
  const dueDateStr = nextDueDate ? nextDueDate.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  // Quiet during trial and while comfortably within the current cycle —
  // only speak up once payment is close or already late.
  if (inTrial) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 10px' }}>
        <div style={{ fontSize: 11, color: C.paperDim, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '7px 12px' }}>
          {daysLeftInTrial} day{daysLeftInTrial === 1 ? '' : 's'} left in your free trial
        </div>
      </div>
    );
  }
  if (overdue) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 10px' }}>
        <div style={{ fontSize: 11, color: C.red, background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 8, padding: '7px 12px', fontWeight: 600 }}>
          Payment of {naira(fee)} overdue since {dueDateStr}
        </div>
      </div>
    );
  }
  if (daysUntilDue !== null && daysUntilDue <= 7) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 10px' }}>
        <div style={{ fontSize: 11, color: C.amber, background: `${C.amber}18`, border: `1px solid ${C.amber}55`, borderRadius: 8, padding: '7px 12px', fontWeight: 600 }}>
          {naira(fee)} due on {dueDateStr}
        </div>
      </div>
    );
  }
  return null;
}

function LegalModal({ title, children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: C.panel, borderTop: `1px solid ${C.line}`, borderRadius: '16px 16px 0 0', padding: 20, width: '100%', maxWidth: 720, maxHeight: '82vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 17, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 14 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.paperDim, lineHeight: 1.7 }}>{children}</div>
        <button onClick={onClose} style={{ width: '100%', marginTop: 18, padding: '11px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}

function TermsModal({ onClose }) {
  return (
    <LegalModal title="Terms of Service" onClose={onClose}>
      <p style={{ color: C.paper, fontWeight: 600, marginBottom: 4 }}>What TodayBread is</p>
      <p style={{ marginBottom: 12 }}>TodayBread is an inventory and sales management tool for small businesses. You use it to track stock, record sales, and manage your business data. It is provided as-is, and we work continuously to keep it reliable, but we don't guarantee it will be uninterrupted or error-free.</p>

      <p style={{ color: C.paper, fontWeight: 600, marginBottom: 4 }}>Your data</p>
      <p style={{ marginBottom: 12 }}>Your inventory, sales, and business information belong to you. We store it to provide the service and don't sell it to third parties. You can request an export or deletion of your data at any time by contacting us.</p>

      <p style={{ color: C.paper, fontWeight: 600, marginBottom: 4 }}>Subscription & payment</p>
      <p style={{ marginBottom: 12 }}>New businesses get a free trial period. After that, continued use requires a monthly subscription fee, payable by bank transfer to your dedicated account. Payment is your responsibility — if a payment is missed, your account isn't locked automatically, but continued non-payment may result in suspension.</p>

      <p style={{ color: C.paper, fontWeight: 600, marginBottom: 4 }}>Your responsibilities</p>
      <p style={{ marginBottom: 12 }}>You're responsible for the accuracy of the data you enter, for keeping your PIN and account access secure, and for how your staff accounts are used. Automated features (like AI-assisted ledger scanning) are tools to speed up data entry — you're responsible for reviewing and confirming anything before it's saved.</p>

      <p style={{ color: C.paper, fontWeight: 600, marginBottom: 4 }}>Limitation of liability</p>
      <p style={{ marginBottom: 12 }}>TodayBread is a tool to help you run your business — it isn't a substitute for your own financial or inventory record-keeping. We aren't liable for business losses arising from use of the app, including data entry errors, technical downtime, or third-party service interruptions (e.g. payment or messaging providers).</p>

      <p style={{ color: C.paper, fontWeight: 600, marginBottom: 4 }}>Changes</p>
      <p style={{ marginBottom: 4 }}>These terms may be updated as the product grows. Continued use of TodayBread after a change means you accept the update.</p>
    </LegalModal>
  );
}

function ContactModal({ onClose, businessName }) {
  return (
    <LegalModal title="Contact us" onClose={onClose}>
      <p style={{ marginBottom: 14 }}>Questions, an issue with your account, or need a hand with something? Reach out any time.</p>
      <a
        href={waLink(`Hi TodayBread! ${businessName ? `This is ${businessName}. ` : ''}I have a question.`, TODAYBREAD_WHATSAPP_NUMBER)}
        target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', borderRadius: 8, background: `${C.teal}22`, color: C.teal, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}
      ><MessageCircle size={16} /> Message us on WhatsApp</a>
    </LegalModal>
  );
}

function LegalFooterLinks() {
  const [modal, setModal] = useState(null); // 'terms' | 'contact' | null
  return (
    <>
      <div style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: C.paperDim }}>
        <button onClick={() => setModal('terms')} style={{ background: 'none', border: 'none', color: C.paperDim, textDecoration: 'underline', cursor: 'pointer', fontSize: 11, padding: '0 6px' }}>Terms of Service</button>
        ·
        <button onClick={() => setModal('contact')} style={{ background: 'none', border: 'none', color: C.paperDim, textDecoration: 'underline', cursor: 'pointer', fontSize: 11, padding: '0 6px' }}>Contact us</button>
      </div>
      {modal === 'terms' && <TermsModal onClose={() => setModal(null)} />}
      {modal === 'contact' && <ContactModal onClose={() => setModal(null)} />}
    </>
  );
}

function BiometricEnrollPrompt({ apiUrl, token, enrolled, onEnrolledChange }) {
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!browserSupportsWebAuthn()) return null;

  const handleEnroll = async () => {
    setBusy(true); setError('');
    try {
      const options = await apiRequest(apiUrl, '/auth/webauthn/register-options', { method: 'POST', token });
      // NOTE: same version caveat as login — v9+ of @simplewebauthn/browser
      // expects { optionsJSON: options }.
      const attResponse = await startRegistration({ optionsJSON: options });
      await apiRequest(apiUrl, '/auth/webauthn/register-verify', { method: 'POST', token, body: attResponse });
      onEnrolledChange(true);
    } catch (e) {
      setError(e.message || 'Could not enable Face ID');
    } finally {
      setBusy(false);
    }
  };

  const handleTurnOff = async () => {
    if (!window.confirm('Turn off Face ID login on this device?')) return;
    setBusy(true); setError('');
    try {
      await apiRequest(apiUrl, '/auth/webauthn/credentials', { method: 'DELETE', token });
      onEnrolledChange(false);
    } catch (e) {
      setError(e.message || 'Could not turn off Face ID');
    } finally {
      setBusy(false);
    }
  };

  if (enrolled) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: C.paperDim }}>
          <Lock size={12} color={C.teal} /> Face ID enabled on this device
          <button onClick={handleTurnOff} disabled={busy} style={{ background: 'none', border: 'none', color: C.paperDim, textDecoration: 'underline', fontSize: 11, cursor: 'pointer', padding: 0 }}>Turn off</button>
        </div>
        {error && <div style={{ color: C.red, fontSize: 10, marginTop: 4 }}>{error}</div>}
      </div>
    );
  }

  if (dismissed) return null;

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 16px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 11, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '7px 12px' }}>
        <Lock size={12} color={C.paperDim} />
        <span style={{ color: C.paperDim }}>Skip typing your PIN next time —</span>
        <button onClick={handleEnroll} disabled={busy} style={{ background: 'none', border: 'none', color: C.teal, fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 11 }}>{busy ? 'Setting up…' : 'enable Face ID'}</button>
        <button onClick={() => setDismissed(true)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: C.paperDim, cursor: 'pointer', padding: 0, fontSize: 11 }}>Not now</button>
      </div>
      {error && <div style={{ color: C.red, fontSize: 10, marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function TabBar({ role, tab, setTab, lowStockCount }) {
  const tabs = [
    // Snapshot leads for owners — snap a photo of the sales book, review,
    // save. Record Sale and Inventory remain right behind it for anyone who
    // wants the fuller manual/tracked experience, just no longer the front door.
    ...(role === 'owner' ? [{ id: 'notebook', label: 'Snapshot', icon: ClipboardList }] : []),
    ...(role === 'owner' ? [{ id: 'reports', label: 'Today', icon: Wallet }] : []),
    ...(role === 'owner' ? [{ id: 'insights', label: 'Insights', icon: Sparkles }] : []),
    { id: 'analytics', label: 'Best Sellers', icon: BarChart3 },
    { id: 'sale', label: 'Record Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    ...(role === 'owner' ? [{ id: 'whatsapp', label: 'Connect & Subscription', icon: MessageCircle }] : []),
    ...(role === 'owner' ? [{ id: 'staff', label: 'Staff', icon: Users }] : []),
  ];
  return (
    <div style={{ display: 'flex', overflowX: 'auto', borderBottom: `1px solid ${C.line}`, maxWidth: 720, margin: '0 auto', padding: '0 16px' }}>
      {tabs.map(t => {
        const Icon = t.icon;
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px',
              background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0,
              borderBottom: active ? `2px solid ${C.amber}` : '2px solid transparent',
              color: active ? C.paper : C.paperDim,
              fontFamily: FONT_BODY, fontSize: 13, fontWeight: active ? 600 : 500,
            }}
          >
            <Icon size={14} />
            {t.label}
            {t.id === 'inventory' && lowStockCount > 0 && (
              <span style={{ background: C.red, color: '#fff', fontSize: 10, fontFamily: FONT_MONO, borderRadius: 10, padding: '1px 6px', marginLeft: 2 }}>
                {lowStockCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function Tag({ children, color }) {
  return (
    <span style={{
      fontFamily: FONT_BODY, fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em',
      color, border: `1px solid ${color}55`, background: `${color}1A`, borderRadius: 4, padding: '2px 6px',
    }}>{children}</span>
  );
}

function ManageTaxonomyModal({ apiUrl, token, categories, brands, onClose, onChanged }) {
  const [tab, setTab] = useState('categories');
  const [renaming, setRenaming] = useState(null); // { type, name }
  const [renameValue, setRenameValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const list = tab === 'categories' ? categories : brands;
  const nameKey = tab === 'categories' ? 'category' : 'brand';
  const basePath = tab === 'categories' ? '/inventory/categories' : '/inventory/brands';

  const startRename = (name) => { setRenaming({ name }); setRenameValue(name); setError(''); };

  const submitRename = async () => {
    if (!renameValue.trim() || renameValue.trim() === renaming.name) { setRenaming(null); return; }
    setBusy(true); setError('');
    try {
      await apiRequest(apiUrl, `${basePath}/rename`, { method: 'PATCH', token, body: { from: renaming.name, to: renameValue.trim() } });
      setRenaming(null);
      onChanged();
    } catch (e) {
      setError(e.message || 'Could not rename');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (name) => {
    if (!window.confirm(`Delete "${name}"? Items using it will become un${tab === 'categories' ? 'categorized' : 'branded'}, not deleted.`)) return;
    setBusy(true); setError('');
    try {
      await apiRequest(apiUrl, `${basePath}/${encodeURIComponent(name)}`, { method: 'DELETE', token });
      onChanged();
    } catch (e) {
      setError(e.message || 'Could not delete');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: C.panel, borderTop: `1px solid ${C.line}`, borderRadius: '16px 16px 0 0', padding: 18, width: '100%', maxWidth: 720, maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 14 }}>Manage categories & brands</div>

        <div style={{ display: 'flex', background: C.ink, borderRadius: 8, border: `1px solid ${C.line}`, padding: 3, marginBottom: 14, width: 'fit-content' }}>
          {[['categories', 'Categories'], ['brands', 'Brands']].map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setRenaming(null); setError(''); }} style={{ padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: tab === t ? C.amber : 'transparent', color: tab === t ? C.ink : C.paperDim, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12 }}>{label}</button>
          ))}
        </div>

        {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</div>}

        {list.length === 0 && <div style={{ color: C.paperDim, fontSize: 13, fontStyle: 'italic' }}>None yet.</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {list.map(row => {
            const name = row[nameKey];
            const isRenaming = renaming?.name === name;
            return (
              <div key={name} style={{ background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 12px' }}>
                {isRenaming ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input value={renameValue} onChange={e => setRenameValue(e.target.value)} style={{ flex: 1, padding: '6px 8px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontSize: 13 }} autoFocus />
                    <button onClick={submitRename} disabled={busy} style={{ padding: '6px 10px', borderRadius: 6, border: 'none', background: C.teal, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setRenaming(null)} style={{ padding: '6px 10px', borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
                      <div style={{ fontSize: 10, color: C.paperDim, marginTop: 2 }}>{row.item_count} item{row.item_count === 1 ? '' : 's'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <button onClick={() => startRename(name)} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Rename</button>
                      <button onClick={() => handleDelete(name)} disabled={busy} style={{ padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.red}44`, background: 'transparent', color: C.red, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onClose} style={{ width: '100%', marginTop: 16, padding: '11px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Done</button>
      </div>
    </div>
  );
}

function InventoryView({ inventory, categories: allCategories, brands: allBrands, role, onSave, onDelete, onClearAll, onTogglePublic, onRestock, onStartTracking, apiUrl, token, loadCategories, loadBrands, loadData }) {
  const [filter, setFilter] = useState('All');
  const [editingItem, setEditingItem] = useState(undefined);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null); // { item }
  const [restockQty, setRestockQty] = useState(1);
  const [restocking, setRestocking] = useState(false);
  const [managingTaxonomy, setManagingTaxonomy] = useState(false);
  // Filter pills stay item-derived on purpose — a seeded-but-unused category
  // filtering to an empty list isn't useful here, unlike in the item form's
  // autocomplete where showing it as a typing suggestion is exactly the point.
  const categories = ['All', ...new Set(inventory.map(i => i.category).filter(Boolean))];
  const items = filter === 'All' ? inventory : inventory.filter(i => i.category === filter);

  const handleSave = async (formItem) => {
    await onSave(formItem);
    setEditingItem(undefined);
  };

  const handleDelete = async (id) => {
    await onDelete(id);
    setEditingItem(undefined);
  };

  const handleClearAll = async () => {
    setClearing(true);
    await onClearAll();
    setClearing(false);
    setConfirmClearAll(false);
  };

  return (
    <div>
      {role === 'owner' && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button
            onClick={() => setEditingItem(null)}
            style={{
              flex: 1, padding: '11px 0', borderRadius: 8, border: `1px dashed ${C.amber}66`, background: `${C.amber}14`,
              color: C.amber, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Plus size={15} /> Add item
          </button>
          <button
            onClick={() => setManagingTaxonomy(true)}
            style={{ padding: '11px 14px', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
          >Categories</button>
          {inventory.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              style={{ padding: '11px 14px', borderRadius: 8, border: `1px solid ${C.red}44`, background: 'transparent', color: C.red, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
            >Clear all</button>
          )}
        </div>
      )}

      {managingTaxonomy && (
        <ManageTaxonomyModal
          apiUrl={apiUrl} token={token}
          categories={allCategories || []} brands={allBrands || []}
          onClose={() => setManagingTaxonomy(false)}
          onChanged={() => { loadCategories(); loadBrands(); loadData(); }}
        />
      )}

      {confirmClearAll && (
        <div style={{ background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Delete all {inventory.length} inventory items?</div>
          <div style={{ fontSize: 12, color: C.paperDim, marginBottom: 12 }}>This cannot be undone. Use this to clear demo data before entering your real inventory.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setConfirmClearAll(false)} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleClearAll} disabled={clearing} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: C.red, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{clearing ? 'Clearing…' : 'Yes, delete all'}</button>
          </div>
        </div>
      )}

      {inventory.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: C.paperDim }}>
          <Package size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
          <div style={{ fontSize: 14, fontWeight: 600, color: C.paper, marginBottom: 6 }}>No inventory yet</div>
          <div style={{ fontSize: 13 }}>Tap <b style={{ color: C.amber }}>+ Add item</b> to start building your real product catalogue.</div>
        </div>
      )}

      {/* Restock panel */}
      {restockTarget && (
        <div style={{ background: `${C.teal}14`, border: `1px solid ${C.teal}55`, borderRadius: 10, padding: 14, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Restock: {restockTarget.name}</div>
          <div style={{ fontSize: 11, color: C.paperDim, marginBottom: 10 }}>
            Warehouse: {restockTarget.warehouseStock} units available → moving to shop floor
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: C.paperDim, fontWeight: 600 }}>Units to move</span>
            <button onClick={() => setRestockQty(q => Math.max(1, q - 1))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Minus size={12} /></button>
            <input type="number" value={restockQty} min={1} max={restockTarget.warehouseStock} onChange={e => setRestockQty(Math.max(1, Math.min(restockTarget.warehouseStock, Number(e.target.value) || 1)))} style={{ width: 52, textAlign: 'center', padding: '5px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700 }} />
            <button onClick={() => setRestockQty(q => Math.min(restockTarget.warehouseStock, q + 1))} style={{ width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={12} /></button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { setRestockTarget(null); setRestockQty(1); }} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button
              disabled={restocking}
              onClick={async () => {
                setRestocking(true);
                const ok = await onRestock(restockTarget, restockQty);
                setRestocking(false);
                if (ok) { setRestockTarget(null); setRestockQty(1); }
              }}
              style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', background: C.teal, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >{restocking ? 'Moving…' : `Move ${restockQty} to shop`}</button>
          </div>
        </div>
      )}

      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{ flexShrink: 0, padding: '5px 11px', borderRadius: 14, fontSize: 11, fontFamily: FONT_BODY, fontWeight: 600, border: `1px solid ${filter === cat ? C.amber : C.line}`, background: filter === cat ? `${C.amber}22` : 'transparent', color: filter === cat ? C.amber : C.paperDim, cursor: 'pointer' }}>{cat}</button>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(item => {
          const Icon = iconForCategory(item.category);
          const catColor = colorForCategory(item.category);
          const low = item.stockTracked !== false && item.stock <= item.reorder;
          const costNotSet = !item.cost || Number(item.cost) === 0;
          let daysToExpiry = null;
          if (item.expiryDate) {
            const diff = new Date(item.expiryDate) - new Date();
            daysToExpiry = Math.ceil(diff / 86400000);
          }
          const expired = daysToExpiry !== null && daysToExpiry < 0;
          const expiringSoon = daysToExpiry !== null && daysToExpiry >= 0 && daysToExpiry <= 30;
          return (
            <div key={item.id} style={{
              background: C.panel, border: `1px solid ${expired ? C.red + '88' : low || expiringSoon ? C.red + '55' : C.line}`, borderRadius: 10,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
              cursor: role === 'owner' ? 'pointer' : 'default',
            }}
              onClick={() => role === 'owner' && setEditingItem(item)}
            >
              {item.stockTracked === false ? <SoldCounter totalSold={item.totalSold || 0} /> : <StockGauge stock={item.stock} reorder={item.reorder} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Icon size={12} color={catColor} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.paperDim }}>{item.id}</span>
                  {low && <AlertTriangle size={12} color={C.red} />}
                  {(expired || expiringSoon) && <Clock size={12} color={expired ? C.red : C.amber} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{item.brand} · {item.size} · {item.origin}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {item.category && <Tag color={catColor}>{item.category}</Tag>}
                  <Tag color={C.paperDim}>{item.brand}</Tag>
                  {costNotSet && <Tag color={C.paperDim}>Cost not set</Tag>}
                  {expired && <Tag color={C.red}>Expired</Tag>}
                  {!expired && expiringSoon && <Tag color={C.amber}>Expires in {daysToExpiry}d</Tag>}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: C.paper }}>{naira(item.price)}</div>
                {role === 'owner' && (
                  costNotSet
                    ? <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.paperDim, marginTop: 2, fontStyle: 'italic' }}>cost not set</div>
                    : <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.paperDim, marginTop: 2 }}>cost {naira(item.cost)}</div>
                )}
                {role === 'owner' && item.warehouseStock != null && (
                  <div style={{ marginTop: 6, textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shop</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: low ? C.red : C.teal }}>{item.stock}</div>
                    <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>Warehouse</div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: C.brass }}>{item.warehouseStock}</div>
                  </div>
                )}
                <div style={{ fontSize: 10, color: low ? C.red : C.paperDim, marginTop: 4, fontWeight: 600 }}>
                  {item.stockTracked === false ? 'no starting count set' : low ? 'RESTOCK FLOOR' : `reorder @ ${item.reorder}`}
                </div>
                {role === 'owner' && item.warehouseStock != null && item.warehouseStock > 0 && (
                  <button
                    onClick={e => { e.stopPropagation(); setRestockTarget(item); setRestockQty(1); setEditingItem(undefined); }}
                    style={{ marginTop: 4, padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, background: `${C.teal}33`, color: C.teal }}
                  >↑ Restock floor</button>
                )}
                {role === 'owner' && (
                  <button
                    onClick={e => { e.stopPropagation(); onTogglePublic(item); }}
                    style={{ marginTop: 4, padding: '3px 8px', borderRadius: 5, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 700, background: item.isPublic ? `${C.teal}33` : `${C.line}`, color: item.isPublic ? C.teal : C.paperDim }}
                  >{item.isPublic ? '🌐 Public' : 'Private'}</button>
                )}
              </div>
              {role === 'owner' && <ChevronRight size={16} color={C.paperDim} style={{ flexShrink: 0 }} />}
            </div>
          );
        })}
      </div>

      {editingItem !== undefined && (
        <ItemForm
          item={editingItem}
          existingCategories={(allCategories || []).map(c => c.category).sort()}
          existingBrands={(allBrands || []).map(b => b.brand).sort()}
          onSave={handleSave}
          onDelete={editingItem ? () => handleDelete(editingItem.id) : null}
          onCancel={() => setEditingItem(undefined)}
          onStartTracking={onStartTracking}
        />
      )}
    </div>
  );
}

function ItemForm({ item, existingCategories, existingBrands, onSave, onDelete, onCancel, onStartTracking }) {
  const isNew = !item;
  const isUntracked = !isNew && item.stockTracked === false;
  const [startingCount, setStartingCount] = useState('');
  const [startTrackingOpen, setStartTrackingOpen] = useState(false);
  const [startTrackingBusy, setStartTrackingBusy] = useState(false);
  // Zero and "not entered yet" look identical in a number input once you
  // start typing into it ("0" + "5" becomes "05") — so any numeric field
  // that's currently zero is shown blank instead, with a placeholder hint.
  const [form, setForm] = useState(() => {
    if (!item) return { name: '', brand: '', category: '', size: '', origin: '', cost: '', price: '', stock: '', warehouseStock: '', reorder: '', expiryDate: '', batchNumber: '' };
    return {
      ...item,
      cost: item.cost ? String(item.cost) : '',
      price: item.price ? String(item.price) : '',
      stock: item.stock ? String(item.stock) : '',
      warehouseStock: item.warehouseStock ? String(item.warehouseStock) : '',
      reorder: item.reorder ? String(item.reorder) : '',
    };
  });
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleStartTracking = async () => {
    const count = Number(startingCount);
    if (!Number.isFinite(count) || count < 0 || startingCount === '') return;
    setStartTrackingBusy(true);
    const updated = await onStartTracking(item, count);
    setStartTrackingBusy(false);
    // The item prop is a snapshot from when this form opened, so it won't
    // pick up stockTracked flipping to true — close rather than try to
    // re-render this modal as now-tracked. The list behind it already has
    // the update (onStartTracking updates the parent's inventory state).
    if (updated) onCancel();
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return setError('Item name is required');
    if (!form.price || Number(form.price) <= 0) return setError('Sale price is required');
    setError('');
    onSave({
      ...form,
      isNew,
      category: (form.category || '').trim(),
      cost: Number(form.cost) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      warehouseStock: Number(form.warehouseStock) || 0,
      reorder: Number(form.reorder) || 0,
      expiryDate: form.expiryDate || '',
      batchNumber: form.batchNumber || '',
    });
  };

  const inputStyle = {
    width: '100%', padding: '9px 10px', borderRadius: 7, border: `1px solid ${C.line}`,
    background: C.ink, color: C.paper, fontFamily: FONT_BODY, fontSize: 13, marginTop: 4,
  };
  const labelStyle = { fontSize: 11, color: C.paperDim, fontWeight: 600 };
  const costNotSet = !form.cost || Number(form.cost) === 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 50,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }} onClick={onCancel}>
      <div
        style={{
          background: C.panel, borderTop: `1px solid ${C.line}`, borderRadius: '16px 16px 0 0',
          padding: 18, width: '100%', maxWidth: 720, maxHeight: '88vh', overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.02em', marginBottom: 14 }}>
          {isNew ? 'Add inventory item' : 'Edit item'}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 4 }}>
          <label style={{ gridColumn: '1 / -1' }}>
            <span style={labelStyle}>Item name *</span>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Product name" />
          </label>
          <label>
            <span style={labelStyle}>Brand</span>
            <input style={inputStyle} list="brand-suggestions" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Brand name" />
            <datalist id="brand-suggestions">
              {(existingBrands || []).map(b => <option key={b} value={b} />)}
            </datalist>
          </label>
          <label>
            <span style={labelStyle}>Category</span>
            <input
              style={inputStyle}
              list="category-suggestions"
              value={form.category || ''}
              onChange={e => set('category', e.target.value)}
              placeholder="Type a category — anything you like"
            />
            <datalist id="category-suggestions">
              {existingCategories.map(c => <option key={c} value={c} />)}
            </datalist>
          </label>
          <label>
            <span style={labelStyle}>Size</span>
            <input style={inputStyle} value={form.size} onChange={e => set('size', e.target.value)} placeholder="e.g. size, weight, or variant" />
          </label>
          <label>
            <span style={labelStyle}>Cost price (₦)</span>
            <input style={inputStyle} type="number" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="-" />
            {costNotSet && <div style={{ fontSize: 10, color: C.paperDim, marginTop: 3, fontStyle: 'italic' }}>Not set — this item won't count toward profit/margin numbers until it is</div>}
          </label>
          <label>
            <span style={labelStyle}>Sale price (₦) *</span>
            <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="-" />
          </label>
          {isUntracked ? (
            <div style={{ gridColumn: '1 / -1', background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8, padding: 12 }}>
              <div style={{ fontSize: 11, color: C.paperDim, marginBottom: 8 }}>
                Not tracking stock yet — <span style={{ color: C.amber, fontWeight: 700 }}>{item.totalSold || 0} sold</span> so far. This item was created straight from a sale, so there's no real starting count on file.
              </div>
              {!startTrackingOpen ? (
                <button
                  type="button" onClick={() => setStartTrackingOpen(true)}
                  style={{ padding: '8px 12px', borderRadius: 7, border: `1px solid ${C.teal}66`, background: `${C.teal}18`, color: C.teal, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                >Start tracking stock</button>
              ) : (
                <div>
                  <span style={{ ...labelStyle, display: 'block', marginBottom: 4 }}>Count what's actually on the shelf right now</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number" min={0} autoFocus value={startingCount}
                      onChange={e => setStartingCount(e.target.value)}
                      placeholder="e.g. 20" style={{ ...inputStyle, marginTop: 0, flex: 1 }}
                    />
                    <button
                      type="button" onClick={handleStartTracking} disabled={startTrackingBusy || startingCount === ''}
                      style={{ padding: '9px 14px', borderRadius: 7, border: 'none', background: startingCount !== '' ? C.teal : C.line, color: startingCount !== '' ? '#fff' : C.paperDim, fontWeight: 700, fontSize: 12, cursor: startingCount !== '' ? 'pointer' : 'default' }}
                    >{startTrackingBusy ? '…' : 'Confirm'}</button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <label>
              <span style={labelStyle}>Shop floor stock</span>
              <input style={inputStyle} type="number" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="-" />
            </label>
          )}
          <label>
            <span style={labelStyle}>Warehouse stock</span>
            <input style={inputStyle} type="number" value={form.warehouseStock} onChange={e => set('warehouseStock', e.target.value)} placeholder="-" />
          </label>
          <label>
            <span style={labelStyle}>Reorder level</span>
            <input style={inputStyle} type="number" value={form.reorder} onChange={e => set('reorder', e.target.value)} placeholder="-" />
          </label>
          <label>
            <span style={labelStyle}>Expiry date</span>
            <input style={inputStyle} type="date" value={form.expiryDate || ''} onChange={e => set('expiryDate', e.target.value)} />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <span style={labelStyle}>Batch / lot number</span>
            <input style={inputStyle} value={form.batchNumber || ''} onChange={e => set('batchNumber', e.target.value)} placeholder="e.g. batch or lot code, if you track one" />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <span style={labelStyle}>Origin / supplier</span>
            <input style={inputStyle} value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="Where this comes from" />
          </label>
        </div>

        {error && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{error}</div>}

        {confirmDelete && (
          <div style={{ background: `${C.red}18`, border: `1px solid ${C.red}55`, borderRadius: 8, padding: 12, marginTop: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Delete "{form.name}"? This cannot be undone.</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              <button onClick={onDelete} style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', background: C.red, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Yes, delete</button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {onDelete && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{ padding: '11px 16px', borderRadius: 8, border: `1px solid ${C.red}66`, background: 'transparent', color: C.red, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >Delete</button>
          )}
          <button
            onClick={onCancel}
            style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >Cancel</button>
          <button
            onClick={handleSubmit}
            style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

function SaleView({ inventory, onSubmit, sales, role, onVoid }) {
  const [search, setSearch] = useState('');
  const [itemId, setItemId] = useState(null);
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState('Cash');
  const [deductStock, setDeductStock] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Ledger-first: every item is sellable regardless of stock count — the
  // count is advisory, not a gate on logging what actually happened.
  const available = inventory;
  const item = available.find(i => i.id === itemId);

  const filtered = search.trim().length > 0
    ? available.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.brand.toLowerCase().includes(search.toLowerCase()) ||
        (i.category || '').toLowerCase().includes(search.toLowerCase()) ||
        i.id.toLowerCase().includes(search.toLowerCase())
      )
    : available;

  const selectItem = (i) => {
    setItemId(i.id);
    setSearch(i.name);
    setShowDropdown(false);
    setQty(1);
  };

  const clearItem = () => {
    setItemId(null);
    setSearch('');
    setShowDropdown(false);
    setQty(1);
  };

  const submit = () => {
    if (!item || qty < 1) return;
    onSubmit(itemId, qty, payment, deductStock);
    setConfirmed(true);
    setQty(1);
    setItemId(null);
    setSearch('');
    setTimeout(() => setConfirmed(false), 1800);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim }}>
          Record a sale
        </div>
        <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.paperDim }}>
          {new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </div>

      {/* Search / type to find item */}
      <div style={{ position: 'relative', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: C.paperDim, fontWeight: 600, marginBottom: 5 }}>
          Search item by name, brand or category
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setItemId(null); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search by name, brand, or category…"
            style={{
              width: '100%', padding: '11px 36px 11px 12px', borderRadius: 8,
              border: `1px solid ${item ? C.amber : C.line}`,
              background: C.panel, color: C.paper, fontFamily: FONT_BODY, fontSize: 13,
            }}
          />
          {(search || item) && (
            <button
              onClick={clearItem}
              style={{ position: 'absolute', right: 10, background: 'none', border: 'none', color: C.paperDim, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}
            >×</button>
          )}
        </div>

        {/* Dropdown results */}
        {showDropdown && search.trim().length > 0 && !item && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
            background: C.panel2, border: `1px solid ${C.line}`, borderRadius: 8,
            maxHeight: 260, overflowY: 'auto', marginTop: 4,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {filtered.length === 0 && (
              <div style={{ padding: '12px 14px', color: C.paperDim, fontSize: 13 }}>No items match "{search}"</div>
            )}
            {filtered.map(i => (
              <button
                key={i.id}
                onClick={() => selectItem(i)}
                style={{
                  width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none',
                  border: 'none', borderBottom: `1px solid ${C.line}`, cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.paper }}>{i.name}</div>
                  <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{i.brand} · {i.size} · {i.stockTracked === false ? `${i.totalSold || 0} sold` : `${i.stock} in stock`}</div>
                </div>
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: C.amber, flexShrink: 0, marginLeft: 10 }}>{naira(i.price)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected item summary */}
      {item && (
        <div style={{ background: `${C.amber}14`, border: `1px solid ${C.amber}44`, borderRadius: 8, padding: '10px 12px', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{item.name}</div>
          <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{item.brand} · {item.size} · {item.stockTracked === false ? `${item.totalSold || 0} sold` : `${item.stock} in stock`}</div>
        </div>
      )}

      {item && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: C.paperDim, fontWeight: 600 }}>Quantity</span>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtnStyle}><Minus size={14} /></button>
            <input
              type="number"
              value={qty}
              min={1}
              onChange={e => setQty(Math.max(1, Number(e.target.value) || 1))}
              style={{
                width: 60, textAlign: 'center', padding: '6px 8px', borderRadius: 6,
                border: `1px solid ${C.line}`, background: C.ink, color: C.paper,
                fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700,
              }}
            />
            <button onClick={() => setQty(q => q + 1)} style={qtyBtnStyle}><Plus size={14} /></button>
          </div>

          {item.stockTracked !== false && qty > item.stock && (
            <div style={{ fontSize: 11, color: C.amber, marginTop: -10, marginBottom: 14 }}>
              More than the {item.stock} currently on record — logging it anyway.
            </div>
          )}

          <button
            onClick={() => setDeductStock(d => !d)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginBottom: 16,
              padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel,
              color: C.paperDim, fontSize: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{
              width: 32, height: 18, borderRadius: 9, position: 'relative', flexShrink: 0,
              background: deductStock ? C.teal : C.line, transition: 'background 0.15s',
            }}>
              <div style={{
                width: 14, height: 14, borderRadius: '50%', background: C.paper, position: 'absolute', top: 2,
                left: deductStock ? 16 : 2, transition: 'left 0.15s',
              }} />
            </div>
            Deduct from inventory stock
          </button>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {['Cash', 'Transfer', 'POS'].map(p => (
              <button
                key={p}
                onClick={() => setPayment(p)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${payment === p ? C.teal : C.line}`,
                  background: payment === p ? `${C.teal}22` : 'transparent',
                  color: payment === p ? C.teal : C.paperDim,
                }}
              >{p}</button>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderTop: `1px solid ${C.line}`, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: C.paperDim }}>Total</span>
            <span style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: C.amber }}>{naira(item.price * qty)}</span>
          </div>

          <button
            onClick={submit}
            style={{
              width: '100%', padding: '13px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: confirmed ? C.teal : C.amber, color: C.ink, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s',
            }}
          >
            {confirmed ? <><Check size={16} /> Sale recorded</> : 'Record sale'}
          </button>
        </>
      )}

      {/* Today's sales log — visible to both owner and staff */}
      {sales && (() => {
        const todayTx = sales.filter(s => {
          const d = new Date(s.timestamp); const now = new Date();
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
        }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        if (todayTx.length === 0) return null;
        return (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 10 }}>
              Sold today ({todayTx.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {todayTx.map(sale => {
                const time = new Date(sale.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
                const payColor = sale.payment === 'Cash' ? C.teal : sale.payment === 'Transfer' ? C.blue : C.amber;
                return (
                  <div key={sale.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, opacity: sale.voided ? 0.5 : 1 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: sale.voided ? 'line-through' : 'none' }}>{sale.itemName}</div>
                      <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Qty: {sale.qty}</span>
                        <span style={{ color: payColor, fontWeight: 600 }}>{sale.payment}</span>
                        <span>{time}</span>
                        {sale.voided && <span style={{ color: C.red, fontWeight: 700 }}>VOIDED</span>}
                      </div>
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: C.amber, flexShrink: 0, textDecoration: sale.voided ? 'line-through' : 'none' }}>
                      {naira(sale.qty * sale.unitPrice)}
                    </div>
                    {role === 'owner' && !sale.voided && onVoid && (
                      <button
                        onClick={() => { if (window.confirm(`Void this sale of ${sale.qty} × ${sale.itemName}? Stock will be restored.`)) onVoid(sale.id); }}
                        style={{ flexShrink: 0, padding: '4px 8px', borderRadius: 5, border: `1px solid ${C.red}44`, background: 'transparent', color: C.red, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                      >Void</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

const qtyBtnStyle = {
  width: 30, height: 30, borderRadius: 6, border: `1px solid ${C.line}`, background: C.panel,
  color: C.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};

function filterSalesByRange(sales, range) {
  const now = new Date();
  const cutoff = new Date(now);
  if (range === 'today') cutoff.setHours(0, 0, 0, 0);
  if (range === '7d') cutoff.setDate(cutoff.getDate() - 7);
  if (range === '30d') cutoff.setDate(cutoff.getDate() - 30);
  if (range === 'all') return sales;
  return sales.filter(s => new Date(s.timestamp) >= cutoff);
}

function AnalyticsView({ sales, role }) {
  const [range, setRange] = useState('7d');
  const [metric, setMetric] = useState('qty');

  const filtered = filterSalesByRange(sales.filter(s => !s.voided), range);
  const agg = {};
  filtered.forEach(s => {
    if (!agg[s.itemId]) agg[s.itemId] = { name: s.itemName, qty: 0, revenue: 0 };
    agg[s.itemId].qty += s.qty;
    agg[s.itemId].revenue += s.qty * s.unitPrice;
  });
  const ranked = Object.values(agg).sort((a, b) => b[metric] - a[metric]).slice(0, 8);
  const max = ranked[0]?.[metric] || 1;

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {[['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['all', 'All time']].map(([k, l]) => (
          <button key={k} onClick={() => setRange(k)} style={chipStyle(range === k)}>{l}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button onClick={() => setMetric('qty')} style={chipStyle(metric === 'qty', C.teal)}>By quantity</button>
        <button onClick={() => setMetric('revenue')} style={chipStyle(metric === 'revenue', C.teal)}>By revenue</button>
      </div>

      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 10 }}>
        Top sellers
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {ranked.length === 0 && <div style={{ color: C.paperDim, fontSize: 13 }}>No sales recorded in this period yet.</div>}
        {ranked.map((r, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>{r.name}</span>
              <span style={{ fontFamily: FONT_MONO, color: C.amber, fontWeight: 700 }}>
                {metric === 'qty' ? `${r.qty} sold` : naira(r.revenue)}
              </span>
            </div>
            <div style={{ height: 8, background: C.panel2, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${(r[metric] / max) * 100}%`, borderRadius: 4,
                background: `linear-gradient(90deg, ${C.amber}, ${C.teal})`,
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function chipStyle(active, color = C.amber) {
  return {
    padding: '6px 12px', borderRadius: 14, fontSize: 11, fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${active ? color : C.line}`,
    background: active ? `${color}22` : 'transparent',
    color: active ? color : C.paperDim,
  };
}

function ReportsView({ sales, inventory, onVoid, apiUrl, token }) {
  const [range, setRange] = useState('today');
  const filteredAll = filterSalesByRange(sales, range); // includes voided — only the log display uses this
  const filtered = filteredAll.filter(s => !s.voided); // everything else (money math) uses this
  const revenue = filtered.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);

  // Cost/profit/margin can only be computed for sales where we actually know
  // the cost at time of sale. A sale with unitCost 0 means cost wasn't set on
  // that item — including it would silently inflate profit and margin, so it's
  // left out of these three numbers entirely rather than treated as free stock.
  const pricedSales = filtered.filter(s => s.unitCost > 0);
  const unpricedSales = filtered.filter(s => s.unitCost === 0);
  const pricedRevenue = pricedSales.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
  const cost = pricedSales.reduce((sum, s) => sum + s.qty * s.unitCost, 0);
  const profit = pricedRevenue - cost;
  const margin = pricedRevenue ? (profit / pricedRevenue) * 100 : 0;
  const unpricedRevenue = unpricedSales.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);

  const byPayment = {};
  filtered.forEach(s => { byPayment[s.payment] = (byPayment[s.payment] || 0) + s.qty * s.unitPrice; });

  // "Today's inflow vs stock balance" — the daily headline the boss checks first
  const todaySales = filterSalesByRange(sales, 'today').filter(s => !s.voided);
  const todayInflow = todaySales.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
  const totalUnitsInStock = inventory.reduce((sum, i) => sum + i.stock, 0);
  const stockValueAtCost = inventory.reduce((sum, i) => sum + i.cost * i.stock, 0);
  const lowStockCount = inventory.filter(i => i.stockTracked !== false && i.stock <= i.reorder).length;

  return (
    <div>
      <div style={{
        background: `linear-gradient(135deg, ${C.panel}, ${C.panel2})`, border: `1px solid ${C.amber}33`,
        borderRadius: 12, padding: 16, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Today at a glance
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.paperDim }}>
            {new Date().toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' })}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: todayInflow > 0 ? C.teal : C.paperDim }}>{naira(todayInflow)}</div>
            <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>cash in today</div>
          </div>
          <div style={{ width: 1, background: C.line }} />
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700 }}>{totalUnitsInStock.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>units on shelf</div>
          </div>
          <div style={{ width: 1, background: C.line }} />
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: lowStockCount > 0 ? C.red : C.paper }}>{lowStockCount}</div>
            <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>items low on stock</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: C.paperDim, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.line}` }}>
          {naira(stockValueAtCost)} worth of stock currently sitting in the shop, at cost
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['all', 'All time']].map(([k, l]) => (
          <button key={k} onClick={() => setRange(k)} style={chipStyle(range === k)}>{l}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: unpricedRevenue > 0 ? 6 : 16 }}>
        <StatCard label="Revenue" value={naira(revenue)} color={C.paper} />
        <StatCard label="Cost (imported)" value={naira(cost)} color={C.paperDim} />
        <StatCard label="Profit" value={naira(profit)} color={C.teal} />
        <StatCard label="Margin" value={`${margin.toFixed(1)}%`} color={C.amber} />
      </div>

      {unpricedRevenue > 0 && (
        <div style={{ fontSize: 11, color: C.paperDim, fontStyle: 'italic', marginBottom: 16 }}>
          {naira(unpricedRevenue)} of revenue is from items with no cost price set — left out of Cost, Profit, and Margin above. Add a cost price on those items in Inventory to include them.
        </div>
      )}

      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 10 }}>
        Revenue by payment method
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {Object.entries(byPayment).map(([method, amt]) => (
          <div key={method} style={{ display: 'flex', justifyContent: 'space-between', background: C.panel, padding: '10px 12px', borderRadius: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{method}</span>
            <span style={{ fontFamily: FONT_MONO, color: C.amber, fontWeight: 700 }}>{naira(amt)}</span>
          </div>
        ))}
        {Object.keys(byPayment).length === 0 && <div style={{ color: C.paperDim, fontSize: 13 }}>No transactions in this period.</div>}
      </div>

      <div style={{ fontSize: 11, color: C.paperDim, marginTop: 16, marginBottom: 12 }}>{filtered.length} transactions in this period</div>

      {filteredAll.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 16px', color: C.paperDim, background: C.panel, borderRadius: 10, border: `1px solid ${C.line}` }}>
          <ShoppingCart size={24} style={{ marginBottom: 10, opacity: 0.4 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: C.paper, marginBottom: 4 }}>No sales recorded yet</div>
          <div style={{ fontSize: 12 }}>Head to <b style={{ color: C.amber }}>Record Sale</b> to log your first transaction — it'll show up here instantly.</div>
        </div>
      )}

      {filteredAll.length > 0 && (
        <>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 10 }}>
            Sales log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...filteredAll].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(sale => {
              const time = new Date(sale.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
              const payColor = sale.payment === 'Cash' ? C.teal : sale.payment === 'Transfer' ? C.blue : C.amber;
              return (
                <div key={sale.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, opacity: sale.voided ? 0.5 : 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textDecoration: sale.voided ? 'line-through' : 'none' }}>{sale.itemName}</div>
                    <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Qty: {sale.qty}</span>
                      <span style={{ color: payColor, fontWeight: 600 }}>{sale.payment}</span>
                      <span>{time}</span>
                      {sale.voided && <span style={{ color: C.red, fontWeight: 700 }}>VOIDED</span>}
                    </div>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: C.amber, flexShrink: 0, textDecoration: sale.voided ? 'line-through' : 'none' }}>
                    {naira(sale.qty * sale.unitPrice)}
                  </div>
                  {!sale.voided && onVoid && (
                    <button
                      onClick={() => { if (window.confirm(`Void this sale of ${sale.qty} × ${sale.itemName}? Stock will be restored.`)) onVoid(sale.id); }}
                      style={{ flexShrink: 0, padding: '4px 8px', borderRadius: 5, border: `1px solid ${C.red}44`, background: 'transparent', color: C.red, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                    >Void</button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <ActivityLog apiUrl={apiUrl} token={token} />
    </div>
  );
}

function ActivityLog({ apiUrl, token }) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (entries !== null) return; // already loaded once, don't refetch every toggle
    try {
      const res = await apiRequest(apiUrl, '/audit-log', { token });
      setEntries(res.entries || []);
    } catch (e) {
      setError(e.message || 'Could not load activity log');
    }
  };

  const actionLabel = {
    item_price_changed: '💰', item_deleted: '🗑️', sale_voided: '↩️',
    category_deleted: '🏷️', brand_deleted: '🏷️',
  };

  return (
    <div style={{ marginTop: 24 }}>
      <button
        onClick={() => { setOpen(o => !o); load(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: C.paperDim, fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.03em', cursor: 'pointer', padding: 0 }}
      >
        {open ? '▾' : '▸'} Recent activity
      </button>
      {open && (
        <div style={{ marginTop: 10 }}>
          {error && <div style={{ color: C.red, fontSize: 12 }}>{error}</div>}
          {entries === null && !error && <div style={{ color: C.paperDim, fontSize: 12 }}>Loading…</div>}
          {entries?.length === 0 && <div style={{ color: C.paperDim, fontSize: 12, fontStyle: 'italic' }}>No price changes, deletions, or voided sales yet.</div>}
          {entries?.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entries.map(e => (
                <div key={e.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '8px 10px', fontSize: 11 }}>
                  <div style={{ color: C.paper }}>{actionLabel[e.action] || '•'} {e.details}</div>
                  <div style={{ color: C.paperDim, marginTop: 2 }}>
                    {e.user_name || 'Unknown'} · {new Date(e.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InsightsView({ sales, inventory, business, apiUrl, token, onBusinessUpdated }) {
  const [reportEmail, setReportEmail] = useState('');
  const [reportSaving, setReportSaving] = useState(false);
  const [reportError, setReportError] = useState('');
  const quarterlyEnabled = business?.quarterly_reports_enabled === true;

  const handleToggleQuarterly = async (nextEnabled) => {
    setReportError('');
    if (nextEnabled && (!reportEmail.trim() || !reportEmail.includes('@'))) {
      setReportError('Enter a valid email to receive quarterly reports');
      return;
    }
    setReportSaving(true);
    try {
      await apiRequest(apiUrl, '/reports/quarterly-opt-in', {
        method: 'POST', token, body: { enabled: nextEnabled, email: reportEmail.trim() || undefined },
      });
      onBusinessUpdated({ quarterly_reports_enabled: nextEnabled });
      if (nextEnabled) setReportEmail('');
    } catch (e) {
      setReportError(e.message || 'Could not update quarterly report setting');
    } finally {
      setReportSaving(false);
    }
  };
  const activeSales = sales.filter(s => !s.voided);
  const now = new Date();
  const sevenAgo = new Date(now); sevenAgo.setDate(sevenAgo.getDate() - 7);
  const fourteenAgo = new Date(now); fourteenAgo.setDate(fourteenAgo.getDate() - 14);

  const thisWeek = activeSales.filter(s => new Date(s.timestamp) >= sevenAgo);
  const lastWeek = activeSales.filter(s => { const d = new Date(s.timestamp); return d >= fourteenAgo && d < sevenAgo; });
  const last14 = activeSales.filter(s => new Date(s.timestamp) >= fourteenAgo);

  const revThis = thisWeek.reduce((s, x) => s + x.qty * x.unitPrice, 0);
  const revLast = lastWeek.reduce((s, x) => s + x.qty * x.unitPrice, 0);
  const pctChange = revLast > 0 ? ((revThis - revLast) / revLast) * 100 : null;

  // capital tied up in stock — items with no cost set have no basis for this,
  // so they're left out rather than treated as zero-cost (which would make
  // their entire retail value look like pure profit)
  const pricedInventory = inventory.filter(i => i.cost > 0);
  const unpricedItemCount = inventory.length - pricedInventory.length;
  const costValue = pricedInventory.reduce((s, i) => s + i.cost * i.stock, 0);
  const retailValue = pricedInventory.reduce((s, i) => s + i.price * i.stock, 0);
  const lockedProfit = retailValue - costValue;

  // velocity per item over last 7 days -> days of stock left
  const velocity = {};
  thisWeek.forEach(s => { velocity[s.itemId] = (velocity[s.itemId] || 0) + s.qty; });
  const runway = inventory
    .map(i => {
      const weeklyQty = velocity[i.id] || 0;
      const dailyRate = weeklyQty / 7;
      const daysLeft = dailyRate > 0 ? i.stock / dailyRate : Infinity;
      return { ...i, daysLeft };
    })
    .filter(i => i.daysLeft < Infinity)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  // dead stock: items with stock but zero sales in last 14 days
  const soldIds = new Set(last14.map(s => s.itemId));
  const deadStock = inventory.filter(i => i.stock > 0 && !soldIds.has(i.id)).slice(0, 5);

  // margin champions — same reasoning as capital tied up: no cost, no margin to rank
  const champions = pricedInventory
    .map(i => ({ ...i, margin: ((i.price - i.cost) / i.price) * 100 }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  // expiring stock — only relevant to businesses that actually track expiry
  // dates (e.g. pharma, cosmetics), so the section stays hidden otherwise
  // rather than showing an empty box to tenants who never use this field
  const tracksExpiry = inventory.some(i => i.expiryDate);
  const expiringItems = inventory
    .filter(i => i.expiryDate)
    .map(i => ({ ...i, daysLeft: Math.ceil((new Date(i.expiryDate) - new Date()) / 86400000) }))
    .filter(i => i.daysLeft <= 30)
    .sort((a, b) => a.daysLeft - b.daysLeft)
    .slice(0, 5);

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #insights-print-area, #insights-print-area * { visibility: visible; }
          #insights-print-area { position: absolute; left: 0; top: 0; width: 100%; padding: 0; }
          #insights-print-hide { display: none !important; }
          #insights-print-area, #insights-print-area * {
            background: #fff !important; color: #111 !important; border-color: #ccc !important;
          }
        }
      `}</style>
      <div id="insights-print-area">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.amber }}>
          <Sparkles size={16} />
          <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            What your notebook never told you
          </span>
        </div>
        <button
          id="insights-print-hide"
          onClick={() => window.print()}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 10px', borderRadius: 7, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
        ><Printer size={13} /> Print</button>
      </div>

      {/* Quarterly report opt-in */}
      <div id="insights-print-hide" style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>📧 Quarterly summary report</div>
          <button
            onClick={() => handleToggleQuarterly(!quarterlyEnabled)} disabled={reportSaving}
            style={{
              width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
              background: quarterlyEnabled ? C.teal : C.line, transition: 'background 0.15s', flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: C.paper, position: 'absolute', top: 3,
              left: quarterlyEnabled ? 21 : 3, transition: 'left 0.15s',
            }} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.paperDim, marginBottom: quarterlyEnabled ? 0 : 8 }}>
          {quarterlyEnabled
            ? "You'll get a performance summary by email every 90 days. Turn off any time."
            : 'Optional — add your email to get a performance summary every 90 days. Off by default, and never required.'}
        </div>
        {!quarterlyEnabled && (
          <>
            <input
              value={reportEmail} onChange={e => setReportEmail(e.target.value)} placeholder="Your email address"
              style={{ width: '100%', padding: '9px 10px', borderRadius: 7, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontSize: 13, marginBottom: 6 }}
            />
            {reportError && <div style={{ color: C.red, fontSize: 11 }}>{reportError}</div>}
          </>
        )}
      </div>

      {/* Capital tied up */}

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Capital sitting on your shelves</div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700 }}>{naira(costValue)}</div>
            <div style={{ fontSize: 11, color: C.paperDim }}>tied up at cost</div>
          </div>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: C.teal }}>{naira(lockedProfit)}</div>
            <div style={{ fontSize: 11, color: C.paperDim }}>profit waiting to be sold</div>
          </div>
        </div>
        {unpricedItemCount > 0 && (
          <div style={{ fontSize: 10, color: C.paperDim, fontStyle: 'italic', marginTop: 8 }}>
            {unpricedItemCount} item{unpricedItemCount === 1 ? '' : 's'} left out — no cost price set yet
          </div>
        )}
      </div>

      {/* Week over week */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>This week vs last week</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700 }}>{naira(revThis)}</span>
          {pctChange !== null && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 2, fontSize: 13, fontWeight: 700,
              color: pctChange >= 0 ? C.teal : C.red,
            }}>
              {pctChange >= 0 ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
              {Math.abs(pctChange).toFixed(0)}%
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>
          vs {naira(revLast)} the week before
        </div>
      </div>

      {/* Restock priority */}
      <SectionLabel icon={Timer} color={C.red}>Running out soon</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {runway.length === 0 && <EmptyNote>Not enough recent sales yet to project stock runway.</EmptyNote>}
        {runway.map(i => (
          <InsightRow key={i.id}
            title={i.name}
            value={`~${Math.max(1, Math.round(i.daysLeft))} day${Math.round(i.daysLeft) === 1 ? '' : 's'} left`}
            valueColor={i.daysLeft <= 5 ? C.red : C.amber}
            sub={`${i.stock} in stock at current pace`}
          />
        ))}
      </div>

      {tracksExpiry && (
        <>
          <SectionLabel icon={Clock} color={C.amber}>Expiring soon</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {expiringItems.length === 0 && <EmptyNote>Nothing expiring in the next 30 days.</EmptyNote>}
            {expiringItems.map(i => (
              <InsightRow key={i.id}
                title={i.name}
                value={i.daysLeft < 0 ? 'Expired' : `${i.daysLeft} day${i.daysLeft === 1 ? '' : 's'} left`}
                valueColor={i.daysLeft < 0 || i.daysLeft <= 7 ? C.red : C.amber}
                sub={`${i.stock} in stock${i.batchNumber ? ` · batch ${i.batchNumber}` : ''}`}
              />
            ))}
          </div>
        </>
      )}

      {/* Dead stock */}
      <SectionLabel icon={ArchiveX} color={C.blue}>Not moving — 14 days, zero sales</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
        {deadStock.length === 0 && <EmptyNote>Everything in stock has sold at least once recently — healthy.</EmptyNote>}
        {deadStock.map(i => (
          <InsightRow key={i.id}
            title={i.name}
            value={`${i.stock} sitting`}
            valueColor={C.blue}
            sub={`${naira(i.cost * i.stock)} of capital idle — consider a bundle or discount`}
          />
        ))}
      </div>

      {/* Margin champions */}
      <SectionLabel icon={Award} color={C.amber}>Your most profitable items</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {champions.map(i => (
          <InsightRow key={i.id}
            title={i.name}
            value={`${i.margin.toFixed(0)}% margin`}
            valueColor={C.amber}
            sub={`${naira(i.price - i.cost)} profit per unit sold`}
          />
        ))}
      </div>
      </div>
    </div>
  );
}

function SectionLabel({ icon: Icon, color, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
      <Icon size={13} color={color} />
      <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.paperDim }}>{children}</span>
    </div>
  );
}

function EmptyNote({ children }) {
  return <div style={{ fontSize: 12, color: C.paperDim, fontStyle: 'italic' }}>{children}</div>;
}

function InsightRow({ title, value, valueColor, sub }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: C.paperDim, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 12.5, fontWeight: 700, color: valueColor, flexShrink: 0, whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      <div style={{ fontFamily: FONT_MONO, fontSize: 19, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
    </div>
  );
}

function WhatsAppView({ sales, inventory, lowStockItems, business, apiUrl, token, onBusinessUpdated }) {
  const today = filterSalesByRange(sales.filter(s => !s.voided), 'today');
  const revenue = today.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
  const agg = {};
  today.forEach(s => { agg[s.itemId] = (agg[s.itemId] || 0) + s.qty; });
  const topId = Object.keys(agg).sort((a, b) => agg[b] - agg[a])[0];
  const topItem = inventory.find(i => i.id === topId);
  const dateStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
  const publicCount = inventory.filter(i => i.isPublic).length;

  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState('');
  const [waToggling, setWaToggling] = useState(false);
  const waEnabled = business?.whatsapp_enabled !== false;

  const handleToggleWhatsapp = async () => {
    setWaToggling(true);
    try {
      const res = await apiRequest(apiUrl, '/settings/whatsapp', {
        method: 'POST', token, body: { enabled: !waEnabled },
      });
      onBusinessUpdated({ whatsapp_enabled: res.enabled });
    } catch (e) {
      // silent — button just stays in its current state, safe default
    } finally {
      setWaToggling(false);
    }
  };

  // Derive catalogue URL from the backend URL — same origin for now
  const catalogueUrl = business?.slug
    ? `${apiUrl?.replace('/api', '') || ''}/catalogue/${business.slug}`
    : null;

  const summaryText =
    `📋 *${business?.name || 'My shop'} — ${dateStr}*\n\n` +
    `Revenue today: ${naira(revenue)}\n` +
    (topItem ? `Best seller: ${topItem.name} (${agg[topId]} sold)\n` : '') +
    `Low stock alerts: ${lowStockItems.length} item${lowStockItems.length === 1 ? '' : 's'}` +
    (catalogueUrl ? `\n\nCatalogue: ${catalogueUrl}` : '');

  const shareCatalogueText = catalogueUrl
    ? `Check out our products: ${catalogueUrl}`
    : '';

  const handleSetupPayment = async () => {
    setPayLoading(true); setPayError('');
    try {
      const res = await apiRequest(apiUrl, '/subscription/setup-payment-account', { method: 'POST', token });
      onBusinessUpdated({ dva_account_number: res.accountNumber, dva_account_name: res.accountName, dva_bank_name: res.bankName });
    } catch (e) {
      setPayError(e.message || 'Could not set up payment account');
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div>

      {/* Subscription payment section */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 700 }}>💳 Subscription payment</div>
        {business?.dva_account_number ? (
          <>
            <div style={{ fontSize: 12, color: C.paperDim, marginBottom: 8 }}>Transfer your monthly fee to this account any time before it's due — it's detected automatically, no need to tell anyone.</div>
            <div style={{ background: C.panel2, borderRadius: 7, padding: '10px 12px', marginBottom: 8 }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, color: C.teal }}>{business.dva_account_number}</div>
              <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{business.dva_bank_name} · {business.dva_account_name}</div>
            </div>
            <button
              onClick={() => { navigator.clipboard?.writeText(business.dva_account_number); }}
              style={{ padding: '7px 12px', borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
            >Copy account number</button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 12, color: C.paperDim, marginBottom: 10 }}>Set up a dedicated account number for your subscription — transfer only, no card needed, nothing to type.</div>
            {payError && <div style={{ color: C.red, fontSize: 11, marginBottom: 8 }}>{payError}</div>}
            <button
              onClick={handleSetupPayment} disabled={payLoading}
              style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >{payLoading ? 'Setting up…' : 'Set up payment account'}</button>
          </>
        )}
      </div>

      {/* WhatsApp privacy toggle */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>🔒 WhatsApp integration</div>
          <button
            onClick={handleToggleWhatsapp} disabled={waToggling}
            style={{
              width: 42, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', position: 'relative',
              background: waEnabled ? C.teal : C.line, transition: 'background 0.15s', flexShrink: 0,
            }}
          >
            <div style={{
              width: 18, height: 18, borderRadius: '50%', background: C.paper, position: 'absolute', top: 3,
              left: waEnabled ? 21 : 3, transition: 'left 0.15s',
            }} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: C.paperDim }}>
          {waEnabled
            ? "TodayBread sends your welcome message and daily 9 PM summary to WhatsApp. Turn off if you'd rather keep this private — nothing about your business gets sent anywhere."
            : 'WhatsApp messages from TodayBread are off. You can still tap the buttons below to send manually.'}
        </div>
      </div>

      {/* Catalogue link section */}
      <div style={{ background: C.panel, border: `1px solid ${C.amber}44`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, fontWeight: 700 }}>🌐 Your public catalogue</div>
        {publicCount === 0 ? (
          <div style={{ fontSize: 12, color: C.paperDim }}>
            No items are marked public yet. Go to <b style={{ color: C.paper }}>Inventory</b> and tap <b style={{ color: C.teal }}>Private</b> on each item you want customers to see — it switches to <b style={{ color: C.teal }}>🌐 Public</b>.
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: C.paperDim, marginBottom: 10 }}>{publicCount} item{publicCount !== 1 ? 's' : ''} visible to customers</div>
            <div style={{ background: C.panel2, borderRadius: 7, padding: '10px 12px', fontFamily: FONT_MONO, fontSize: 12, color: C.teal, wordBreak: 'break-all', marginBottom: 10 }}>
              {catalogueUrl || `${apiUrl}/catalogue/${business?.slug || 'your-shop'}`}
            </div>
            <a
              href={waLink(shareCatalogueText)} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 7, background: `${C.teal}22`, color: C.teal, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
            ><MessageCircle size={13} /> Share on WhatsApp</a>
          </>
        )}
      </div>

      {/* Today's summary — real, sendable now via click-to-chat */}
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 12 }}>
        Today's summary
      </div>

      <div style={{ background: '#0B141A', borderRadius: 12, padding: 16, border: `1px solid ${C.line}`, marginBottom: 12 }}>
        <div style={{
          background: '#005C4B', color: '#E9EDEF', borderRadius: '10px 10px 2px 10px', padding: '12px 14px',
          fontFamily: FONT_BODY, fontSize: 13, lineHeight: 1.6, maxWidth: '92%', marginLeft: 'auto',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 {business?.name || 'Your Business'} — {dateStr}</div>
          <div>Revenue today: <b>{naira(revenue)}</b></div>
          {topItem && <div>Best seller: <b>{topItem.name}</b> ({agg[topId]} sold)</div>}
          <div>Low stock alerts: <b>{lowStockItems.length} item{lowStockItems.length === 1 ? '' : 's'}</b></div>
        </div>
      </div>

      {waEnabled && (
        <>
          <a
            href={waLink(summaryText)} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '12px 0', borderRadius: 8, background: C.amber, color: C.ink, fontWeight: 700, fontSize: 14, textDecoration: 'none', marginBottom: 16 }}
          ><MessageCircle size={16} /> Send today's summary on WhatsApp</a>

          <a
            href={waLink(`Hi TodayBread! This is ${business?.name || 'a TodayBread user'} — I have a question.`, TODAYBREAD_WHATSAPP_NUMBER)}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '11px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 600, fontSize: 13, textDecoration: 'none' }}
          ><MessageCircle size={14} /> Message TodayBread support</a>
        </>
      )}

      <div style={{ marginTop: 16, fontSize: 11, color: C.paperDim, lineHeight: 1.6 }}>
        These open WhatsApp with your message ready to go — just tap send. Automatic delivery (no tapping required) is coming once WhatsApp Business verification is complete.
      </div>
    </div>
  );
}

function StaffView({ apiUrl, token }) {
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', pin: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [resetTarget, setResetTarget] = useState(null); // { id, name }
  const [newPin, setNewPin] = useState('');
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  const loadStaff = useCallback(async () => {
    try {
      const data = await apiRequest(apiUrl, '/auth/staff', { token });
      setStaff(data.staff);
    } catch (e) {
      setError(e.message);
    }
  }, [apiUrl, token]);

  useEffect(() => { loadStaff(); }, [loadStaff]);

  const handleAdd = async () => {
    if (!form.name.trim()) return setFormError('Name is required');
    if (!form.phone.trim()) return setFormError('Phone number is required');
    if (!form.pin || form.pin.length < 4) return setFormError('PIN must be at least 4 digits');
    setSaving(true); setFormError('');
    try {
      await apiRequest(apiUrl, '/auth/staff', { method: 'POST', token, body: { name: form.name.trim(), phone: form.phone.trim(), pin: form.pin } });
      setForm({ name: '', phone: '', pin: '' });
      setShowForm(false);
      await loadStaff();
    } catch (e) {
      setFormError(e.message || 'Could not create staff account');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPin = async () => {
    if (!newPin || newPin.length < 4) return setResetError('New PIN must be at least 4 digits');
    setResetting(true); setResetError('');
    try {
      await apiRequest(apiUrl, '/auth/reset-pin', { method: 'POST', token, body: { userId: resetTarget.id, newPin } });
      setResetSuccess(true);
      setTimeout(() => { setResetTarget(null); setNewPin(''); setResetSuccess(false); }, 1500);
    } catch (e) {
      setResetError(e.message || 'Could not reset PIN');
    } finally {
      setResetting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '9px 10px', borderRadius: 7, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_BODY, fontSize: 13, marginTop: 4 };
  const labelStyle = { fontSize: 11, color: C.paperDim, fontWeight: 600 };

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.02em', color: C.paperDim, marginBottom: 12 }}>
        Staff accounts
      </div>

      {!showForm && (
        <button onClick={() => setShowForm(true)} style={{ width: '100%', padding: '11px 0', borderRadius: 8, border: `1px dashed ${C.amber}66`, background: `${C.amber}14`, color: C.amber, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
          <Plus size={15} /> Add staff member
        </button>
      )}

      {showForm && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <label style={labelStyle}>Staff name</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Chidi Okafor" />
          <label style={{ ...labelStyle, display: 'block', marginTop: 10 }}>Phone number (their login)</label>
          <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="2348099998888" />
          <label style={{ ...labelStyle, display: 'block', marginTop: 10 }}>Set their PIN</label>
          <input style={inputStyle} type="password" value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value }))} placeholder="At least 4 digits" />
          {formError && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{formError}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => { setShowForm(false); setFormError(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleAdd} disabled={saving} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{saving ? 'Adding…' : 'Add staff'}</button>
          </div>
        </div>
      )}

      {/* PIN reset panel */}
      {resetTarget && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: 14, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Reset PIN for {resetTarget.name}</div>
          <label style={labelStyle}>New PIN</label>
          <input style={inputStyle} type="password" value={newPin} onChange={e => setNewPin(e.target.value)} placeholder="At least 4 digits" />
          {resetError && <div style={{ color: C.red, fontSize: 12, marginTop: 8 }}>{resetError}</div>}
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button onClick={() => { setResetTarget(null); setNewPin(''); setResetError(''); }} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleResetPin} disabled={resetting} style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: resetSuccess ? C.teal : C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              {resetSuccess ? <><Check size={14} /> Done</> : resetting ? 'Saving…' : 'Set new PIN'}
            </button>
          </div>
        </div>
      )}

      {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {staff === null && <div style={{ color: C.paperDim, fontSize: 13 }}>Loading staff…</div>}
        {staff?.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 16px', color: C.paperDim }}>
            <Users size={26} style={{ marginBottom: 10, opacity: 0.5 }} />
            <div style={{ fontSize: 13 }}>No staff accounts yet. Add one above — they'll log in with the same site URL using their own phone and PIN.</div>
          </div>
        )}
        {staff?.map(s => (
          <div key={s.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.name}</div>
              <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2, fontFamily: FONT_MONO }}>{s.phone}</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => { setResetTarget({ id: s.id, name: s.name }); setNewPin(''); setResetError(''); setShowForm(false); }}
                style={{ fontSize: 11, fontWeight: 600, color: C.paperDim, background: 'none', border: `1px solid ${C.line}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}
              >Reset PIN</button>
              <Tag color={C.blue}>Staff</Tag>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


// ============================================================================
// NOTEBOOK VIEW — paste Google Lens text or upload a photo of the ledger,
// backend (Claude vision / text) extracts rows, we fuzzy-match against real
// inventory, owner reviews and confirms, then we commit through the same
// recordSale/saveItem paths as the rest of the app (so offline queueing,
// optimistic UI, etc. all keep working the same way).
// ============================================================================

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:image/jpeg;base64,AAAA..." — strip the prefix
      const result = reader.result;
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = () => reject(new Error('Could not read the selected file'));
    reader.readAsDataURL(file);
  });
}

// Phone cameras produce multi-megabyte photos — way more resolution than
// handwritten text needs and way more bytes than necessary to upload over a
// patchy connection. This downsizes to a max dimension and re-encodes as
// JPEG at a modest quality via <canvas>, landing most ledger photos in the
// tens-to-low-hundreds of KB rather than several MB, before it ever goes to
// Gemini. Runs entirely client-side — nothing about the image touches the
// network until this has already shrunk it.
function compressImageForUpload(file, { maxDimension = 2200, quality = 0.85 } = {}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Could not compress the photo'));
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result;
            const commaIdx = result.indexOf(',');
            resolve({
              base64: commaIdx >= 0 ? result.slice(commaIdx + 1) : result,
              mediaType: 'image/jpeg',
              sizeKb: Math.round(blob.size / 1024),
            });
          };
          reader.onerror = () => reject(new Error('Could not read the compressed photo'));
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Could not load the selected photo')); };
    img.src = objectUrl;
  });
}

function NotebookView({ inventory, categories, apiUrl, token, onRecordSales, onAddStock, onReceiveStock }) {
  const [mode, setMode] = useState('sales'); // sales | stock
  const [inputMode, setInputMode] = useState('text'); // text | photo
  const [raw, setRaw] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [compressedInfo, setCompressedInfo] = useState(null); // { base64, mediaType, sizeKb }
  const [compressing, setCompressing] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [payment, setPayment] = useState('Cash');
  const [deductStock, setDeductStock] = useState(true);
  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const categoryNames = (categories || []).map(c => c.category).sort();

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
    setCompressedInfo(null);
    setCompressing(true);
    try {
      const info = await compressImageForUpload(file);
      setCompressedInfo(info);
    } catch (err) {
      setError(err.message || 'Could not process that photo — try another one');
      setPhotoFile(null);
    } finally {
      setCompressing(false);
    }
  };

  const clearPhoto = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setCompressedInfo(null);
  };

  const handleParse = async () => {
    setError('');
    if (inputMode === 'text' && !raw.trim()) return setError('Paste some ledger text first');
    if (inputMode === 'photo' && !compressedInfo) return setError('Choose a photo first');

    setParsing(true);
    try {
      let body;
      if (inputMode === 'photo') {
        // Already compressed client-side at selection time — this is the
        // small JPEG, not the original multi-MB camera capture.
        body = { imageBase64: compressedInfo.base64, mediaType: compressedInfo.mediaType, mode };
      } else {
        body = { text: raw, mode };
      }

      const data = await apiRequest(apiUrl, '/ocr/parse-page', { method: 'POST', token, body });

      // Map the backend's AI-extracted rows onto this business's actual
      // inventory (dbId is the backend's UUID, item.id is the frontend SKU).
      const results = (data.rows || []).map(row => {
        const matchedItem = row.matchedItem
          ? inventory.find(i => i.dbId === row.matchedItem.id) || null
          : null;
        const match = matchedItem ? { item: matchedItem, confidence: row.matchedItem.confidence } : null;
        // Rough per-unit estimate — the page usually shows a line total, not
        // a unit figure, so divide it back out by quantity. In Stock Arrival
        // mode this is what was paid to the supplier (cost); in Recording
        // Sales mode it's what the customer paid (sale price). Same raw
        // number, different meaning depending on which ledger this is.
        const qty = row.quantity || 1;
        const estUnitAmount = row.amountOnPage ? Math.round(row.amountOnPage / qty) : '';
        return {
          rawLine: row.rawDescription,
          overrideQty: qty,
          suggestedCategory: row.suggestedCategory || '',
          suggestedExpiryDate: row.suggestedExpiryDate || '',
          suggestedBatchNumber: row.suggestedBatchNumber || '',
          suggestedUnitCost: mode === 'stock' ? estUnitAmount : '',
          match,
          confirmed: !!match && !row.needsReview,
          creating: false,
          newDraft: {
            name: row.rawDescription, category: row.suggestedCategory || '',
            price: mode === 'sales' ? estUnitAmount : '',
            cost: mode === 'stock' ? estUnitAmount : '',
            expiryDate: row.suggestedExpiryDate || '', batchNumber: row.suggestedBatchNumber || '',
          },
        };
      });
      setParsed(results);
      setDone(false);
    } catch (e) {
      // e.debug (present on OCR errors) is diagnostic detail for logs, not
      // for the screen — surfacing it here is what used to show the raw
      // partial/truncated model output right in the UI. The backend's own
      // e.message is already the clean, user-facing copy for every case
      // (busy, truncated, unparseable, etc.) — show that and nothing else.
      setError(e.message || 'Could not parse the ledger entry');
      if (e.debug) console.warn('[ocr] parse error detail:', e.debug);
    } finally {
      setParsing(false);
    }
  };

  const updateQty = (idx, val) => setParsed(p => p.map((r, i) => i === idx ? { ...r, overrideQty: Math.max(1, Number(val) || 1) } : r));
  const updateMatch = (idx, itemId) => {
    const item = inventory.find(i => i.id === itemId);
    setParsed(p => p.map((r, i) => i === idx ? { ...r, match: item ? { item, confidence: 1 } : null, confirmed: !!item, creating: false } : r));
  };
  const toggleConfirm = (idx) => setParsed(p => p.map((r, i) => i === idx ? { ...r, confirmed: !r.confirmed } : r));
  const startCreating = (idx) => setParsed(p => p.map((r, i) => i === idx ? { ...r, creating: true, confirmed: false } : r));
  const cancelCreating = (idx) => setParsed(p => p.map((r, i) => i === idx ? { ...r, creating: false } : r));
  const updateNewDraft = (idx, key, val) => setParsed(p => p.map((r, i) => i === idx ? { ...r, newDraft: { ...r.newDraft, [key]: val } } : r));

  const isRowReady = (r) => r.creating
    ? !!(r.newDraft.name && r.newDraft.name.trim() && Number(r.newDraft.price) > 0)
    : !!(r.confirmed && r.match);

  const handleCommit = async () => {
    const toCommit = parsed.filter(isRowReady);
    if (toCommit.length === 0) return setError('Nothing ready to record yet');
    setCommitting(true); setError('');
    // Tracks items created earlier in this same commit loop — if the same
    // new product appears on two lines of one scanned page, the second line
    // restocks the first instead of creating a duplicate item.
    const createdThisBatch = [];
    try {
      for (const row of toCommit) {
        if (row.creating) {
          const normName = row.newDraft.name.trim().toLowerCase();
          const dupe = createdThisBatch.find(c => c.name.trim().toLowerCase() === normName);
          if (dupe) {
            if (mode === 'sales') {
              await onRecordSales(dupe.dbId, row.overrideQty, payment, deductStock);
            } else {
              const updated = await onAddStock({ ...dupe, stock: dupe.stock + row.overrideQty });
              if (updated) createdThisBatch[createdThisBatch.indexOf(dupe)] = updated;
            }
          } else if (mode === 'sales') {
            // A sale for a product that isn't in inventory yet, straight off
            // a photo of the sales book — this is the core "just snap it"
            // case: create the product itself (no baseline stock, since we
            // genuinely don't know how much was on hand — this is the first
            // the system is learning about it), then log the sale through
            // the same non-blocking path as any other sale, which is free
            // to take stock negative or skip deduction per the toggle above.
            const created = await onAddStock({
              isNew: true, name: row.newDraft.name.trim(), category: row.newDraft.category || '',
              price: Number(row.newDraft.price) || 0, cost: Number(row.newDraft.cost) || 0, stock: 0,
              warehouseStock: 0, reorder: 0, brand: '', size: '', origin: '',
              expiryDate: row.newDraft.expiryDate || '', batchNumber: row.newDraft.batchNumber || '',
              stockTracked: false,
            });
            if (created) {
              createdThisBatch.push(created);
              await onRecordSales(created.dbId, row.overrideQty, payment, deductStock);
            }
          } else {
            // Stock Arrival — the parsed quantity IS what physically arrived,
            // so it becomes the item's real initial stock straight away.
            const created = await onAddStock({
              isNew: true, name: row.newDraft.name.trim(), category: row.newDraft.category || '',
              price: Number(row.newDraft.price) || 0, cost: Number(row.newDraft.cost) || 0, stock: row.overrideQty,
              warehouseStock: 0, reorder: 0, brand: '', size: '', origin: '',
              expiryDate: row.newDraft.expiryDate || '', batchNumber: row.newDraft.batchNumber || '',
            });
            if (created) createdThisBatch.push(created);
          }
        } else if (mode === 'sales') {
          await onRecordSales(row.match.item.id, row.overrideQty, payment, deductStock);
        } else {
          // Stock Arrival, matched existing item — receive-stock recalculates
          // cost as a weighted average if this delivery's price differs from
          // what's on file (rather than leaving cost frozen at whatever it
          // was when the item was first added), and fills expiry/batch only
          // if the item doesn't already have one — never silently overwrites
          // real existing data, since this model tracks one expiry per item,
          // not per batch.
          await onReceiveStock(row.match.item, row.overrideQty, row.suggestedUnitCost || null, row.suggestedExpiryDate, row.suggestedBatchNumber);
        }
      }
      setDone(true); setRaw(''); setParsed(null); clearPhoto();
    } catch (e) {
      setError(e.message || 'Could not record entries');
    } finally {
      setCommitting(false);
    }
  };

  const readyCount = parsed?.filter(isRowReady).length || 0;

  const inputToggleBtn = (m, label, Icon) => (
    <button
      onClick={() => { setInputMode(m); setError(''); }}
      style={{ flex: 1, padding: '9px 0', borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: inputMode === m ? C.amber : 'transparent', color: inputMode === m ? C.ink : C.paperDim, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12 }}
    >
      <Icon size={13} /> {label}
    </button>
  );

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ClipboardList size={16} color={C.amber} />
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Snapshot</div>
          <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>Photograph the sales book, or paste text from Google Lens — items and math are extracted automatically</div>
        </div>
      </div>

      <div style={{ display: 'flex', background: C.panel, borderRadius: 8, border: `1px solid ${C.line}`, padding: 3, marginBottom: 12, width: 'fit-content' }}>
        {[['sales', 'Recording Sales'], ['stock', 'Stock Arrival']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: mode === m ? C.amber : 'transparent', color: mode === m ? C.ink : C.paperDim, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12 }}>{label}</button>
        ))}
      </div>

      {!parsed && (
        <>
          <div style={{ display: 'flex', background: C.panel, borderRadius: 8, border: `1px solid ${C.line}`, padding: 3, marginBottom: 14 }}>
            {inputToggleBtn('text', 'Paste text', Type)}
            {inputToggleBtn('photo', 'Upload photo', Camera)}
          </div>

          {inputMode === 'text' ? (
            <textarea
              value={raw}
              onChange={e => setRaw(e.target.value)}
              placeholder={mode === 'sales'
                ? 'Paste your Google Lens text here — any format is fine. Examples:\n\nProduct name x5\nAnother product 2pcs\nThird item x10'
                : 'Paste your Google Lens text here — any format is fine. Examples:\n\nProduct name x100\nAnother product 20 bottles\nThird item x50'}
              style={{ width: '100%', minHeight: 200, padding: '12px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, fontFamily: FONT_MONO, fontSize: 13, lineHeight: 1.6, resize: 'vertical' }}
            />
          ) : (
            <div>
              {!photoPreview ? (
                <div style={{ display: 'flex', gap: 8, minHeight: 200 }}>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, border: `1px dashed ${C.line}`, background: C.panel, color: C.paperDim, cursor: 'pointer', fontSize: 12.5, textAlign: 'center', padding: '0 10px' }}>
                    <Camera size={24} style={{ opacity: 0.6 }} />
                    Take a photo now
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                  </label>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 8, border: `1px dashed ${C.line}`, background: C.panel, color: C.paperDim, cursor: 'pointer', fontSize: 12.5, textAlign: 'center', padding: '0 10px' }}>
                    <ImageIcon size={24} style={{ opacity: 0.6 }} />
                    Choose from gallery
                    <input type="file" accept="image/*" onChange={handlePhotoSelect} style={{ display: 'none' }} />
                  </label>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <img src={photoPreview} alt="Ledger page" style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 8, border: `1px solid ${C.line}`, background: C.ink }} />
                  <button onClick={clearPhoto} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 6, color: '#fff', padding: '5px 10px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>Remove</button>
                  <div style={{
                    position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.65)', borderRadius: 6,
                    padding: '4px 8px', fontSize: 10.5, color: compressing ? C.paperDim : C.teal, fontFamily: FONT_MONO,
                  }}>
                    {compressing ? 'Compressing…' : compressedInfo ? `${compressedInfo.sizeKb} KB ready to upload` : ''}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && <div style={{ color: C.red, fontSize: 12, marginTop: 10 }}>{error}</div>}

          <button
            onClick={handleParse}
            disabled={parsing || compressing || (inputMode === 'text' ? !raw.trim() : !compressedInfo)}
            style={{
              width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 8, border: 'none',
              background: parsing ? C.line : ((inputMode === 'text' ? raw.trim() : compressedInfo) ? C.amber : C.line),
              color: (inputMode === 'text' ? raw.trim() : compressedInfo) ? C.ink : C.paperDim,
              fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14,
              cursor: (inputMode === 'text' ? raw.trim() : compressedInfo) ? 'pointer' : 'default',
            }}
          >
            {parsing ? 'Reading entries…' : compressing ? 'Preparing photo…' : 'Parse entries'}
          </button>
        </>
      )}

      {parsed && !done && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 30,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div style={{
            background: C.ink, width: '100%', maxWidth: 720, maxHeight: '92vh', overflowY: 'auto',
            borderRadius: '16px 16px 0 0', border: `1px solid ${C.line}`, borderBottom: 'none',
            padding: '16px 16px 20px',
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paper }}>Review before saving</div>
            <button onClick={() => setParsed(null)} style={{ fontSize: 11, color: C.paperDim, background: 'none', border: 'none', cursor: 'pointer' }}>← Start over</button>
          </div>
          <div style={{ fontSize: 12, color: C.paperDim, marginBottom: 12 }}>
            {parsed.length} line{parsed.length !== 1 ? 's' : ''} extracted — nothing is saved to your ledger until you confirm below. Check names, quantities and prices carefully.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {parsed.map((row, idx) => {
              const borderColor = row.creating ? C.amber + '55' : (row.match && row.confirmed) ? C.teal + '55' : !row.match ? C.red + '55' : C.line;
              return (
                <div key={idx} style={{ background: C.panel, border: `1px solid ${borderColor}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: C.paperDim, fontFamily: FONT_MONO, marginBottom: 6 }}>{row.rawLine}</div>

                  {row.creating ? (
                    <div>
                      <div style={{ fontSize: 11, color: C.amber, fontWeight: 700, marginBottom: 8 }}>+ New item</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                        <input
                          value={row.newDraft.name} onChange={e => updateNewDraft(idx, 'name', e.target.value)}
                          placeholder="Item name" style={{ gridColumn: '1 / -1', padding: '7px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_BODY, fontSize: 13 }}
                        />
                        <input
                          value={row.newDraft.category} onChange={e => updateNewDraft(idx, 'category', e.target.value)}
                          list="notebook-category-suggestions" placeholder="Category (optional)"
                          style={{ padding: '7px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_BODY, fontSize: 13 }}
                        />
                        <input
                          type="number" value={row.newDraft.cost} onChange={e => updateNewDraft(idx, 'cost', e.target.value)}
                          placeholder="Cost price (₦, optional)" style={{ padding: '7px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_MONO, fontSize: 13 }}
                        />
                        <input
                          type="number" value={row.newDraft.price} onChange={e => updateNewDraft(idx, 'price', e.target.value)}
                          placeholder="Sale price (₦)" style={{ padding: '7px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_MONO, fontSize: 13 }}
                        />
                        <input
                          type="date" value={row.newDraft.expiryDate} onChange={e => updateNewDraft(idx, 'expiryDate', e.target.value)}
                          style={{ padding: '7px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: row.newDraft.expiryDate ? C.paper : C.paperDim, fontFamily: FONT_BODY, fontSize: 12 }}
                        />
                        <input
                          value={row.newDraft.batchNumber} onChange={e => updateNewDraft(idx, 'batchNumber', e.target.value)}
                          placeholder="Batch/lot (optional)" style={{ padding: '7px 9px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_BODY, fontSize: 13 }}
                        />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 11, color: C.paperDim }}>{mode === 'sales' ? 'Qty sold:' : 'Initial stock:'}</span>
                        <input type="number" value={row.overrideQty} min={1} onChange={e => updateQty(idx, e.target.value)} style={{ width: 52, textAlign: 'center', padding: '5px 6px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700 }} />
                        <button onClick={() => cancelCreating(idx)} style={{ marginLeft: 'auto', padding: '5px 10px', borderRadius: 6, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 600, fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {row.match ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{row.match.item.name}</div>
                            <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{row.match.item.brand} · {Math.round(row.match.confidence * 100)}% match</div>
                            {mode === 'stock' && row.suggestedExpiryDate && !row.match.item.expiryDate && (
                              <div style={{ fontSize: 10, color: C.teal, marginTop: 3 }}>Will set expiry: {row.suggestedExpiryDate} (this item has none yet)</div>
                            )}
                            {mode === 'stock' && row.suggestedUnitCost && Number(row.suggestedUnitCost) !== Number(row.match.item.cost) && (
                              <div style={{ fontSize: 10, color: C.teal, marginTop: 3 }}>Cost will update to a weighted average (was {naira(row.match.item.cost)}, this delivery ≈{naira(row.suggestedUnitCost)}/unit)</div>
                            )}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <input type="number" value={row.overrideQty} min={1} onChange={e => updateQty(idx, e.target.value)} style={{ width: 52, textAlign: 'center', padding: '5px 6px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700 }} />
                            <button onClick={() => toggleConfirm(idx)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: row.confirmed ? C.teal : C.line, color: row.confirmed ? '#fff' : C.paperDim, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{row.confirmed ? '✓' : 'Skip'}</button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <AlertTriangle size={13} color={C.red} />
                          <span style={{ fontSize: 12, color: C.red }}>No match found</span>
                        </div>
                      )}

                      <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: C.paperDim }}>{row.match ? 'Not this?' : 'Or:'}</span>
                        <select onChange={e => updateMatch(idx, e.target.value)} value={row.match && !row.creating ? row.match.item.id : ''} style={{ flex: 1, minWidth: 140, padding: '5px 8px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontSize: 12 }}>
                          <option value="">— pick an existing item —</option>
                          {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                        <button onClick={() => startCreating(idx)} style={{ padding: '5px 10px', borderRadius: 6, border: `1px dashed ${C.amber}66`, background: `${C.amber}14`, color: C.amber, fontWeight: 700, fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap' }}>+ Create as new item</button>
                      </div>
                      {mode === 'sales' && !row.match && (
                        <div style={{ fontSize: 10, color: C.paperDim, fontStyle: 'italic', marginTop: 6 }}>Not in your inventory yet — sell it anyway, or create it from this line.</div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <datalist id="notebook-category-suggestions">
            {categoryNames.map(c => <option key={c} value={c} />)}
          </datalist>

          {mode === 'sales' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['Cash', 'Transfer', 'POS'].map(p => (
                <button key={p} onClick={() => setPayment(p)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${payment === p ? C.teal : C.line}`, background: payment === p ? `${C.teal}22` : 'transparent', color: payment === p ? C.teal : C.paperDim }}>{p}</button>
              ))}
            </div>
          )}

          {mode === 'sales' && (
            <button
              onClick={() => setDeductStock(d => !d)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%', marginBottom: 14,
                padding: '9px 10px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel,
                color: C.paperDim, fontSize: 12, cursor: 'pointer', textAlign: 'left',
              }}
            >
              <div style={{
                width: 32, height: 18, borderRadius: 9, position: 'relative', flexShrink: 0,
                background: deductStock ? C.teal : C.line, transition: 'background 0.15s',
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%', background: C.paper, position: 'absolute', top: 2,
                  left: deductStock ? 16 : 2, transition: 'left 0.15s',
                }} />
              </div>
              Deduct these quantities from inventory stock
            </button>
          )}

          {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</div>}

          <button onClick={handleCommit} disabled={committing || readyCount === 0} style={{ width: '100%', padding: '13px 0', borderRadius: 8, border: 'none', background: readyCount > 0 ? C.amber : C.line, color: readyCount > 0 ? C.ink : C.paperDim, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: readyCount > 0 ? 'pointer' : 'default' }}>
            {committing ? 'Saving…' : `Confirm & Save to Ledger (${readyCount})`}
          </button>
          </div>
        </div>
      )}

      {done && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <Check size={32} color={C.teal} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: C.paper, marginBottom: 6 }}>All done</div>
          <div style={{ fontSize: 13, color: C.paperDim, marginBottom: 20 }}>Entries recorded successfully from your notebook.</div>
          <button onClick={() => setDone(false)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Add another page</button>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// ADMIN DASHBOARD — only shown to super admin (JOHN KUNLE / 2348083161190)
// ============================================================================
function AdminDashboard({ apiUrl, token, onLogout }) {
  const [stats, setStats] = useState(null);
  const [businesses, setBusinesses] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pinResets, setPinResets] = useState([]);
  const [resolvingPin, setResolvingPin] = useState(null);
  const [newAdminPin, setNewAdminPin] = useState('');
  const [pinResolveError, setPinResolveError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [s, b, pr] = await Promise.all([
          apiRequest(apiUrl, '/admin/stats', { token }),
          apiRequest(apiUrl, '/admin/businesses', { token }),
          apiRequest(apiUrl, '/admin/pin-resets', { token }).catch(() => ({ resets: [] })),
        ]);
        setStats(s);
        setBusinesses(b.businesses);
        setPinResets(pr.resets || []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [apiUrl, token]);

  const handleResolvePin = async (userId) => {
    if (!newAdminPin || newAdminPin.length < 4) return setPinResolveError('PIN must be at least 4 digits');
    setPinResolveError('');
    try {
      await apiRequest(apiUrl, `/admin/pin-resets/${userId}/resolve`, { method: 'POST', token, body: { newPin: newAdminPin } });
      setPinResets(pr => pr.filter(r => r.id !== userId));
      setResolvingPin(null);
      setNewAdminPin('');
    } catch (e) {
      setPinResolveError(e.message);
    }
  };

  const [markingPaid, setMarkingPaid] = useState(null); // business id currently being marked

  const handleMarkPaid = async (businessId) => {
    setMarkingPaid(businessId);
    try {
      const res = await apiRequest(apiUrl, `/admin/businesses/${businessId}/mark-paid`, { method: 'POST', token });
      setBusinesses(bs => bs.map(b => b.id === businessId ? { ...b, next_due_date: res.nextDueDate } : b));
      setDetail(d => (d && d.business && selected === businessId) ? { ...d, business: { ...d.business, next_due_date: res.nextDueDate } } : d);
    } catch (e) {
      alert(`Could not mark as paid: ${e.message}`);
    } finally {
      setMarkingPaid(null);
    }
  };

  const subscriptionStatus = (b) => {
    const now = new Date();
    const trialEndsAt = b.trial_ends_at ? new Date(b.trial_ends_at) : null;
    const nextDueDate = b.next_due_date ? new Date(b.next_due_date) : null;
    if (trialEndsAt && now < trialEndsAt) {
      const days = Math.ceil((trialEndsAt - now) / 86400000);
      return { label: `Trial · ${days}d left`, color: C.blue };
    }
    if (nextDueDate && now > nextDueDate) {
      return { label: 'Overdue', color: C.red };
    }
    if (nextDueDate) {
      const days = Math.ceil((nextDueDate - now) / 86400000);
      if (days <= 7) return { label: `Due in ${days}d`, color: C.amber };
      return { label: 'Active', color: C.teal };
    }
    return { label: '—', color: C.paperDim };
  };

  const loadDetail = async (id) => {
    setSelected(id);
    setDetail(null);
    try {
      const data = await apiRequest(apiUrl, `/admin/businesses/${id}`, { token });
      setDetail(data);
    } catch (e) {
      setDetail({ error: e.message });
    }
  };

  const daysSince = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div style={{ background: C.ink, backgroundImage: 'radial-gradient(circle, rgba(242,169,59,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px', minHeight: '100vh', color: C.paper, fontFamily: FONT_BODY }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap'); * { box-sizing: border-box; } ::-webkit-scrollbar { height: 0; width: 0; } body { background-color: #14151A; }`}</style>

      {/* Header */}
      <div style={{ background: '#0E0F12', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='40'%3E%3Cpath d='M0 20 Q25 8 50 20 Q75 32 100 20 Q125 8 150 20 Q175 32 200 20' fill='none' stroke='rgba(242,169,59,0.06)' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '200px 40px', borderBottom: `1px solid ${C.line}`, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.paperDim, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            Today<span style={{ color: C.amber }}>Bread</span> platform
          </div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            Admin Dashboard
          </div>
          <div style={{ fontSize: 11, color: C.teal, marginTop: 2 }}>Super admin view · all data visible</div>
        </div>
        <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.paperDim, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>
          Log out
        </button>
      </div>

      <div style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
        {loading && <div style={{ color: C.paperDim, fontSize: 13, padding: '30px 0' }}>Loading platform data…</div>}
        {error && <div style={{ color: C.red, fontSize: 13 }}>{error}</div>}

        {/* Platform stats */}
        {stats && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              {[
                ['Total businesses', stats.totalBusinesses, C.amber],
                ['Total users', stats.totalUsers, C.paper],
                ['Total sales', stats.totalSales, C.teal],
                ['Platform revenue', naira(stats.totalRevenue), C.teal],
                ['Inventory items', stats.totalItems, C.paperDim],
                ['New this week', stats.recentSignups, C.blue],
              ].map(([label, value, color]) => (
                <div key={label} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Active vs Ghost breakdown */}
            <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10, padding: '12px 14px', marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Activity breakdown (last 7 days)</div>
              <div style={{ display: 'flex', gap: 0 }}>
                {/* Active bar */}
                <div style={{ flex: stats.activeBusinesses || 1, background: C.teal, height: 8, borderRadius: '4px 0 0 4px' }} />
                {/* Ghost bar */}
                <div style={{ flex: stats.ghostBusinesses || 1, background: C.red + '88', height: 8, borderRadius: '0 4px 4px 0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: C.teal, fontWeight: 700 }}>{stats.activeBusinesses}</span>
                  <span style={{ color: C.paperDim }}> active — sold something this week</span>
                </div>
                <div style={{ fontSize: 12 }}>
                  <span style={{ color: C.red, fontWeight: 700 }}>{stats.ghostBusinesses}</span>
                  <span style={{ color: C.paperDim }}> ghost — never recorded a sale</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* PIN reset requests */}
        {pinResets.length > 0 && (
          <div style={{ background: `${C.red}14`, border: `1px solid ${C.red}55`, borderRadius: 10, padding: 14, marginBottom: 20 }}>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.red, marginBottom: 10 }}>
              🔐 PIN reset requests ({pinResets.length})
            </div>
            {pinResets.map(r => (
              <div key={r.id} style={{ borderBottom: `1px solid ${C.line}`, paddingBottom: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 11, color: C.paperDim, fontFamily: FONT_MONO }}>{r.phone} · {r.business_name}</div>
                  </div>
                  <button
                    onClick={() => { setResolvingPin(r.id); setNewAdminPin(''); setPinResolveError(''); }}
                    style={{ padding: '5px 12px', borderRadius: 6, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                  >Reset PIN</button>
                </div>
                {resolvingPin === r.id && (
                  <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="password"
                      value={newAdminPin}
                      onChange={e => setNewAdminPin(e.target.value)}
                      placeholder="New PIN (min 4 digits)"
                      style={{ flex: 1, padding: '8px 10px', borderRadius: 7, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_MONO, fontSize: 13 }}
                    />
                    <button onClick={() => handleResolvePin(r.id)} style={{ padding: '8px 14px', borderRadius: 7, border: 'none', background: C.teal, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Confirm</button>
                    <button onClick={() => setResolvingPin(null)} style={{ padding: '8px 10px', borderRadius: 7, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontSize: 13, cursor: 'pointer' }}>Cancel</button>
                    {pinResolveError && <div style={{ width: '100%', color: C.red, fontSize: 12 }}>{pinResolveError}</div>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Business list */}
        {businesses && (
          <>
            <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 10 }}>
              All businesses ({businesses.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {businesses.map(b => (
                <div key={b.id}>
                  <div
                    onClick={() => selected === b.id ? setSelected(null) : loadDetail(b.id)}
                    style={{ background: selected === b.id ? C.panel2 : C.panel, border: `1px solid ${selected === b.id ? C.amber + '55' : C.line}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
                        {(() => { const st = subscriptionStatus(b); return (
                          <span style={{ fontSize: 10, fontWeight: 700, color: st.color, border: `1px solid ${st.color}55`, background: `${st.color}1A`, borderRadius: 4, padding: '1px 6px' }}>{st.label}</span>
                        ); })()}
                      </div>
                      {b.address && <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{b.address}</div>}
                      <div style={{ fontSize: 11, color: C.paperDim, marginTop: 4, display: 'flex', gap: 12 }}>
                        <span>👤 {b.owner_name || '—'}</span>
                        <span>📦 {b.item_count} items</span>
                        <span>🧾 {b.sale_count} sales</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700, color: C.amber }}>{naira(b.total_revenue)}</div>
                      <div style={{ fontSize: 10, color: C.paperDim, marginTop: 3 }}>{daysSince(b.created_at)}</div>
                      {b.last_sale_at && <div style={{ fontSize: 10, color: C.teal, marginTop: 2 }}>last sale {daysSince(b.last_sale_at)}</div>}
                      {!b.last_sale_at && <div style={{ fontSize: 10, color: C.red, marginTop: 2 }}>no sales yet</div>}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selected === b.id && (
                    <div style={{ background: C.panel2, border: `1px solid ${C.amber}33`, borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '12px 14px' }}>
                      {!detail && <div style={{ fontSize: 12, color: C.paperDim }}>Loading detail…</div>}
                      {detail?.error && <div style={{ fontSize: 12, color: C.red }}>{detail.error}</div>}
                      {detail && !detail.error && (
                        <>
                          <div style={{ display: 'flex', gap: 16, marginBottom: 12, flexWrap: 'wrap' }}>
                            <div style={{ fontSize: 11 }}><span style={{ color: C.paperDim }}>Phone: </span><span style={{ fontFamily: FONT_MONO }}>{detail.business.owner_phone}</span></div>
                            <div style={{ fontSize: 11 }}><span style={{ color: C.paperDim }}>Staff: </span>{detail.staff.length} account{detail.staff.length !== 1 ? 's' : ''}</div>
                            <div style={{ fontSize: 11 }}><span style={{ color: C.paperDim }}>WhatsApp: </span><span style={{ fontFamily: FONT_MONO }}>{detail.business.whatsapp_number || '—'}</span></div>
                          </div>

                          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 12px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ fontSize: 11, color: C.paperDim }}>
                              {naira(detail.business.monthly_fee || 10000)}/mo · next due{' '}
                              <span style={{ color: C.paper, fontWeight: 600 }}>
                                {detail.business.next_due_date ? new Date(detail.business.next_due_date).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                              </span>
                            </div>
                            <button
                              onClick={() => handleMarkPaid(b.id)}
                              disabled={markingPaid === b.id}
                              style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: C.teal, color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                            >{markingPaid === b.id ? 'Marking…' : 'Mark as paid'}</button>
                          </div>

                          {detail.topItems.length > 0 && (
                            <>
                              <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Top items</div>
                              {detail.topItems.map((item, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>
                                  <span>{item.name}</span>
                                  <span style={{ color: C.paperDim }}>{item.times_sold} sold · {item.stock} left</span>
                                </div>
                              ))}
                              <div style={{ height: 12 }} />
                            </>
                          )}

                          {detail.recentSales.length > 0 && (
                            <>
                              <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Recent sales</div>
                              {detail.recentSales.map((s, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: `1px solid ${C.line}` }}>
                                  <span style={{ color: C.paperDim }}>{new Date(s.occurred_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</span>
                                  <span style={{ flex: 1, padding: '0 10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.item_name}</span>
                                  <span style={{ fontFamily: FONT_MONO, color: C.amber }}>{naira(s.qty * s.unit_price)}</span>
                                </div>
                              ))}
                            </>
                          )}

                          {detail.recentSales.length === 0 && detail.topItems.length === 0 && (
                            <div style={{ fontSize: 12, color: C.paperDim, fontStyle: 'italic' }}>No activity recorded yet.</div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
