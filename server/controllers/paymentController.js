const User = require('../models/User');
const Transaction = require('../models/Transaction');
const PaymentRecord = require('../models/PaymentRecord');
const fetch = require('node-fetch');

// ─── Generate Virtual Account ────────────────────────────────────────────────
const generateVirtualAccount = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) { res.status(404); throw new Error('User not found'); }

  // If user already has an account, return it
  if (user.paymentPointVirtualAccount) {
    return res.json({
      success: true,
      accountNumber: user.paymentPointVirtualAccount,
      bankName: user.paymentPointBankName,
      accountName: user.paymentPointAccountName
    });
  }

  const { PAYMENTPOINT_BEARER_TOKEN, PAYMENTPOINT_API_KEY, PAYMENTPOINT_BUSINESS_ID } = process.env;

  if (!PAYMENTPOINT_BEARER_TOKEN || !PAYMENTPOINT_API_KEY) {
    // For test mode, if keys are missing, generate a mock virtual account
    user.paymentPointVirtualAccount = `99${user._id.toString().substring(0, 8).replace(/\D/g, '0').padEnd(8, '0')}`;
    user.paymentPointBankName = 'MockBank (Test Mode)';
    user.paymentPointAccountName = user.name;
    await user.save();
    return res.json({
      success: true,
      accountNumber: user.paymentPointVirtualAccount,
      bankName: user.paymentPointBankName,
      accountName: user.paymentPointAccountName,
      mock: true
    });
  }

  try {
    const response = await fetch('https://api.paymentpoint.co/api/v1/createVirtualAccount', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYMENTPOINT_BEARER_TOKEN}`,
        'api-key': PAYMENTPOINT_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        phoneNumber: user.phone || '08000000000',
        bankCode: ["20946", "20897"],
        businessId: PAYMENTPOINT_BUSINESS_ID || ''
      })
    });

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to generate virtual account');
    }

    const accountDetails = data.bankAccounts && data.bankAccounts.length > 0 ? data.bankAccounts[0] : null;

    if (!accountDetails) {
      throw new Error('No bank account generated in response');
    }

    user.paymentPointVirtualAccount = accountDetails.accountNumber;
    user.paymentPointBankName = accountDetails.bankName;
    user.paymentPointAccountName = accountDetails.accountName;
    user.paymentPointCustomerId = data.customer ? data.customer.customer_id : null;
    
    await user.save();

    res.json({
      success: true,
      accountNumber: user.paymentPointVirtualAccount,
      bankName: user.paymentPointBankName,
      accountName: user.paymentPointAccountName
    });
  } catch (error) {
    console.error('PaymentPoint Virtual Account Error:', error);
    res.status(500);
    throw new Error('Could not generate virtual account. Please try again later.');
  }
};

// ─── PaymentPoint Webhook ────────────────────────────────────────────────────
const paymentpointWebhook = async (req, res) => {
  const payload = req.body;
  
  console.log('================ WEBHOOK RECEIVED ================');
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.log('==================================================');

  // Based on the webhook payload structure
  const reference = payload.reference || payload.trxRef || payload.transactionId;
  const amount = Number(payload.amount);
  const status = payload.status;
  const accountNumber = payload.accountNumber || payload.virtualAccount;

  // We only care about successful transactions
  if (!status || status.toLowerCase() !== 'success' && status.toLowerCase() !== 'successful') {
    return res.status(200).send('Ignored: Not successful');
  }

  try {
    // Prevent duplicate processing
    const existingRecord = await PaymentRecord.findOne({ reference });
    if (existingRecord) return res.status(200).send('Already processed');

    // Find the user with this virtual account
    const user = await User.findOne({ paymentPointVirtualAccount: accountNumber });
    if (!user) {
      console.error(`Webhook error: User not found for account ${accountNumber}`);
      return res.status(200).send('User not found');
    }

    // Create payment record
    await PaymentRecord.create({
      user: user._id,
      reference: reference,
      amount: amount,
      status: 'success',
      channel: 'bank_transfer',
      paymentResponse: payload
    });

    // Credit user's wallet
    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    // Create transaction history
    await Transaction.create({
      user: user._id,
      type: 'credit',
      amount: amount,
      note: `Bank Transfer Deposit (Ref: ${reference})`,
    });

    console.log(`Successfully processed webhook for ${reference} - Credited ${amount} to ${user.name}`);
    res.status(200).send('OK');

  } catch (error) {
    console.error('PaymentPoint Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  generateVirtualAccount,
  paymentpointWebhook
};
