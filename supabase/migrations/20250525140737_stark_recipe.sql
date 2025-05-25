/*
  # Initial Schema for Price Tracker

  1. New Tables
    - `suppliers`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text, required)
      - `contact` (text)
      - `phone` (text)
      - `address` (text)
      - `notes` (text)
      - `user_id` (uuid, required, references auth.users)
      
    - `products`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `name` (text, required)
      - `category` (text)
      - `description` (text)
      - `sku` (text)
      - `unit` (text)
      - `user_id` (uuid, required, references auth.users)
      
    - `prices`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `price` (numeric, required)
      - `date` (date, required)
      - `notes` (text)
      - `product_id` (uuid, required, references products)
      - `supplier_id` (uuid, required, references suppliers)
      - `user_id` (uuid, required, references auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies to allow users to only access their own data
*/

-- Create suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  contact text,
  phone text,
  address text,
  notes text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  category text,
  description text,
  sku text,
  unit text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create prices table
CREATE TABLE IF NOT EXISTS prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  price numeric NOT NULL,
  date date NOT NULL,
  notes text,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for suppliers
CREATE POLICY "Users can create their own suppliers" 
ON suppliers FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own suppliers" 
ON suppliers FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suppliers" 
ON suppliers FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own suppliers" 
ON suppliers FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Create RLS Policies for products
CREATE POLICY "Users can create their own products" 
ON products FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own products" 
ON products FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own products" 
ON products FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products" 
ON products FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Create RLS Policies for prices
CREATE POLICY "Users can create their own prices" 
ON prices FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own prices" 
ON prices FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own prices" 
ON prices FOR UPDATE TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prices" 
ON prices FOR DELETE TO authenticated 
USING (auth.uid() = user_id);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS suppliers_user_id_idx ON suppliers(user_id);
CREATE INDEX IF NOT EXISTS products_user_id_idx ON products(user_id);
CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
CREATE INDEX IF NOT EXISTS prices_user_id_idx ON prices(user_id);
CREATE INDEX IF NOT EXISTS prices_product_id_idx ON prices(product_id);
CREATE INDEX IF NOT EXISTS prices_supplier_id_idx ON prices(supplier_id);
CREATE INDEX IF NOT EXISTS prices_date_idx ON prices(date);