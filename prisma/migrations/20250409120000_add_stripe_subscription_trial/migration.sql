ALTER TABLE "users" ADD COLUMN "trial_ends_at" TIMESTAMP(3);
UPDATE "users" SET "trial_ends_at" = "created_at" + INTERVAL '3 days' WHERE "trial_ends_at" IS NULL;
ALTER TABLE "users" ALTER COLUMN "trial_ends_at" SET NOT NULL;
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" TEXT;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" TEXT;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_status" TEXT;
