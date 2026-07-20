import dotenv from "dotenv"
import mongoose from "mongoose"
import { app } from "./app"

dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI

const bootstrap = async () => {
  if (!PORT || !MONGO_URI) {
    throw new Error("PORT and MONGO_URI must be defined")
  }

  try {
    await mongoose.connect(MONGO_URI)
    console.log("Successfully connected to MongoDB")

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

bootstrap()