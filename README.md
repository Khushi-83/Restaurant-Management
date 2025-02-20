# Restaurant Management System with QR-Based Ordering

## Overview
This project is a **Restaurant Management System** with a **QR-based ordering system** that allows customers to view the menu, place orders, and make payments without logging in. Restaurant staff can manage orders, menu items, and customer interactions through an **admin portal**.

## Features

### Customer Features
✅ **QR-Based Menu Access** – Scan a QR code at the table to view the menu.
✅ **Categorized Menu** – Menu items are grouped into **Drinks, Starters, Main Course, Desserts, etc.**
✅ **Order Customization** – Choose quantity, specify preferences (spiciness, drink temperature, song requests).
✅ **Dine-in, Takeout, or Delivery Options**
✅ **Cart & Order Placement** – Add items to the cart and place an order.
✅ **Online & Cash Payment** – Secure payment via **UPI, Cards, Wallets, or Cash on Delivery**.
✅ **Real-Time Chat with Admin** – Customers can ask about order status and get responses instantly.

### Admin Features
✅ **Order Management** – View all orders with customer details (name & table number).
✅ **Track Preferences** – View food modifications (extra spicy, chilled drinks, song requests).
✅ **Menu Management** – Add/remove items, update prices.
✅ **Order Status Tracking** – Mark orders as completed and track delivery.
✅ **Customer Feedback Collection** – Gather ratings and suggestions.
✅ **Daily Sales Reports** – Track revenue and order logs.
✅ **Real-Time Chat System** – Respond to customer queries live.
✅ **Music Playlist Management** – Approve/decline customer song requests.

## Tech Stack
- **Frontend:** React.js / Next.js, Tailwind CSS
- **Backend:** Node.js (Express.js)
- **Database:** Supabase
- **Payment Gateway:** Cashfree
- **Hosting:** Vercel (Frontend), Railway (Backend)
- **Messaging System:** WebSockets

## Installation & Setup
### Prerequisites
- Node.js installed
- Supabase account for database
- Cashfree account for payment integration

### Steps to Run the Project
1. **Clone the Repository**
   ```sh
   git clone https://github.com/yourusername/restaurant-management-system.git
   cd restaurant-management-system
   ```
2. **Install Dependencies**
   ```sh
   npm install
   ```
3. **Set Up Environment Variables**
   Create a `.env` file in the root directory and add:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   CASHFREE_API_KEY=your_cashfree_api_key
   ```
4. **Run the Backend Server**
   ```sh
   npm run server
   ```
5. **Run the Frontend**
   ```sh
   npm run dev
   ```

## Deployment
- **Frontend:** Deploy on **Vercel**
- **Backend:** Deploy on **Railway**

## Contribution Guidelines
1. Fork the repository.
2. Create a new branch for your feature.
3. Commit your changes.
4. Push the branch and create a pull request.

## License
This project is licensed under the MIT License.

## Contact
For questions or feature requests, reach out to **Khushi Sinha** at sinhakhushi0803@gmail.com.

