'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Clock, Star, Truck } from 'lucide-react';

// Define the category interface
interface Category {
  name: string;
  icon: string;
  link: string;
}

// Define the categories array
const categories: Category[] = [
  { name: 'Starters', icon: '/images/starters.svg', link: '/menu/starters' },
  { name: 'Main Course', icon: '/images/main-course.svg', link: '/menu/main-course' },
  { name: 'Beverages', icon: '/images/beverages.svg', link: '/menu/beverages' },
  { name: 'Desserts', icon: '/images/desserts.svg', link: '/menu/desserts' },
];

// Define the CategoryCard props interface
interface CategoryCardProps {
  name: string;
  icon: string;
  link: string;
}

export default function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section with Enhanced Design */}
      <section className="relative min-h-screen w-full flex items-center justify-center text-center bg-cover bg-fixed bg-center overflow-hidden px-4 sm:px-6" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.65)), url('/images/food-bg.jpg')"
        }}
      >
        <div className="w-full max-w-2xl mx-auto">
          <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 text-white text-sm font-medium">
            Welcome to Our Restaurant
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-semibold text-white mb-4 tracking-tight leading-tight">
            Best food for your taste
          </h1>
          <p className="text-base sm:text-lg text-gray-200 mb-8 max-w-xl mx-auto">
            Discover delectable cuisine and unforgettable moments in our welcoming, culinary haven.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 px-4">
            <Link href="/bookings" className="w-full sm:w-auto">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 transform transition-all duration-300 hover:scale-105 w-full">
                Book A Table
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#menu" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10 transform transition-all duration-300 hover:scale-105 w-full">
                Explore Menu
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative group">
              <Image 
                src="/images/food-bg.jpeg" 
                alt="Fast food delivery" 
                width={600} 
                height={400}
                className="rounded-2xl shadow-xl transform transition-all duration-500 group-hover:scale-[1.02] w-full"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-lg hidden sm:block">
                <Badge variant="secondary" className="mb-2">Fast Delivery</Badge>
                <p className="text-sm font-medium">30 mins or free</p>
              </div>
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-4 sm:mb-6">
                Fastest Food Delivery in City
              </h2>
              <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
                Experience lightning-fast delivery with our efficient service.
              </p>
              <div className="space-y-4 sm:space-y-6">
                <Card className="transform transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="flex items-center p-4">
                    <div className="bg-red-100 p-3 rounded-full mr-4 flex-shrink-0">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Quick Delivery</h3>
                      <p className="text-sm text-gray-600">Delivery within 30 minutes</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="transform transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="flex items-center p-4">
                    <div className="bg-red-100 p-3 rounded-full mr-4">
                      <Star className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Best Offers</h3>
                      <p className="text-sm text-gray-600">Best prices guaranteed</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="transform transition-all duration-300 hover:scale-[1.02]">
                  <CardContent className="flex items-center p-4">
                    <div className="bg-red-100 p-3 rounded-full mr-4">
                      <Truck className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Online Services</h3>
                      <p className="text-sm text-gray-600">Track your order live</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section with Enhanced Cards */}
      <section id="menu" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center justify-center bg-gray-100 px-4 py-2 rounded-full mb-4 text-gray-800 text-sm font-medium">
              Our Menu
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-4">
              Browse Our Menu
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.name} {...category} />
            ))}
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-white py-16 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-4">Bistro Bliss</h3>
            <p className="text-gray-400">
              Crafting unforgettable dining experiences with passion and innovation.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['About', 'Menu', 'Pricing', 'Contact'].map((item) => (
                <li key={item}>
                  <Link 
                    href={`/${item.toLowerCase()}`} 
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Opening Hours</h4>
            <ul className="space-y-2 text-gray-400">
              <li>Monday - Friday: 9AM - 10PM</li>
              <li>Saturday - Sunday: 10AM - 11PM</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe for updates and offers</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email" 
                className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300"
              />
              <Button variant="secondary" className="hover:scale-105 transition-transform duration-300">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400">© {new Date().getFullYear()} Restaurant. All Rights Reserved</p>
            <div className="flex gap-4 text-gray-400">
              <Link 
                href="/terms&conditions" 
                className="hover:text-white transition-duration-300"
              >
                Terms & Conditions
              </Link>
              <span>•</span>
              <Link 
                href="/privacy" 
                className="hover:text-white transition-duration-300"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CategoryCard({ name, icon, link }: CategoryCardProps) {
  return (
    <Link href={link}>
      <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardContent className="p-6 flex flex-col items-center space-y-4">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center group-hover:bg-red-50 transition-colors duration-300">
            <Image 
              src={icon} 
              alt={name} 
              width={40} 
              height={40} 
              className="object-contain group-hover:scale-110 transition-transform duration-300" 
            />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
          <p className="text-sm text-gray-600 text-center">
            Explore our delicious selection of {name.toLowerCase()}
          </p>
          <Badge variant="secondary" className="group-hover:bg-red-100 transition-colors duration-300">
            Explore Menu
            <ChevronRight className="ml-1 h-4 w-4" />
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}