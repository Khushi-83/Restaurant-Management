'use client'

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { socket, ensureSocketConnected } from '@/lib/socket'

type OrderStatus = 'Awaiting Payment' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled'

type OrderItem = {
  name: string
  quantity: number
  price: number
}

type Order = {
  order_id: string
  customer_name: string
  table_number: string | number
  items: OrderItem[]
  total_price: number
  status: OrderStatus
  created_at: string
}

export default function OrderStatusPage() {
  const [orderIdInput, setOrderIdInput] = useState<string>('')
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Prefill from last order if available
  useEffect(() => {
    if (typeof window === 'undefined') return
    const last = window.localStorage.getItem('lastOrderId') || ''
    if (last) {
      setOrderIdInput(last)
      setCurrentOrderId(last)
    }
  }, [])

  const fetchOrder = async (orderId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`)
      if (!res.ok) {
        throw new Error('Order not found')
      }
      const data: Order = await res.json()
      setOrder(data)
      // Persist for next visit
      if (typeof window !== 'undefined') {
        try { window.localStorage.setItem('lastOrderId', data.order_id) } catch {}
      }
    } catch (e) {
      setOrder(null)
      setError(e instanceof Error ? e.message : 'Failed to fetch order')
    } finally {
      setLoading(false)
    }
  }

  // Fetch when currentOrderId changes
  useEffect(() => {
    if (!currentOrderId) return
    fetchOrder(currentOrderId)
  }, [currentOrderId])

  // Register global listeners as soon as we know the target order id
  useEffect(() => {
    if (!currentOrderId) return
    let pollTimer: NodeJS.Timeout | null = null
    ;(async () => {
      try {
        await ensureSocketConnected()
        const refetch = () => fetchOrder(currentOrderId)
        const onStatusUpdate = (payload: { orderId?: string; order?: { order_id?: string } }) => {
          const matches = payload?.orderId === currentOrderId || payload?.order?.order_id === currentOrderId
          if (matches) refetch()
        }
        socket.on('order_status_update', onStatusUpdate)
        socket.on('order_cancelled', onStatusUpdate)
        pollTimer = setInterval(refetch, 15000)
        return () => {
          socket.off('order_status_update', onStatusUpdate)
          socket.off('order_cancelled', onStatusUpdate)
          if (pollTimer) clearInterval(pollTimer)
        }
      } catch {
        // ignore
      }
    })()
  }, [currentOrderId])

  // Live updates via sockets for this order with reconnection + polling fallback
  useEffect(() => {
    if (!order || !currentOrderId) return
    let cleanup = () => {}
    let pollTimer: NodeJS.Timeout | null = null
    ;(async () => {
      try {
        await ensureSocketConnected()
        // Join the table room for targeted updates
        socket.emit('join_table', order.table_number)
        const refetch = () => fetchOrder(currentOrderId)

        const onStatusUpdate = (payload: { orderId?: string; order?: { order_id?: string } }) => {
          const matches = payload?.orderId === currentOrderId || payload?.order?.order_id === currentOrderId
          if (matches) refetch()
        }
        // General and table-scoped events
        socket.on('order_status_update', onStatusUpdate)
        socket.on('table_order_status_update', onStatusUpdate)
        socket.on('order_cancelled', onStatusUpdate)
        socket.on('table_order_update', () => refetch())

        // Re-join on reconnect
        const onReconnect = () => {
          socket.emit('join_table', order.table_number)
        }
        socket.on('connect', onReconnect)
        socket.on('reconnect', onReconnect)

        // Polling fallback every 12s
        pollTimer = setInterval(refetch, 12000)
        cleanup = () => {
          socket.off('order_status_update', onStatusUpdate)
          socket.off('table_order_status_update', onStatusUpdate)
          socket.off('order_cancelled', onStatusUpdate)
          socket.off('table_order_update', refetch)
          socket.off('connect', onReconnect)
          socket.off('reconnect', onReconnect)
          if (pollTimer) clearInterval(pollTimer)
        }
      } catch {
        // ignore
      }
    })()
    return () => cleanup()
  }, [order, currentOrderId])

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'Preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Ready':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // We render simple badges; no icon helpers needed

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <Badge className="bg-red-200 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
          Track your Order
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-2">
          Order Status
        </h1>
        <p className="text-gray-600">Enter your Order ID to see live updates</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-4 bg-white/80">
          <div className="flex gap-3">
            <Input
              placeholder="Enter Order ID (e.g., RETRO-...-12)"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
            />
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!orderIdInput.trim()) return
                setCurrentOrderId(orderIdInput.trim())
                if (typeof window !== 'undefined') {
                  try { window.localStorage.setItem('lastOrderId', orderIdInput.trim()) } catch {}
                }
              }}
            >
              Track
            </Button>
          </div>
        </Card>

        {loading && (
          <p className="text-center text-gray-500">Loading...</p>
        )}

        {error && !loading && (
          <Card className="p-6 border bg-white shadow-sm rounded-2xl text-center text-red-600">
            {error}
          </Card>
        )}

        {!loading && !error && order && (
          <motion.div
            key={order.order_id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="p-6 border-2 border-gray-200 bg-white/80 backdrop-blur-sm shadow-xl rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">#{order.order_id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Table {order.table_number} • {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right font-bold text-green-600">₹{order.total_price}</div>
              </div>
              <div className="space-y-2">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border">
                    <div className="font-medium text-gray-800">{item.name} × {item.quantity}</div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-800">₹{item.price}</div>
                      <div className="text-sm text-gray-500">Total: ₹{item.price * item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
  