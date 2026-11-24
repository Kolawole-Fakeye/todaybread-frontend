import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { api, naira, lagosTime } from './api.js';

export default function MySales() {
  const [sales, setSales] = useState(null);
  const [error, setError] = useState('');

  async function load() {
    setError('');
    try {
      setSales((await api('/api/ops/my-sales')).sales);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="eyebrow">Your account</div>
      <h1 className="h1">Your last <b>3 sales</b></h1>
      <p className="sub">Only sales taken on your own login appear here.</p>
      {error && <div className="err">{error}</div>}
      {!sales && !error && <div className="center">Loading…</div>}
      {sales && sales.length === 0 && <div className="card center">No sales yet. Take your first order.</div>}
      {sales && sales.map((s) => (
        <div className="card" key={s.id}>
          <div className="row">
            <b>Order #{s.order_no}</b>
            <span className="badge go">{s.status.replace(/_/g, ' ')}</span>
          </div>
          <div className="mu">{lagosTime(s.placed_at)} · {s.branch} · {s.order_type.replace('_', ' ')}</div>
          <div style={{ margin: '8px 0' }}>{(s.items || []).map((i) => i.quantity + '× ' + i.name).join(', ')}</div>
          <div className="row total"><span>Total</span><span>{naira(s.total_kobo)}</span></div>
        </div>
      ))}
      <button className="btn ghost" onClick={load}><RefreshCw size={18} /> Refresh</button>
    </div>
  );
}
