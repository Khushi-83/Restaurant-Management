'use client';

import { useCart } from '@/contexts/cartContext';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ChefHat,
  Clock
} from 'lucide-react';
import { useState } from 'react';

export default function CartPage() {
  const { cart, removeFromCart, clearCart, totalItems, totalPrice, updateQuantity } = useCart();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearCart = async () => {
    setIsClearing(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Animation delay
    clearCart();
    setIsClearing(false);
  };

  const estimatedTime = 30; // minutes

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6">
      {/* Hero Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center bg-red-100 px-4 py-2 rounded-full mb-4">
          <span className="text-red-800 text-sm font-medium">Your Shopping Cart</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-2">
          {totalItems === 0 ? "Your Cart is Empty" : `Your Cart (${totalItems})`}
        </h1>
        <p className="text-gray-600">
          {totalItems === 0 
            ? "Add some delicious items to your cart" 
            : "Review your selected items and proceed to checkout"}
        </p>
      </div>

      <div className="max-w-6xl mx-auto">
        {cart.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="mb-6">
              <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 mb-6">Your cart is feeling a bit empty</p>
            </div>
            <Link 
              href="/#menu" 
              className="inline-flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/#menu';
                document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Browse our menu
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1">
              <Card className="bg-white shadow-sm rounded-3xl p-6">
                <div className="mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900">Your Cart ({totalItems})</h1>
                  <p className="text-gray-500 mt-1">Review your selected items</p>
                </div>
                <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                  <AnimatePresence>
                    {cart.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                      >
                        <div className="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                          {/* Image */}
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-100">
                            <Image
                              src={item.image_url || '/images/default-food.jpg'}
                              alt={item.name || 'Food item'}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover transition-transform group-hover:scale-110"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>

                          {/* Details */}
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold text-lg">{item.name}</h3>
                                <p className="text-gray-600">₹{item.price} per item</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeFromCart(item.id)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                            </div>

                            {/* Quantity Controls */}
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex items-center border rounded-lg">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                                  disabled={item.quantity === 1}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="font-medium">
                                ₹{item.price * (item.quantity ?? 1)}
                              </p>
                            </div>
                          </div>
                        </div>
                        {index < cart.length - 1 && <Separator className="my-4" />}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </ScrollArea>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="md:w-[380px]">
              <Card className="bg-white shadow-sm rounded-3xl p-6 sticky top-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>₹40</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹{Math.round(totalPrice * 0.05)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{totalPrice + 40 + Math.round(totalPrice * 0.05)}</span>
                  </div>

                  {/* Estimated Time */}
                  <div className="bg-gray-50 rounded-xl p-4 mt-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <Clock className="h-5 w-5" />
                      <span>Estimated Delivery Time</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-5 w-5 text-red-600" />
                      <span className="font-medium">{estimatedTime} minutes</span>
                    </div>
                  </div>

                  <div className="space-y-3 mt-6">
                    <Link href="/checkout" className="w-full">
                      <Button 
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl font-medium"
                      >
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      className="w-full py-6 rounded-xl"
                      onClick={handleClearCart}
                      disabled={isClearing}
                    >
                      {isClearing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </motion.div>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-5 w-5" />
                          Clear Cart
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}