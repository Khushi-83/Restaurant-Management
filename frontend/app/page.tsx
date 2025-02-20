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
  { name: 'Starters', imageUrl: '/starters.png', link: '/menu/starters' },
  { name: 'Savory', imageUrl: '/savory.png', link: '/menu/savory' },
  { name: 'Main Course', imageUrl: '/main-course.png', link: '/menu/main-course' },
  { name: 'Appetizers', imageUrl: '/appetizers.png', link: '/menu/appetizers' },
  { name: 'Beverages', imageUrl: '/beverages.png', link: '/menu/beverages' },
  { name: 'Desserts', imageUrl: '/desserts.png', link: '/menu/desserts' },
];

function CategoryCard({ name, imageUrl, link }: { name: string; imageUrl: string; link: string }) {
  return (
    <Link href={link} className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center">
      <Image src={imageUrl} alt={name} width={100} height={100} className="rounded-full" />
      <h2 className="mt-2 text-lg font-semibold">{name}</h2>
      <p className="text-purple-500 font-bold text-sm">see more</p>
    </Link>
  );
}
