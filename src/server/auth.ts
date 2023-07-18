import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
} from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials"
import { env } from "~/env.mjs";
import { prisma } from "~/server/db";
import { AuthUser, jwtHelper, tokenOneDay, tokenOneWeek } from "~/utils/jwtHelper";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
// declare module "next-auth" {
//   interface Session extends DefaultSession {
//     user: {
//       id: string;
//       // ...other properties
//       // role: UserRole;
//     } & DefaultSession["user"];
//   }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
// }

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60
  },
  callbacks: {
    async jwt({token, user, profile, account, isNewUser}){
      if (user) {
        const authUser = {id: user.id, name: user.name, email: user.email, bio: user.bio, image: user.image, phone: user.phone, password: user.password} as AuthUser;

        const accessToken = await jwtHelper.createAccessToken(authUser);
        const refreshToken = await jwtHelper.createRefreshToken(authUser);
        const accessTokenExpired = Date.now() / 1000 + tokenOneDay;
        const refreshTokenExpired= Date.now() / 1000 + tokenOneWeek;

        return {
          ...token, accessToken, refreshToken, accessTokenExpired, refreshTokenExpired,
          user: authUser
        }
      } else {
        if (token) {
          if (Date.now() / 1000 > token.accessTokenExpired) {
            const verifyToken = await jwtHelper.verifyToken(token.refreshToken)

            if (verifyToken) {
              const user = await prisma.user.findFirst({
                where: {
                  name: token.user.name
                }
              })

              if (user) {
                const accessToken = await jwtHelper.createAccessToken(token.user);
                const accessTokenExpired = Date.now() / 1000 + tokenOneDay;

                return {...token, accessToken, accessTokenExpired}
              }
            }

            return {...token, error: "RefreshAccessTokenError"}
          }
        }
      }

      return token
    },
    async session({ session, token}) {
      if (token){
        session.user = {
          name: token.user.name,
          email: token.user.email,
          bio: token.user.bio,
          image: token.user.image,
          phone: token.user.phone,
          password: token.user.password,
          userId: token.user.id
        }
      }
      session.error = token.error
      return session
    }
  },
    // session: ({ session, user }) => ({
    //   ...session,
    //   user: {
    //     ...session.user,
    //     id: user.id,
    //   },
    // }),
  // },
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: env.GITHUB_ID,
      clientSecret: env.GITHUB_SECRET
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@email.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials || !credentials.email || !credentials.password) {
          // Credentials are missing or incomplete
          return null;
        }
        // Add logic here to look up the user from the credentials supplied
        // const user = { id: "1", name: "J Smith", email: "jsmith@example.com" }
        const { email, password } = credentials

        const user = await prisma.user.findUnique({ where: { email } })
  
        if (user && password === user.password) {
          // Any object returned will be saved in `user` property of the JWT
          return {
            id: user.id,
            name: user.name || undefined,
            email: user.email || undefined,
            image: user.image || undefined,
            bio: user.bio || undefined,
            password: user.password || undefined,
            phone: user.phone || undefined
          }
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      }
    })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  pages: {
    signIn: "/signin",
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
