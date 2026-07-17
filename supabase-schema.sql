-- ============================================================
-- Catálogo Digital — Schema de Supabase
-- Ejecutar en: Supabase → SQL Editor → New Query
-- ============================================================

-- Tabla: categorias
CREATE TABLE IF NOT EXISTS categorias (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla: productos
CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT DEFAULT '',
  precio NUMERIC(10,2) NOT NULL DEFAULT 0,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  estado TEXT DEFAULT 'disponible' CHECK (estado IN ('disponible', 'agotado', 'nuevo')),
  talles TEXT[] DEFAULT '{}',
  colores TEXT[] DEFAULT '{}',
  fotos TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Políticas públicas de lectura (el catálogo es público)
CREATE POLICY "catalogo_read" ON categorias FOR SELECT USING (true);
CREATE POLICY "catalogo_read" ON productos FOR SELECT USING (true);

-- Políticas de escritura solo para usuarios autenticados (el admin)
CREATE POLICY "admin_write_categorias" ON categorias FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "admin_write_productos" ON productos FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- DATOS DE EJEMPLO (opcional, ejecutá solo si los querés)
-- ============================================================

-- Insertar categorías ejemplo
INSERT INTO categorias (nombre, orden) VALUES
  ('Mujer', 1),
  ('Hombre', 2),
  ('Accesorios', 3),
  ('Ofertas', 4);

-- Insertar algunos productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria_id, estado, talles, colores, fotos) VALUES
  ('Remera Básica', 'Remera de algodón 100%. Clásica y cómoda para el día a día.', 4500, 1, 'disponible', ARRAY['S','M','L','XL'], ARRAY['Blanco','Negro','Gris'], ARRAY[]::TEXT[]),
  ('Jeans Slim Fit', 'Jeans ajustados con stretch para mayor comodidad.', 12000, 2, 'nuevo', ARRAY['28','30','32','34'], ARRAY['Azul oscuro','Negro'], ARRAY[]::TEXT[]),
  ('Bolso de cuero', 'Bolso artesanal de cuero genuino. Ideal para el día a día.', 8500, 3, 'disponible', ARRAY[]::TEXT[], ARRAY['Marrón','Negro'], ARRAY[]::TEXT[]),
  ('Oferta - Zapatillas', 'Zapatillas urbanas. ¡Últimas unidades!', 9500, 4, 'agotado', ARRAY['38','39','40','41','42'], ARRAY['Blanco','Negro'], ARRAY[]::TEXT[]);

-- ============================================================
-- NOTA IMPORTANTE: después de crear el Storage bucket
-- "productos-fotos" en Supabase → Storage, marcá la política
-- como pública para que las fotos se vean sin login.
-- ============================================================
