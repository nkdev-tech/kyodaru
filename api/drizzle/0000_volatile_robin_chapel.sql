CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`summary` text NOT NULL,
	`raw_text` text NOT NULL,
	`condition_level` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
