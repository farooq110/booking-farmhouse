import { Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt-utils"
import { RequestWithUser } from "./authenticate"

export const authenticateOptional = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next()
  }

  const token = authHeader.split(" ")[1]
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
  } catch (error) {
    // Ignore invalid tokens for optional authentication
  }
  return next()
}
