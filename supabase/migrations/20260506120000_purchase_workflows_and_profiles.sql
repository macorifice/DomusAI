-- Stato workflow (fase, metadata, history) persistito per utente; allineato a workflow_user_id / JWT sub.
create table if not exists public.purchase_workflows (
  workflow_user_id text not null primary key,
  phase text not null,
  metadata jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  property_id text,
  transaction_id text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_purchase_workflows_updated
  on public.purchase_workflows (updated_at desc);

alter table public.purchase_workflows enable row level security;

-- Solo API backend con service_role scrive/legge; nessuna policy per anon/authenticated (RLS blocca anon).
comment on table public.purchase_workflows is 'Persistenza stato workflow Nest; accesso tramite SUPABASE_SERVICE_ROLE_KEY.';

-- Profilo utente applicativo (dati extra oltre auth.users).
create table if not exists public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy profiles_select_own
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy profiles_insert_own
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy profiles_update_own
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Riga profilo alla registrazione (nome funzione dedicato per evitare conflitti con altri progetti).
create or replace function public.domusai_profiles_on_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profiles on auth.users;

create trigger on_auth_user_created_profiles
  after insert on auth.users
  for each row execute function public.domusai_profiles_on_auth_user_created();
