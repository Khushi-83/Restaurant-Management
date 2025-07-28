-- Update existing orders table with indexes and improvements
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Add comments to describe the table and columns
COMMENT ON TABLE orders IS 'Stores all restaurant orders with customer details and payment information';
COMMENT ON COLUMN orders.order_id IS 'Unique order identifier in format RETRO-timestamp-tableNumber';
COMMENT ON COLUMN orders.items IS 'JSON array of ordered items with quantities and prices';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, PAID, FAILED';
COMMENT ON COLUMN orders.status IS 'Order status: Awaiting Payment, Preparing, Ready, Delivered, Cancelled';

-- Create views for common queries
CREATE OR REPLACE VIEW active_orders AS
SELECT * FROM orders 
WHERE status NOT IN ('Delivered', 'Cancelled')
ORDER BY created_at DESC;

CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
  DATE(created_at) as order_date,
  COUNT(*) as total_orders,
  SUM(total_price) as total_revenue,
  AVG(total_price) as average_order_value
FROM orders 
WHERE payment_status = 'PAID'
GROUP BY DATE(created_at)
ORDER BY order_date DESC;

CREATE OR REPLACE VIEW pending_payments AS
SELECT * FROM orders 
WHERE payment_status = 'pending' AND status = 'Awaiting Payment'
ORDER BY created_at ASC;

-- Display confirmation
SELECT 'Orders table updated successfully!' as status; 