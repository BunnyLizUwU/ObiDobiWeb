-- Esquema de Base de Datos para Obi Dobi PWA & Cotizador Inteligente

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Categorías
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL
);

-- 2. Productos
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    images JSONB DEFAULT '[]'::jsonb, -- Array de URLs o nombres de imágenes
    is_digital BOOLEAN DEFAULT FALSE,
    estimated_minutes INTEGER DEFAULT 0 -- Tiempo estimado de mano de obra en minutos
);

-- 3. Materiales / Insumos
CREATE TABLE materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    unit_measure VARCHAR(50) NOT NULL, -- ej: "pza", "ml", "g", "cm2"
    unit_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    waste_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0.00 -- Porcentaje de merma, ej: 10.00 para 10%
);

-- 4. Relación de Materiales por Producto
CREATE TABLE product_materials (
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    material_id UUID REFERENCES materials(id) ON DELETE CASCADE,
    quantity NUMERIC(10, 4) NOT NULL DEFAULT 1.0000,
    PRIMARY KEY (product_id, material_id)
);

-- 5. Configuración de Costos e Índices Financieros
CREATE TABLE quote_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1), -- Solo permite una fila de configuración
    hourly_rate NUMERIC(10, 2) NOT NULL DEFAULT 120.00, -- Costo por hora de mano de obra
    indirect_cost_percentage NUMERIC(5, 2) NOT NULL DEFAULT 15.00, -- Desgaste de máquinas, luz, empaque
    default_profit_margin NUMERIC(5, 2) NOT NULL DEFAULT 40.00, -- Margen de ganancia
    included_revisions INTEGER NOT NULL DEFAULT 2, -- Rondas de revisiones gratis
    extra_revision_fee NUMERIC(10, 2) NOT NULL DEFAULT 50.00, -- Costo por revisión extra
    express_surcharge NUMERIC(5, 2) NOT NULL DEFAULT 25.00, -- Recargo Express (+25%)
    urgent_surcharge NUMERIC(5, 2) NOT NULL DEFAULT 50.00, -- Recargo Urgente (+50%)
    local_delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 40.00, -- Costo de envío local
    national_shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 180.00 -- Costo de envío foráneo
);

-- 6. Cotizaciones y Pedidos
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folio SERIAL UNIQUE, -- Folio autonumérico para facilitar la búsqueda
    client_name VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50) NOT NULL,
    event_date DATE,
    delivery_type VARCHAR(50) NOT NULL DEFAULT 'taller', -- 'taller' (recolección), 'local' (envío local), 'nacional' (paquetería)
    urgency_level VARCHAR(50) NOT NULL DEFAULT 'normal', -- 'normal', 'express', 'urgente'
    payment_method VARCHAR(50) NOT NULL DEFAULT 'efectivo', -- 'efectivo', 'transferencia', 'tarjeta'
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    deposit_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- 50% de anticipo
    status VARCHAR(50) NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'boceto_enviado', 'anticipo_recibido', 'en_produccion', 'listo_entrega', 'cancelado'
    included_revisions INTEGER DEFAULT 2,
    extra_revisions_count INTEGER DEFAULT 0,
    extra_revisions_cost NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    payment_receipt_url TEXT, -- Comprobante de pago subido
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) en todas las tablas
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Políticas para 'categories'
CREATE POLICY "Permitir lectura pública de categorías" ON categories
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir gestión completa a administradores" ON categories
    FOR ALL TO authenticated USING (true);

-- Políticas para 'products'
CREATE POLICY "Permitir lectura pública de productos" ON products
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir gestión completa a administradores" ON products
    FOR ALL TO authenticated USING (true);

-- Políticas para 'materials'
CREATE POLICY "Permitir lectura pública de materiales" ON materials
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir gestión completa a administradores" ON materials
    FOR ALL TO authenticated USING (true);

-- Políticas para 'product_materials'
CREATE POLICY "Permitir lectura pública de relaciones de materiales" ON product_materials
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir gestión completa a administradores" ON product_materials
    FOR ALL TO authenticated USING (true);

-- Políticas para 'quote_settings'
CREATE POLICY "Permitir lectura pública de configuraciones" ON quote_settings
    FOR SELECT TO public USING (true);
CREATE POLICY "Permitir gestión completa a administradores" ON quote_settings
    FOR ALL TO authenticated USING (true);

-- Políticas para 'quotes'
CREATE POLICY "Permitir a cualquiera crear una cotización" ON quotes
    FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Permitir visualización y edición completa a administradores" ON quotes
    FOR ALL TO authenticated USING (true);


-- ==========================================
-- SEED DATA (Datos Iniciales)
-- ==========================================

-- Insertar configuración por defecto
INSERT INTO quote_settings (id, hourly_rate, indirect_cost_percentage, default_profit_margin, included_revisions, extra_revision_fee, express_surcharge, urgent_surcharge, local_delivery_fee, national_shipping_fee)
VALUES (1, 120.00, 15.00, 40.00, 2, 50.00, 25.00, 50.00, 40.00, 180.00)
ON CONFLICT (id) DO NOTHING;

-- Insertar Categorías
INSERT INTO categories (name, description, slug) VALUES
('Invitaciones Digitales', 'Invitaciones interactivas para bodas, XV años, cumpleaños y eventos corporativos con RSVP, GPS y cuenta regresiva.', 'invitaciones-digitales'),
('Totebags Sublimadas', 'Bolsas de tela canvas ecológicas y duraderas con diseños personalizados y sublimación premium.', 'tote-bags'),
('Stickers Personalizados', 'Pegatinas de alta calidad con cortes precisos en diferentes acabados: brillante, mate y holográfico.', 'stickers'),
('Llaveros de Resina', 'Accesorios de resina epóxica hechos a mano, personalizados con flores secas, glitter y letras de colores.', 'llaveros-resina');

-- Guardamos los IDs de categorías para referencias posteriores
-- (Hacemos select manual al insertar o usamos subqueries)

-- Insertar Materiales
INSERT INTO materials (name, unit_measure, unit_cost, waste_percentage) VALUES
('Resina Epóxica A+B', 'g', 0.45, 5.00), -- 0.45 MXN por gramo, 5% merma
('Molde y Herraje de Llavero', 'pza', 15.00, 2.00),
('Glitter y Decoraciones', 'g', 1.20, 10.00),
('Bolsa Tote Bag Canvas Lisa', 'pza', 32.00, 0.00),
('Hoja de Transfer / Sublimación A4', 'pza', 8.50, 10.00),
('Vinilo Adhesivo Holográfico A4', 'pza', 18.00, 15.00),
('Papel Fotográfico Autoadhesivo A4', 'pza', 6.00, 8.00),
('Hospedaje Digital Invitación (por año)', 'pza', 50.00, 0.00);

-- Insertar Productos
-- Invitación Digital
INSERT INTO products (category_id, title, description, images, is_digital, estimated_minutes)
VALUES (
    (SELECT id FROM categories WHERE slug = 'invitaciones-digitales'),
    'Invitación Digital Interactiva Premium',
    'Invitación interactiva para dispositivos móviles. Incluye cuenta regresiva, confirmación automática de asistencia por WhatsApp, ubicación con Google Maps, enlaces a mesa de regalos y galería de fotos.',
    '["/placeholder_invitacion.png"]'::jsonb,
    TRUE,
    180 -- 3 horas de mano de obra
);

-- Tote Bag
INSERT INTO products (category_id, title, description, images, is_digital, estimated_minutes)
VALUES (
    (SELECT id FROM categories WHERE slug = 'tote-bags'),
    'Tote Bag Canvas Personalizada',
    'Bolsa de tela de algodón (canvas) resistente con impresión de alta calidad mediante técnica de sublimación. Medidas estándar 35x40cm.',
    '["/placeholder_totebag.png"]'::jsonb,
    FALSE,
    45 -- 45 minutos de mano de obra
);

-- Stickers
INSERT INTO products (category_id, title, description, images, is_digital, estimated_minutes)
VALUES (
    (SELECT id FROM categories WHERE slug = 'stickers'),
    'Planilla de Stickers Custom (A4)',
    'Planilla tamaño A4 de stickers personalizados troquelados con la forma de tu diseño. Ideales para termos, laptops, packaging o decoración.',
    '["/placeholder_stickers.png"]'::jsonb,
    FALSE,
    30 -- 30 minutos de mano de obra
);

-- Llavero de Resina
INSERT INTO products (category_id, title, description, images, is_digital, estimated_minutes)
VALUES (
    (SELECT id FROM categories WHERE slug = 'llaveros-resina'),
    'Llavero de Letra de Resina Floral',
    'Llavero en forma de inicial hecho de resina epóxica transparente con incrustaciones de flores secas naturales, hoja de oro/plata y herraje de alta calidad.',
    '["/placeholder_llavero.png"]'::jsonb,
    FALSE,
    60 -- 1 hora de mano de obra (tiempo activo de vertido/lijado/montaje)
);

-- Relacionar Materiales con Productos
-- 1. Invitación Digital interactiva utiliza 1 licencia de hospedaje
INSERT INTO product_materials (product_id, material_id, quantity) VALUES
((SELECT id FROM products WHERE title = 'Invitación Digital Interactiva Premium'), (SELECT id FROM materials WHERE name = 'Hospedaje Digital Invitación (por año)'), 1.0000);

-- 2. Tote Bag utiliza 1 Bolsa lisa y 1 hoja de sublimación A4
INSERT INTO product_materials (product_id, material_id, quantity) VALUES
((SELECT id FROM products WHERE title = 'Tote Bag Canvas Personalizada'), (SELECT id FROM materials WHERE name = 'Bolsa Tote Bag Canvas Lisa'), 1.0000),
((SELECT id FROM products WHERE title = 'Tote Bag Canvas Personalizada'), (SELECT id FROM materials WHERE name = 'Hoja de Transfer / Sublimación A4'), 1.0000);

-- 3. Planilla de Stickers utiliza 1 Vinilo Adhesivo Holográfico A4 o Papel fotográfico autoadhesivo
INSERT INTO product_materials (product_id, material_id, quantity) VALUES
((SELECT id FROM products WHERE title = 'Planilla de Stickers Custom (A4)'), (SELECT id FROM materials WHERE name = 'Papel Fotográfico Autoadhesivo A4'), 1.0000);

-- 4. Llavero de resina utiliza 30g de resina, 1 herraje y 2g de decoración
INSERT INTO product_materials (product_id, material_id, quantity) VALUES
((SELECT id FROM products WHERE title = 'Llavero de Letra de Resina Floral'), (SELECT id FROM materials WHERE name = 'Resina Epóxica A+B'), 30.0000),
((SELECT id FROM products WHERE title = 'Llavero de Letra de Resina Floral'), (SELECT id FROM materials WHERE name = 'Molde y Herraje de Llavero'), 1.0000),
((SELECT id FROM products WHERE title = 'Llavero de Letra de Resina Floral'), (SELECT id FROM materials WHERE name = 'Glitter y Decoraciones'), 2.0000);
