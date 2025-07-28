-- Restaurant Management System Database Setup
-- This script creates all necessary tables for the restaurant management system

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  image_url TEXT,
  quantity_per_serve INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
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

-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  table_number INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_table_number ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);

CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_date ON feedback(date);

CREATE INDEX IF NOT EXISTS idx_chat_messages_table ON chat_messages(table_number);
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp);

-- Create a trigger to automatically update the updated_at timestamp for orders
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

-- Add comments to describe the tables and columns
COMMENT ON TABLE orders IS 'Stores all restaurant orders with customer details and payment information';
COMMENT ON COLUMN orders.order_id IS 'Unique order identifier in format RETRO-timestamp-tableNumber';
COMMENT ON COLUMN orders.items IS 'JSON array of ordered items with quantities and prices';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, PAID, FAILED';
COMMENT ON COLUMN orders.status IS 'Order status: Awaiting Payment, Preparing, Ready, Delivered, Cancelled';
COMMENT ON COLUMN orders.cf_payment_id IS 'Cashfree payment gateway transaction ID';

COMMENT ON TABLE menu_items IS 'Stores all menu items with categories and pricing';
COMMENT ON TABLE feedback IS 'Stores customer feedback and ratings';
COMMENT ON TABLE chat_messages IS 'Stores real-time chat messages between customers and admin';

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

-- Insert sample menu items (optional)
INSERT INTO menu_items (name, price, description, category, image_url) VALUES
('Paneer Tikka', 250.00, 'Grilled cottage cheese with spices', 'Starters', '/images/starters.jpg'),
('Butter Chicken', 350.00, 'Creamy tomato-based curry with chicken', 'Main Course', '/images/main-course.jpg'),
('Butter Naan', 40.00, 'Soft bread baked in tandoor', 'Main Course', '/images/main-course.jpg'),
('Mango Lassi', 80.00, 'Sweet yogurt drink with mango', 'Beverages', '/images/beverages.jpg'),
('Gulab Jamun', 60.00, 'Sweet dessert balls in sugar syrup', 'Desserts', '/images/desserts.jpg')
ON CONFLICT DO NOTHING;

-- Display table creation confirmation
SELECT 'Database setup completed successfully!' as status; 