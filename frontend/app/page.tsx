import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <main className="bg-white min-h-screen">
      {/* ✅ Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center text-center bg-cover bg-center" style={{ backgroundImage: "url('/images/food-bg.jpg')" }}>
        <div className="bg-white/70 p-6 rounded-xl shadow-xl max-w-2xl mx-auto">
          <h1 className="text-5xl font-serif font-semibold text-gray-900 mb-4">Best food for your taste</h1>
          <p className="text-gray-700 mb-6">
            Discover delectable cuisine and unforgettable moments in our welcoming, culinary haven.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/book-table">
              <button className="bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:bg-red-700 transition">
                Book A Table
              </button>
            </Link>
            <Link href="/menu">
              <button className="border border-gray-700 text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                Explore Menu
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ✅ Menu Section */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-4xl font-serif font-semibold text-gray-900 mb-12">Browse Our Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <CategoryCard key={category.name} {...category} />
          ))}
        </div>
      </section>
    </main>
  );
}

const categories = [
  { name: 'Starters', icon: '/images/starters.jpg', link: '/menu/starters' },
  //{ name: 'Savory', icon: '/images/savoury.jpg', link: '/menu/savory' },
  { name: 'Main Course', icon: '/images/main-course.jpg', link: '/menu/main-course' },
  //{ name: 'Appetizers', icon: '/images/appetizers.jpg', link: '/menu/appetizers' },
  { name: 'Beverages', icon: '/images/beverages.jpg', link: '/menu/beverages' },
  { name: 'Desserts', icon: '/images/desserts.jpg', link: '/menu/desserts' },
];

interface CategoryCardProps {
  name: string;
  icon: string;
  link: string;
}

function CategoryCard({ name, icon, link }: CategoryCardProps) {
  return (
    <Link href={link} className="group border rounded-xl p-6 flex flex-col items-center space-y-4 shadow-sm hover:shadow-lg transition">
      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center">
        <Image src={icon} alt={name} width={40} height={40} />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-600 text-center">
        In the new era of technology we look in the future with certainty and pride for our life.
      </p>
      <p className="text-red-600 font-semibold text-sm mt-auto">Explore Menu</p>
    </Link>
  );
}
