"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [form, setForm] = useState({ name: "", price: "", quantity: "", image_url: "", category: "Starters" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("food_items").insert([{ ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) }]);
    if (error) alert(error.message);
    else alert("Food item added successfully!");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-6">
      <h1 className="text-xl font-bold mb-4">Add Food Item</h1>
      <form className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Food Name" required className="mb-2 w-full p-2 border rounded" onChange={handleChange} />
        <input type="text" name="price" placeholder="Price" required className="mb-2 w-full p-2 border rounded" onChange={handleChange} />
        <input type="text" name="quantity" placeholder="Quantity" required className="mb-2 w-full p-2 border rounded" onChange={handleChange} />
        <input type="text" name="image_url" placeholder="Image URL" required className="mb-2 w-full p-2 border rounded" onChange={handleChange} />
        <label htmlFor="category" className="mb-2 block">Category</label>
        <select id="category" name="category" className="mb-2 w-full p-2 border rounded" onChange={handleChange}>
          {["Starters", "Savory", "Main Course", "Appetizers", "Beverages", "Desserts"].map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button type="submit" className="w-full bg-purple-500 text-white p-2 rounded">Add Food Item</button>
      </form>
    </div>
  );
}
