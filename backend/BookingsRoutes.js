const express = require('express');

// Booking statuses
const BOOKING_STATUS = {
  BOOKED: 'Booked',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

/**
 * Bookings routes factory
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('socket.io').Server} io
 */
module.exports = function BookingsRoutes(supabase, io) {
  const router = express.Router();

  const TOTAL_TABLES = Number(process.env.TOTAL_TABLES || 20);

  // Utility to compute overlapping bookings
  function isOverlapping(targetStart, targetEnd, bookingStart, bookingDurationMinutes) {
    try {
      const startA = new Date(targetStart).getTime();
      const endA = new Date(targetEnd).getTime();
      const startB = new Date(bookingStart).getTime();
      const endB = startB + Number(bookingDurationMinutes || 60) * 60 * 1000;
      return startA < endB && startB < endA;
    } catch {
      return false;
    }
  }

  // List bookings (optionally by day)
  router.get('/', async (req, res) => {
    try {
      const { day } = req.query; // ISO date string; if omitted, show today onwards
      let from = new Date();
      from.setHours(0, 0, 0, 0);
      if (day) {
        const d = new Date(day);
        if (!isNaN(d.getTime())) from = d;
      }
      const { data, error } = await supabase
        .from('table_bookings')
        .select('*')
        .gte('booking_time', from.toISOString())
        .order('booking_time', { ascending: true });
      if (error) throw error;
      res.json(data || []);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch bookings', details: err.message });
    }
  });

  // Get available tables for a given start time and duration
  router.get('/available', async (req, res) => {
    try {
      const at = req.query.at ? new Date(String(req.query.at)) : new Date();
      const durationMinutes = Number(req.query.duration || 60);
      if (isNaN(at.getTime())) return res.status(400).json({ error: 'Invalid time' });

      // Fetch bookings for the day
      const dayStart = new Date(at);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const { data: bookings, error } = await supabase
        .from('table_bookings')
        .select('table_number, booking_time, duration_minutes, status')
        .gte('booking_time', dayStart.toISOString())
        .lt('booking_time', dayEnd.toISOString());
      if (error) throw error;

      const targetEnd = new Date(at.getTime() + durationMinutes * 60 * 1000);

      const unavailable = new Set();
      (bookings || []).forEach(b => {
        if ([BOOKING_STATUS.BOOKED, BOOKING_STATUS.SEATED].includes(b.status)) {
          if (isOverlapping(at, targetEnd, b.booking_time, b.duration_minutes)) {
            unavailable.add(Number(b.table_number));
          }
        }
      });

      const allTables = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1);
      const available = allTables.filter(t => !unavailable.has(t));
      res.json({ available, total: TOTAL_TABLES });
    } catch (err) {
      res.status(500).json({ error: 'Failed to compute availability', details: err.message });
    }
  });

  // Create booking
  router.post('/', async (req, res) => {
    try {
      const { customer_name, customer_phone, party_size, table_number, booking_time, duration_minutes } = req.body || {};
      if (!customer_name || !customer_phone || !party_size || !booking_time) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const start = new Date(booking_time);
      if (isNaN(start.getTime())) return res.status(400).json({ error: 'Invalid booking_time' });
      const duration = Number(duration_minutes || 60);
      const end = new Date(start.getTime() + duration * 60 * 1000);

      // Determine table if not provided
      let chosenTable = Number(table_number) || null;
      if (!chosenTable) {
        // Compute availability and choose first available
        const { data: bookings, error } = await supabase
          .from('table_bookings')
          .select('table_number, booking_time, duration_minutes, status');
        if (error) throw error;
        const unavailable = new Set();
        (bookings || []).forEach(b => {
          if ([BOOKING_STATUS.BOOKED, BOOKING_STATUS.SEATED].includes(b.status)) {
            if (isOverlapping(start, end, b.booking_time, b.duration_minutes)) {
              unavailable.add(Number(b.table_number));
            }
          }
        });
        const allTables = Array.from({ length: TOTAL_TABLES }, (_, i) => i + 1);
        const available = allTables.filter(t => !unavailable.has(t));
        if (available.length === 0) return res.status(409).json({ error: 'No tables available for selected time' });
        chosenTable = available[0];
      }

      const booking = {
        booking_id: `BOOK-${Date.now()}-${chosenTable}`,
        customer_name,
        customer_phone,
        party_size: Number(party_size),
        table_number: chosenTable,
        booking_time: start.toISOString(),
        duration_minutes: duration,
        status: BOOKING_STATUS.BOOKED,
        created_at: new Date().toISOString()
      };

      const { data, error: insertError } = await supabase
        .from('table_bookings')
        .insert([booking])
        .select();
      if (insertError) throw insertError;

      const saved = data[0];
      io.emit('booking_update', saved);
      io.to('admin_room').emit('admin_booking_update', saved);
      return res.status(201).json(saved);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create booking', details: err.message });
    }
  });

  // Update booking status
  router.put('/:booking_id/status', async (req, res) => {
    try {
      const { booking_id } = req.params;
      const { status } = req.body || {};
      if (!booking_id || !status) return res.status(400).json({ error: 'booking_id and status are required' });

      const { data, error } = await supabase
        .from('table_bookings')
        .update({ status })
        .eq('booking_id', booking_id)
        .select();
      if (error) throw error;
      const updated = data[0];
      io.emit('booking_status_update', updated);
      io.to('admin_room').emit('admin_booking_status_update', updated);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update status', details: err.message });
    }
  });

  // Cancel booking
  router.delete('/:booking_id', async (req, res) => {
    try {
      const { booking_id } = req.params;
      const { data, error } = await supabase
        .from('table_bookings')
        .update({ status: BOOKING_STATUS.CANCELLED })
        .eq('booking_id', booking_id)
        .select();
      if (error) throw error;
      const cancelled = data[0];
      io.emit('booking_cancelled', cancelled);
      io.to('admin_room').emit('admin_booking_cancelled', cancelled);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to cancel booking', details: err.message });
    }
  });

  return router;
};


