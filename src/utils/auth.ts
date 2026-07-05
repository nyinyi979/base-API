import { FastifyReply, FastifyRequest } from "fastify";
import { messages } from "../api/messages";
import { getUserByToken } from "../api/auth/controllers";

export const authenticate = async function (
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const token = req.headers["x-access-token"];
    if (!token || typeof token !== "string") {
      throw new Error("Missing X-Access-Token header");
    } else {
      const user = await getUserByToken(token);

    }
  } catch (err) {
    res.status(401).send({ ...messages.unthorizedAccess });
  }
};

export const authenticateAdmin = async function (
  req: FastifyRequest,
  res: FastifyReply,
) {
  try {
    const token = req.headers["x-access-token"];
    if (!token || typeof token !== "string") {
      throw new Error("Missing X-Access-Token header");
    } else {
      const user = await getUserByToken(token);
      if (user.role !== 1) {
        throw new Error("Unauthorized access");
      }
    }
  } catch (err) {
    res.status(401).send({ ...messages.unthorizedAccess });
  }
};
