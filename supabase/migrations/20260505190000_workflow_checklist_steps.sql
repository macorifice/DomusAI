create table if not exists public.workflow_checklist_steps (
  workflow_user_id text not null,
  step_id text not null,
  done boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (workflow_user_id, step_id)
);

create index if not exists idx_workflow_checklist_steps_user
  on public.workflow_checklist_steps (workflow_user_id);
