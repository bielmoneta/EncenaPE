-- ================================================
-- CORREÇÃO DE POLÍTICAS RLS
-- Remove recursão infinita nas políticas
-- ================================================

-- PASSO 1: Remover todas as políticas existentes para recriar
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;

DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can create their own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;

DROP POLICY IF EXISTS "Users can view their own rentals" ON space_rentals;
DROP POLICY IF EXISTS "Users can create their own rentals" ON space_rentals;
DROP POLICY IF EXISTS "Admins can view all rentals" ON space_rentals;
DROP POLICY IF EXISTS "Admins can update rentals" ON space_rentals;

DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;

DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

DROP POLICY IF EXISTS "Anyone can view events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;

DROP POLICY IF EXISTS "Anyone can view spaces" ON spaces;
DROP POLICY IF EXISTS "Admins can manage spaces" ON spaces;

-- ================================================
-- PASSO 2: Criar função auxiliar para verificar admin
-- ================================================

-- Função que verifica se o usuário é admin usando metadata do auth.users
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT COALESCE((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin', false)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função alternativa que verifica via tabela (sem recursão)
CREATE OR REPLACE FUNCTION check_user_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================
-- PASSO 3: Recriar políticas SEM RECURSÃO
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

-- Políticas públicas para leitura (events e spaces)
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view spaces"
  ON spaces FOR SELECT
  USING (true);

-- Políticas de admin para escrita (events e spaces)
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (is_admin());

CREATE POLICY "Admins can manage spaces"
  ON spaces FOR ALL
  USING (is_admin());

-- ================================================
-- PASSO 4: Garantir que RLS está habilitado
-- ================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ================================================
-- PASSO 5: Atualizar metadata dos usuários existentes
-- ================================================

-- Esta query deve ser executada no SQL Editor do Supabase
-- para garantir que os metadados estejam corretos

-- Atualizar metadata do usuário admin (se existir)
-- Nota: Esta query precisa ser executada diretamente no Supabase
-- pois requer acesso à tabela auth.users

/*
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@teatrorecife.com.br';

-- Para outros usuários, garantir que tenham role 'user'
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "user"}'::jsonb
WHERE email != 'admin@teatrorecife.com.br' 
  AND (raw_user_meta_data->>'role') IS NULL;
*/

-- ================================================
-- VERIFICAÇÃO
-- ================================================

-- Listar todas as políticas ativas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário autenticado é admin usando JWT metadata';
COMMENT ON FUNCTION check_user_role(UUID, TEXT) IS 'Verifica role de um usuário específico sem causar recursão';
