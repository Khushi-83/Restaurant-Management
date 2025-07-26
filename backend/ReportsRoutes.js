const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  // GET /api/reports/daily-sales - aggregate sales per food item for today
  router.get('/daily-sales', async (req, res) => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('items, created_at')
        .gte('created_at', today.toISOString())
        .lt('created_at', tomorrow.toISOString());

      if (error) throw error;

      const sales = {};
      (orders || []).forEach(order => {
        let items;
        try {
          items = JSON.parse(order.items);
        } catch {
          items = [];
        }
        items.forEach(item => {
          const name = item.name || 'Unknown';
          const qty = item.quantity_per_serve || item.quantity || 1;
          if (!sales[name]) sales[name] = 0;
          sales[name] += qty;
        });
      });

      res.json(sales);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch daily sales', details: err.message });
    }
  });

  return router;
}; 