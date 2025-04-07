'use client'

export default function OrderStatusPage() {
    const orders = [
      { id: 1, name: "Paneer Tikka", status: "Preparing" },
      { id: 2, name: "Mango Lassi", status: "Delivered" },
    ]
  
    return (
      <div className="p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Your Order Status</h2>
        <ul className="space-y-4">
          {orders.map(order => (
            <li key={order.id} className="border p-4 rounded-lg shadow-sm bg-white">
              <div className="flex justify-between">
                <span className="font-medium">{order.name}</span>
                <span className={`text-sm ${order.status === 'Delivered' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )
  }
  