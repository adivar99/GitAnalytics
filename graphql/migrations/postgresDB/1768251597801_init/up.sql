SET check_function_bodies = false;
CREATE TYPE public.branch_health_status AS ENUM (
    'HOT',
    'STABLE',
    'STALE'
);
CREATE TYPE public.member_role AS ENUM (
    'DEVELOPER',
    'GUEST'
);
CREATE TABLE public.churn_metrics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    commit_hash character varying,
    project_id uuid,
    perpetrator_email character varying,
    victim_email character varying,
    lines_overwritten integer
);
COMMENT ON TABLE public.churn_metrics IS 'Calculated by git blame analysis';
COMMENT ON COLUMN public.churn_metrics.perpetrator_email IS 'User who overwrote the code';
COMMENT ON COLUMN public.churn_metrics.victim_email IS 'User whose code was overwritten';
CREATE TABLE public.companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    license_key character varying NOT NULL,
    admin_user_id uuid,
    max_projects integer DEFAULT 5,
    created_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE public.companies IS 'Created upon signup with a valid license';
COMMENT ON COLUMN public.companies.admin_user_id IS 'Strict Rule: Only 1 Admin per Company';
CREATE TABLE public.file_extension_stats (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    commit_hash character varying,
    extension character varying,
    count integer
);
COMMENT ON TABLE public.file_extension_stats IS 'Snapshots of file types per commit to track tech stack evolution';
COMMENT ON COLUMN public.file_extension_stats.extension IS 'e.g., .go, .js, .py';
CREATE TABLE public.git_branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid,
    name character varying,
    last_commit_hash character varying,
    health_status public.branch_health_status,
    last_activity_at timestamp without time zone
);
CREATE TABLE public.git_commits (
    hash character varying NOT NULL,
    project_id uuid NOT NULL,
    author_name character varying,
    author_email character varying,
    message text,
    branch_name character varying,
    committed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);
COMMENT ON COLUMN public.git_commits.created_at IS 'When this was ingested by our system';
CREATE TABLE public.project_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    project_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role public.member_role NOT NULL,
    joined_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE public.project_members IS 'Pivot table for Developers and Guests. Managers are linked directly in the projects table.';
CREATE TABLE public.projects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying NOT NULL,
    company_id uuid NOT NULL,
    manager_user_id uuid NOT NULL,
    description text,
    repo_url character varying,
    created_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE public.projects IS 'Admin creates project and assigns manager_user_id';
COMMENT ON COLUMN public.projects.manager_user_id IS 'Strict Rule: Only 1 Manager per Project';
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying NOT NULL,
    password_hash character varying NOT NULL,
    full_name character varying,
    company_id uuid,
    created_at timestamp without time zone DEFAULT now()
);
COMMENT ON TABLE public.users IS 'All users (Admins, Managers, Devs) live here';
COMMENT ON COLUMN public.users.company_id IS 'Users must belong to a company';
ALTER TABLE ONLY public.churn_metrics
    ADD CONSTRAINT churn_metrics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_admin_user_id_key UNIQUE (admin_user_id);
ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_license_key_key UNIQUE (license_key);
ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.file_extension_stats
    ADD CONSTRAINT file_extension_stats_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.git_branches
    ADD CONSTRAINT git_branches_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.git_branches
    ADD CONSTRAINT git_branches_project_id_name_key UNIQUE (project_id, name);
ALTER TABLE ONLY public.git_commits
    ADD CONSTRAINT git_commits_pkey PRIMARY KEY (hash);
ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.churn_metrics
    ADD CONSTRAINT churn_metrics_commit_hash_fkey FOREIGN KEY (commit_hash) REFERENCES public.git_commits(hash);
ALTER TABLE ONLY public.churn_metrics
    ADD CONSTRAINT churn_metrics_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_admin_user_id_fkey FOREIGN KEY (admin_user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.file_extension_stats
    ADD CONSTRAINT file_extension_stats_commit_hash_fkey FOREIGN KEY (commit_hash) REFERENCES public.git_commits(hash);
ALTER TABLE ONLY public.git_branches
    ADD CONSTRAINT git_branches_last_commit_hash_fkey FOREIGN KEY (last_commit_hash) REFERENCES public.git_commits(hash);
ALTER TABLE ONLY public.git_branches
    ADD CONSTRAINT git_branches_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.git_commits
    ADD CONSTRAINT git_commits_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id);
ALTER TABLE ONLY public.project_members
    ADD CONSTRAINT project_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);
ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_manager_user_id_fkey FOREIGN KEY (manager_user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);
