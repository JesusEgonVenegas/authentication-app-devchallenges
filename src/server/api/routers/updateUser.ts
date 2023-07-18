import { ZodString, z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const updateUserRouter = createTRPCRouter({
  updateUser: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().optional(),
        bio: z.string().optional(),
        phone: z.string(). optional(),
        password: z.string().optional()
      })
    )
    .mutation(async ({ ctx, input }) => {

        const { id, ...updateFields } = input

      try {
        const updatedUser = await ctx.prisma.user.update({
          where : { id },
          data: updateFields,
        });
        return updatedUser
      } catch (error) {
        console.log(error);
      }
    }),
});
