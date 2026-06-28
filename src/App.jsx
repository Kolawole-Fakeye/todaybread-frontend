import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Fuel, Droplet, Package, TrendingUp, TrendingDown, AlertTriangle,
  RefreshCw, MessageCircle, Lock, Clock, ChevronRight, Plus, Minus,
  ShoppingCart, BarChart3, Wallet, Boxes, Wrench, Link2, Check, Sparkles, ArrowUp, ArrowDown, Timer, ArchiveX, Award,
  Wifi, WifiOff, LogOut, Server, CloudUpload, AlertCircle, Users
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
  const [tab, setTab] = useState('reports');
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
        cost: Number(i.cost_price || 0), price: Number(i.sale_price), stock: i.stock, reorder: i.reorder_level, origin: i.origin,
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
  }, [dataLoaded, role, tab]);

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
            costPrice: formItem.cost, salePrice: formItem.price, stock: formItem.stock, reorderLevel: formItem.reorder, origin: formItem.origin,
          },
        });
        setInventoryLocal(inv => [...inv, { ...formItem, dbId: res.item.id }]);
      } else {
        await apiRequest(apiUrl, `/inventory/${formItem.dbId}`, {
          method: 'PUT', token, body: {
            name: formItem.name, brand: formItem.brand, size: formItem.size, category: formItem.category,
            costPrice: formItem.cost, salePrice: formItem.price, stock: formItem.stock, reorderLevel: formItem.reorder, origin: formItem.origin,
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
  if (!dataLoaded) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ background: C.ink, minHeight: '100vh', color: C.paper, fontFamily: FONT_BODY }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        ::-webkit-scrollbar { height: 0; width: 0; }
      `}</style>

      <TickerBar fmtTime={fmtTime} rates={rates} rateLoading={rateLoading} rateError={rateError} onRefresh={fetchRates} />

      <SyncBar pendingCount={pending.length} syncStatus={syncStatus} loadError={loadError} onRetry={() => { loadData(); syncPending(); }} />

      <Header business={auth.business} onLogout={handleLogout} />

      <TabBar role={role} tab={tab} setTab={setTab} lowStockCount={lowStockItems.length} />

      <div style={{ padding: '16px', maxWidth: 720, margin: '0 auto' }}>
        {tab === 'inventory' && (
          <InventoryView inventory={inventory} role={role} onSave={saveItem} onDelete={deleteItem} />
        )}
        {tab === 'sale' && (
          <SaleView inventory={inventory} onSubmit={recordSale} />
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
          <WhatsAppView sales={sales} inventory={inventory} lowStockItems={lowStockItems} />
        )}
        {tab === 'staff' && role === 'owner' && (
          <StaffView apiUrl={apiUrl} token={token} />
        )}
      </div>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div style={{ background: C.ink, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.paper, fontFamily: FONT_BODY }}>
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
    <div style={{ background: C.ink, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT_BODY }}>
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

  const handleLogin = async () => {
    if (!phone || !pin) return setError('Enter your phone and PIN');
    setLoading(true);
    setError('');
    try {
      const data = await apiRequest(apiUrl, '/auth/login', { method: 'POST', body: { phone, pin } });
      const me = await apiRequest(apiUrl, '/me', { token: data.token }).catch(() => null);
      await onLogin({ token: data.token, user: data.user, business: me?.business || { name: 'TodayBread Business' } });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: C.ink, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT_BODY }}>
      <div style={{ maxWidth: 360, width: '100%' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.paper, textTransform: 'uppercase', marginBottom: 6 }}>
          Today<span style={{ color: C.amber }}>Bread</span>
        </div>
        <div style={{ color: C.paperDim, fontSize: 13, marginBottom: 20 }}>Sign in with your phone and PIN.</div>

        <label style={{ fontSize: 11, color: C.paperDim, fontWeight: 600 }}>Phone number</label>
        <input
          value={phone} onChange={e => setPhone(e.target.value)} placeholder="2348012345678"
          style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, fontFamily: FONT_MONO, fontSize: 13, marginTop: 6, marginBottom: 12 }}
        />
        <label style={{ fontSize: 11, color: C.paperDim, fontWeight: 600 }}>PIN</label>
        <input
          value={pin} onChange={e => setPin(e.target.value)} type="password" placeholder="••••"
          style={{ width: '100%', padding: '11px 12px', borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, color: C.paper, fontFamily: FONT_MONO, fontSize: 13, marginTop: 6, marginBottom: 12 }}
        />
        {error && <div style={{ color: C.red, fontSize: 12, marginBottom: 12 }}>{error}</div>}
        <button
          onClick={handleLogin} disabled={loading}
          style={{ width: '100%', padding: '12px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 14, cursor: 'pointer', marginBottom: 10 }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <button
          onClick={onShowSignup}
          style={{ width: '100%', padding: '10px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.amber, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10 }}
        >
          New shop? Create your business
        </button>
        <button
          onClick={onChangeApiUrl}
          style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: 'none', background: 'transparent', color: C.paperDim, fontSize: 12, cursor: 'pointer' }}
        >
          Change backend URL
        </button>
      </div>
    </div>
  );
}

function SignupScreen({ apiUrl, onSignup, onBackToLogin }) {
  const [form, setForm] = useState({ businessName: '', ownerName: '', phone: '', pin: '', whatsappNumber: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSignup = async () => {
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
          phone: form.phone.trim(),
          pin: form.pin,
          whatsappNumber: form.whatsappNumber.trim() || form.phone.trim(),
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
    <div style={{ background: C.ink, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: FONT_BODY }}>
      <div style={{ maxWidth: 360, width: '100%' }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.paper, textTransform: 'uppercase', marginBottom: 6 }}>
          Today<span style={{ color: C.amber }}>Bread</span>
        </div>
        <div style={{ color: C.paperDim, fontSize: 13, marginBottom: 20 }}>Set up your shop on TodayBread.</div>

        <label style={labelStyle}>Business name</label>
        <input style={inputStyle} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="e.g. Apex Autos Limited" />

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
          ? `Couldn't reach the server — showing last known data`
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
      background: '#0E0F12', borderBottom: `1px solid ${C.line}`,
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

function InventoryView({ inventory, role, onSave, onDelete }) {
  const [filter, setFilter] = useState('All');
  const [editingItem, setEditingItem] = useState(undefined); // undefined=closed, null=adding new, object=editing
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

  return (
    <div>
      {role === 'owner' && (
        <button
          onClick={() => setEditingItem(null)}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 8, border: `1px dashed ${C.amber}66`, background: `${C.amber}14`,
            color: C.amber, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 14,
          }}
        >
          <Plus size={15} /> Add inventory item
        </button>
      )}

      {items.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                flexShrink: 0, padding: '5px 11px', borderRadius: 14, fontSize: 11, fontFamily: FONT_BODY, fontWeight: 600,
                border: `1px solid ${filter === cat ? C.amber : C.line}`,
                background: filter === cat ? `${C.amber}22` : 'transparent',
                color: filter === cat ? C.amber : C.paperDim, cursor: 'pointer',
              }}
            >{cat}</button>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 16px', color: C.paperDim }}>
          <Package size={28} style={{ marginBottom: 10, opacity: 0.5 }} />
          <div style={{ fontSize: 13 }}>No inventory yet — add your first item to get started.</div>
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
                <div style={{ fontSize: 10, color: low ? C.red : C.paperDim, marginTop: 4, fontWeight: 600 }}>
                  {low ? 'REORDER NOW' : `reorder @ ${item.reorder}`}
                </div>
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
    cost: 0, price: 0, stock: 0, reorder: 0,
  });
  const [error, setError] = useState('');

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
            <span style={labelStyle}>Current stock</span>
            <input style={inputStyle} type="number" value={form.stock} onChange={e => set('stock', e.target.value)} />
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

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {onDelete && (
            <button
              onClick={onDelete}
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

function SaleView({ inventory, onSubmit }) {
  const [itemId, setItemId] = useState(inventory[0]?.id);
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState('Cash');
  const [confirmed, setConfirmed] = useState(false);
  const item = inventory.find(i => i.id === itemId);
  const available = inventory.filter(i => i.stock > 0);

  const submit = () => {
    if (!item || qty < 1 || qty > item.stock) return;
    onSubmit(itemId, qty, payment);
    setConfirmed(true);
    setQty(1);
    setTimeout(() => setConfirmed(false), 1800);
  };

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: 12, color: C.paperDim }}>
        Record a sale
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {available.map(i => {
          const active = i.id === itemId;
          return (
            <button
              key={i.id}
              onClick={() => setItemId(i.id)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${active ? C.amber : C.line}`,
                background: active ? `${C.amber}1A` : C.panel,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.paper }}>{i.name}</div>
                <div style={{ fontSize: 11, color: C.paperDim }}>{i.size} · {i.stock} in stock</div>
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 13, fontWeight: 700, color: C.amber }}>{naira(i.price)}</div>
            </button>
          );
        })}
      </div>

      {item && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: C.paperDim, fontWeight: 600 }}>Quantity</span>
            <button onClick={() => setQty(q => Math.max(1, q - 1))} style={qtyBtnStyle}><Minus size={14} /></button>
            <span style={{ fontFamily: FONT_MONO, fontSize: 18, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{qty}</span>
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
        <div style={{ fontSize: 10, color: C.paperDim, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
          Today at a glance
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 22, fontWeight: 700, color: C.teal }}>{naira(todayInflow)}</div>
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

      <div style={{ fontSize: 11, color: C.paperDim, marginTop: 16 }}>{filtered.length} transactions in this period</div>
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

function WhatsAppView({ sales, inventory, lowStockItems }) {
  const today = filterSalesByRange(sales, 'today');
  const revenue = today.reduce((sum, s) => sum + s.qty * s.unitPrice, 0);
  const agg = {};
  today.forEach(s => { agg[s.itemId] = (agg[s.itemId] || 0) + s.qty; });
  const topId = Object.keys(agg).sort((a, b) => agg[b] - agg[a])[0];
  const topItem = inventory.find(i => i.id === topId);
  const dateStr = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.03em', color: C.paperDim, marginBottom: 12 }}>
        Daily summary preview
      </div>

      <div style={{ background: '#0B141A', borderRadius: 12, padding: 16, border: `1px solid ${C.line}` }}>
        <div style={{
          background: '#005C4B', color: '#E9EDEF', borderRadius: '10px 10px 2px 10px', padding: '12px 14px',
          fontFamily: FONT_BODY, fontSize: 13, lineHeight: 1.6, maxWidth: '92%', marginLeft: 'auto',
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>📋 Apex Autos — {dateStr}</div>
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
    setSaving(true);
    setFormError('');
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

  const inputStyle = {
    width: '100%', padding: '9px 10px', borderRadius: 7, border: `1px solid ${C.line}`,
    background: C.ink, color: C.paper, fontFamily: FONT_BODY, fontSize: 13, marginTop: 4,
  };
  const labelStyle = { fontSize: 11, color: C.paperDim, fontWeight: 600 };

  return (
    <div>
      <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.02em', color: C.paperDim, marginBottom: 12 }}>
        Staff accounts
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            width: '100%', padding: '11px 0', borderRadius: 8, border: `1px dashed ${C.amber}66`, background: `${C.amber}14`,
            color: C.amber, fontFamily: FONT_BODY, fontWeight: 700, fontSize: 13, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 16,
          }}
        >
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
            <button
              onClick={() => { setShowForm(false); setFormError(''); }}
              style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: `1px solid ${C.line}`, background: 'transparent', color: C.paperDim, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >Cancel</button>
            <button
              onClick={handleAdd} disabled={saving}
              style={{ flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', background: C.amber, color: C.ink, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            >{saving ? 'Adding…' : 'Add staff'}</button>
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
            <Tag color={C.blue}>Staff</Tag>
          </div>
        ))}
      </div>
    </div>
  );
}

