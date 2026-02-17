-- CreateTable
CREATE TABLE "site_setting" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "mainTitle" TEXT NOT NULL DEFAULT 'The real basketball is out there',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_setting_pkey" PRIMARY KEY ("id")
);
