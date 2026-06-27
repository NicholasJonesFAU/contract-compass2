# Database Schema — Contract Compass

Single table: **`contracts`**. One row per saved contract, owned by a user. Row Level Security ensures users only access their own rows.

> **Privacy constraint:** there is no column for raw/unredacted contract text. Only the user-approved `redacted_text` is stored.

## `contracts` table

| Column | Type | Constraints | Source | Description |
|---|---|---|---|---|
| `id` | `uuid` | PK, default `gen_random_uuid()` | system | Row identity |
| `user_id` | `uuid` | not null, FK → `auth.users(id)` | auth | Owner; drives RLS |
| `title` | `text` | not null | user | Human label for the contract |
| `redacted_text` | `text` | | user | Approved redacted contract body (only body stored) |
| `summary` | `text` | | AI | Concise summary |
| `plain_english_summary` | `text` | | AI | Layperson summary |
| `risk_level` | `text` | | AI | `Low` / `Medium` / `High` |
| `risk_score` | `integer` | | AI | Numeric risk, 1–10 |
| `auto_renewal` | `boolean` | default `false` | AI | Whether the contract auto-renews |
| `renewal_terms` | `text` | | AI | Renewal details |
| `termination_terms` | `text` | | AI | Termination details |
| `payment_terms` | `text` | | AI | Payment details |
| `important_deadlines` | `jsonb` | default `'[]'` | AI | Array of deadline objects |
| `obligations` | `jsonb` | default `'[]'` | AI | Array of obligation objects |
| `created_at` | `timestamptz` | not null, default `now()` | system | Insert time |
| `updated_at` | `timestamptz` | not null, default `now()` | system | Last update time |

### `important_deadlines` element shape
```json
{
  "deadline_type": "",
  "description": "",
  "date_or_trigger": "",
  "importance": "Low | Medium | High"
}
```

### `obligations` element shape
```json
{
  "party": "",
  "obligation": "",
  "deadline_or_frequency": "",
  "risk_if_missed": ""
}
```

## DDL

```sql
-- Table
create table public.contracts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  title                 text not null,
  redacted_text         text,
  summary               text,
  plain_english_summary text,
  risk_level            text,
  risk_score            integer,
  auto_renewal          boolean default false,
  renewal_terms         text,
  termination_terms     text,
  payment_terms         text,
  important_deadlines   jsonb default '[]'::jsonb,
  obligations           jsonb default '[]'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Helpful index for per-user queries
create index contracts_user_id_idx on public.contracts (user_id);
```

## Auto-update `updated_at`

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger contracts_set_updated_at
before update on public.contracts
for each row execute function public.set_updated_at();
```

## Row Level Security

```sql
-- Enable RLS
alter table public.contracts enable row level security;

-- Grant table access to authenticated users.
-- GRANT says "this role may touch the table"; RLS restricts WHICH rows.
-- Both are required: a table created via raw SQL does not auto-grant the way
-- the Table Editor does, so this GRANT is necessary to avoid a
-- "permission denied for table" error.
grant select, insert, update, delete on public.contracts to authenticated;

-- SELECT: users see only their own contracts
create policy "select own contracts"
on public.contracts for select
using (auth.uid() = user_id);

-- INSERT: users can only create rows they own
create policy "insert own contracts"
on public.contracts for insert
with check (auth.uid() = user_id);

-- UPDATE: users can only modify their own rows
create policy "update own contracts"
on public.contracts for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- DELETE: users can only delete their own rows
create policy "delete own contracts"
on public.contracts for delete
using (auth.uid() = user_id);
```

## Verification

- Confirm `rowsecurity = true` for `public.contracts` in `pg_tables`.
- As user A, insert a row; as user B, confirm it is not returned by `select * from contracts`.
- Confirm an insert with a mismatched `user_id` is rejected by the `with check` clause.
