export const SESSION_KEY = "session";

export const POSTS_KEY = "posts";

export const USERS_KEY = "users";

export const FOLLOWS_KEY = "follows";

export const USER_FOLLOWS_KEY = (userId: number) =>
  `${USERS_KEY}.${userId}.${FOLLOWS_KEY}`;

export const MESSAGES_KEY = "messages";
