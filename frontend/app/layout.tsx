'use client';

import { useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";
import "@/app/globals.css";
import Link from "next/link";
import { Menu, X, ShoppingCart } from "lucide-react";
import { CartProvider, useCart } from '@/contexts/cartContext';
import Notification from "@/components/Notifications";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CartProvider>
      <html lang="en">
        <head>
          <title>Restaurant Management</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="bg-gray-100">
          {/* Navbar */}
          <div className="bg-white shadow-md w-full px-6 py-4 flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">Restaurant</h1>

            {/* Desktop Navigation */}
            <nav className="ml-auto hidden md:flex items-center space-x-6">
              <DesktopNavigation />
            </nav>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden ml-auto" 
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {isOpen && <MobileNavigation closeMenu={() => setIsOpen(false)} />}

          {/* Main Content */}
          <main className="p-6">{children}</main>

          {/* Notification System */}
          <NotificationWrapper />
        </body>
      </html>
    </CartProvider>
  );
}

// Desktop Navigation
function DesktopNavigation() {
  const { totalItems } = useCart();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Feedback", href: "/feedback" },
    { name: "Chat", href: "/chat" },
    { name: "Order Status", href: "/orderstatus" },
    { name: "Cart", href: "/cart" },
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList className="flex space-x-6 text-lg font-medium items-center">
        {navItems.map((item, index) => (
          <NavigationMenuItem key={index}>
            <NavigationMenuLink asChild>
              <Link
                href={item.href}
                className="text-gray-700 hover:text-blue-600 flex items-center relative"
              >
                {item.name === "Cart" ? (
                  <>
                    <ShoppingCart className="mr-1 h-5 w-5" />
                    <span className="relative">
                      <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                      Cart
                    </span>
                  </>
                ) : (
                  item.name
                )}
              </Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// Mobile Navigation
function MobileNavigation({ closeMenu }: { closeMenu: () => void }) {
  const { totalItems } = useCart();

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Feedback", href: "/feedback" },
    { name: "Chat", href: "/chat" },
    { name: "Order Status", href: "/orderstatus" },
    { name: "Cart", href: "/cart" },
  ];

  return (
    <div className="bg-white shadow-md w-full md:hidden flex flex-col items-center space-y-4 py-4">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          onClick={closeMenu}
          className="text-gray-700 hover:text-blue-600 text-lg flex items-center relative"
        >
          {item.name === "Cart" ? (
            <>
              <ShoppingCart className="mr-1 h-5 w-5" />
              <span className="relative">
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
                Cart
              </span>
            </>
          ) : (
            item.name
          )}
        </Link>
      ))}
    </div>
  );
}

// Notification Wrapper Component
function NotificationWrapper() {
  const { notification, showNotification } = useCart();

  return (
    <Notification 
      message={notification || ""} 
      show={!!notification} 
      onClose={() => showNotification("")} 
    />
  );
}
