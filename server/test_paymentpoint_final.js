require('dotenv').config();
const fetch = require('node-fetch');

async function testApi() {
  const { PAYMENTPOINT_BEARER_TOKEN, PAYMENTPOINT_API_KEY, PAYMENTPOINT_BUSINESS_ID } = process.env;

  try {
    const response = await fetch('https://api.paymentpoint.co/api/v1/createVirtualAccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENTPOINT_BEARER_TOKEN}`,
        'api-key': PAYMENTPOINT_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test User",
        phoneNumber: "08012345678",
        businessId: PAYMENTPOINT_BUSINESS_ID
      })
    });

    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Raw Response:", text);
    
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testApi();
