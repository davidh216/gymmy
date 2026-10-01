-- Read-only health check of the live database, printed at the end of every Supabase workflow run.
select
  (select count(*) from information_schema.tables
    where table_schema = 'public'
      and table_name in ('profiles', 'gyms', 'gym_members', 'entries', 'reports', 'blocks',
                         'app_settings', 'moderation_results', 'exercise_submissions', 'sync_records')) as tables_of_10,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in ('username_available', 'join_gym_by_invite', 'admin_review_queue', 'admin_resolve',
                        'delete_my_account', 'join_place_gym', 'admin_exercise_submissions',
                        'admin_resolve_exercise', 'sync_push')) as functions_of_9,
  (select count(*) from public.profiles) as users,
  (select count(*) from public.profiles where is_admin) as admins,
  (select count(*) from public.gyms) as gyms,
  (select count(*) from public.entries) as entries,
  (select count(*) from public.exercise_submissions where status = 'pending') as pending_exercises,
  (select value from public.app_settings where key = 'moderation_enabled') as moderation_enabled;
