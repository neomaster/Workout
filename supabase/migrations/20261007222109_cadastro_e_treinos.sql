-- Torquímetro Gym: cadastro (perfis), treinos e o restante do estado do app.
-- Cada pessoa só enxerga e altera as próprias linhas (RLS).

create table public.perfis (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  nome          text,
  foto_url      text,
  apelido       text check (char_length(apelido) <= 40),
  altura_cm     numeric(5,1) check (altura_cm between 100 and 250),
  massa_kg      numeric(5,1) check (massa_kg between 25 and 300),
  objetivo      text check (objetivo in ('hipertrofia','forca','emagrecimento','saude','desempenho')),
  nivel         text check (nivel in ('iniciante','intermediario','avancado')),
  dias_semana   smallint check (dias_semana between 1 and 7),
  local_treino  text check (local_treino in ('academia','casa','ambos')),
  aceite_termos timestamptz,
  cadastro_completo boolean not null default false,
  criado_em     timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
comment on table public.perfis is 'Um cadastro por conta Google. Criado automaticamente no primeiro login e completado pelo formulário.';

create table public.treinos (
  usuario_id    uuid not null references auth.users(id) on delete cascade default auth.uid(),
  id            text not null check (char_length(id) between 1 and 80),
  data          timestamptz not null,
  nome          text not null default 'Treino' check (char_length(nome) <= 120),
  rotina_id     text,
  inicio        timestamptz,
  fim           timestamptz,
  origem        text,
  itens         jsonb not null default '[]'::jsonb check (jsonb_typeof(itens) = 'array'),
  series        integer generated always as (jsonb_array_length(itens)) stored,
  apagado       boolean not null default false,
  atualizado_em timestamptz not null default now(),
  primary key (usuario_id, id)
);
comment on table public.treinos is 'Cada treino do app, com as séries em itens (jsonb). apagado=true propaga exclusões entre aparelhos.';
comment on column public.treinos.series is 'Quantidade de exercícios no treino (tamanho de itens).';
create index treinos_usuario_data on public.treinos (usuario_id, data desc);

create table public.estado_app (
  usuario_id    uuid primary key references auth.users(id) on delete cascade default auth.uid(),
  dados         jsonb not null default '{}'::jsonb check (jsonb_typeof(dados) = 'object'),
  atualizado_em timestamptz not null default now()
);
comment on table public.estado_app is 'Rotinas, semana, ajustes, peso corporal e notas do app, para levar de um aparelho a outro.';

-- atualizado_em automático
create or replace function public.tocar_atualizado_em() returns trigger
language plpgsql set search_path = '' as $$
begin new.atualizado_em := now(); return new; end; $$;
create trigger perfis_tocar before update on public.perfis for each row execute function public.tocar_atualizado_em();
create trigger treinos_tocar before update on public.treinos for each row execute function public.tocar_atualizado_em();
create trigger estado_tocar before update on public.estado_app for each row execute function public.tocar_atualizado_em();

-- perfil criado no primeiro login com Google, com nome e foto da conta
create or replace function public.criar_perfil() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.perfis (id, email, nome, foto_url)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
          coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'))
  on conflict (id) do nothing;
  return new;
end; $$;
revoke execute on function public.criar_perfil() from public, anon, authenticated;
create trigger ao_criar_usuario after insert on auth.users for each row execute function public.criar_perfil();

-- RLS: só o dono
alter table public.perfis enable row level security;
alter table public.treinos enable row level security;
alter table public.estado_app enable row level security;

create policy "ler o próprio perfil" on public.perfis for select to authenticated using ((select auth.uid()) = id);
create policy "atualizar o próprio perfil" on public.perfis for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "ler os próprios treinos" on public.treinos for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "criar os próprios treinos" on public.treinos for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "alterar os próprios treinos" on public.treinos for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);
create policy "apagar os próprios treinos" on public.treinos for delete to authenticated using ((select auth.uid()) = usuario_id);

create policy "ler o próprio estado" on public.estado_app for select to authenticated using ((select auth.uid()) = usuario_id);
create policy "criar o próprio estado" on public.estado_app for insert to authenticated with check ((select auth.uid()) = usuario_id);
create policy "alterar o próprio estado" on public.estado_app for update to authenticated using ((select auth.uid()) = usuario_id) with check ((select auth.uid()) = usuario_id);

-- o perfil não pode trocar de dono nem de e-mail pelo cliente
revoke update on public.perfis from authenticated;
grant update (apelido, altura_cm, massa_kg, objetivo, nivel, dias_semana, local_treino, aceite_termos, cadastro_completo) on public.perfis to authenticated;
revoke all on public.perfis, public.treinos, public.estado_app from anon;
