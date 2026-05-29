-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "developerId" TEXT,
    "mustResetPassword" BOOLEAN NOT NULL DEFAULT true,
    "resetTokenHash" TEXT,
    "resetTokenExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_developerId_key" ON "User"("developerId");

-- Seed admin user
INSERT INTO "User" (
    "id",
    "email",
    "passwordHash",
    "role",
    "developerId",
    "mustResetPassword",
    "createdAt",
    "updatedAt"
) VALUES (
    'seed-admin-user',
    'admin@example.com',
    'scrypt:5dee6538a16dc8266ba3f1494b9caf54:303751c6725bf06d93e7a3bf3d3e49a51898a0c4f6a35430cea4c2c3936f11998d7bf8756cd7f12d47053033dc3374cac03a5f2896a7f8b47c1a64a031f9db1f',
    'admin',
    NULL,
    false,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "Developer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
