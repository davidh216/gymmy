-- Read-only product report from anonymous analytics (last 28 days). Run with a [db report] commit.
with recent as (
  select * from public.analytics_events where received_at > now() - interval '28 days'
),
installs as (
  select install_id, min(client_at)::date as first_day from recent group by install_id
)
select 'active installs' as metric, 'today' as detail,
       count(distinct install_id)::text as value
  from recent where client_at::date = current_date
union all
select 'active installs', 'last 7 days', count(distinct install_id)::text
  from recent where client_at > now() - interval '7 days'
union all
select 'active installs', 'last 28 days', count(distinct install_id)::text from recent
union all
select 'workouts finished', 'last 7 days', count(*)::text
  from recent where event = 'workout_finish' and client_at > now() - interval '7 days'
union all
select 'finish rate', 'started → finished, 7 days',
       coalesce(round(100.0 * count(*) filter (where event = 'workout_finish')
         / nullif(count(*) filter (where event = 'workout_start'), 0))::text || '%', '—')
  from recent where client_at > now() - interval '7 days'
union all
select 'came back', 'installs active on a later day than their first',
       coalesce(round(100.0 * count(*) filter (where back) / nullif(count(*), 0))::text || '%', '—')
  from (select i.install_id, exists (select 1 from recent r where r.install_id = i.install_id
          and r.client_at::date > i.first_day) as back from installs i) t
union all
(select 'event', event, count(*)::text from recent group by event order by count(*) desc limit 15)
union all
(select 'screen', props->>'name', count(*)::text from recent where event = 'screen'
   group by props->>'name' order by count(*) desc limit 10)
union all
(select 'plan started', props->>'program', count(*)::text from recent where event = 'plan_start'
   group by props->>'program' order by count(*) desc)
union all
(select 'workout source', props->>'source', count(*)::text from recent where event = 'workout_start'
   group by props->>'source' order by count(*) desc);
