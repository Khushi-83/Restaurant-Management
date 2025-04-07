'use client';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll: () => void = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Navbar with scroll effect */}
      <nav className={cn(
        "fixed top-0 left-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-white/90 backdrop-blur-sm shadow-sm" : "bg-transparent"
      )}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-gray-900">Restaurant</Link>
          <div className="flex space-x-8">
            <Link href="/" className="text-gray-900 hover:text-red-600">Home</Link>
            <Link href="/feedback" className="text-gray-900 hover:text-red-600">Feedback</Link>
            <Link href="/chat" className="text-gray-900 hover:text-red-600">Chat</Link>
            <Link href="/order-status" className="text-gray-900 hover:text-red-600">Order Status</Link>
            <Link href="/cart" className="text-gray-900 hover:text-red-600">Cart</Link>
          </div>
        </div>
      </nav>

      {/* Full-page Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center text-center bg-cover bg-center" style={{ 
        backgroundImage: "url('/images/food-bg.jpg')",
        marginTop: '-64px', // Compensate for navbar height
        paddingTop: '64px' // Ensure content starts below navbar
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
              src="/images/delivery.jpg" 
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
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Bistro Bliss</h3>
            <p className="text-gray-400">
              In the new era of technology we look a in the future with certainty and pride to for our company and.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Pages</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-gray-400 hover:text-white">About</Link></li>
              <li><Link href="/menu" className="text-gray-400 hover:text-white">Menu</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white">Pricing</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
              <li><Link href="/delivery" className="text-gray-400 hover:text-white">Delivery</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Utility Pages</h4>
            <ul className="space-y-2">
              <li><Link href="/styleguide" className="text-gray-400 hover:text-white">Styleguide</Link></li>
              <li><Link href="/password" className="text-gray-400 hover:text-white">Password Protected</Link></li>
              <li><Link href="/404" className="text-gray-400 hover:text-white">404 Not Found</Link></li>
              <li><Link href="/licenses" className="text-gray-400 hover:text-white">Licenses</Link></li>
              <li><Link href="/changelog" className="text-gray-400 hover:text-white">Changelog</Link></li>
              <li><Link href="/more" className="text-gray-400 hover:text-white">View More</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                </svg>
              </Link>
              {/* Add other social icons similarly */}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>Copyright © 2023 Restaurant. All Rights Reserved</p>
        </div>
      </footer>
    </div>
  );
}

const categories = [
  { name: 'Starters', icon: '/images/starters.jpg', link: '/menu/starters' },
  { name: 'Main Course', icon: '/images/main-course.jpg', link: '/menu/main-course' },
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