import { Request, Response, NextFunction } from "express"
import { verifyAccessToken, TokenPayload } from "../utils/jwt-utils"
import { HttpError } from "../errors/http-error"

export interface RequestWithUser extends Request {
  user?: TokenPayload
}

export const authenticate = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new HttpError(401, "No authentication token provided"))
  }

  const token = authHeader.split(" ")[1]
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    return next()
  } catch (error) {
    return next(error)
  }
}
