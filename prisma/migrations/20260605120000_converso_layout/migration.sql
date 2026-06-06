-- Converso layout adaptations (catálogo de serviços, agenda, empresa/admin).
-- Idempotente (segue o padrão das migrations anteriores deste repo).

-- 1. Novos enums --------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "ServiceStatus" AS ENUM ('ativo', 'pausado', 'rascunho');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CompanyPlan" AS ENUM ('free', 'pro', 'empresa');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "CompanyRole" AS ENUM ('owner', 'admin', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "MemberStatus" AS ENUM ('ativo', 'pendente', 'inativo');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Etapa "proposta" no funil (adiciona se ainda não existir) -----------------
ALTER TYPE "FunnelStage" ADD VALUE IF NOT EXISTS 'proposta' BEFORE 'negociando';

-- 3. Serviços (catalog_products): status, descrição e duração livre ------------
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "duration" TEXT;
ALTER TABLE "catalog_products" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "catalog_products"
  ADD COLUMN IF NOT EXISTS "status" "ServiceStatus" NOT NULL DEFAULT 'ativo';

-- 4. Agenda (appointments): duração em minutos e categoria de serviço ----------
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "duration_minutes" INTEGER;
ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "service_category" TEXT;

-- 5. Empresa (multi-autônomo / painel Admin) ----------------------------------
CREATE TABLE IF NOT EXISTS "companies" (
  "id"           TEXT NOT NULL,
  "name"         TEXT NOT NULL,
  "plan"         "CompanyPlan" NOT NULL DEFAULT 'empresa',
  "monthly_goal" DECIMAL(12,2),
  "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "memberships" (
  "id"            TEXT NOT NULL,
  "company_id"    TEXT NOT NULL,
  "user_id"       TEXT,
  "invited_name"  TEXT,
  "invited_email" TEXT,
  "role"          "CompanyRole" NOT NULL DEFAULT 'member',
  "area"          TEXT,
  "status"        "MemberStatus" NOT NULL DEFAULT 'pendente',
  "joined_at"     TIMESTAMP(3),
  "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "memberships_company_id_idx" ON "memberships"("company_id");
CREATE UNIQUE INDEX IF NOT EXISTS "memberships_company_id_user_id_key"
  ON "memberships"("company_id", "user_id");

DO $$ BEGIN
  ALTER TABLE "memberships"
    ADD CONSTRAINT "memberships_company_id_fkey"
    FOREIGN KEY ("company_id") REFERENCES "companies"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "memberships"
    ADD CONSTRAINT "memberships_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
