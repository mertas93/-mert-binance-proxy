const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;

function getSignature(queryString, secretKey) {
  return crypto.createHmac('sha256', secretKey).update(queryString).digest('hex');
}

app.get('/balances', async (req, res) => {
  const timestamp = Date.now();
  const query = `timestamp=${timestamp}`;
  const signature = getSignature(query, API_SECRET);

  try {
    const response = await axios.get(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const balances = {};
    response.data.balances.forEach(asset => {
      const free = parseFloat(asset.free);
      if (free > 0) {
        balances[asset.asset] = free;
      }
    });

    res.json(balances);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
