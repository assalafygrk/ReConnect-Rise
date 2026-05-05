require('dotenv').config();
const fetch = require('node-fetch');

async function testApi() {
  const { PAYMENTPOINT_BEARER_TOKEN, PAYMENTPOINT_API_KEY, PAYMENTPOINT_BUSINESS_ID } = process.env;

  console.log("Testing with:");
  console.log("Bearer:", PAYMENTPOINT_BEARER_TOKEN.substring(0, 10) + "...");
  console.log("API Key:", PAYMENTPOINT_API_KEY.substring(0, 10) + "...");
  console.log("Business ID:", PAYMENTPOINT_BUSINESS_ID);

  try {
    const response = await fetch('https://api.paymentpoint.co/api/v1/virtual-accounts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENTPOINT_BEARER_TOKEN}`,
        'api-key': PAYMENTPOINT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: "test@example.com",
        name: "Test User",
        phoneNumber: "08012345678",
        businessId: PAYMENTPOINT_BUSINESS_ID
      })
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

testApi();
