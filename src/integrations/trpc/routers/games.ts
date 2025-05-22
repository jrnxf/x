import { eq } from "drizzle-orm";
import { z } from "zod";

import { type TRPCRouterRecord } from "@trpc/server";
import { muxVideos, riuSets, riuSubmissions, rius, users } from "~/db/schema";
import { authProcedure, publicProcedure } from "~/integrations/trpc/init";
import {
  createRiuSetSchema,
  createRiuSubmissionSchema,
  editRiuSetSchema,
} from "~/models/games";

export const gamesRouter = {
  createRiuSet: authProcedure
    .input(createRiuSetSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.videoUploadId) {
        await ctx.db
          .insert(muxVideos)
          .values({
            uploadId: input.videoUploadId,
          })
          .onConflictDoNothing(); // the webhook won – the video is already ready
      }

      const upcomingRiu = await ctx.db.query.rius.findFirst({
        where: eq(rius.status, "upcoming"),
      });

      if (!upcomingRiu) {
        throw new Error("No upcoming RIU found");
      }

      const [riuSet] = await ctx.db
        .insert(riuSets)
        .values({
          ...input,
          riuId: upcomingRiu.id,
          userId,
        })
        .returning();

      return riuSet;
    }),
  createRiuSubmission: authProcedure
    .input(createRiuSubmissionSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      if (input.videoUploadId) {
        await ctx.db
          .insert(muxVideos)
          .values({
            uploadId: input.videoUploadId,
          })
          .onConflictDoNothing(); // the webhook won – the video is already ready
      }

      const [riuSet] = await ctx.db
        .select({
          id: riuSets.id,
          riu: {
            status: rius.status,
          },
        })
        .from(riuSets)
        .innerJoin(rius, eq(riuSets.riuId, rius.id))
        .where(eq(riuSets.id, input.riuSetId));

      if (!riuSet) {
        throw new Error("No RIU set found");
      }

      if (riuSet.riu.status !== "active") {
        throw new Error("RIU set is not from an active RIU");
      }

      const [riuSubmission] = await ctx.db
        .insert(riuSubmissions)
        .values({
          ...input,
          riuSetId: riuSet.id,
          userId,
        })
        .returning();

      return riuSubmission;
    }),

  deleteRiuSet: authProcedure
    .input(z.number())
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      const set = await ctx.db.query.riuSets.findFirst({
        where: eq(riuSets.id, input),
      });

      if (!set) {
        throw new Error("Set not found");
      }

      if (set.userId !== userId) {
        throw new Error("Access denied");
      }

      const [deletedSet] = await ctx.db
        .delete(riuSets)
        .where(eq(riuSets.id, input))
        .returning();

      return deletedSet;
    }),

  editRiuSet: authProcedure
    .input(editRiuSetSchema.extend({ setId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [riuSet] = await ctx.db
        .update(riuSets)
        .set({ ...input })
        .where(eq(riuSets.id, input.setId))
        .returning();

      return riuSet;
    }),

  getRiuSet: publicProcedure.input(z.number()).query(async ({ ctx, input }) => {
    const [set] = await ctx.db
      .select({
        description: riuSets.description,
        id: riuSets.id,
        name: riuSets.name,
        setPlaybackId: muxVideos.playbackId,
        user: {
          avatarUrl: users.avatarUrl,
          id: users.id,
          name: users.name,
        },
        video: {
          playbackId: muxVideos.playbackId,
        },
      })
      .from(riuSets)
      .innerJoin(muxVideos, eq(riuSets.videoUploadId, muxVideos.uploadId))
      .innerJoin(users, eq(riuSets.userId, users.id))
      .innerJoin(rius, eq(riuSets.riuId, rius.id))
      .where(eq(riuSets.id, input));

    return set;
  }),
  getRiuSubmission: publicProcedure
    .input(z.number())
    .query(async ({ ctx, input }) => {
      const [submission] = await ctx.db
        .select({
          id: riuSubmissions.id,
          user: {
            avatarUrl: users.avatarUrl,
            id: users.id,
            name: users.name,
          },
          video: {
            playbackId: muxVideos.playbackId,
          },
        })
        .from(riuSubmissions)
        .innerJoin(
          muxVideos,
          eq(riuSubmissions.videoUploadId, muxVideos.uploadId),
        )
        .innerJoin(users, eq(riuSubmissions.userId, users.id))
        .where(eq(riuSubmissions.id, input));

      return submission;
    }),
  listArchivedRius: publicProcedure.query(async ({ ctx }) => {
    const sets = await ctx.db
      .select()
      .from(rius)
      .where(eq(rius.status, "archived"));

    return sets;
  }),
  listRiuSets: publicProcedure
    .input(z.enum(["active", "archived", "upcoming"]))
    .query(async ({ ctx, input }) => {
      const sets = await ctx.db
        .select({
          description: riuSets.description,
          id: riuSets.id,
          name: riuSets.name,
          setPlaybackId: muxVideos.playbackId,
          user: {
            avatarUrl: users.avatarUrl,
            id: users.id,
            name: users.name,
          },
          video: {
            playbackId: muxVideos.playbackId,
          },
        })
        .from(riuSets)
        .innerJoin(muxVideos, eq(riuSets.videoUploadId, muxVideos.uploadId))
        .innerJoin(users, eq(riuSets.userId, users.id))
        .innerJoin(rius, eq(riuSets.riuId, rius.id))
        .where(eq(rius.status, input));

      // Fetch all sets with their submissions
      const setsWithSubmissions = await Promise.all(
        sets.map(async (set) => {
          const submissions = await ctx.db
            .select({
              createdAt: riuSubmissions.createdAt,
              id: riuSubmissions.id,
              user: {
                avatarUrl: users.avatarUrl,
                id: users.id,
                name: users.name,
              },
              video: {
                playbackId: muxVideos.playbackId,
              },
            })
            .from(riuSubmissions)
            .innerJoin(users, eq(riuSubmissions.userId, users.id))
            .innerJoin(
              muxVideos,
              eq(riuSubmissions.videoUploadId, muxVideos.uploadId),
            )
            .where(eq(riuSubmissions.riuSetId, set.id));

          return {
            ...set,
            submissions,
          };
        }),
      );

      const map = new Map<
        number,
        {
          sets: typeof setsWithSubmissions;
          user: (typeof setsWithSubmissions)[number]["user"];
        }
      >();

      for (const set of setsWithSubmissions) {
        const existing = map.get(set.user.id);
        if (existing) {
          existing.sets.push(set);
        } else {
          map.set(set.user.id, {
            sets: [set],
            user: set.user,
          });
        }
      }

      return [...map.values()];
    }),

  listUpcomingRiuRoster: publicProcedure.query(async ({ ctx }) => {
    const sets = await ctx.db
      .select({
        description: riuSets.description,
        id: riuSets.id,
        name: riuSets.name,
        user: {
          avatarUrl: users.avatarUrl,
          id: users.id,
          name: users.name,
        },
        video: {
          playbackId: muxVideos.playbackId,
        },
      })
      .from(riuSets)
      .innerJoin(rius, eq(rius.id, riuSets.riuId))
      .innerJoin(users, eq(riuSets.userId, users.id))
      .innerJoin(muxVideos, eq(riuSets.videoUploadId, muxVideos.uploadId))
      .where(eq(rius.status, "upcoming"));

    const map = new Map<
      number,
      {
        avatarUrl: null | string;
        count: number;
        id: number;
        name: string;
      }
    >();

    for (const set of sets) {
      if (set.user) {
        const existing = map.get(set.user.id);
        if (existing) {
          existing.count++;
        } else {
          map.set(set.user.id, {
            ...set.user,
            count: 1,
          });
        }
      }
    }

    const isAuthUsersSet = (set: (typeof sets)[number]) => {
      return ctx.session.user && set.user.id === ctx.session.user.id;
    };

    return {
      authUserSets: ctx.session.user ? sets.filter(isAuthUsersSet) : undefined,
      roster: Object.fromEntries(map),
    };
  }),

  rotateRius: authProcedure.mutation(async ({ ctx }) => {
    await ctx.db
      .update(rius)
      .set({ status: "archived" })
      .where(eq(rius.status, "active"));

    console.log("moved active rius to archived");

    await ctx.db
      .update(rius)
      .set({ status: "active" })
      .where(eq(rius.status, "upcoming"));

    console.log("moved upcoming riu to active");

    await ctx.db.insert(rius).values({
      status: "upcoming",
    });

    console.log("created new upcoming riu");
  }),
} satisfies TRPCRouterRecord;
