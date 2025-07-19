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

  // POST /api/feedback - submit new feedback
  router.post('/', async (req, res) => {
    try {
      const feedbackData = req.body;
      
      // Remove submitted_at field but keep date
      const { submitted_at, ...cleanFeedbackData } = feedbackData;
      
      const { data, error } = await supabase
        .from('feedback')
        .insert([{
          ...cleanFeedbackData,
          created_at: new Date().toISOString(),
        }])
        .select();
      
      if (error) throw error;
      
      res.status(201).json({ 
        message: 'Feedback submitted successfully',
        data: data[0]
      });
    } catch (err) {
      console.error('Feedback submission error:', err);
      res.status(500).json({ error: 'Failed to submit feedback' });
    }
  });

  return router;
}; 