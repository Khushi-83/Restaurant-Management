// Test script to verify order creation with existing schema
// Run this to test if orders are being created correctly

const testOrderCreation = async () => {
  const testOrder = {
    customerDetails: {
      name: "Test Customer",
      email: "test@example.com",
      phone: "+91-1234567890",
      tableNo: 5
    },
    cartItems: [
      {
        name: "Paneer Tikka",
        quantity: 2,
        price: 250
      },
      {
        name: "Butter Naan",
        quantity: 3,
        price: 40
      }
    ],
    amount: 620,
    paymentMethod: "upi"
  };

  try {
    const response = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Order creation failed:', errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Order created successfully:', result);
    
    // Test fetching the order
    const fetchResponse = await fetch(`http://localhost:5000/api/orders/${result.order_id}`);
    if (fetchResponse.ok) {
      const fetchedOrder = await fetchResponse.json();
      console.log('✅ Order fetched successfully:', fetchedOrder);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test order status update
const testOrderStatusUpdate = async (orderId) => {
  try {
    const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'Preparing' })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Status update failed:', errorData);
      return;
    }

    const result = await response.json();
    console.log('✅ Status updated successfully:', result);
    
  } catch (error) {
    console.error('❌ Status update test failed:', error);
  }
};

// Test fetching all orders
const testFetchOrders = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/orders');
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Fetch orders failed:', errorData);
      return;
    }

    const orders = await response.json();
    console.log('✅ Orders fetched successfully:', orders);
    console.log(`📊 Total orders: ${orders.length}`);
    
  } catch (error) {
    console.error('❌ Fetch orders test failed:', error);
  }
};

// Run tests
console.log('🧪 Testing order management system...\n');

// Uncomment the lines below to run tests
// testOrderCreation();
// testFetchOrders();
// testOrderStatusUpdate('RETRO-1703123456789-5');

console.log('💡 To run tests, uncomment the test function calls above');
console.log('💡 Make sure your backend server is running on port 5000'); 