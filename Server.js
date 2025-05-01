// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// OTP भेजने का API
app.post('/api/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000);
    
    const response = await axios.post('https://api.msg91.com/api/v5/otp', {
      mobile: `91${mobile}`,
      template_id: process.env.MSG91_TEMPLATE_ID,
      otp: otp,
      otp_expiry: 5 // 5 मिनट
    }, {
      headers: { 'authkey': process.env.MSG91_AUTH_KEY }
    });
    
    res.json({ success: true, otp: otp });
  } catch (error) {
    console.error('OTP Error:', error.response?.data || error.message);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// server.js में एड करें
const cors = require('cors');
app.use(cors({
  origin: 'https://skrsameer.github.io/Earn-With-SKR-/'
}));

