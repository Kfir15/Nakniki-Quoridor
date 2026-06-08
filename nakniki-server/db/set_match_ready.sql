-- Checks within the database whether a match has two players, and if so, sets the match status to READY
create or replace function set_match_ready()
returns trigger as $$
begin
  if new.player_1_id is not null
     and new.player_2_id is not null
     and new.status = 'PENDING' then
    new.status := 'READY';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_set_match_ready
before insert or update on tournament_matches
for each row execute function set_match_ready();