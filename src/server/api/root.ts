import { createTRPCRouter } from "~/server/api/trpc";
import { updateUserRouter } from "./routers/updateUser";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  updateUser: updateUserRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
