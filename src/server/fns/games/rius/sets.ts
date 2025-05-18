import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "~/db";
import { muxVideos, rius, riuSets } from "~/db/schema";
import { authMiddleware } from "~/server/middleware/auth";

const baseRiuSetSchema = z.object({
  description: z.string().optional(),
  name: z.string().min(1, { message: "Required" }),
});

const createRiuSetSchema = baseRiuSetSchema.extend({
  videoUploadId: z.string().min(1, { message: "Required" }),
});

const createSet = createServerFn({
  method: "POST",
})
  .validator(createRiuSetSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (data.videoUploadId) {
      await db
        .insert(muxVideos)
        .values({
          uploadId: data.videoUploadId,
        })
        .onConflictDoNothing(); // the webhook won – the video is already ready
    }

    const upcomingRiu = await db.query.rius.findFirst({
      where: eq(rius.status, "upcoming"),
    });

    if (!upcomingRiu) {
      throw new Error("No upcoming RIU found");
    }

    const [riuSet] = await db
      .insert(riuSets)
      .values({
        ...data,
        riuId: upcomingRiu.id,
        userId: context.user.id,
      })
      .returning();

    return riuSet;
  });

const updateRiuSetSchema = baseRiuSetSchema.extend({
  setId: z.number().int().positive(),
});

const updateSet = createServerFn({
  method: "POST",
})
  .validator(updateRiuSetSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const [riuSet] = await db
      .update(riuSets)
      .set({ ...data })
      .where(
        and(eq(riuSets.id, data.setId), eq(riuSets.userId, context.user.id)),
      )
      .returning();

    return riuSet;
  });

const deleteRiuSetSchema = z.object({
  setId: z.number().int().positive(),
});

const deleteSet = createServerFn({
  method: "POST",
})
  .validator(deleteRiuSetSchema)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const [riuSet] = await db
      .delete(riuSets)
      .where(
        and(eq(riuSets.id, data.setId), eq(riuSets.userId, context.user.id)),
      )
      .returning();

    return riuSet;
  });

export const createRiuSet = {
  schema: createRiuSetSchema,
  serverFn: createSet,
};

export const updateRiuSet = {
  schema: updateRiuSetSchema,
  serverFn: updateSet,
};

export const deleteRiuSet = {
  schema: deleteRiuSetSchema,
  serverFn: deleteSet,
};
