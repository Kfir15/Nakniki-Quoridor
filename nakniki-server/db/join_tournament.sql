-- Necessary function to prevent race condition when two or more users attempt to join the same tournament at the same time
create or replace function join_tournament(p_tournament uuid, p_user uuid)
returns void as $$
declare v_size int; v_count int;
begin
  -- row lock: concurrent joins for THIS tournament queue up here
  select size into v_size from tournaments where id = p_tournament for update;
  if v_size is null then raise exception 'Tournament not found'; end if;

  select count(*) into v_count from tournament_participants where tournament_id = p_tournament;
  if v_count >= v_size then raise exception 'Tournament is full'; end if;

  insert into tournament_participants (tournament_id, user_id) values (p_tournament, p_user);
end;
$$ language plpgsql;