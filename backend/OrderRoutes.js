const express = require('express');
const router = express.Router();
const { PaymentError, ERROR_CODES } = require('./utils/ErrorHandler');
const logger = require('./utils/logger');

module.exports = (supabase, io) => {
  // GET /api/orders - fetch all orders
  router.get('/', async (req, res) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Parse items JSON for each order and convert table_number to number
      const ordersWithParsedItems = data.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]'),
        table_number: parseInt(order.table_number) || 0
      }));

      res.json(ordersWithParsedItems);
    } catch (err) {
      logger.error('Failed to fetch orders:', err);
      res.status(500).json({ error: 'Failed to fetch orders', details: err.message });
    }
  });

  // GET /api/orders/:orderId - fetch specific order
  router.get('/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Parse items JSON and convert table_number to number
      const orderWithParsedItems = {
        ...data,
        items: JSON.parse(data.items || '[]'),
        table_number: parseInt(data.table_number) || 0
      };

      res.json(orderWithParsedItems);
    } catch (err) {
      logger.error('Failed to fetch order:', err);
      res.status(500).json({ error: 'Failed to fetch order', details: err.message });
    }
  });

  // PUT /api/orders/:orderId/status - update order status
  router.put('/:orderId/status', async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['Awaiting Payment', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        throw new PaymentError('Invalid status', ERROR_CODES.INVALID_DATA);
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Parse items for socket notification and convert table_number to number
      const orderWithParsedItems = {
        ...data,
        items: JSON.parse(data.items || '[]'),
        table_number: parseInt(data.table_number) || 0
      };

      // Socket notifications
      io.emit('order_status_update', {
        orderId,
        status,
        order: orderWithParsedItems,
        timestamp: new Date().toISOString()
      });

      io.to(`table_${data.table_number}`).emit('table_order_status_update', {
        orderId,
        status,
        order: orderWithParsedItems
      });

      io.to('admin_room').emit('admin_order_status_update', {
        orderId,
        status,
        order: orderWithParsedItems
      });

      res.json({ 
        message: 'Order status updated successfully',
        order: orderWithParsedItems
      });
    } catch (err) {
      logger.error('Failed to update order status:', err);
      const status = err instanceof PaymentError ? 400 : 500;
      res.status(status).json({ 
        error: 'Failed to update order status', 
        details: err.message 
      });
    }
  });

  // GET /api/orders/table/:tableNumber - fetch orders for specific table
  router.get('/table/:tableNumber', async (req, res) => {
    try {
      const { tableNumber } = req.params;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('table_number', tableNumber)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Parse items JSON for each order and convert table_number to number
      const ordersWithParsedItems = data.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]'),
        table_number: parseInt(order.table_number) || 0
      }));

      res.json(ordersWithParsedItems);
    } catch (err) {
      logger.error('Failed to fetch table orders:', err);
      res.status(500).json({ error: 'Failed to fetch table orders', details: err.message });
    }
  });

  // GET /api/orders/status/:status - fetch orders by status
  router.get('/status/:status', async (req, res) => {
    try {
      const { status } = req.params;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Parse items JSON for each order and convert table_number to number
      const ordersWithParsedItems = data.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]'),
        table_number: parseInt(order.table_number) || 0
      }));

      res.json(ordersWithParsedItems);
    } catch (err) {
      logger.error('Failed to fetch orders by status:', err);
      res.status(500).json({ error: 'Failed to fetch orders by status', details: err.message });
    }
  });

  // DELETE /api/orders/:orderId - cancel order (soft delete by updating status)
  router.delete('/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status: 'Cancelled'
        })
        .eq('order_id', orderId)
        .select()
        .single();

      if (error) throw error;
      if (!data) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Parse items for socket notification and convert table_number to number
      const orderWithParsedItems = {
        ...data,
        items: JSON.parse(data.items || '[]'),
        table_number: parseInt(data.table_number) || 0
      };

      // Socket notifications
      io.emit('order_cancelled', {
        orderId,
        order: orderWithParsedItems,
        timestamp: new Date().toISOString()
      });

      res.json({ 
        message: 'Order cancelled successfully',
        order: orderWithParsedItems
      });
    } catch (err) {
      logger.error('Failed to cancel order:', err);
      res.status(500).json({ error: 'Failed to cancel order', details: err.message });
    }
  });

  return router;
}; 