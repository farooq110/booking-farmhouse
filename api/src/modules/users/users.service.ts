import { UserModel, User } from "../../models/user.model"

export class UsersService {
  async findByEmail(email: string) {
    return UserModel.findOne({ email: email.toLowerCase() })
  }

  async findById(id: string) {
    return UserModel.findById(id)
  }

  async updateRefreshToken(id: string, token: string | null) {
    return UserModel.findByIdAndUpdate(
      id,
      { refresh_token: token || undefined },
      { new: true },
    )
  }

  async create(userData: Omit<User, "created_at" | "updated_at">) {
    const user = new UserModel(userData)
    return user.save()
  }
}
