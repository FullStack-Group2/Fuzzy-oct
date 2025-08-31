const SUBSCRIPTION_SERVICE_URL = `http://localhost:5001`;

let token = '';
const userAgent =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const headers = {
  'user-agent': userAgent,
};

async function signIn() {
  const username = 'marciochen';
  const password = '123456789';

  try {
    console.log('Attempting to login with:', username);
    const response = await fetch(`${SUBSCRIPTION_SERVICE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    console.log('Login response status:', response.status);
    console.log('Login response:', response);

    // Check if request succeeded
    if (!response.ok) {
      const errorData = await response.text();
      console.log('Login error data:', errorData);
      throw new Error(
        `Login failed: ${response.status} ${response.statusText}`,
      );
    }

    // Parse JSON data
    const data = await response.json();
    console.log('Login successful, token:', data.token ? 'Present' : 'Missing');
    token = data.token;
    return data;
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

async function addItemToCart(itemId: string, quantity: number) {
  try {
    console.log(' Adding item to cart:', { itemId, quantity });
    console.log(' Using token:', token ? 'Present' : 'Missing');
    
    const response = await fetch(
      `${SUBSCRIPTION_SERVICE_URL}/api/customers/cart`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...headers,
        },
        body: JSON.stringify({
          itemId,
          quantity,
        }),
      },
    );
    console.log("Cart response:", response);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.log('Cart error data:', errorData);
      throw new Error(
        `Add Item failed: ${response.status} ${response.statusText}`,
      );
    }

    // Parse JSON data
    const data = await response.json();
    console.log("item added to cart:", data);
    return data;
  } catch (err) {
    console.error(' Add item error:', err);
    throw err;
  }
}

async function orderItem() {
  try {
    const response = await fetch(
      `${SUBSCRIPTION_SERVICE_URL}/api/customers/orders`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...headers,
        },
      },
    );

    console.log("response2:", response);
    if (!response.ok) {
      throw new Error(
        `Order item failed: ${response.status} ${response.statusText}`,
      );
    }

    // Parse JSON data
    const data = await response.json();
    console.log("Order item response:", data);
    return data;
  } catch (err) {
    console.error('Order error: ', err);
    throw err;
  }
}
async function main() {
  /*//////////////////////////////////////////////////////////////
                    LOGIN
    //////////////////////////////////////////////////////////////*/
  const signInResponse = await signIn();
  console.log('\x1b[32m%s\x1b[0m', 'signInResponse==========>', signInResponse);

  /*//////////////////////////////////////////////////////////////
                    ADD ITEM TO CART
    //////////////////////////////////////////////////////////////*/
  const addItemResponse = await addItemToCart('68a7083c748d1da6d1719947', 100);
  const addItemResponse2 = await addItemToCart('68adef53cd115496268d7308', 100);

  console.log('\x1b[32m%s\x1b[0m', 'addItemToCart==========>', addItemResponse);
  console.log(
    '\x1b[32m%s\x1b[0m',
    'addItemToCart==========>',
    addItemResponse2,
  );

  /*//////////////////////////////////////////////////////////////
                    ORDER ITEM
    //////////////////////////////////////////////////////////////*/
  const orderResponse = await orderItem();

  console.log('\x1b[32m%s\x1b[0m', 'orderResponse==========>', orderResponse);
}

main();
