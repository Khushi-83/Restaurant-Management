'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Home, Utensils, ShoppingBag, User } from 'lucide-react';
import Image from 'next/image';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      {/* ✅ Header */}
      <header className="w-full flex justify-between items-center py-4">
        <h1 className="text-xl font-bold">Delicious food for you</h1>
        <ShoppingCart className="w-6 h-6 text-gray-600" />
      </header>

      {/* ✅ Search Bar */}
      <div className="w-full flex items-center bg-white p-2 rounded-lg shadow-md mt-4">
        <Search className="w-5 h-5 text-gray-500 ml-2" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 outline-none bg-transparent"
        />
      </div>

      {/* ✅ Categories */}
      <div className="w-full flex justify-around mt-4">
        {['Food', 'Drinks', 'Snacks', 'Sauces'].map((category) => (
          <button key={category} className="px-4 py-2 text-gray-700 font-medium border-b-2 border-transparent hover:border-purple-500">
            {category}
          </button>
        ))}
      </div>

      {/* ✅ Featured Items */}
      <div className="grid grid-cols-2 gap-4 mt-6 w-full">
        <FoodCard name="Veggie Tomato Mix" price="₹200" imageUrl="/food1.png" />
        <FoodCard name="Spicy Chicken" price="₹250" imageUrl="/food2.png" />
        <FoodCard name="Egg Meal" price="₹300" imageUrl="/food3.png" />
        <FoodCard name="Chicken Rice" price="₹350" imageUrl="/food4.png" />
      </div>

      {/* ✅ Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white flex justify-around py-3 shadow-lg border-t">
        <NavItem href="/" icon={<Home className="w-6 h-6" />} />
        <NavItem href="/menu" icon={<Utensils className="w-6 h-6" />} />
        <NavItem href="/cart" icon={<ShoppingBag className="w-6 h-6" />} />
        <NavItem href="/profile" icon={<User className="w-6 h-6" />} />
      </nav>
    </div>
  );
}

// ✅ Food Card Component
function FoodCard({ name, price, imageUrl }: { name: string; price: string; imageUrl: string }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
      {/* ✅ Fixed Image Size */}
      <Image 
        src={imageUrl} 
        alt={name} 
        width={96}  
        height={96} 
        className="object-cover rounded-full"
      />
      <h2 className="mt-2 text-lg font-semibold">{name}</h2>
      <p className="text-purple-500 font-bold">{price}</p>
      <button className="mt-2 px-4 py-2 bg-purple-500 text-white rounded-lg">Add to Cart</button>
    </div>
  );
}

// ✅ Navigation Item Component
function NavItem({ href, icon }: { href: string; icon: JSX.Element }) {
  return (
    <Link href={href} className="text-gray-500 hover:text-purple-500">
      {icon}
    </Link>
  );
}
