"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {/* ✅ Hero Section */}
      <div className="text-center p-6">
        <h1 className="text-4xl font-bold text-gray-800">
          Welcome to Our Restaurant 🍽️
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Delicious meals, quick service, and an amazing dining experience.
        </p>
      </div>

      {/* ✅ Menu Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        <CategoryCard name="Starters" link="/menu?category=starters" />
        <CategoryCard name="Main Course" link="/menu?category=main" />
        <CategoryCard name="Drinks" link="/menu?category=drinks" />
        <CategoryCard name="Desserts" link="/menu?category=desserts" />
      </div>

      {/* ✅ Call to Action */}
      <div className="mt-8">
        <Link
          href="/menu"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          View Menu & Order 🍔
        </Link>
      </div>
    </div>
  );
}

// ✅ Category Card Component
function CategoryCard({ name, link }: { name: string; link: string }) {
  return (
    <Link href={link}>
      <div className="p-4 bg-white shadow-lg rounded-lg text-center hover:bg-gray-200 transition">
        <p className="font-semibold">{name}</p>
      </div>
    </Link>
  );
}
