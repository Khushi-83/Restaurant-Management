-- Orders Table Schema for Restaurant Management System
-- This table stores all order information including customer details, items, and payment status

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL, -- Stores cart items as JSON
  total_price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'Awaiting Payment',
  cf_payment_id VARCHAR(255), -- Cashfree payment ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to describe the table and columns
COMMENT ON TABLE orders IS 'Stores all restaurant orders with customer details and payment information';
COMMENT ON COLUMN orders.order_id IS 'Unique order identifier in format RETRO-timestamp-tableNumber';
COMMENT ON COLUMN orders.items IS 'JSON array of ordered items with quantities and prices';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, PAID, FAILED';
COMMENT ON COLUMN orders.status IS 'Order status: Awaiting Payment, Preparing, Ready, Delivered, Cancelled';
COMMENT ON COLUMN orders.cf_payment_id IS 'Cashfree payment gateway transaction ID';

-- Optional: Create a view for active orders (not delivered or cancelled)
CREATE OR REPLACE VIEW active_orders AS
SELECT * FROM orders 
WHERE status NOT IN ('Delivered', 'Cancelled')
ORDER BY created_at DESC;

-- Optional: Create a view for daily sales summary
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