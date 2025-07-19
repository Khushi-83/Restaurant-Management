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

const MainCourse = () => {
  const [MainCourse, setMainCourse] = useState<FoodItem[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/food-items`)
      .then((res) => res.json())
      .then((data: FoodItem[]) => {
        const filteredItems = data.filter((item) => item.category === "Main Course");
        setMainCourse(filteredItems);
      })
      .catch((err) => console.error("Error fetching food items:", err));
  }, []);

  return (
    <div className="p-2 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Main Course</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
        {MainCourse.length > 0 ? (
          MainCourse.map((item) => <FoodCard key={item.id} item={item} />)
        ) : (
          <p>No Main Course available.</p>
        )}
      </div>
    </div>
  );
};

const FoodCard = ({ item }: { item: FoodItem }) => {
  const { addToCart } = useCart();

  return (
    <div className="border p-2 sm:p-4 rounded-lg shadow w-full flex flex-col items-center bg-white min-h-[180px] max-w-[160px] mx-auto">
      {/* Image Section */}
      <div className="w-full h-20 sm:h-36 relative">
        <Image
          src={item.image_url}
          alt={item.name}
          fill
          style={{ objectFit: 'cover' }}
          className="rounded-md"
        />
      </div>
      {/* Details Section */}
      <div className="w-full text-center mt-2 sm:mt-3">
        <h3 className="text-base sm:text-lg font-semibold line-clamp-1">{item.name}</h3>
        <p className="text-gray-600 text-sm">₹{item.price}</p>
        <p className="text-gray-500 text-xs">Available: {item.quantity}</p>
        <button 
          onClick={() => addToCart({
            ...item,
            id: item.id.toString(),
            tableNo: "1"
          })}
          className="mt-2 sm:mt-3 bg-blue-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded-md hover:bg-blue-600 transition text-xs sm:text-base"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default MainCourse;
