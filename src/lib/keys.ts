export const SESSION_KEY = "session";

export const POSTS_KEY = "posts";

export const USERS_KEY = "users";

export const FOLLOWS_KEY = "follows";

export const USER_FOLLOWS_KEY = (userId: number) =>
  `${USERS_KEY}.${userId}.${FOLLOWS_KEY}`;

export const MESSAGES_KEY = "messages";

export const GAMES_RIU_UPCOMING_ROSTER_KEY = "games.rius.upcoming.roster";

export const QUERY_KEYS = {
  SESSION: "session",
  POSTS: "posts",
  USERS: "users",
  FOLLOWS: "follows",
  USER_FOLLOWS: (userId: number) => `${USERS_KEY}.${userId}.${FOLLOWS_KEY}`,
  MESSAGES: "messages",
  GAMES_RIU_UPCOMING_ROSTER: ["games", "rius", "upcoming", "roster"],
} as const;
