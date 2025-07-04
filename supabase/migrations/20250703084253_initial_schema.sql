-- 1. Table pour stocker les informations des pizzerias
CREATE TABLE pizzerias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  address TEXT,
  delivery_area_text TEXT, -- Pour la saisie libre
  delivery_radius_km INT, -- Pour le rayon en km
  contact_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer la sécurité au niveau des lignes (RLS)
ALTER TABLE pizzerias ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leur propre pizzeria
CREATE POLICY "Allow owner to read their pizzeria"
ON pizzerias FOR SELECT
USING (auth.uid() = owner_id);

-- Politique : Les utilisateurs peuvent créer leur pizzeria
CREATE POLICY "Allow owner to create their pizzeria"
ON pizzerias FOR INSERT
WITH CHECK (auth.uid() = owner_id);


-- 2. Table pour stocker le menu structuré
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pizzeria_id UUID REFERENCES pizzerias(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2),
  size TEXT, -- ex: 'M', 'L', 'XL'
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Politique : Le propriétaire de la pizzeria peut gérer son menu
CREATE POLICY "Allow pizzeria owner to manage menu"
ON menu_items FOR ALL
USING (auth.uid() = (SELECT owner_id FROM pizzerias WHERE id = pizzeria_id));


-- 3. Table pour les commandes reçues via Retell AI
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

-- Activer RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Politique : Le propriétaire peut voir les commandes de sa pizzeria
CREATE POLICY "Allow pizzeria owner to view orders"
ON orders FOR SELECT
USING (auth.uid() = (SELECT owner_id FROM pizzerias WHERE id = pizzeria_id));


-- 4. Création du bucket pour les images des menus
-- Note: La gestion des buckets via les migrations est limitée.
-- Il est recommandé de le créer via l'UI ou une seule fois via un script.
-- Ce code est déclaratif pour la migration.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('menu_images', 'menu_images', FALSE, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = FALSE,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif'];


-- Politiques de sécurité pour le bucket
-- Assurez-vous que les politiques n'existent pas déjà avant de les créer
DROP POLICY IF EXISTS "Allow authenticated users to upload menus" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload menus"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'menu_images');

DROP POLICY IF EXISTS "Allow owner to read their menu image" ON storage.objects;
CREATE POLICY "Allow owner to read their menu image"
ON storage.objects FOR SELECT
TO authenticated
USING (auth.uid()::text = owner_id);

DROP POLICY IF EXISTS "Allow owner to update their menu image" ON storage.objects;
CREATE POLICY "Allow owner to update their menu image"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid()::text = owner_id);

DROP POLICY IF EXISTS "Allow owner to delete their menu image" ON storage.objects;
CREATE POLICY "Allow owner to delete their menu image"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid()::text = owner_id);
