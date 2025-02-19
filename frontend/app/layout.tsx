'use client';

import { useState } from "react";
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, NavigationMenuLink } from "@/components/ui/navigation-menu";
import "@/app/globals.css";
import Link from "next/link";
import { Menu, X } from "lucide-react";

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
        <div className="bg-white shadow-md w-full px-6 py-4 flex items-center">
          {/* 🍽️ Restaurant Name / Logo */}
          <h1 className="text-xl font-semibold text-gray-800">Restaurant</h1>

          {/* 🖥️ Navbar Links (Desktop) */}
          <nav className="ml-auto hidden md:flex items-center space-x-6">
            <NavigationMenu>
              <NavigationMenuList className="flex space-x-6 text-lg font-medium">
                {["Home", "Menu", "Order Status", "Cart", "Chat"].map((item, index) => (
                  <NavigationMenuItem key={index}>
                    <NavigationMenuLink asChild>
                      <Link href={`/${item.toLowerCase().replace(" ", "")}`} className="text-gray-700 hover:text-blue-600">
                        {item}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* 🍔 Mobile Menu Button */}
          <button className="md:hidden ml-auto" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* ✅ Mobile Dropdown Menu */}
        {isOpen && (
          <div className="bg-white shadow-md w-full md:hidden flex flex-col items-center space-y-4 py-4">
            {["Home", "Menu", "Order Status", "Cart", "Chat"].map((item, index) => (
              <Link key={index} href={`/${item.toLowerCase().replace(" ", "")}`} className="text-gray-700 hover:text-blue-600 text-lg">
                {item}
              </Link>
            ))}
          </div>
        )}

        {/* ✅ Page Content */}
        <main className="p-6">{children}</main>
      </body>
    </html>
  );
}
