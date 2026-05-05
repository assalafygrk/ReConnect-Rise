const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function clearMockData() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find users with the mock bank name and clear their virtual account details
  const result = await User.updateMany(
    { paymentPointBankName: 'MockBank (Test Mode)' },
    { 
      $unset: { 
        paymentPointVirtualAccount: "",
        paymentPointBankName: "",
        paymentPointAccountName: "",
        paymentPointCustomerId: ""
      }
    }
  );
  
  console.log(`Cleared mock accounts for ${result.modifiedCount} users.`);
  mongoose.disconnect();
}

clearMockData();
