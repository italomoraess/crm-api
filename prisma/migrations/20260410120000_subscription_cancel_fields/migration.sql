ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "subscription_period_end" TIMESTAMP(3);
