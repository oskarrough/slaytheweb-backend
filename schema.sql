drop table if exists runs;
drop table if exists players;

PRAGMA foreign_keys = on;

create table runs (
  id integer primary key not null,
 	created_at integer DEFAULT (strftime('%s', 'now')),
  player text not null references players(name),
  won integer,
  game_state blob,
  foreign key (player) references players(name)
);

create table players (
  name text primary key not null,
 	created_at integer DEFAULT (strftime('%s', 'now'))
);

insert into players (name) values ('Jaw Worm');
insert into players (name) values ('Jorbs');

insert into runs (player, won, game_state) values ('Jorbs', 1, '{"level": 5}');
insert into runs (player, won) values ('Jorbs', 0);
insert into runs (player) values ('Jorbs');
insert into runs (player, won) values ('Jaw Worm', 1);

