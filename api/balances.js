import axios from 'axios';

export default async function handler(req, res) {
  const API_KEY = process.env.BINANCE_API_KEY;
  const API_SECRET = process.env.BINANCE_API_SECRET;

  const timestamp = Date.now();
  const query = `timestamp=${timestamp}`;

  const crypto = await import('crypto');
  const signature = crypto.createHmac('sha256', API_SECRET)
                          .update(query)
                          .digest('hex');

  try {
    const response = await axios.get(`https://api.binance.com/api/v3/account?${query}&signature=${signature}`, {
      headers: { 'X-MBX-APIKEY': API_KEY }
    });

    const balances = {};
    response.data.balances.forEach(asset => {
      const free = parseFloat(asset.free);
      if (free > 0) balances[asset.asset] = free;
    });

    res.status(200).json(balances);
  } catch (err) {
    res.status(500).json({ error: err.response?.data || err.message });
  }
}
