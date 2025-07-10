const express = require('express');
const router = express.Router();

module.exports = (supabase) => {
  // GET /api/feedback - fetch all feedback
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch feedback' });
    }
  });

  return router;
}; 