import Link from 'next/link';
import { Search, ShoppingCart } from 'lucide-react';
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
      <div className="grid grid-cols-2 gap-4 mt-6 w-full">
        {categories.map((category) => (
          <CategoryCard key={category.name} {...category} />
        ))}
      </div>
    </div>
  );
}

const categories = [
  { name: 'Starters', imageUrl: '/images/starters.jpg', link: '/menu/starters' },
  { name: 'Savory', imageUrl: '/images/savoury.jpg', link: '/menu/savory' },
  { name: 'Main Course', imageUrl: '/images/main-course.jpg', link: '/menu/main-course' },
  { name: 'Appetizers', imageUrl: '/images/appetizers.jpg', link: '/menu/appetizers' },
  { name: 'Beverages', imageUrl: '/images/beverages.jpg', link: '/menu/beverages' },
  { name: 'Desserts', imageUrl: '/images/desserts.jpg', link: '/menu/desserts' },
];

interface CategoryCardProps {
  name: string;
  imageUrl: string;
  link: string;
}

