"use client"
import { useEffect, useState } from "react";
import Image from "next/image";

type FoodItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  category: string;
};

const Beverages = () => {
  const [Beverages, setBeverages] = useState<FoodItem[]>([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/food-items")
      .then((res) => res.json())
      .then((data: FoodItem[]) => {
        const filteredItems = data.filter((item) => item.category === "Beverages");
        setBeverages(filteredItems);
      })
      .catch((err) => console.error("Error fetching food items:", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Beverages</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Beverages.length > 0 ? (
          Beverages.map((item) => <FoodCard key={item.id} item={item} />)
        ) : (
          <p>No Beverages available.</p>
        )}
      </div>
    </div>
  );
};

const FoodCard = ({ item }: { item: FoodItem }) => (
  <div className="border p-4 rounded-lg shadow-md w-56 flex flex-col items-center bg-white">
    {/* Image Section */}
    <div className="w-full h-36 relative">
      <Image
        src={item.image_url}
        alt={item.name}
        layout="fill"
        objectFit="cover"
        className="rounded-md"
      />
    </div>

    {/* Details Section */}
    <div className="w-full text-center mt-3">
      <h3 className="text-lg font-semibold">{item.name}</h3>
      <p className="text-gray-600">Price: ₹{item.price}</p>
      <p className="text-gray-500">Available: {item.quantity}</p>
      
      {/* Add Button */}
      <button className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
        Add
      </button>
    </div>
  </div>
);


export default Beverages;
