import jwt from "jsonwebtoken"
import { HttpError } from "../errors/http-error"

export interface TokenPayload {
  id: string
  email: string
  role: string
}

export const signAccessToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET!
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as any,
  })
}

export const signRefreshToken = (payload: TokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET!
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as any,
  })
}

export const verifyAccessToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_ACCESS_SECRET!
  try {
    return jwt.verify(token, secret) as TokenPayload
  } catch (error) {
    throw new HttpError(401, "Invalid or expired access token")
  }
}

export const verifyRefreshToken = (token: string): TokenPayload => {
  const secret = process.env.JWT_REFRESH_SECRET!
  try {
    return jwt.verify(token, secret) as TokenPayload
  } catch (error) {
    throw new HttpError(401, "Invalid or expired refresh token")
  }
}
