import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Fuel, Droplet, Package, TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, MessageCircle, Lock, Clock, ChevronRight, Plus, Minus,
  ShoppingCart, BarChart3, Wallet, Boxes, Wrench, Link2, Check, Sparkles, ArrowUp, ArrowDown, Timer, ArchiveX, Award,
  Wifi, WifiOff, LogOut, Server, CloudUpload, AlertCircle, Users, ClipboardList
} from 'lucide-react';

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

const INITIAL_INVENTORY = [
  { id: 'TB-101', name: 'Toyota Genuine ATF Type T-IV', size: '1L', category: 'Transmission Fluid', brand: 'Toyota Genuine', cost: 2400, price: 3600, stock: 640, reorder: 150, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-102', name: 'Honda Genuine CVT Fluid', size: '1L', category: 'Transmission Fluid', brand: 'Honda Genuine', cost: 2600, price: 3900, stock: 380, reorder: 100, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-103', name: 'Total Transmission Gear Oil 80W-90', size: '1L', category: 'Transmission Fluid', brand: 'Total', cost: 1800, price: 2800, stock: 520, reorder: 130, origin: 'Apapa Port, Lagos' },
  { id: 'TB-104', name: 'Castrol DOT 3 Brake Fluid', size: '500ml', category: 'Brake Fluid', brand: 'Castrol', cost: 1100, price: 1850, stock: 1800, reorder: 400, origin: 'Apapa Port, Lagos' },
  { id: 'TB-105', name: 'Bosch DOT 4 Brake Fluid', size: '500ml', category: 'Brake Fluid', brand: 'Bosch', cost: 1350, price: 2200, stock: 900, reorder: 250, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-106', name: 'Liqui Moly Brake Cleaner Spray', size: '450ml', category: 'Cleaner & Degreaser', brand: 'Liqui Moly', cost: 1650, price: 2700, stock: 40, reorder: 150, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-107', name: 'Mobil 1 5W-30 Synthetic Engine Oil', size: '4L', category: 'Engine Oil', brand: 'Mobil', cost: 8400, price: 12200, stock: 360, reorder: 100, origin: 'Apapa Port, Lagos' },
  { id: 'TB-108', name: 'Total Quartz 20W-50 Engine Oil', size: '4L', category: 'Engine Oil', brand: 'Total', cost: 6700, price: 9800, stock: 840, reorder: 220, origin: 'Apapa Port, Lagos' },
  { id: 'TB-109', name: 'Shell Helix 10W-40 Engine Oil', size: '4L', category: 'Engine Oil', brand: 'Shell', cost: 7400, price: 10700, stock: 490, reorder: 150, origin: 'Apapa Port, Lagos' },
  { id: 'TB-110', name: 'Prestone Long Life Coolant — Green', size: '1L', category: 'Coolant', brand: 'Prestone', cost: 1150, price: 1950, stock: 700, reorder: 200, origin: 'Cotonou, Benin Republic' },
  { id: 'TB-111', name: 'Valvoline Long Life Coolant — Red OAT', size: '1L', category: 'Coolant', brand: 'Valvoline', cost: 1250, price: 2100, stock: 70, reorder: 180, origin: 'Cotonou, Benin Republic' },
  { id: 'TB-112', name: 'Prestone Radiator Stop Leak', size: '300ml', category: 'Coolant', brand: 'Prestone', cost: 1450, price: 2450, stock: 260, reorder: 100, origin: 'Cotonou, Benin Republic' },
  { id: 'TB-113', name: 'Armor All Dashboard Shine Spray — Citrus', size: '300ml', category: 'Dashboard & Interior', brand: 'Armor All', cost: 1000, price: 1850, stock: 1450, reorder: 350, origin: 'Cotonou, Benin Republic' },
  { id: 'TB-114', name: 'Armor All Leather & Vinyl Cleaner', size: '300ml', category: 'Dashboard & Interior', brand: 'Armor All', cost: 1300, price: 2250, stock: 560, reorder: 180, origin: 'Cotonou, Benin Republic' },
  { id: 'TB-115', name: 'STP Tyre Shine Spray', size: '500ml', category: 'Dashboard & Interior', brand: 'STP', cost: 1550, price: 2650, stock: 400, reorder: 150, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-116', name: 'Little Trees Air Freshener Vent Clip — Vanilla (3pk)', size: '3pk', category: 'Dashboard & Interior', brand: 'Little Trees', cost: 700, price: 1400, stock: 2200, reorder: 500, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-117', name: 'Toyota Genuine Power Steering Fluid', size: '500ml', category: 'Power Steering', brand: 'Toyota Genuine', cost: 1650, price: 2750, stock: 300, reorder: 110, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-118', name: 'Permatex Silicone Grease Tube', size: '100g', category: 'Grease & Sealant', brand: 'Permatex', cost: 850, price: 1550, stock: 640, reorder: 180, origin: 'Apapa Port, Lagos' },
  { id: 'TB-119', name: 'Permatex Gasket Sealant (RTV)', size: '85g', category: 'Grease & Sealant', brand: 'Permatex', cost: 1750, price: 2950, stock: 190, reorder: 100, origin: 'Apapa Port, Lagos' },
  { id: 'TB-120', name: 'Loctite Multi-Purpose Grease Tub', size: '500g', category: 'Grease & Sealant', brand: 'Loctite', cost: 2450, price: 3900, stock: 140, reorder: 80, origin: 'Apapa Port, Lagos' },
  { id: 'TB-121', name: 'Liqui Moly Carburetor Cleaner Spray', size: '400ml', category: 'Cleaner & Degreaser', brand: 'Liqui Moly', cost: 1450, price: 2500, stock: 460, reorder: 150, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-122', name: 'STP Fuel Injector Cleaner', size: '300ml', category: 'Cleaner & Degreaser', brand: 'STP', cost: 1850, price: 3150, stock: 330, reorder: 120, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-123', name: 'Total Engine Degreaser', size: '1L', category: 'Cleaner & Degreaser', brand: 'Total', cost: 1700, price: 2850, stock: 720, reorder: 220, origin: 'Apapa Port, Lagos' },
  { id: 'TB-124', name: 'Prestone Windscreen Washer Fluid Concentrate', size: '500ml', category: 'Cleaner & Degreaser', brand: 'Prestone', cost: 900, price: 1650, stock: 1050, reorder: 300, origin: 'Cotonou, Benin Republic' },
  { id: 'TB-125', name: 'Bosch Battery Terminal Protector Spray', size: '200ml', category: 'Grease & Sealant', brand: 'Bosch', cost: 1050, price: 1950, stock: 230, reorder: 120, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-126', name: 'Loctite Chain & Cable Lubricant Spray', size: '300ml', category: 'Grease & Sealant', brand: 'Loctite', cost: 1250, price: 2200, stock: 490, reorder: 160, origin: 'Apapa Port, Lagos' },
  { id: 'TB-127', name: 'STP Heavy Duty Hand Cleaner Paste', size: '500g', category: 'Cleaner & Degreaser', brand: 'STP', cost: 1500, price: 2650, stock: 290, reorder: 100, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-128', name: 'Liqui Moly Diesel Injector Cleaner', size: '300ml', category: 'Cleaner & Degreaser', brand: 'Liqui Moly', cost: 1950, price: 3350, stock: 250, reorder: 100, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-129', name: 'Honda Genuine Synthetic Gear Oil 75W-140', size: '1L', category: 'Transmission Fluid', brand: 'Honda Genuine', cost: 2750, price: 4250, stock: 210, reorder: 100, origin: 'Tin-Can Island Port, Lagos' },
  { id: 'TB-130', name: 'Castrol Premium Brake Fluid DOT 5.1', size: '500ml', category: 'Brake Fluid', brand: 'Castrol', cost: 1650, price: 2750, stock: 170, reorder: 100, origin: 'Apapa Port, Lagos' },
  { id: 'TB-131', name: 'Prestone AC Refrigerant Leak Sealant', size: '250ml', category: 'Coolant', brand: 'Prestone', cost: 2150, price: 3600, stock: 130, reorder: 80, origin: 'Cotonou, Benin Republic' },
  { id: 'TB-132', name: 'Armor All Headlight Restoration Kit', size: '1 kit', category: 'Dashboard & Interior', brand: 'Armor All', cost: 2500, price: 4200, stock: 180, reorder: 90, origin: 'Cotonou, Benin Republic' },
];

// Deterministic PRNG so the demo sales history looks the same on every load
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSeedHistory(inventory) {
  const rand = mulberry32(20260101);
  const fastMovers = ['TB-113', 'TB-123', 'TB-104', 'TB-101', 'TB-124', 'TB-108'];
  const weighted = [...inventory.map(i => i.id), ...fastMovers, ...fastMovers, ...fastMovers];
  const sales = [];
  const now = new Date();
  let counter = 0;
  for (let day = 13; day >= 0; day--) {
    const txCount = 8 + Math.floor(rand() * 12);
    for (let t = 0; t < txCount; t++) {
      const itemId = weighted[Math.floor(rand() * weighted.length)];
      const item = inventory.find(i => i.id === itemId);
      if (!item) continue;
      const qty = 1 + Math.floor(rand() * 3);
      const payRoll = rand();
      const payment = payRoll < 0.5 ? 'Cash' : payRoll < 0.8 ? 'Transfer' : 'POS';
      const ts = new Date(now);
      ts.setDate(ts.getDate() - day);
      ts.setHours(8 + Math.floor(rand() * 10), Math.floor(rand() * 60), 0, 0);
      sales.push({
        id: `S-${counter++}`,
        itemId: item.id,
        itemName: item.name,
        qty,
        unitPrice: item.price,
        unitCost: item.cost,
        payment,
        staff: rand() < 0.5 ? 'Owner' : 'Chidi (Staff)',
        timestamp: ts.toISOString(),
      });
    }
  }
  return sales;
}

function naira(n) {
  return '₦' + Math.round(n).toLocaleString('en-NG');
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
  const [apiUrl, setApiUrlState, loaded] = useStorage('todaybread-api-url', null);
  return [apiUrl, setApiUrlState, loaded];
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
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export default function TodayBread() {
  const [apiUrl, setApiUrl, apiUrlLoaded] = useApiUrl();
  const [auth, setAuth, authLoaded] = useAuth();
  const [inventory, setInventoryLocal] = useState([]);
  const [sales, setSalesLocal] = useState([]);
  const [pending, setPending, pendingLoaded] = useStorage('todaybread-pending-sales', []);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | error
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState('sale');
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
      }));
      const mappedSales = salesRes.sales.map(s => ({
        id: s.id, itemId: s.item_id, itemName: s.item_name, qty: s.qty,
        unitPrice: Number(s.unit_price), unitCost: Number(s.unit_cost || 0), payment: s.payment_method, timestamp: s.occurred_at,
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

  const lowStockItems = useMemo(() => inventory.filter(i => i.stock <= i.reorder), [inventory]);

  // staff never have access to owner-only tabs — fall back to Record Sale if one is somehow active
  useEffect(() => {
    if (dataLoaded && role === 'staff' && !['sale', 'inventory', 'analytics'].includes(tab)) {
      setTab('sale');
    }
    if (dataLoaded && role === 'owner' && tab === 'sale') {
      setTab('reports');
    }
  }, [dataLoaded, role]);

  // record a sale — try live, fall back to offline queue if the network call fails
  const recordSale = async (itemId, qty, payment) => {
    const item = inventory.find(i => i.id === itemId);
    if (!item || item.stock < qty) return;
    const clientUuid = crypto.randomUUID();
    const occurredAt = new Date().toISOString();

    // optimistic local update so the UI feels instant either way
    setInventoryLocal(inv => inv.map(i => i.id === itemId ? { ...i, stock: i.stock - qty } : i));
    setSalesLocal(s => [{ id: clientUuid, itemId: item.id, itemName: item.name, qty, unitPrice: item.price, unitCost: item.cost, payment, timestamp: occurredAt }, ...s]);

    try {
      await apiRequest(apiUrl, '/sales', { method: 'POST', token, body: { itemId: item.dbId, qty, paymentMethod: payment, clientUuid } });
    } catch (e) {
      // offline or server unreachable — queue it, it'll sync automatically later
      setPending(p => [...p, { itemId: item.dbId, qty, paymentMethod: payment, clientUuid, occurredAt }]);
    }
  };

  // owner-only inventory CRUD, talking straight to the live API
  const saveItem = async (formItem) => {
    const isNew = !inventory.some(i => i.id === formItem.id) && !formItem.dbId;
    try {
      if (isNew) {
        const res = await apiRequest(apiUrl, '/inventory', {
          method: 'POST', token, body: {
            sku: formItem.id, name: formItem.name, brand: formItem.brand, size: formItem.size, category: formItem.category,
            costPrice: formItem.cost, salePrice: formItem.price, stock: formItem.stock,
            warehouseStock: formItem.warehouseStock || 0, reorderLevel: formItem.reorder, origin: formItem.origin,
          },
        });
        setInventoryLocal(inv => [...inv, { ...formItem, dbId: res.item.id }]);
      } else {
        await apiRequest(apiUrl, `/inventory/${formItem.dbId}`, {
          method: 'PUT', token, body: {
            name: formItem.name, brand: formItem.brand, size: formItem.size, category: formItem.category,
            costPrice: formItem.cost, salePrice: formItem.price, stock: formItem.stock,
            warehouseStock: formItem.warehouseStock || 0, reorderLevel: formItem.reorder, origin: formItem.origin,
          },
        });
        setInventoryLocal(inv => inv.map(i => i.id === formItem.id ? formItem : i));
      }
    } catch (e) {
      alert(`Could not save: ${e.message}`);
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

  const handleLogout = () => setAuth(null);
  const [authMode, setAuthMode] = useState('login');

  if (!apiUrlLoaded || !authLoaded || !pendingLoaded) {
    return <LoadingScreen />;
  }
  if (!apiUrl) {
    return <ApiSetupScreen onSave={setApiUrl} />;
  }
  if (!auth) {
    return authMode === 'signup'
      ? <SignupScreen apiUrl={apiUrl} onSignup={setAuth} onBackToLogin={() => setAuthMode('login')} />
      : <LoginScreen apiUrl={apiUrl} onLogin={setAuth} onChangeApiUrl={() => setApiUrl(null)} onShowSignup={() => setAuthMode('signup')} />;
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

      <TabBar role={role} tab={tab} setTab={setTab} lowStockCount={lowStockItems.length} />

      <div style={{ padding: '16px', maxWidth: 720, margin: '0 auto' }}>
        {tab === 'inventory' && (
          <InventoryView inventory={inventory} role={role} onSave={saveItem} onDelete={deleteItem} onClearAll={clearAllItems} onTogglePublic={togglePublic} onRestock={restockItem} />
        )}
        {tab === 'sale' && (
          <SaleView inventory={inventory} onSubmit={recordSale} sales={sales} />
        )}
        {tab === 'analytics' && (
          <AnalyticsView sales={sales} role={role} />
        )}
        {tab === 'insights' && role === 'owner' && (
          <InsightsView sales={sales} inventory={inventory} />
        )}
        {tab === 'reports' && role === 'owner' && (
          <ReportsView sales={sales} inventory={inventory} />
        )}
        {tab === 'whatsapp' && role === 'owner' && (
          <WhatsAppView sales={sales} inventory={inventory} lowStockItems={lowStockItems} business={auth.business} apiUrl={apiUrl} />
        )}
        {tab === 'staff' && role === 'owner' && (
          <StaffView apiUrl={apiUrl} token={token} />
        )}
        {tab === 'notebook' && role === 'owner' && (
          <NotebookView inventory={inventory} onRecordSales={recordSale} onAddStock={saveItem} />
        )}
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

function LoginScreen({ apiUrl, onLogin, onChangeApiUrl, onShowSignup }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
      const me = await apiRequest(apiUrl, '/me', { token: data.token }).catch(() => null);
      const adminCheck = await apiRequest(apiUrl, '/admin/check', { token: data.token }).catch(() => ({ isSuperAdmin: false }));
      await onLogin({ token: data.token, user: { ...data.user, isSuperAdmin: adminCheck.isSuperAdmin }, business: me?.business || { name: 'TodayBread' } });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
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
            <button onClick={() => setForgotMode(true)} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'transparent', color: C.paperDim, fontSize: 12, cursor: 'pointer', marginBottom: 4 }}>
              Forgot PIN?
            </button>
            <button onClick={onShowSignup} style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.amber, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}>
              New shop? Create your business
            </button>
            <button onClick={onChangeApiUrl} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'transparent', color: C.paperDim, fontSize: 12, cursor: 'pointer' }}>
              Change backend URL
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
      </div>
    </div>
  );
}

function SignupScreen({ apiUrl, onSignup, onBackToLogin }) {
  const [form, setForm] = useState({ businessName: '', ownerName: '', address: '', phone: '', pin: '', whatsappNumber: '', inviteCode: '' });
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
        },
      });
      await onSignup({ token: data.token, user: data.user, business: data.business });
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
        <input style={inputStyle} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Apex Autos Limited" />

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

function TabBar({ role, tab, setTab, lowStockCount }) {
  const tabs = [
    ...(role === 'owner' ? [{ id: 'reports', label: 'Today', icon: Wallet }] : []),
    ...(role === 'owner' ? [{ id: 'insights', label: 'Insights', icon: Sparkles }] : []),
    { id: 'analytics', label: 'Best Sellers', icon: BarChart3 },
    { id: 'sale', label: 'Record Sale', icon: ShoppingCart },
    { id: 'inventory', label: 'Inventory', icon: Package },
    ...(role === 'owner' ? [{ id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }] : []),
    ...(role === 'owner' ? [{ id: 'staff', label: 'Staff', icon: Users }] : []),
    ...(role === 'owner' ? [{ id: 'notebook', label: 'Notebook', icon: ClipboardList }] : []),
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

function InventoryView({ inventory, role, onSave, onDelete, onClearAll, onTogglePublic, onRestock }) {
  const [filter, setFilter] = useState('All');
  const [editingItem, setEditingItem] = useState(undefined);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [restockTarget, setRestockTarget] = useState(null); // { item }
  const [restockQty, setRestockQty] = useState(1);
  const [restocking, setRestocking] = useState(false);
  const categories = ['All', ...new Set(inventory.map(i => i.category))];
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
          {inventory.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              style={{ padding: '11px 14px', borderRadius: 8, border: `1px solid ${C.red}44`, background: 'transparent', color: C.red, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
            >Clear all</button>
          )}
        </div>
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
          const Icon = CATEGORY_ICON[item.category] || Package;
          const catColor = CATEGORY_COLOR[item.category] || C.blue;
          const low = item.stock <= item.reorder;
          return (
            <div key={item.id} style={{
              background: C.panel, border: `1px solid ${low ? C.red + '55' : C.line}`, borderRadius: 10,
              padding: 12, display: 'flex', alignItems: 'center', gap: 12,
              cursor: role === 'owner' ? 'pointer' : 'default',
            }}
              onClick={() => role === 'owner' && setEditingItem(item)}
            >
              <StockGauge stock={item.stock} reorder={item.reorder} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <Icon size={12} color={catColor} />
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.paperDim }}>{item.id}</span>
                  {low && <AlertTriangle size={12} color={C.red} />}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{item.name}</div>
                <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{item.brand} · {item.size} · {item.origin}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 5 }}>
                  <Tag color={catColor}>{item.category}</Tag>
                  <Tag color={C.paperDim}>{item.brand}</Tag>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700, color: C.paper }}>{naira(item.price)}</div>
                {role === 'owner' && (
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.paperDim, marginTop: 2 }}>cost {naira(item.cost)}</div>
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
                  {low ? 'RESTOCK FLOOR' : `reorder @ ${item.reorder}`}
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
          existingIds={inventory.map(i => i.id)}
          onSave={handleSave}
          onDelete={editingItem ? () => handleDelete(editingItem.id) : null}
          onCancel={() => setEditingItem(undefined)}
        />
      )}
    </div>
  );
}

function ItemForm({ item, existingIds, onSave, onDelete, onCancel }) {
  const isNew = !item;
  const [form, setForm] = useState(item || {
    id: '', name: '', brand: '', category: 'Engine Oil', size: '', origin: '',
    cost: 0, price: 0, stock: 0, warehouseStock: 0, reorder: 0,
  });
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = () => {
    if (!form.name.trim()) return setError('Item name is required');
    if (!form.id.trim()) return setError('SKU is required');
    if (isNew && existingIds.includes(form.id.trim())) return setError('That SKU already exists');
    setError('');
    onSave({
      ...form,
      id: form.id.trim(),
      cost: Number(form.cost) || 0,
      price: Number(form.price) || 0,
      stock: Number(form.stock) || 0,
      warehouseStock: Number(form.warehouseStock) || 0,
      reorder: Number(form.reorder) || 0,
    });
  };

  const inputStyle = {
    width: '100%', padding: '9px 10px', borderRadius: 7, border: `1px solid ${C.line}`,
    background: C.ink, color: C.paper, fontFamily: FONT_BODY, fontSize: 13, marginTop: 4,
  };
  const labelStyle = { fontSize: 11, color: C.paperDim, fontWeight: 600 };

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
            <span style={labelStyle}>Item name</span>
            <input style={inputStyle} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Mobil 1 5W-30 Synthetic Engine Oil" />
          </label>
          <label>
            <span style={labelStyle}>SKU {isNew ? '' : '(locked)'}</span>
            <input style={inputStyle} value={form.id} disabled={!isNew} onChange={e => set('id', e.target.value)} placeholder="e.g. TB-201" />
          </label>
          <label>
            <span style={labelStyle}>Brand</span>
            <input style={inputStyle} value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="e.g. Mobil" />
          </label>
          <label>
            <span style={labelStyle}>Category</span>
            <select style={inputStyle} value={form.category} onChange={e => set('category', e.target.value)}>
              {Object.keys(CATEGORY_COLOR).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label>
            <span style={labelStyle}>Size</span>
            <input style={inputStyle} value={form.size} onChange={e => set('size', e.target.value)} placeholder="e.g. 4L" />
          </label>
          <label>
            <span style={labelStyle}>Cost price (₦)</span>
            <input style={inputStyle} type="number" value={form.cost} onChange={e => set('cost', e.target.value)} />
          </label>
          <label>
            <span style={labelStyle}>Sale price (₦)</span>
            <input style={inputStyle} type="number" value={form.price} onChange={e => set('price', e.target.value)} />
          </label>
          <label>
            <span style={labelStyle}>Shop floor stock</span>
            <input style={inputStyle} type="number" value={form.stock} onChange={e => set('stock', e.target.value)} />
          </label>
          <label>
            <span style={labelStyle}>Warehouse stock</span>
            <input style={inputStyle} type="number" value={form.warehouseStock ?? 0} onChange={e => set('warehouseStock', e.target.value)} />
          </label>
          <label>
            <span style={labelStyle}>Reorder level</span>
            <input style={inputStyle} type="number" value={form.reorder} onChange={e => set('reorder', e.target.value)} />
          </label>
          <label style={{ gridColumn: '1 / -1' }}>
            <span style={labelStyle}>Origin / supplier</span>
            <input style={inputStyle} value={form.origin} onChange={e => set('origin', e.target.value)} placeholder="e.g. Apapa Port, Lagos" />
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

function SaleView({ inventory, onSubmit, sales }) {
  const [search, setSearch] = useState('');
  const [itemId, setItemId] = useState(null);
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState('Cash');
  const [confirmed, setConfirmed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const available = inventory.filter(i => i.stock > 0);
  const item = available.find(i => i.id === itemId);

  const filtered = search.trim().length > 0
    ? available.filter(i =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.brand.toLowerCase().includes(search.toLowerCase()) ||
        i.category.toLowerCase().includes(search.toLowerCase()) ||
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
    if (!item || qty < 1 || qty > item.stock) return;
    onSubmit(itemId, qty, payment);
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
            placeholder="e.g. Castrol, brake fluid, engine oil…"
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
                  <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{i.brand} · {i.size} · {i.stock} in stock</div>
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
          <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{item.brand} · {item.size} · {item.stock} in stock</div>
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
              max={item.stock}
              onChange={e => setQty(Math.max(1, Math.min(item.stock, Number(e.target.value) || 1)))}
              style={{
                width: 60, textAlign: 'center', padding: '6px 8px', borderRadius: 6,
                border: `1px solid ${C.line}`, background: C.ink, color: C.paper,
                fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700,
              }}
            />
            <button onClick={() => setQty(q => Math.min(item.stock, q + 1))} style={qtyBtnStyle}><Plus size={14} /></button>
          </div>

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
                  <div key={sale.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sale.itemName}</div>
                      <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>Qty: {sale.qty}</span>
                        <span style={{ color: payColor, fontWeight: 600 }}>{sale.payment}</span>
                        <span>{time}</span>
                      </div>
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: C.amber, flexShrink: 0 }}>
                      {naira(sale.qty * sale.unitPrice)}
                    </div>
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

  const filtered = filterSalesByRange(sales, range);
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

function ReportsView({ sales, inventory }) {
  const [range, setRange] = useState('today');
  const filtered = filterSalesByRange(sales, range);
  const revenue = filtered.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
  const cost = filtered.reduce((sum, s) => sum + s.qty * s.unitCost, 0);
  const profit = revenue - cost;
  const margin = revenue ? (profit / revenue) * 100 : 0;

  const byPayment = {};
  filtered.forEach(s => { byPayment[s.payment] = (byPayment[s.payment] || 0) + s.qty * s.unitPrice; });

  // "Today's inflow vs stock balance" — the daily headline the boss checks first
  const todaySales = filterSalesByRange(sales, 'today');
  const todayInflow = todaySales.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
  const totalUnitsInStock = inventory.reduce((sum, i) => sum + i.stock, 0);
  const stockValueAtCost = inventory.reduce((sum, i) => sum + i.cost * i.stock, 0);
  const lowStockCount = inventory.filter(i => i.stock <= i.reorder).length;

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        <StatCard label="Revenue" value={naira(revenue)} color={C.paper} />
        <StatCard label="Cost (imported)" value={naira(cost)} color={C.paperDim} />
        <StatCard label="Profit" value={naira(profit)} color={C.teal} />
        <StatCard label="Margin" value={`${margin.toFixed(1)}%`} color={C.amber} />
      </div>

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

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px 16px', color: C.paperDim, background: C.panel, borderRadius: 10, border: `1px solid ${C.line}` }}>
          <ShoppingCart size={24} style={{ marginBottom: 10, opacity: 0.4 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: C.paper, marginBottom: 4 }}>No sales recorded yet</div>
          <div style={{ fontSize: 12 }}>Head to <b style={{ color: C.amber }}>Record Sale</b> to log your first transaction — it'll show up here instantly.</div>
        </div>
      )}

      {filtered.length > 0 && (
        <>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 10 }}>
            Sales log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...filtered].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).map(sale => {
              const time = new Date(sale.timestamp).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true });
              const payColor = sale.payment === 'Cash' ? C.teal : sale.payment === 'Transfer' ? C.blue : C.amber;
              return (
                <div key={sale.id} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sale.itemName}</div>
                    <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>Qty: {sale.qty}</span>
                      <span style={{ color: payColor, fontWeight: 600 }}>{sale.payment}</span>
                      <span>{time}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: C.amber, flexShrink: 0 }}>
                    {naira(sale.qty * sale.unitPrice)}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function InsightsView({ sales, inventory }) {
  const now = new Date();
  const sevenAgo = new Date(now); sevenAgo.setDate(sevenAgo.getDate() - 7);
  const fourteenAgo = new Date(now); fourteenAgo.setDate(fourteenAgo.getDate() - 14);

  const thisWeek = sales.filter(s => new Date(s.timestamp) >= sevenAgo);
  const lastWeek = sales.filter(s => { const d = new Date(s.timestamp); return d >= fourteenAgo && d < sevenAgo; });
  const last14 = sales.filter(s => new Date(s.timestamp) >= fourteenAgo);

  const revThis = thisWeek.reduce((s, x) => s + x.qty * x.unitPrice, 0);
  const revLast = lastWeek.reduce((s, x) => s + x.qty * x.unitPrice, 0);
  const pctChange = revLast > 0 ? ((revThis - revLast) / revLast) * 100 : null;

  // capital tied up in stock
  const costValue = inventory.reduce((s, i) => s + i.cost * i.stock, 0);
  const retailValue = inventory.reduce((s, i) => s + i.price * i.stock, 0);
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

  // margin champions
  const champions = [...inventory]
    .map(i => ({ ...i, margin: ((i.price - i.cost) / i.price) * 100 }))
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, color: C.amber }}>
        <Sparkles size={16} />
        <span style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
          What your notebook never told you
        </span>
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

function WhatsAppView({ sales, inventory, lowStockItems, business, apiUrl }) {
  const today = filterSalesByRange(sales, 'today');
  const revenue = today.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
  const agg = {};
  today.forEach(s => { agg[s.itemId] = (agg[s.itemId] || 0) + s.qty; });
  const topId = Object.keys(agg).sort((a, b) => agg[b] - agg[a])[0];
  const topItem = inventory.find(i => i.id === topId);
  const dateStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
  const publicCount = inventory.filter(i => i.isPublic).length;

  // Derive catalogue URL from the backend URL — same origin for now
  const catalogueUrl = business?.slug
    ? `${apiUrl?.replace('/api', '') || ''}/catalogue/${business.slug}`
    : null;

  return (
    <div>

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
            <div style={{ fontSize: 11, color: C.paperDim }}>Share this link on WhatsApp, your signboard, or anywhere — customers see your products without needing to log in. Powered by TodayBread.</div>
          </>
        )}
      </div>

      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 12 }}>
        Daily summary preview
      </div>

      <div style={{ background: '#0B141A', borderRadius: 12, padding: 16, border: `1px solid ${C.line}` }}>
        <div style={{
          background: '#005C4B', color: '#E9EDEF', borderRadius: '10px 10px 2px 10px', padding: '12px 14px',
          fontFamily: FONT_BODY, fontSize: 13, lineHeight: 1.6, maxWidth: '92%', marginLeft: 'auto',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 {business?.name || 'Apex Autos'} — {dateStr}</div>
          <div>Revenue today: <b>{naira(revenue)}</b></div>
          {topItem && <div>Best seller: <b>{topItem.name}</b> ({agg[topId]} sold)</div>}
          <div>Low stock alerts: <b>{lowStockItems.length} item{lowStockItems.length === 1 ? '' : 's'}</b></div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: '#8AB4C8' }}>
            <Link2 size={12} /> <span style={{ textDecoration: 'underline' }}>View full dashboard →</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: 10, color: '#8AB4C8', marginTop: 6 }}>9:00 PM ✓✓</div>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: 12, color: C.paperDim, lineHeight: 1.6, background: C.panel, padding: 12, borderRadius: 8, border: `1px solid ${C.line}` }}>
        <b style={{ color: C.paper }}>How this gets sent for real:</b> this preview is generated from today's live data, but actually delivering it to WhatsApp needs a small backend job (using the WhatsApp Business Cloud API) running on a schedule — that's the next build step once you're ready to go from prototype to production.
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
// NOTEBOOK VIEW — paste Google Lens output, parse to sales or stock arrivals
// ============================================================================
function normalize(str) {
  return String(str || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function fuzzyMatch(description, inventory) {
  const target = normalize(description).split(' ').filter(w => w.length > 1);
  if (target.length === 0) return null;
  let best = null, bestScore = 0;
  for (const item of inventory) {
    const words = normalize(item.name + ' ' + item.brand + ' ' + item.category).split(' ').filter(Boolean);
    const overlap = target.filter(w => words.some(iw => iw.includes(w) || w.includes(iw))).length;
    const score = overlap / Math.max(target.length, 1);
    if (score > bestScore && score >= 0.25) { bestScore = score; best = { item, confidence: score }; }
  }
  return best;
}

function parseLine(line) {
  const qtyPatterns = [/[x×]\s*(\d+)/i, /(\d+)\s*pcs/i, /(\d+)\s*units?/i, /qty\s*[:\-]?\s*(\d+)/i, /(\d+)\s*cartons?/i, /(\d+)\s*bottles?/i];
  let qty = 1;
  let desc = line;
  for (const pattern of qtyPatterns) {
    const m = line.match(pattern);
    if (m) { qty = parseInt(m[1]); desc = line.replace(m[0], '').trim(); break; }
  }
  desc = desc.replace(/[-–]\s*\d{4,}/g, '').trim();
  desc = desc.replace(/^\d+\s+/, '').replace(/\s+\d+$/, '').trim();
  return { desc: desc || line, qty };
}

function NotebookView({ inventory, onRecordSales, onAddStock }) {
  const [mode, setMode] = useState('sales');
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState(null);
  const [payment, setPayment] = useState('Cash');
  const [committing, setCommitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleParse = () => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const results = lines.map(line => {
      const { desc, qty } = parseLine(line);
      const match = fuzzyMatch(desc, inventory);
      return { rawLine: line, desc, qty, match, confirmed: !!match, overrideQty: qty };
    });
    setParsed(results);
    setDone(false);
    setError('');
  };

  const updateQty = (idx, val) => setParsed(p => p.map((r, i) => i === idx ? { ...r, overrideQty: Math.max(1, Number(val) || 1) } : r));
  const updateMatch = (idx, itemId) => {
    const item = inventory.find(i => i.id === itemId);
    setParsed(p => p.map((r, i) => i === idx ? { ...r, match: item ? { item, confidence: 1 } : null, confirmed: !!item } : r));
  };
  const toggleConfirm = (idx) => setParsed(p => p.map((r, i) => i === idx ? { ...r, confirmed: !r.confirmed } : r));

  const handleCommit = async () => {
    const toCommit = parsed.filter(r => r.confirmed && r.match);
    if (toCommit.length === 0) return setError('No confirmed matches to record');
    setCommitting(true); setError('');
    try {
      for (const row of toCommit) {
        if (mode === 'sales') {
          await onRecordSales(row.match.item.id, row.overrideQty, payment);
        } else {
          await onAddStock({ ...row.match.item, stock: row.match.item.stock + row.overrideQty });
        }
      }
      setDone(true); setRaw(''); setParsed(null);
    } catch (e) {
      setError(e.message || 'Could not record entries');
    } finally {
      setCommitting(false);
    }
  };

  const confirmedCount = parsed?.filter(r => r.confirmed && r.match).length || 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <ClipboardList size={16} color={C.amber} />
        <div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.03em' }}>Paste from notebook</div>
          <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>Use Google Lens to scan your notebook page → copy text → paste below</div>
        </div>
      </div>

      <div style={{ display: 'flex', background: C.panel, borderRadius: 8, border: `1px solid ${C.line}`, padding: 3, marginBottom: 14, width: 'fit-content' }}>
        {[['sales', 'Recording Sales'], ['stock', 'Stock Arrival']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{ padding: '7px 16px', borderRadius: 6, border: 'none', cursor: 'pointer', background: mode === m ? C.amber : 'transparent', color: mode === m ? C.ink : C.paperDim, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 12 }}>{label}</button>
        ))}
      </div>

      {!parsed && (
        <>
          <textarea
            value={raw}
            onChange={e => setRaw(e.target.value)}
            placeholder={mode === 'sales'
              ? 'Paste your Google Lens text here. Examples:\n\nCastrol brake fluid x5\nMobil 20-50 engine oil 2pcs\nTotal gear oil x10\nair freshner 12'
              : 'Paste your Google Lens text here. Examples:\n\nCastrol dot 3 x100\nMobil 5W-30 20 bottles\nShell Helix 10W-40 x50\nPrestone coolant 30'}
            style={{ width: '100%', minHeight: 200, padding: '12px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, fontFamily: FONT_MONO, fontSize: 13, lineHeight: 1.6, resize: 'vertical' }}
          />
          <button onClick={handleParse} disabled={!raw.trim()} style={{ width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 8, border: 'none', background: raw.trim() ? C.amber : C.line, color: raw.trim() ? C.ink : C.paperDim, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: raw.trim() ? 'pointer' : 'default' }}>
            Parse entries
          </button>
        </>
      )}

      {parsed && !done && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.paperDim }}>{parsed.length} line{parsed.length !== 1 ? 's' : ''} parsed — review before confirming</div>
            <button onClick={() => setParsed(null)} style={{ fontSize: 11, color: C.paperDim, background: 'none', border: 'none', cursor: 'pointer' }}>← Edit text</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {parsed.map((row, idx) => (
              <div key={idx} style={{ background: C.panel, border: `1px solid ${row.match && row.confirmed ? C.teal + '55' : !row.match ? C.red + '55' : C.line}`, borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: C.paperDim, fontFamily: FONT_MONO, marginBottom: 6 }}>{row.rawLine}</div>
                {row.match ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{row.match.item.name}</div>
                      <div style={{ fontSize: 11, color: C.paperDim, marginTop: 2 }}>{row.match.item.brand} · {Math.round(row.match.confidence * 100)}% match</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="number" value={row.overrideQty} min={1} onChange={e => updateQty(idx, e.target.value)} style={{ width: 52, textAlign: 'center', padding: '5px 6px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontFamily: FONT_MONO, fontSize: 14, fontWeight: 700 }} />
                      <button onClick={() => toggleConfirm(idx)} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', background: row.confirmed ? C.teal : C.line, color: row.confirmed ? '#fff' : C.paperDim, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>{row.confirmed ? '✓' : 'Skip'}</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <AlertTriangle size={13} color={C.red} />
                    <span style={{ fontSize: 12, color: C.red }}>No match — pick manually:</span>
                    <select onChange={e => updateMatch(idx, e.target.value)} style={{ flex: 1, minWidth: 160, padding: '5px 8px', borderRadius: 6, border: `1px solid ${C.line}`, background: C.ink, color: C.paper, fontSize: 12 }}>
                      <option value="">— pick an item —</option>
                      {inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {mode === 'sales' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              {['Cash', 'Transfer', 'POS'].map(p => (
                <button key={p} onClick={() => setPayment(p)} style={{ flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1px solid ${payment === p ? C.teal : C.line}`, background: payment === p ? `${C.teal}22` : 'transparent', color: payment === p ? C.teal : C.paperDim }}>{p}</button>
              ))}
            </div>
          )}

          {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 10 }}>{error}</div>}

          <button onClick={handleCommit} disabled={committing || confirmedCount === 0} style={{ width: '100%', padding: '13px 0', borderRadius: 8, border: 'none', background: confirmedCount > 0 ? C.amber : C.line, color: confirmedCount > 0 ? C.ink : C.paperDim, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 14, cursor: confirmedCount > 0 ? 'pointer' : 'default' }}>
            {committing ? 'Recording…' : `Record ${confirmedCount} confirmed entr${confirmedCount === 1 ? 'y' : 'ies'}`}
          </button>
        </>
      )}

      {done && (
        <div style={{ textAlign: 'center', padding: '40px 16px' }}>
          <Check size={32} color={C.teal} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: C.paper, marginBottom: 6 }}>All done</div>
          <div style={{ fontSize: 13, color: C.paperDim, marginBottom: 20 }}>Entries recorded successfully from your notebook.</div>
          <button onClick={() => setDone(false)} style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Paste another page</button>
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
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{b.name}</div>
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
