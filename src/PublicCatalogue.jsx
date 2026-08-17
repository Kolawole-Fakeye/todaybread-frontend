import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, MessageCircle, Package, Plus, Minus, ShoppingCart, X,
  MapPin, ChevronDown, ChevronUp, Fuel, Droplet, Wrench, Boxes,
} from 'lucide-react';

/* ---------------------------------------------------------------
   PublicCatalogue — the customer-facing storefront TodayBread
   businesses share as `/shop/:slug`.

   Standalone on purpose: it does NOT import anything from App.jsx,
   so dropping it in can't touch a single line of the existing app.
   Design tokens below are copied from App.jsx's `C` / font stack so
   the storefront looks like the same product, not a bolt-on page.

   Data comes straight from the existing, already-live backend
   endpoint: GET /catalogue/:slug (no auth) — see main.js line ~711.
   Nothing on the backend needs to change either.
----------------------------------------------------------------*/

const API_URL = 'https://todaybread.onrender.com';

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

function naira(n) {
  return `₦${Number(n || 0).toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function waLink(text, number) {
  const base = number ? `https://wa.me/${number}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

// Same TodayBread word-mark treatment used in the main app's header.
function Wordmark({ size = 20 }) {
  return (
    <span style={{ fontFamily: FONT_DISPLAY, fontWeight: 600, fontSize: size, letterSpacing: '0.01em' }}>
      <span style={{ color: C.paper }}>Today</span>
      <span style={{ color: C.amber }}>Bread</span>
    </span>
  );
}

function useCataloguePath() {
  // Reads the slug out of /shop/:slug (or /catalogue/:slug, in case a
  // link was shared with the old path). Works with no router installed.
  const [slug] = useState(() => {
    const path = window.location.pathname;
    const m = path.match(/\/(?:shop|catalogue)\/([^/?#]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  });
  return slug;
}

export default function PublicCatalogue({ slug: slugProp }) {
  const routeSlug = useCataloguePath();
  const slug = slugProp || routeSlug;

  const [business, setBusiness] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [openCategory, setOpenCategory] = useState(null);
  const [cart, setCart] = useState({}); // { itemKey: qty }
  const [cartOpen, setCartOpen] = useState(false);

  const load = useCallback(async () => {
    if (!slug) { setError('missing-slug'); setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/catalogue/${encodeURIComponent(slug)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not load this shop');
      setBusiness(data.business);
      setItems(data.items || []);
    } catch (e) {
      setError(e.message || 'Could not load this shop');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { load(); }, [load]);

  const itemKey = (item) => `${item.name}__${item.brand}__${item.size}`;

  const categories = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      const cat = item.category || 'Other';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat).push(item);
    });
    return Array.from(map.entries()).map(([category, list]) => ({ category, items: list }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map(({ category, items: list }) => ({
        category,
        items: list.filter(i =>
          i.name.toLowerCase().includes(q) ||
          (i.brand || '').toLowerCase().includes(q) ||
          category.toLowerCase().includes(q)
        ),
      }))
      .filter(c => c.items.length > 0);
  }, [categories, query]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartItems = useMemo(() => {
    return items
      .map(item => ({ item, qty: cart[itemKey(item)] || 0 }))
      .filter(c => c.qty > 0);
  }, [items, cart]);
  const cartTotal = cartItems.reduce((sum, c) => sum + c.qty * Number(c.item.sale_price || 0), 0);

  const addToCart = (item, delta) => {
    setCart(prev => {
      const key = itemKey(item);
      const next = Math.max(0, (prev[key] || 0) + delta);
      const copy = { ...prev };
      if (next === 0) delete copy[key]; else copy[key] = next;
      return copy;
    });
  };

  const orderMessage = () => {
    const lines = cartItems.map(({ item, qty }) =>
      `• ${item.name}${item.brand ? ` (${item.brand})` : ''} — ${qty} x ${naira(item.sale_price)}`
    );
    return (
      `Hi ${business?.name || ''}! I'd like to order:\n\n` +
      lines.join('\n') +
      `\n\nEstimated total: ${naira(cartTotal)}` +
      `\n\n(Sent from your TodayBread catalogue)`
    );
  };

  // ---------------- Loading / error states ----------------

  if (loading) {
    return (
      <ShellCenter>
        <div style={{ color: C.paperDim, fontFamily: FONT_BODY, fontSize: 14 }}>Loading shop…</div>
      </ShellCenter>
    );
  }

  if (error || !business) {
    return (
      <ShellCenter>
        <Package size={32} color={C.paperDim} style={{ marginBottom: 12 }} />
        <div style={{ color: C.paper, fontFamily: FONT_DISPLAY, fontSize: 20, marginBottom: 6 }}>
          Shop not found
        </div>
        <div style={{ color: C.paperDim, fontFamily: FONT_BODY, fontSize: 13, textAlign: 'center', maxWidth: 280 }}>
          {error === 'missing-slug'
            ? "This link is missing the shop's address."
            : "This catalogue link may be out of date, or the shop hasn't gone public yet."}
        </div>
      </ShellCenter>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.ink, fontFamily: FONT_BODY }}>
      {/* Header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10, background: C.panel,
        borderBottom: `1px solid ${C.line}`, padding: '16px 16px 14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Wordmark size={16} />
          <div style={{
            fontFamily: FONT_MONO, fontSize: 10, color: C.paperDim, textTransform: 'uppercase',
            letterSpacing: '0.08em', border: `1px solid ${C.line}`, borderRadius: 20, padding: '3px 8px',
          }}>
            Public catalogue
          </div>
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 24, color: C.paper, fontWeight: 600, marginBottom: 4 }}>
          {business.name}
        </div>
        {business.address && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.paperDim, fontSize: 12.5 }}>
            <MapPin size={13} />{business.address}
          </div>
        )}
        {business.whatsapp_number && (
          <a
            href={waLink(`Hi ${business.name}! I have a question about your products.`, business.whatsapp_number)}
            target="_blank" rel="noopener noreferrer"
            style={{
              marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
              background: C.teal, color: C.ink, fontWeight: 600, fontSize: 12.5,
              padding: '7px 12px', borderRadius: 8, textDecoration: 'none',
            }}
          >
            <MessageCircle size={14} /> Chat on WhatsApp
          </a>
        )}
      </div>

      {/* Search */}
      <div style={{ padding: '14px 16px 0' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, background: C.panel2,
          border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 12px',
        }}>
          <Search size={15} color={C.paperDim} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search products…"
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: C.paper, fontFamily: FONT_BODY, fontSize: 13.5,
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <X size={14} color={C.paperDim} />
            </button>
          )}
        </div>
      </div>

      {/* Catalogue */}
      <div style={{ padding: '16px 16px 100px' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: C.paperDim, fontSize: 13, padding: '40px 0' }}>
            {items.length === 0 ? 'This shop has no public products yet.' : 'No products match your search.'}
          </div>
        )}

        {filtered.map(({ category, items: list }) => {
          const isOpen = openCategory === null || openCategory === category;
          const color = colorForCategory(category);
          const Icon = iconForCategory(category);
          return (
            <div key={category} style={{ marginBottom: 14 }}>
              <button
                onClick={() => setOpenCategory(openCategory === category ? '__collapsed__' : category)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, background: `${color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={14} color={color} />
                  </div>
                  <span style={{ fontFamily: FONT_DISPLAY, fontSize: 15, color: C.paper, fontWeight: 500 }}>
                    {category}
                  </span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.paperDim }}>
                    {list.length}
                  </span>
                </div>
                {openCategory === category
                  ? <ChevronUp size={16} color={C.paperDim} />
                  : <ChevronDown size={16} color={C.paperDim} />}
              </button>

              {isOpen && openCategory !== '__collapsed__' && (
                <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                  {list.map((item, idx) => {
                    const qty = cart[itemKey(item)] || 0;
                    return (
                      <div key={idx} style={{
                        background: C.panel, border: `1px solid ${C.line}`, borderRadius: 10,
                        padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 8, background: `${color}18`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Icon size={16} color={color} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: C.paper, fontSize: 13.5, fontWeight: 500, marginBottom: 2 }}>
                            {item.name}
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', color: C.paperDim, fontSize: 11.5 }}>
                            {item.brand && <span>{item.brand}</span>}
                            {item.brand && item.size && <span>·</span>}
                            {item.size && <span>{item.size}</span>}
                          </div>
                          <div style={{ fontFamily: FONT_MONO, color: C.amber, fontSize: 14, fontWeight: 600, marginTop: 4 }}>
                            {naira(item.sale_price)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {qty > 0 && (
                            <>
                              <button onClick={() => addToCart(item, -1)} style={qtyBtnStyle}>
                                <Minus size={13} color={C.paper} />
                              </button>
                              <span style={{ fontFamily: FONT_MONO, color: C.paper, fontSize: 13, minWidth: 16, textAlign: 'center' }}>
                                {qty}
                              </span>
                            </>
                          )}
                          <button onClick={() => addToCart(item, 1)} style={{ ...qtyBtnStyle, background: C.amber, borderColor: C.amber }}>
                            <Plus size={13} color={C.ink} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sticky order bar */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, background: C.panel,
          borderTop: `1px solid ${C.line}`, padding: '12px 16px', display: 'flex',
          alignItems: 'center', gap: 10, boxShadow: '0 -4px 16px rgba(0,0,0,0.3)',
        }}>
          <button
            onClick={() => setCartOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, background: 'none',
              border: `1px solid ${C.line}`, borderRadius: 8, padding: '9px 12px',
              color: C.paper, fontSize: 12.5, cursor: 'pointer',
            }}
          >
            <ShoppingCart size={15} />
            {cartCount} item{cartCount !== 1 ? 's' : ''} · {naira(cartTotal)}
          </button>
          <a
            href={business.whatsapp_number ? waLink(orderMessage(), business.whatsapp_number) : waLink(orderMessage())}
            target="_blank" rel="noopener noreferrer"
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: C.teal, color: C.ink, fontWeight: 600, fontSize: 13.5,
              padding: '10px 12px', borderRadius: 8, textDecoration: 'none',
            }}
          >
            <MessageCircle size={15} /> Order via WhatsApp
          </a>
        </div>
      )}

      {/* Cart detail sheet */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 20,
            display: 'flex', alignItems: 'flex-end',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.panel, borderTop: `1px solid ${C.line}`, borderRadius: '14px 14px 0 0',
              padding: 16, width: '100%', maxHeight: '70vh', overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 16, color: C.paper }}>Your order</div>
              <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} color={C.paperDim} />
              </button>
            </div>
            <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
              {cartItems.map(({ item, qty }, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: C.paper }}>
                  <span>{qty} × {item.name}</span>
                  <span style={{ fontFamily: FONT_MONO, color: C.amber }}>{naira(qty * item.sale_price)}</span>
                </div>
              ))}
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.line}`,
              paddingTop: 10, fontSize: 14, fontWeight: 600, color: C.paper,
            }}>
              <span>Total</span>
              <span style={{ fontFamily: FONT_MONO, color: C.amber }}>{naira(cartTotal)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShellCenter({ children }) {
  return (
    <div style={{
      minHeight: '100vh', background: C.ink, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: FONT_BODY,
    }}>
      {children}
    </div>
  );
}

const qtyBtnStyle = {
  width: 26, height: 26, borderRadius: 6, border: `1px solid ${C.line}`, background: C.panel2,
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0,
};
