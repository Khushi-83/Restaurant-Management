'use client'

import { useEffect, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ChefHat, CheckCircle2, Clock, XCircle } from 'lucide-react'
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
  const [tableInput, setTableInput] = useState<string>('')
  const [currentTable, setCurrentTable] = useState<string | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Prefill from last table if available
  useEffect(() => {
    if (typeof window === 'undefined') return
    const lastTable = window.localStorage.getItem('tableNo') || ''
    if (lastTable) {
      setTableInput(lastTable)
      setCurrentTable(lastTable)
    }
  }, [])

  const fetchOrders = async (tableNumber: string | number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/table/${tableNumber}`)
      if (!res.ok) throw new Error('No orders found for this table')
      const data: Order[] = await res.json()
      setOrders(Array.isArray(data) ? data : [])
      // Persist for next visit
      if (typeof window !== 'undefined') {
        try { window.localStorage.setItem('tableNo', String(tableNumber)) } catch {}
      }
    } catch (e) {
      setOrders([])
      setError(e instanceof Error ? e.message : 'Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!currentTable) return
    fetchOrders(currentTable)
  }, [currentTable])

  // Live updates for a table with reconnect + polling fallback
  useEffect(() => {
    if (!currentTable) return
    let cleanup = () => {}
    let pollTimer: NodeJS.Timeout | null = null
    ;(async () => {
      try {
        await ensureSocketConnected()
        socket.emit('join_table', currentTable)
        const refetch = () => fetchOrders(currentTable)

        const onTableUpdate = () => {
          // Any event for this table should trigger refetch
          refetch()
        }
        socket.on('table_order_update', onTableUpdate)
        socket.on('table_order_status_update', onTableUpdate)
        // also listen to global cancel and status updates and refetch
        const onGlobalStatus = (payload: { order?: { table_number?: string | number } }) => {
          if (payload?.order?.table_number && String(payload.order.table_number) === String(currentTable)) {
            refetch()
          }
        }
        socket.on('order_status_update', onGlobalStatus)
        socket.on('order_cancelled', onGlobalStatus)

        // re-join on reconnect
        const onReconnect = () => socket.emit('join_table', currentTable)
        socket.on('connect', onReconnect)
        socket.on('reconnect', onReconnect)

        // Polling fallback every 12s
        pollTimer = setInterval(refetch, 12000)
        cleanup = () => {
          socket.off('table_order_update', onTableUpdate)
          socket.off('table_order_status_update', onTableUpdate)
          socket.off('order_status_update', onGlobalStatus)
          socket.off('order_cancelled', onGlobalStatus)
          socket.off('connect', onReconnect)
          socket.off('reconnect', onReconnect)
          if (pollTimer) clearInterval(pollTimer)
        }
      } catch {
        // ignore
      }
    })()
    return () => cleanup()
  }, [currentTable])

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
  const renderStatusBadge = (status: OrderStatus) => {
    const colorClasses = getStatusColor(status)
    const Icon =
      status === 'Preparing' ? ChefHat :
      status === 'Ready' || status === 'Delivered' ? CheckCircle2 :
      status === 'Cancelled' ? XCircle : Clock
    return (
      <span className={`inline-flex items-center gap-1.5 border ${colorClasses} px-2.5 py-1 rounded-full text-xs font-semibold`}
        aria-label={`Order status: ${status}`}>
        <Icon className="h-4 w-4" />
        {status}
      </span>
    )
  }

  const statusToStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'Preparing': return 0;
      case 'Ready': return 1;
      case 'Delivered': return 2;
      default: return -1; // Awaiting Payment / Cancelled
    }
  }

  const renderStatusStepper = (status: OrderStatus) => {
    if (status === 'Cancelled') {
      return (
        <div className="mt-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle className="h-4 w-4" /> Order was cancelled
        </div>
      )
    }

    const active = statusToStepIndex(status)
    const steps: { key: OrderStatus; label: string; Icon: React.ElementType }[] = [
      { key: 'Preparing', label: 'Preparing', Icon: ChefHat },
      { key: 'Ready', label: 'Ready', Icon: CheckCircle2 },
      { key: 'Delivered', label: 'Delivered', Icon: CheckCircle2 },
    ]

    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          {steps.map((s, idx) => {
            const isActive = active >= idx
            const isCurrent = active === idx
            const baseCircle = 'flex items-center justify-center h-8 w-8 rounded-full border text-xs'
            const activeCls = idx === 0
              ? 'border-yellow-400 bg-yellow-100 text-yellow-800'
              : idx === 1
              ? 'border-blue-400 bg-blue-100 text-blue-800'
              : 'border-green-400 bg-green-100 text-green-800'
            const inactiveCls = 'border-gray-300 bg-gray-100 text-gray-500'
            const circleCls = `${baseCircle} ${isActive ? activeCls : inactiveCls}`
            return (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center min-w-[72px]">
                  <div className={circleCls} aria-current={isCurrent ? 'step' : undefined}>
                    <s.Icon className="h-4 w-4" />
                  </div>
                  <div className={`mt-1 text-[11px] font-medium ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>{s.label}</div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 ${active > idx ? 'bg-green-400' : 'bg-gray-200'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <Badge className="bg-red-200 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
          Track your Order
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-2">
          Order Status
        </h1>
        <p className="text-gray-600">Enter your Table Number to see live updates</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <Card className="p-4 bg-white/80">
          <div className="flex gap-3">
            <Input
              placeholder="Enter Table Number (e.g., 12)"
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              type="number"
              min={1}
            />
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!tableInput.trim()) return
                setCurrentTable(tableInput.trim())
                if (typeof window !== 'undefined') {
                  try { window.localStorage.setItem('tableNo', tableInput.trim()) } catch {}
                }
              }}
            >
              Track Table
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

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.flatMap((order) => (order.items || []).map((item, idx) => ({ order, item, key: `${order.order_id}-${idx}` }))).map(({ order, item, key }) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-6 border border-gray-200 bg-white shadow-lg rounded-2xl">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 truncate">{item.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border">#{String(order.order_id)}</span>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Ordered at {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Quantity: {item.quantity}</div>
                      <div className="font-semibold text-gray-900">₹{item.price}</div>
                      <div className="mt-2">{renderStatusBadge(order.status)}</div>
                    </div>
                  </div>

                  {order.status === 'Preparing' && (
                    <div className="mt-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Estimated time: 15-20 minutes</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-2 bg-yellow-500 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
  