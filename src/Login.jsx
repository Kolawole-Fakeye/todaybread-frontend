import { useState } from 'react';
import { Delete } from 'lucide-react';
import { login, changePin } from './api.js';

export function Login({ theme }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);

  async function submit(p) {
    if (busy) return;
    if (!phone.trim()) return setError('Enter your WhatsApp number first');
    setBusy(true);
    setError('');
    try {
      await login(phone, p);
    } catch (e) {
      setError(e.message);
      setPin('');
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setBusy(false);
    }
  }

  function press(d) {
    if (busy) return;
    setError('');
    const next = (pin + d).slice(0, 6);
    setPin(next);
    if (next.length === 6) submit(next);
  }

  return (
    <div className="login">
      <img src={theme === 'light' ? '/jekaplay-wordmark-black.png' : '/jekaplay-wordmark-green.png'} alt="Jekaplay, the Streets’ Food HQ" />
      <h1 className="h1">Staff <b>login</b></h1>
      <input
        inputMode="tel"
        autoComplete="tel"
        placeholder="WhatsApp number, e.g. 0801 234 5678"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        aria-label="WhatsApp number"
      />
      <div className={'dots' + (shake ? ' shake' : '')} aria-label="PIN entered so far">
        {[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className={i < pin.length ? 'f' : ''} />)}
      </div>
      {error && <div className="err">{error}</div>}
      <div className="pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} onClick={() => press(String(n))} disabled={busy}>{n}</button>
        ))}
        <span />
        <button onClick={() => press('0')} disabled={busy}>0</button>
        <button onClick={() => setPin(pin.slice(0, -1))} aria-label="Delete last digit"><Delete size={22} /></button>
      </div>
      <p className="mu">{busy ? 'Signing you in…' : 'Enter your 6-digit PIN'}</p>
    </div>
  );
}

export function SetPin({ onDone }) {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!/^\d{6}$/.test(next)) return setError('Your new PIN must be exactly 6 digits');
    if (next !== again) return setError('The two new PINs do not match');
    setBusy(true);
    setError('');
    try {
      await changePin(cur, next);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const digits = (setter) => (e) => setter(e.target.value.replace(/\D/g, '').slice(0, 6));
  return (
    <form className="login" onSubmit={submit}>
      <h1 className="h1">Choose your <b>own PIN</b></h1>
      <p className="sub">You are using a temporary PIN. Pick a new 6-digit PIN that only you know.</p>
      <input type="password" inputMode="numeric" placeholder="Temporary PIN" value={cur} onChange={digits(setCur)} />
      <input type="password" inputMode="numeric" placeholder="New 6-digit PIN" value={next} onChange={digits(setNext)} />
      <input type="password" inputMode="numeric" placeholder="Repeat new PIN" value={again} onChange={digits(setAgain)} />
      {error && <div className="err">{error}</div>}
      <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save my PIN'}</button>
    </form>
  );
}
