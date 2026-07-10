ALTER TABLE "Order" ADD COLUMN "customerId" TEXT;
ALTER TABLE "Order" ADD COLUMN "razorpayOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN "razorpayPaymentId" TEXT;
ALTER TABLE "Order" ADD COLUMN "razorpaySignature" TEXT;

CREATE INDEX IF NOT EXISTS "Order_email_idx" ON "Order"("email");
CREATE INDEX IF NOT EXISTS "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Order_paymentStatus_idx" ON "Order"("paymentStatus");

CREATE TABLE IF NOT EXISTS "OrderStatusHistory" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "orderId" TEXT NOT NULL,
  "oldStatus" TEXT,
  "newStatus" TEXT NOT NULL,
  "changedBy" TEXT,
  "note" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "OrderStatusHistory_orderId_idx" ON "OrderStatusHistory"("orderId");

ALTER TABLE "Customer" ADD COLUMN "authUserId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Customer_authUserId_key" ON "Customer"("authUserId");

CREATE TABLE IF NOT EXISTS "CustomerAddress" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "pincode" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'India',
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "CustomerAddress_customerId_idx" ON "CustomerAddress"("customerId");

CREATE TABLE IF NOT EXISTS "InstagramFeedItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "imageUrl" TEXT NOT NULL,
  "caption" TEXT,
  "postUrl" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS "InstagramFeedItem_isActive_sortOrder_idx" ON "InstagramFeedItem"("isActive", "sortOrder");
