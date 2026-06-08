begin
  insert into public.users (id, email, username, avatar_url)
  values (
    new.id, 
    new.email,
    -- Fallback chain for different providers (Email vs Google)
    coalesce(new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'Player_' || substr(new.id::text, 1, 5)), 
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture')
  );
  return new;
end;