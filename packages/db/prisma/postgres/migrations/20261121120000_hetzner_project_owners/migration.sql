-- AlterTable
ALTER TABLE "hetzner_projects" ADD COLUMN "ownerId" TEXT;

-- CreateTable
CREATE TABLE "group_hetzner_projects" (
    "groupId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "group_hetzner_projects_pkey" PRIMARY KEY ("groupId","projectId")
);

-- CreateIndex
CREATE INDEX "group_hetzner_projects_projectId_idx" ON "group_hetzner_projects"("projectId");

-- CreateIndex
CREATE INDEX "hetzner_projects_ownerId_idx" ON "hetzner_projects"("ownerId");

-- AddForeignKey
ALTER TABLE "hetzner_projects" ADD CONSTRAINT "hetzner_projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_hetzner_projects" ADD CONSTRAINT "group_hetzner_projects_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_hetzner_projects" ADD CONSTRAINT "group_hetzner_projects_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "hetzner_projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: a project Admin owns the project, else any member, else the oldest super admin
UPDATE "hetzner_projects" p
SET "ownerId" = COALESCE(
    (SELECT MIN(u."userId") FROM "hetzner_project_users" u WHERE u."projectId" = p."id" AND u."role" = 'Admin'),
    (SELECT MIN(u."userId") FROM "hetzner_project_users" u WHERE u."projectId" = p."id"),
    (SELECT a."id" FROM "users" a WHERE a."admin" = true AND a."deletedAt" IS NULL ORDER BY a."createdAt" ASC LIMIT 1)
)
WHERE p."ownerId" IS NULL;
