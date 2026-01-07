CREATE TYPE "member_role" AS ENUM (
  'DEVELOPER',
  'GUEST'
);

CREATE TYPE "branch_health_status" AS ENUM (
  'HOT',
  'STABLE',
  'STALE'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "full_name" varchar,
  "company_id" uuid,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "companies" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar NOT NULL,
  "license_key" varchar UNIQUE NOT NULL,
  "admin_user_id" uuid UNIQUE,
  "max_projects" int DEFAULT 5,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "projects" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "name" varchar NOT NULL,
  "company_id" uuid NOT NULL,
  "manager_user_id" uuid NOT NULL,
  "description" text,
  "repo_url" varchar,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "project_members" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "project_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "role" member_role NOT NULL,
  "joined_at" timestamp DEFAULT (now())
);

CREATE TABLE "git_commits" (
  "hash" varchar PRIMARY KEY,
  "project_id" uuid NOT NULL,
  "author_name" varchar,
  "author_email" varchar,
  "message" text,
  "branch_name" varchar,
  "committed_at" timestamp,
  "created_at" timestamp DEFAULT (now())
);

CREATE TABLE "git_branches" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "project_id" uuid,
  "name" varchar,
  "last_commit_hash" varchar,
  "health_status" branch_health_status,
  "last_activity_at" timestamp
);

CREATE TABLE "file_extension_stats" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "commit_hash" varchar,
  "extension" varchar,
  "count" int
);

CREATE TABLE "churn_metrics" (
  "id" uuid PRIMARY KEY DEFAULT (gen_random_uuid()),
  "commit_hash" varchar,
  "project_id" uuid,
  "perpetrator_email" varchar,
  "victim_email" varchar,
  "lines_overwritten" int
);

COMMENT ON TABLE "users" IS 'All users (Admins, Managers, Devs) live here';

COMMENT ON COLUMN "users"."company_id" IS 'Users must belong to a company';

COMMENT ON TABLE "companies" IS 'Created upon signup with a valid license';

COMMENT ON COLUMN "companies"."admin_user_id" IS 'Strict Rule: Only 1 Admin per Company';

COMMENT ON TABLE "projects" IS 'Admin creates project and assigns manager_user_id';

COMMENT ON COLUMN "projects"."manager_user_id" IS 'Strict Rule: Only 1 Manager per Project';

COMMENT ON TABLE "project_members" IS 'Pivot table for Developers and Guests. Managers are linked directly in the projects table.';

COMMENT ON COLUMN "git_commits"."created_at" IS 'When this was ingested by our system';

COMMENT ON TABLE "file_extension_stats" IS 'Snapshots of file types per commit to track tech stack evolution';

COMMENT ON COLUMN "file_extension_stats"."extension" IS 'e.g., .go, .js, .py';

COMMENT ON TABLE "churn_metrics" IS 'Calculated by git blame analysis';

COMMENT ON COLUMN "churn_metrics"."perpetrator_email" IS 'User who overwrote the code';

COMMENT ON COLUMN "churn_metrics"."victim_email" IS 'User whose code was overwritten';

ALTER TABLE "users" ADD FOREIGN KEY ("company_id") REFERENCES "companies" ("id");

ALTER TABLE "companies" ADD FOREIGN KEY ("admin_user_id") REFERENCES "users" ("id");

ALTER TABLE "projects" ADD FOREIGN KEY ("company_id") REFERENCES "companies" ("id");

ALTER TABLE "projects" ADD FOREIGN KEY ("manager_user_id") REFERENCES "users" ("id");

ALTER TABLE "project_members" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "project_members" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "git_commits" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "git_branches" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");

ALTER TABLE "git_commits" ADD FOREIGN KEY ("hash") REFERENCES "git_branches" ("last_commit_hash");

ALTER TABLE "file_extension_stats" ADD FOREIGN KEY ("commit_hash") REFERENCES "git_commits" ("hash");

ALTER TABLE "churn_metrics" ADD FOREIGN KEY ("commit_hash") REFERENCES "git_commits" ("hash");

ALTER TABLE "churn_metrics" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id");
