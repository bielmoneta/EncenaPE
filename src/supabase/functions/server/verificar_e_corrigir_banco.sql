-- ================================================
-- SCRIPT DE VERIFICAÇÃO E CORREÇÃO DO BANCO DE DADOS
-- Teatro Recife - Sistema Relacional
-- ================================================

-- PASSO 1: REMOVER TABELA KV_STORE (se existir)
-- ================================================
DROP TABLE IF EXISTS kv_store_8d787f3b CASCADE;

-- PASSO 2: VERIFICAR TABELAS EXISTENTES
-- ================================================
SELECT 
  'Tabelas existentes:' as info,
  table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- PASSO 3: REMOVER TABELAS ANTIGAS (se necessário recriar)
-- ================================================
-- CUIDADO: Isso apaga TODOS os dados! Use apenas se precisar recriar tudo
-- Descomente as linhas abaixo se precisar limpar e recriar:

-- DROP TABLE IF EXISTS notifications CASCADE;
-- DROP TABLE IF EXISTS favorites CASCADE;
-- DROP TABLE IF EXISTS space_rentals CASCADE;
-- DROP TABLE IF EXISTS bookings CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS spaces CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;

-- PASSO 4: VERIFICAR SE AS TABELAS RELACIONAIS EXISTEM
-- ================================================
SELECT 
  CASE 
    WHEN COUNT(*) = 7 THEN 'OK - Todas as 7 tabelas relacionais existem'
    ELSE 'ERRO - Faltam tabelas. Executar schema.sql completo'
  END as status,
  COUNT(*) as total_tabelas
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles', 
    'events', 
    'spaces', 
    'bookings', 
    'space_rentals', 
    'favorites', 
    'notifications'
  );

-- PASSO 5: VERIFICAR DADOS INICIAIS
-- ================================================
SELECT 'Eventos cadastrados:' as info, COUNT(*) as total FROM events;
SELECT 'Espaços cadastrados:' as info, COUNT(*) as total FROM spaces;
SELECT 'Usuários cadastrados:' as info, COUNT(*) as total FROM user_profiles;

-- PASSO 6: VERIFICAR RLS (Row Level Security)
-- ================================================
SELECT 
  tablename,
  CASE 
    WHEN rowsecurity = true THEN 'OK - RLS Habilitado'
    ELSE 'AVISO - RLS Desabilitado'
  END as status_rls
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles', 
    'events', 
    'spaces', 
    'bookings', 
    'space_rentals', 
    'favorites', 
    'notifications'
  )
ORDER BY tablename;

-- ================================================
-- FIM DA VERIFICAÇÃO
-- ================================================
