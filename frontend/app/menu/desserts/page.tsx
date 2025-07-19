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
    <div className="p-2 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Desserts</h1>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
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
    <div className="border p-2 sm:p-4 rounded-lg shadow w-full flex flex-col items-center bg-white min-h-[180px] max-w-[160px] mx-auto hover:shadow-lg transition-shadow">
      {/* Image Section */}
      <div className="w-full h-20 sm:h-36 relative mb-2 sm:mb-3">
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
        <h3 className="text-base sm:text-lg font-semibold line-clamp-1">{item.name}</h3>
        <p className="text-gray-600 text-sm">₹{item.price.toFixed(2)}</p>
        <p className="text-gray-500 text-xs sm:text-sm">Qty: {item.quantity}</p>
        <button 
          onClick={() => addToCart({
            ...item,
            id: item.id.toString(),
            tableNo: "1"
          })}
          className="mt-2 sm:mt-3 w-full bg-blue-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-blue-600 transition text-xs sm:text-base disabled:bg-gray-300"
          disabled={item.quantity <= 0}
        >
          {item.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default Desserts;