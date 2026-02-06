-- ==============================================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS - AGROTECH SAFRA CONTROL
-- Execute este script no SQL Editor do Supabase para configurar o backend.
-- ==============================================================================

-- 1. Tabela de Registros de Safra (Cabeçalho)
create table if not exists harvest_records (
  record_number text primary key,
  submission_date timestamp with time zone default now(),
  status text default 'PENDING',
  customer_id text,
  customer_name text,
  regional text,
  manager_name text,
  seller_name text,
  city text,
  state text,
  property_name text,
  location_url text,
  crop_id text,
  total_area numeric,
  planted_area numeric,
  registration_number text,
  cprf_coordinates text
);

-- 2. Tabela de Visitas Técnicas (Detalhes)
create table if not exists technical_visits (
  id text primary key,
  record_number text not null references harvest_records(record_number) on delete cascade,
  date timestamp with time zone,
  stage text,
  opinion text,
  author text
);

-- 3. Tabela de Administradores (NOVO)
create table if not exists admins (
  username text primary key,
  password text not null, -- Em produção, recomenda-se usar Supabase Auth ou hash
  full_name text
);

-- Inserir usuário Admin padrão (se não existir)
insert into admins (username, password, full_name)
values ('admin', 'admin123', 'Administrador Principal')
on conflict (username) do nothing;

-- 4. Habilitar Row Level Security (RLS)
alter table harvest_records enable row level security;
alter table technical_visits enable row level security;
alter table admins enable row level security;

-- 5. Criar Políticas de Acesso (Policies)
-- Limpar políticas antigas
drop policy if exists "Acesso Total Registros" on harvest_records;
drop policy if exists "Acesso Total Visitas" on technical_visits;
drop policy if exists "Leitura Admins" on admins;

-- Políticas
create policy "Acesso Total Registros" on harvest_records for all using (true) with check (true);
create policy "Acesso Total Visitas" on technical_visits for all using (true) with check (true);

-- Permitir que a aplicação verifique o login (Leitura pública da tabela de admins)
create policy "Leitura Admins" on admins for select using (true);

-- Fim do Script