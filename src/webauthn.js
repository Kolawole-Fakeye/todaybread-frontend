import { startRegistration, startAuthentication } from '@simplewebauthn/browser';

// Replace this with your actual Render backend URL
const API_BASE_URL = 'https://todaybread.onrender.com/api';

// 1. REGISTER NEW PASSKEY
export async function registerPasskey(userId, email) {
  try {
    // Fetch options from backend
    const res = await fetch(`${API_BASE_URL}/webauthn/generate-registration-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email })
    });
    const optionsJSON = await res.json();

    // Prompt fingerprint / Face ID / PIN
    const attResp = await startRegistration({ optionsJSON });

    // Send verification to backend
    const verifyRes = await fetch(`${API_BASE_URL}/webauthn/verify-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, attResp })
    });

    return await verifyRes.json();
  } catch (error) {
    console.error('Passkey registration failed:', error);
    throw error;
  }
}

// 2. LOGIN WITH PASSKEY
export async function loginWithPasskey(email) {
  try {
    // Fetch authentication options
    const res = await fetch(`${API_BASE_URL}/webauthn/generate-authentication-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const optionsJSON = await res.json();

    // Prompt biometric login
    const authResp = await startAuthentication({ optionsJSON });

    // Verify with backend
    const verifyRes = await fetch(`${API_BASE_URL}/webauthn/verify-authentication`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, authResp })
    });

    return await verifyRes.json();
  } catch (error) {
    console.error('Passkey login failed:', error);
    throw error;
  }
}
