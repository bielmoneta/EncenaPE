-- ================================================
-- TEATRO RECIFE - DATABASE SCHEMA
-- Sistema de Gestão Integrada para Teatros
-- BANCO DE DADOS RELACIONAL COMPLETO
-- ================================================

-- ================================================
-- PASSO 0: LIMPAR TABELA KV_STORE (se existir)
-- ================================================
DROP TABLE IF EXISTS kv_store_8d787f3b CASCADE;

-- ================================================
-- PASSO 1: EXTENSIONS
-- ================================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================================
-- TABELA: user_profiles
-- Complementa auth.users com informações específicas
-- ================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  birth_date DATE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_profiles_cpf ON user_profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- ================================================
-- TABELA: spaces
-- Espaços disponíveis para locação
-- ================================================
CREATE TABLE IF NOT EXISTS spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  price_per_hour DECIMAL(10, 2) NOT NULL,
  amenities JSONB DEFAULT '[]'::jsonb,
  availability TEXT DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_spaces_availability ON spaces(availability);

-- ================================================
-- TABELA: events
-- Eventos cadastrados no sistema
-- ================================================
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  space_id UUID REFERENCES spaces(id) ON DELETE SET NULL,
  space_name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  available_seats INTEGER NOT NULL,
  total_seats INTEGER NOT NULL,
  category TEXT NOT NULL,
  duration TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_space_id ON events(space_id);

-- ================================================
-- TABELA: bookings
-- Reservas de ingressos
-- ================================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  seats JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'cancelled')),
  purchase_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);

-- ================================================
-- TABELA: space_rentals
-- Solicitações de locação de espaço
-- ================================================
CREATE TABLE IF NOT EXISTS space_rentals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES spaces(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  total_cost DECIMAL(10, 2) NOT NULL,
  submitted_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_space_rentals_user_id ON space_rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_space_rentals_space_id ON space_rentals(space_id);
CREATE INDEX IF NOT EXISTS idx_space_rentals_status ON space_rentals(status);
CREATE INDEX IF NOT EXISTS idx_space_rentals_date ON space_rentals(date);

-- ================================================
-- TABELA: favorites
-- Eventos favoritos dos usuários
-- ================================================
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  added_date TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_event_id ON favorites(event_id);

-- ================================================
-- TABELA: notifications
-- Notificações para usuários
-- ================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Habilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ================================================
-- FUNÇÃO AUXILIAR PARA VERIFICAR ADMIN (SEM RECURSÃO)
-- ================================================

-- Função que verifica se o usuário é admin usando JWT metadata
-- Esta abordagem EVITA recursão infinita
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário autenticado é admin usando JWT metadata (sem recursão)';

-- ================================================
-- POLÍTICAS RLS CORRIGIDAS (SEM RECURSÃO)
-- ================================================

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR ALL
  USING (is_admin());

-- Políticas para bookings
CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bookings"
  ON bookings FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage bookings"
  ON bookings FOR ALL
  USING (is_admin());

-- Políticas para space_rentals
CREATE POLICY "Users can view their own rentals"
  ON space_rentals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own rentals"
  ON space_rentals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all rentals"
  ON space_rentals FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update rentals"
  ON space_rentals FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage rentals"
  ON space_rentals FOR ALL
  USING (is_admin());

-- Políticas para favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites"
  ON favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites"
  ON favorites FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Políticas públicas para leitura
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view spaces"
  ON spaces FOR SELECT
  USING (true);

-- Políticas de admin para escrita
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (is_admin());

CREATE POLICY "Admins can manage spaces"
  ON spaces FOR ALL
  USING (is_admin());

-- ================================================
-- FUNCTIONS E TRIGGERS
-- ================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_space_rentals_updated_at
  BEFORE UPDATE ON space_rentals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON spaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- SEED DATA (dados iniciais)
-- ================================================

-- Inserir espaços
INSERT INTO spaces (id, name, description, image, capacity, price_per_hour, amenities) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sala Principal', 'Nossa maior sala com infraestrutura completa para grandes produções. Equipada com sistema de som profissional, iluminação cênica avançada e palco italiano tradicional.', 'https://images.unsplash.com/photo-1759103570737-8485420df3a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwaW50ZXJpb3IlMjBhdWRpZW5jZXxlbnwxfHx8fDE3NjIxMjU5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', 300, 500, '["Sistema de som profissional", "Iluminação cênica", "Camarins", "Palco italiano"]'::jsonb),
  ('22222222-2222-2222-2222-222222222222', 'Studio Experimental', 'Espaço versátil para performances experimentais e ensaios. Ideal para grupos menores e produções independentes.', 'https://images.unsplash.com/photo-1761618291331-535983ae4296?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwZW1wdHklMjBzdGFnZXxlbnwxfHx8fDE3NjIxMjU5OTN8MA&ixlib=rb-4.1.0&q=80&w=1080', 80, 200, '["Flexibilidade de configuração", "Equipamento básico", "Ar-condicionado"]'::jsonb),
  ('33333333-3333-3333-3333-333333333333', 'Auditório', 'Espaço confortável para palestras, recitais e conferências. Com cadeiras ergonômicas e excelente acústica.', 'https://images.unsplash.com/photo-1646905103565-5c8348075920?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwaGFsbCUyMGludGVyaW9yfGVufDF8fHx8MTc2MjA2OTg0Nnww&ixlib=rb-4.1.0&q=80&w=1080', 250, 400, '["Projetor e tela", "Microfones", "Ar-condicionado", "Acústica profissional"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Inserir eventos
INSERT INTO events (id, title, description, image, date, time, space_id, space_name, price, available_seats, total_seats, category, duration) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'Hamlet - Teatro Clássico', 'Uma adaptação moderna do clássico de Shakespeare. A tragédia do príncipe da Dinamarca é recontada com elementos contemporâneos que dialogam com questões atuais.', 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjIwMDUxMTR8MA&ixlib=rb-4.1.0&q=80&w=1080', '2025-12-15', '20:00', '11111111-1111-1111-1111-111111111111', 'Sala Principal', 60, 120, 300, 'Teatro', '2h 30min'),
  ('e2222222-2222-2222-2222-222222222222', 'Noite de Improv', 'Comédia de improvisação com a participação do público. Uma noite única e imprevisível onde as histórias são criadas na hora.', 'https://images.unsplash.com/photo-1759103570737-8485420df3a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwaW50ZXJpb3IlMjBhdWRpZW5jZXxlbnwxfHx8fDE3NjIxMjU5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', '2025-12-08', '19:00', '22222222-2222-2222-2222-222222222222', 'Studio Experimental', 35, 45, 80, 'Comédia', '1h 30min'),
  ('e3333333-3333-3333-3333-333333333333', 'Concerto de Piano - Chopin', 'Recital de piano com obras selecionadas de Frédéric Chopin. Uma viagem pelas composições mais emocionantes do mestre polonês.', 'https://images.unsplash.com/photo-1646905103565-5c8348075920?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb25jZXJ0JTIwaGFsbCUyMGludGVyaW9yfGVufDF8fHx8MTc2MjA2OTg0Nnww&ixlib=rb-4.1.0&q=80&w=1080', '2025-12-20', '18:30', '33333333-3333-3333-3333-333333333333', 'Auditório', 80, 200, 250, 'Música', '2h'),
  ('e4444444-4444-4444-4444-444444444444', 'A Casa de Bernarda Alba', 'Drama de Federico García Lorca sobre opressão e liberdade. Uma poderosa história sobre mulheres confinadas pelas convenções sociais.', 'https://images.unsplash.com/photo-1761618291331-535983ae4296?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwZW1wdHklMjBzdGFnZXxlbnwxfHx8fDE3NjIxMjU5OTN8MA&ixlib=rb-4.1.0&q=80&w=1080', '2025-12-25', '20:30', '11111111-1111-1111-1111-111111111111', 'Sala Principal', 55, 180, 300, 'Teatro', '2h 15min'),
  ('e5555555-5555-5555-5555-555555555555', 'Festival de Dança Contemporânea', 'Apresentações de três companhias de dança com diferentes estilos contemporâneos. Uma celebração do movimento e expressão corporal.', 'https://images.unsplash.com/photo-1539964604210-db87088e0c2c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NjIwMDUxMTR8MA&ixlib=rb-4.1.0&q=80&w=1080', '2025-12-12', '19:30', '11111111-1111-1111-1111-111111111111', 'Sala Principal', 45, 90, 300, 'Dança', '2h'),
  ('e6666666-6666-6666-6666-666666666666', 'Stand-Up: Risadas do Recife', 'Noite de stand-up comedy com comediantes locais. Humor genuíno e histórias do cotidiano recifense.', 'https://images.unsplash.com/photo-1759103570737-8485420df3a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwaW50ZXJpb3IlMjBhdWRpZW5jZXxlbnwxfHx8fDE3NjIxMjU5OTJ8MA&ixlib=rb-4.1.0&q=80&w=1080', '2025-12-10', '21:00', '22222222-2222-2222-2222-222222222222', 'Studio Experimental', 30, 60, 80, 'Comédia', '1h 45min')
ON CONFLICT (id) DO NOTHING;