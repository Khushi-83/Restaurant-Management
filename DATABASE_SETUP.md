# Database Setup Guide for Restaurant Management System

## Overview
This guide will help you set up the database for the restaurant management system with proper order management functionality.

## Database Structure

### Tables Created:
1. **orders** - Stores all order information
2. **menu_items** - Stores menu items and pricing
3. **feedback** - Stores customer feedback and ratings
4. **chat_messages** - Stores real-time chat messages

### Key Features:
- ✅ Real-time order tracking
- ✅ Payment status management
- ✅ Customer details storage
- ✅ Order status updates
- ✅ Performance optimized with indexes
- ✅ Automatic timestamp updates

## Setup Instructions

### 1. Supabase Setup (Recommended)

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and API key

2. **Run Database Schema:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `setup_database.sql`
   - Execute the script

3. **Environment Variables:**
   Add these to your `.env` file:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

### 2. Local PostgreSQL Setup (Alternative)

1. **Install PostgreSQL:**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # macOS
   brew install postgresql
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create Database:**
   ```bash
   createdb restaurant_management
   ```

3. **Run Schema:**
   ```bash
   psql -d restaurant_management -f setup_database.sql
   ```

## API Endpoints

### Order Management

#### Get All Orders
```http
GET /api/orders
```

#### Get Specific Order
```http
GET /api/orders/{orderId}
```

#### Update Order Status
```http
PUT /api/orders/{orderId}/status
Content-Type: application/json

{
  "status": "Preparing"
}
```

#### Get Orders by Table
```http
GET /api/orders/table/{tableNumber}
```

#### Get Orders by Status
```http
GET /api/orders/status/{status}
```

#### Cancel Order
```http
DELETE /api/orders/{orderId}
```

### Order Statuses
- `Awaiting Payment` - Order placed, waiting for payment
- `Preparing` - Payment received, order being prepared
- `Ready` - Order ready for delivery
- `Delivered` - Order delivered to customer
- `Cancelled` - Order cancelled

### Payment Statuses
- `pending` - Payment not yet completed
- `PAID` - Payment successful
- `FAILED` - Payment failed

## Database Schema Details

### Orders Table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  order_id VARCHAR(255) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  table_number INTEGER NOT NULL,
  items JSONB NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'Awaiting Payment',
  cf_payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Sample Order Data
```json
{
  "order_id": "RETRO-1703123456789-12",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+91-9876543210",
  "table_number": 12,
  "items": [
    {
      "name": "Paneer Tikka",
      "quantity": 2,
      "price": 250
    },
    {
      "name": "Butter Naan",
      "quantity": 3,
      "price": 40
    }
  ],
  "total_price": 620.00,
  "payment_method": "upi",
  "payment_status": "PAID",
  "status": "Preparing"
}
```

## Views Available

### Active Orders
```sql
SELECT * FROM active_orders;
-- Shows all orders that are not delivered or cancelled
```

### Daily Sales Summary
```sql
SELECT * FROM daily_sales_summary;
-- Shows daily revenue and order statistics
```

### Pending Payments
```sql
SELECT * FROM pending_payments;
-- Shows orders waiting for payment
```

## Real-time Features

### WebSocket Events
The system supports real-time updates via WebSocket:

- `order_update` - New order placed
- `order_status_update` - Order status changed
- `order_cancelled` - Order cancelled
- `table_order_update` - Order update for specific table
- `admin_order_update` - Order update for admin panel

### Frontend Integration
The updated `OrdersPanel.tsx` component now:
- ✅ Fetches real data from API
- ✅ Updates order status in real-time
- ✅ Shows payment status
- ✅ Displays order details
- ✅ Supports order cancellation
- ✅ Auto-refreshes data

## Testing the Setup

### 1. Test Order Creation
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerDetails": {
      "name": "Test Customer",
      "email": "test@example.com",
      "phone": "+91-1234567890",
      "tableNo": 5
    },
    "cartItems": [
      {
        "name": "Paneer Tikka",
        "quantity": 2,
        "price": 250
      }
    ],
    "amount": 500,
    "paymentMethod": "upi"
  }'
```

### 2. Test Order Status Update
```bash
curl -X PUT http://localhost:5000/api/orders/RETRO-1703123456789-5/status \
  -H "Content-Type: application/json" \
  -d '{"status": "Preparing"}'
```

### 3. Test Order Retrieval
```bash
curl http://localhost:5000/api/orders
```

## Troubleshooting

### Common Issues:

1. **Connection Error:**
   - Verify Supabase credentials
   - Check network connectivity
   - Ensure environment variables are set

2. **Order Not Found:**
   - Verify order_id format (RETRO-timestamp-tableNumber)
   - Check if order exists in database

3. **Status Update Fails:**
   - Ensure status is one of: Awaiting Payment, Preparing, Ready, Delivered, Cancelled
   - Check if order exists and is not already in final state

4. **Real-time Updates Not Working:**
   - Verify WebSocket connection
   - Check if Socket.IO is properly configured
   - Ensure frontend is listening to correct events

## Maintenance

### Regular Tasks:
1. **Backup Database:**
   ```bash
   pg_dump restaurant_management > backup.sql
   ```

2. **Clean Old Orders:**
   ```sql
   DELETE FROM orders WHERE created_at < NOW() - INTERVAL '30 days';
   ```

3. **Monitor Performance:**
   ```sql
   SELECT * FROM pg_stat_user_tables WHERE schemaname = 'public';
   ```

## Support

If you encounter any issues:
1. Check the logs in `backend/logs/`
2. Verify database connectivity
3. Test API endpoints individually
4. Check WebSocket connections

The database is now ready to handle orders with full CRUD operations and real-time updates! 