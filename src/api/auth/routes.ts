import { FastifyInstance } from "fastify";
import {
  handleGetUserById,
  handleGetUserByToken,
  handleGetUsers,
  handleUpdateUser,
  handleDeleteAdmin,
  handleLogin,
  handleSignup,
} from "./handlers";
import { authenticate } from "../../utils/auth";

export default async function authRoutes(app: FastifyInstance) {
  app.post("/signup", handleSignup);
  app.get("", handleGetUsers);
  app.get("/:id", handleGetUserById);
  app.post("/me", { preHandler: authenticate }, handleGetUserByToken);
  app.put("/", handleUpdateUser);
  app.delete("/:id", handleDeleteAdmin);
  app.post("/login", handleLogin);
}
