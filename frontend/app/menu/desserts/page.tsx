"use client"
import { useEffect, useState } from "react";
import Image from "next/image";
import { useCart } from "@/contexts/cartContext";

type FoodItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
};

const Desserts = () => {
  const [desserts, setDesserts] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDesserts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/food-items`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch: ${response.status} - ${errorText}`);
        }

        const data: FoodItem[] = await response.json();
        const filteredItems = data.filter((item) => item.category === "Desserts");
        setDesserts(filteredItems);
      } catch (err) {
        console.error("Error fetching food items:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch desserts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesserts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Desserts</h1>
      
      {isLoading ? (
        <div className="text-center py-8">
          <p>Loading desserts...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {desserts.length > 0 ? (
            desserts.map((item) => <FoodCard key={item.id} item={item} />)
          ) : (
            <p className="text-center w-full">No desserts available.</p>
          )}
        </div>
      )}
    </div>
  );
};

const FoodCard = ({ item }: { item: FoodItem }) => {
  const { addToCart } = useCart();

  return (
    <div className="border p-4 rounded-lg shadow-md w-56 flex flex-col items-center bg-white hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="w-full h-36 relative mb-3">
        <Image
          src={item.image_url || '/images/default-food.jpg'}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-md"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/default-food.jpg';
          }}
        />
      </div>

      {/* Details Section */}
      <div className="w-full text-center">
        <h3 className="text-lg font-semibold line-clamp-1">{item.name}</h3>
        <p className="text-gray-600">₹{item.price.toFixed(2)}</p>
        <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
        
        {/* Add Button */}
        <button 
          onClick={() => addToCart({
            ...item,
            id: item.id.toString(),
            tableNo: "1" // Default table number
          })}
          className="mt-3 w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition disabled:bg-gray-300"
          disabled={item.quantity <= 0}
        >
          {item.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

