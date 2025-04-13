import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/menu - Get all menu items
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('menu_items')
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

// POST /api/menu - Add a new menu item
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
      .from('menu_items')
      .insert([
        {
          name,
          price,
          description,
          category,
          image_url
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to add menu item' },
      { status: 500 }
    );
  }
}

// DELETE /api/menu/[id] - Delete a menu item
export async function DELETE(request: Request) {
  try {
    const id = request.url.split('/').pop();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Menu item ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete menu item' },
      { status: 500 }
    );
  }
} 