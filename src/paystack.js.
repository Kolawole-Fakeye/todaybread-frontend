import PaystackPop from '@paystack/inline-js';

// Replace this with your actual Render backend URL
const API_BASE_URL = 'https://todaybread.onrender.com/api';

export async function triggerPaystackPayment({ email, amount, onSuccess, onClose }) {
  try {
    // Step 1: Get access code from backend
    const response = await fetch(`${API_BASE_URL}/paystack/initialize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, amount })
    });

    const data = await response.json();

    if (!response.ok || !data.access_code) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    // Step 2: Launch Paystack Popup
    const popup = new PaystackPop();
    popup.checkout({
      accessCode: data.access_code,
      onSuccess: (transaction) => {
        console.log('Payment complete reference:', transaction.reference);
        if (onSuccess) onSuccess(transaction);
      },
      onClose: () => {
        console.log('Paystack modal closed');
        if (onClose) onClose();
      }
    });
  } catch (error) {
    console.error('Paystack error:', error);
    alert('Could not start Paystack checkout. Please try again.');
  }
}
