import { z } from "zod";

export const likeableEntities = [
  "chatMessage",
  "post",
  "postMessage",
  "user",
] as const;

export type LikeableEntity = {
  id: number;
  likes: {
    user: {
      id: number;
      name: string;
    };
  }[];
};

export type LikeableEntityType = (typeof likeableEntities)[number];

export const likeUnlikeSchema = z.object({
  action: z.enum(["like", "unlike"]),
  recordId: z.number(), // the id of the thing being liked
  type: z.enum(likeableEntities),
});
