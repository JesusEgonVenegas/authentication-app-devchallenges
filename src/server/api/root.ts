import { createTRPCRouter } from "~/server/api/trpc";
import { updateUserRouter } from "./routers/updateUser";
import { s3Router } from "./routers/s3";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  updateUser: updateUserRouter,
  s3: s3Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;
