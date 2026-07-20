import { Router, Request, Response, NextFunction } from "express"
import { AuthService } from "./auth.service"
import { registerSchema, loginSchema } from "./auth.validation"
import { validate } from "../../common/middleware/validate"
import { authenticate, RequestWithUser } from "../../common/middleware/authenticate"
import { sendSuccess } from "../../common/utils/response-utils"
import { HttpError } from "../../common/errors/http-error"

const authRouter = Router()
const authService = new AuthService()

authRouter.post(
  "/register",
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      return sendSuccess(res, result, 201)
    } catch (error) {
      return next(error)
    }
  },
)

authRouter.post(
  "/login",
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body)
      return sendSuccess(res, result, 200)
    } catch (error) {
      return next(error)
    }
  },
)

authRouter.post(
  "/refresh",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body
      if (!refreshToken) {
        throw new HttpError(400, "Refresh token is required")
      }
      const result = await authService.refreshTokens(refreshToken)
      return sendSuccess(res, result, 200)
    } catch (error) {
      return next(error)
    }
  },
)

authRouter.post(
  "/logout",
  authenticate,
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id
      if (!userId) {
        throw new HttpError(401, "Unauthorized")
      }
      await authService.logout(userId)
      return sendSuccess(res, { message: "Successfully logged out" }, 200)
    } catch (error) {
      return next(error)
    }
  },
)

export { authRouter }
