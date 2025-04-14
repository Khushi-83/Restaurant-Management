import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type FoodItem = {
  id?: string; // UUID from database
  name: string;
  price: number;
  category: 'Starters' | 'Main Course' | 'Beverages' | 'Desserts';
  image_url: string;
  quantity_per_serve: number;
  quantity?: number;
  created_at?: string;
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET all food items
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("food_items")
      .select(`
        id,
        name,
        price,
        category,
        image_url,
        quantity_per_serve,
        quantity,
        created_at
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Database error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}

// POST new food item
export async function POST(req: Request) {
  try {
    const requestData = await req.json();

    // Validate required fields
    const requiredFields = ['name', 'price', 'category', 'image_url', 'quantity_per_serve'];
    const missingFields = requiredFields.filter(field => !(field in requestData));
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate category enum
    const validCategories = ['Starters', 'Main Course', 'Beverages', 'Desserts'];
    if (!validCategories.includes(requestData.category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (requestData.price <= 0 || requestData.quantity_per_serve <= 0) {
      return NextResponse.json(
        { error: "Price and quantity_per_serve must be positive numbers" },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: Omit<FoodItem, 'id' | 'created_at'> = {
      name: requestData.name,
      price: requestData.price,
      category: requestData.category,
      image_url: requestData.image_url,
      quantity_per_serve: requestData.quantity_per_serve,
      quantity: requestData.quantity || 10 // Use default if not provided
    };

    // Insert with explicit return
    const { data, error } = await supabase
      .from("food_items")
      .insert([insertData])
      .select();

    if (error) throw error;

    return NextResponse.json(
      { 
        message: "Food item created successfully",
        data: data[0] // Return the full created record
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Database error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}