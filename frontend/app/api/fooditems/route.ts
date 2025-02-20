import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

// ✅ GET API to fetch all food items
export async function GET() {
  const { data, error } = await supabase.from("food_items").select("*");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 200 });
}

// ✅ POST API to add a new food item
export async function POST(req: Request) {
  try {
    const { name, price, category, image_url, quantity_per_serve } = await req.json();

    if (!name || !price || !category || !image_url || !quantity_per_serve) {
      return NextResponse.json({ error: "All fields are required!" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("food_items")
      .insert([{ name, price, category, image_url, quantity_per_serve }]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ message: "Food item added successfully!", data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
