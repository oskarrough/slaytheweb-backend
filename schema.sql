drop table if exists runs;
drop table if exists players;

PRAGMA foreign_keys = on;

create table runs (
  id integer primary key not null,
 	created_at integer DEFAULT (strftime('%s', 'now')),
  player text not null references players(name),
  game_state blob,
  game_past blob,
  foreign key (player) references players(name)
);

create table players (
  name text primary key not null,
 	created_at integer DEFAULT (strftime('%s', 'now'))
);

--insert into players (name) values ('Jaw Worm');
--insert into players (name) values ('Jorbs');
--insert into runs (player, game_state) values ('Jorbs', '{"turn": 5}');
--insert into runs (player, game_state) values ('Jaw Worm', '{"turn": 1}');
