'use client';

import Link from 'next/link';
import Image from 'next/image';

const categories = [
  { name: 'Starters', imageUrl: '/starters.png' },
  { name: 'Savory', imageUrl: '/savory.png' },
  { name: 'Main Course', imageUrl: '/main-course.png' },
  { name: 'Appetizers', imageUrl: '/appetizers.png' },
  { name: 'Beverages', imageUrl: '/beverages.png' },
  { name: 'Desserts', imageUrl: '/desserts.png' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="text-xl font-bold text-center mb-6">Delicious food for you</header>
      
      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Link key={category.name} href={`/menu/${category.name.toLowerCase()}`}>
            <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center cursor-pointer hover:shadow-lg">
              <Image
                src={category.imageUrl}
                alt={category.name}
                width={100}
                height={100}
                className="object-cover rounded-full"
              />
              <h2 className="mt-2 text-lg font-semibold">{category.name}</h2>
              <p className="text-purple-500 text-sm mt-1">see more</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
