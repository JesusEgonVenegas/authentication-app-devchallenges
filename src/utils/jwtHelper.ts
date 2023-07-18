import { JWT, encode, decode } from "next-auth/jwt"
import { env } from "../env.mjs"
import { User } from "@prisma/client"

export interface AuthUser extends Omit<User, "Password">{}

export const tokenOneDay = 24 * 60 * 60;
export const tokenOneWeek = tokenOneDay * 7

const createJWT = (token:AuthUser | any, duration: number) => encode({token, secret: env.JWT_SECRET, maxAge: duration})

export const jwtHelper = {
    createAccessToken: (token:AuthUser) => createJWT(token, tokenOneDay),
    createRefreshToken: (token:AuthUser) => createJWT(token, tokenOneWeek),
    verifyToken: (token:string) => decode({token, secret: env.JWT_SECRET})
}