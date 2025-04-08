'use client';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <div className="relative pt-16"> {/* Push content below fixed navbar */}
      {/* Navbar with scroll effect */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
      )}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">Restaurant</Link>
          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-900 hover:text-red-600">Home</Link>
            <Link href="/feedback" className="text-gray-900 hover:text-red-600">Feedback</Link>
            <Link href="/chat" className="text-gray-900 hover:text-red-600">Chat</Link>
            <Link href="/order-status" className="text-gray-900 hover:text-red-600">Order Status</Link>
            <Link href="/cart" className="text-gray-900 hover:text-red-600">Cart</Link>
          </div>
          <button onClick={toggleMenu} className="md:hidden text-gray-900">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden px-6 pb-4 flex flex-col space-y-4 bg-white shadow-md">
            <Link href="/" className="text-gray-900 hover:text-red-600">Home</Link>
            <Link href="/feedback" className="text-gray-900 hover:text-red-600">Feedback</Link>
            <Link href="/chat" className="text-gray-900 hover:text-red-600">Chat</Link>
            <Link href="/order-status" className="text-gray-900 hover:text-red-600">Order Status</Link>
            <Link href="/cart" className="text-gray-900 hover:text-red-600">Cart</Link>
          </div>
        )}
      </nav>

      {/* Full-page Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center text-center bg-cover bg-center" style={{ 
        backgroundImage: "url('/images/food-bg.jpg')",
        marginTop: '-64px',
        paddingTop: '64px'
      }}>
        <div className="bg-white/70 p-8 rounded-xl shadow-xl max-w-2xl mx-4">
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-gray-900 mb-4">Best food for your taste</h1>
          <p className="text-lg text-gray-700 mb-8">
            Discover delectable cuisine and unforgettable moments in our welcoming, culinary haven.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/book-table">
              <button className="bg-red-600 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:bg-red-700 transition">
                Book A Table
              </button>
            </Link>
            <Link href="/menu">
              <button className="border border-gray-700 text-gray-800 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                Explore Menu
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Fast Delivery Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Image 
              src="/images/food-bg.jpeg" 
              alt="Fast food delivery" 
              width={600} 
              height={400}
              className="rounded-xl shadow-lg"
            />
          </div>
          <div>
            <h2 className="text-4xl font-serif font-semibold text-gray-900 mb-6">Fastest Food Delivery in City</h2>
            <p className="text-lg text-gray-700 mb-8">
              Our visual designer lets you quickly and of drag a down your way to customapps for both keep desktop.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center">
                <span className="bg-red-100 p-2 rounded-full mr-4">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                <span className="text-lg">Delivery within 30 minutes</span>
              </li>
              <li className="flex items-center">
                <span className="bg-red-100 p-2 rounded-full mr-4">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                <span className="text-lg">Best Offer & Prices</span>
              </li>
              <li className="flex items-center">
                <span className="bg-red-100 p-2 rounded-full mr-4">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </span>
                <span className="text-lg">Online Services Available</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-semibold text-gray-900 mb-6 text-center">Browse Our Menu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        ...
      </footer>
    </div>
  );
}

const categories = [
  { name: 'Starters', icon: '/images/starters.svg', link: '/menu/starters' },
  { name: 'Main Course', icon: '/images/main-course.svg', link: '/menu/main-course' },
  { name: 'Beverages', icon: '/images/beverages.svg', link: '/menu/beverages' },
  { name: 'Desserts', icon: '/images/desserts.svg', link: '/menu/desserts' },
];

interface CategoryCardProps {
  name: string;
  icon: string;
  link: string;
}

function CategoryCard({ name, icon, link }: CategoryCardProps) {
  return (
    <Link href={link} className="group border rounded-xl p-6 flex flex-col items-center space-y-4 shadow-sm hover:shadow-lg transition hover:-translate-y-1">
      <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center">
        <Image src={icon} alt={name} width={40} height={40} className="object-contain" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-600 text-center">
        In the new era of technology we look in the future with certainty and pride for our life.
      </p>
      <p className="text-red-600 font-semibold text-sm mt-auto">Explore Menu</p>
    </Link>
  );
}
