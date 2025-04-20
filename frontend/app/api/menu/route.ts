import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic'; // Disable static rendering
export const revalidate = 0; // Disable cache
// GET /api/menu - Get all food items
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('food_items') // Changed from menu_items
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch menu items' },
      { status: 500 }
    );
  }
}

// POST /api/menu - Add new food item
export async function POST(request: Request) {
  try {
    const { name, price, description, category, image_url } = await request.json();

    // Validate required fields
    if (!name || !price || !category) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('food_items') // Changed from menu_items
      .insert([{
        name,
        price,
        description,
        category,
        image_url,
        quantity_per_serve: 1, // Default value
        quantity: 10 // Default value
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to add menu item' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/[id] - Delete food item
export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('food_items') // Changed from menu_items
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json(
      { message: 'Item deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
