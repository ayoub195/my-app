const API_KEY = process.env.NEXT_PUBLIC_INTASEND_API_KEY;
const SECRET_KEY = process.env.NEXT_PUBLIC_INTASEND_SECRET_KEY;

const IS_LIVE = API_KEY?.includes('_live_') || SECRET_KEY?.includes('_live_');
const BASE_URL = IS_LIVE
  ? 'https://payment.intasend.com/api/v1'
  : 'https://sandbox.intasend.com/api/v1';

export const createCheckout = async (params: {
  amount: number;
  currency?: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  reference?: string;
  comment?: string;
}) => {
  try {
    if (!API_KEY || !SECRET_KEY) {
      throw new Error('IntaSend API credentials not found');
    }

    console.log('Creating checkout with params:', {
      ...params,
      public_key: API_KEY ? 'PRESENT' : 'MISSING',
    });

    const url = `${BASE_URL}/checkout/`;
    const requestBody = {
      public_key: API_KEY,
      amount: params.amount,
      currency: params.currency || 'USD',
      email: params.email,
      first_name: params.first_name,
      last_name: params.last_name,
      phone_number: params.phone_number || '',
      reference: params.reference || `Order-${Date.now()}`,
      comment: params.comment || 'Payment for products'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('IntaSend API error:', data);
      throw new Error(data.message || `Error ${response.status}`);
    }

    console.log('IntaSend checkout created successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('IntaSend checkout error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Checkout failed'
    };
  }
}; 