require('dotenv').config();
const fetch = require('node-fetch');

const paths = [
  '/api/v1/generate-virtual-account',
  '/api/generate-virtual-account',
  '/api/create-virtual-account',
  '/api/virtual-account/generate',
  '/api/virtual-account/create',
  '/api/v1/virtualAccount/create',
  '/api/account/virtual',
  '/v1/generate-virtual-account',
  '/virtual-account'
];

async function testPaths() {
  const { PAYMENTPOINT_BEARER_TOKEN, PAYMENTPOINT_API_KEY, PAYMENTPOINT_BUSINESS_ID } = process.env;
  
  for (const path of paths) {
    try {
      const response = await fetch(`https://api.paymentpoint.co${path}`, {
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
      console.log(`Path: ${path} | Status: ${response.status}`);
      if (text.startsWith('{')) {
        console.log(`JSON Response found: ${text}`);
      }
    } catch (err) {
      console.error(`Path: ${path} | Error: ${err.message}`);
    }
  }
}

testPaths();
