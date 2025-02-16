'use client';

import { useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";
import "@/app/globals.css";
import Link from "next/link";
import { Menu, X } from "lucide-react"; // Icons for menu toggle

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <html lang="en">
      <head>
        <title>Restaurant Management</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-100">
        {/* ✅ Navbar */}
        <div className="bg-white shadow-md w-full px-6 py-4 flex items-center justify-between">
          {/* 🍽️ Restaurant Name / Logo */}
          <h1 className="text-xl font-semibold text-gray-800">Restaurant</h1>

          {/* 🍔 Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* 🖥️ Navbar Links (Desktop & Mobile) */}
          <nav
            className={`absolute md:relative top-16 left-0 w-full md:w-auto bg-white md:bg-transparent shadow-md md:shadow-none p-4 md:p-0 transition-all ${
              isOpen ? "block" : "hidden"
            } md:flex md:items-center md:justify-end`}
          >
            <NavigationMenu>
              <NavigationMenuList className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 text-lg font-medium">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/" className="text-gray-700 hover:text-blue-600">Home</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/menu" className="text-gray-700 hover:text-blue-600">Menu</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/orders" className="text-gray-700 hover:text-blue-600">Order Status</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/cart" className="text-gray-700 hover:text-blue-600">Cart</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link href="/chat" className="text-gray-700 hover:text-blue-600">Chat</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
        </div>

        {/* ✅ Page Content */}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
