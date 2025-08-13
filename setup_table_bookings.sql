-- Table for table bookings/reservations
CREATE TABLE IF NOT EXISTS table_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  table_number INTEGER NOT NULL,
  booking_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status VARCHAR(20) NOT NULL DEFAULT 'Booked',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_table_bookings_time ON table_bookings(booking_time);
CREATE INDEX IF NOT EXISTS idx_table_bookings_table ON table_bookings(table_number);
CREATE INDEX IF NOT EXISTS idx_table_bookings_status ON table_bookings(status);


