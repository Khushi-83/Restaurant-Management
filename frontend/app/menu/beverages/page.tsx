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
  <div className="border p-4 rounded-lg shadow-md">
    <Image src={item.image_url} alt={item.name} width={200} height={150} className="rounded-md" />
    <h3 className="text-lg font-semibold mt-2">{item.name}</h3>
    <p className="text-gray-600">Price: ₹{item.price}</p>
    <p className="text-gray-500">Available: {item.quantity}</p>
  </div>
);

export default Beverages;
