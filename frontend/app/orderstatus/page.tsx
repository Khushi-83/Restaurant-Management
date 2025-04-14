'use client'

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Clock, CheckCircle2, ChefHat, Truck, AlertCircle } from "lucide-react"

type OrderStatus = "Preparing" | "Ready" | "On the Way" | "Delivered" | "Cancelled"

interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
  status: OrderStatus
  estimatedTime?: string
  orderNumber: string
  timestamp: string
}

export default function OrderStatusPage() {
  const orders: OrderItem[] = [
    {
      id: 1,
      name: "Paneer Tikka",
      quantity: 2,
      price: 299,
      status: "Preparing",
      estimatedTime: "15-20",
      orderNumber: "ORD-001",
      timestamp: "2024-03-25T14:30:00"
    },
    {
      id: 2,
      name: "Mango Lassi",
      quantity: 1,
      price: 129,
      status: "Delivered",
      orderNumber: "ORD-002",
      timestamp: "2024-03-25T14:15:00"
    },
    {
      id: 3,
      name: "Butter Chicken",
      quantity: 1,
      price: 399,
      status: "Ready",
      orderNumber: "ORD-003",
      timestamp: "2024-03-25T14:45:00"
    }
  ]

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "Preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "Ready":
        return "bg-blue-100 text-blue-800 border-blue-300"
      case "On the Way":
        return "bg-purple-100 text-purple-800 border-purple-300"
      case "Delivered":
        return "bg-green-100 text-green-800 border-green-300"
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "Preparing":
        return <ChefHat className="h-5 w-5" />
      case "Ready":
        return <CheckCircle2 className="h-5 w-5" />
      case "On the Way":
        return <Truck className="h-5 w-5" />
      case "Delivered":
        return <CheckCircle2 className="h-5 w-5" />
      case "Cancelled":
        return <AlertCircle className="h-5 w-5" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center mb-10">
      <Badge className="bg-red-200 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
          Track your Order
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-2">
          Order Status
        </h1>
        <p className="text-gray-600">
          Track the status of your orders in real-time
        </p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {orders.map((order, index) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-6 border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{order.name}</h3>
                    <Badge variant="outline" className="text-gray-600">
                      #{order.orderNumber}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Ordered at {formatTime(order.timestamp)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Quantity: {order.quantity}</div>
                    <div className="text-lg font-semibold">₹{order.price}</div>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={`px-3 py-1.5 text-sm font-medium flex items-center gap-1.5 ${getStatusColor(order.status)}`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status}
                  </Badge>
                </div>
              </div>

              {order.status === "Preparing" && order.estimatedTime && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span>Estimated time: {order.estimatedTime} minutes</span>
                  </div>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="bg-yellow-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 1.5 }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
  