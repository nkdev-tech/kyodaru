CREATE TABLE `entries` (
	`id` text PRIMARY KEY NOT NULL,
	`raw_text` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
