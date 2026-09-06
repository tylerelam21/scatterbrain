CREATE TABLE "chess_puzzles" (
	"hour_key" text PRIMARY KEY NOT NULL,
	"puzzle_id" text NOT NULL,
	"fen" text NOT NULL,
	"side_to_move" text NOT NULL,
	"solution_move" text NOT NULL,
	"rating" integer,
	"themes" text[] DEFAULT '{}' NOT NULL,
	"source" text DEFAULT 'lichess' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
