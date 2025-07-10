-- Recreate the orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pizzeria_id UUID REFERENCES pizzerias(id) ON DELETE CASCADE NOT NULL,
  customer_phone TEXT,
  customer_name TEXT,
  delivery_address TEXT,
  order_details JSONB, -- ex: [{"item_id": "...", "quantity": 2, "options": "sans oignons"}]
  total_price NUMERIC(10, 2),
  status TEXT DEFAULT 'pending', -- pending, preparing, out_for_delivery, completed, cancelled
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Allow pizzeria owner to view their orders
CREATE POLICY "Allow pizzeria owner to view orders"
ON orders FOR SELECT
USING (auth.uid() = (SELECT owner_id FROM pizzerias WHERE id = pizzeria_id));

-- Policy: Allow pizzeria owner to update their orders (e.g., change status)
CREATE POLICY "Allow pizzeria owner to update orders"
ON orders FOR UPDATE
USING (auth.uid() = (SELECT owner_id FROM pizzerias WHERE id = pizzeria_id));

-- Policy: Allow pizzeria owner to delete their orders
CREATE POLICY "Allow pizzeria owner to delete orders"
ON orders FOR DELETE
USING (auth.uid() = (SELECT owner_id FROM pizzerias WHERE id = pizzeria_id));