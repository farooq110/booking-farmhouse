import { HttpError } from "../../common/errors/http-error"
import { UsersService } from "../users/users.service"
import { RegisterDto, LoginDto } from "./auth.validation"
import { hashPassword, comparePassword } from "../../common/utils/hash-utils"
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/utils/jwt-utils"

export class AuthService {
  private readonly usersService = new UsersService()

  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email)
    if (existingUser) {
      throw new HttpError(400, "User with this email already exists")
    }

    const passwordHash = await hashPassword(dto.password)

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password_hash: passwordHash,
      role: "admin",
    })

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken)

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) {
      throw new HttpError(401, "Invalid email or password")
    }

    const isPasswordValid = await comparePassword(dto.password, user.password_hash)
    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid email or password")
    }

    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken)

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    }
  }

  async refreshTokens(token: string) {
    const payload = verifyRefreshToken(token)
    const user = await this.usersService.findById(payload.id)

    if (!user || user.refresh_token !== token) {
      throw new HttpError(401, "Invalid or expired refresh token")
    }

    const newPayload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    }

    const accessToken = signAccessToken(newPayload)
    const refreshToken = signRefreshToken(newPayload)

    await this.usersService.updateRefreshToken(user._id.toString(), refreshToken)

    return {
      accessToken,
      refreshToken,
    }
  }

  async logout(userId: string) {
    await this.usersService.updateRefreshToken(userId, null)
  }
}
