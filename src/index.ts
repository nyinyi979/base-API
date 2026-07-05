import cors from "@fastify/cors";
import formBody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import Fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import rateLimit from "@fastify/rate-limit";
import authRoutes from "./api/auth/routes";
import masterRoutes from "./api/master/routes";

let cachedApp: FastifyInstance | null = null;
async function buildApp(): Promise<FastifyInstance> {
  if (cachedApp) return cachedApp;

  const app: FastifyInstance = Fastify({ logger: true });

  app.register(cors, {
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
  });
  app.register(rateLimit, {
    max: 60,
    timeWindow: "1 minute",
  });

  app.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
  });
  app.register(formBody);

  app.get("/api", (req, res) => {
    console.log("hello");
    res.send("hello");
  });
  app.register(authRoutes, { prefix: "api/admin" });
  app.register(masterRoutes, { prefix: "api/master" });
  await app.ready();
  cachedApp = app;
  return app;
}

if (require.main === module) {
  buildApp().then((app) =>
    app.listen(
      { port: +process.env.DEV_PORT! || 7000, host: "127.0.0.1" },
      (err, address) => {
        if (err) {
          app.log.error(err);
          process.exit(1);
        }
        console.log(`Server listening on ${address}`);
      },
    ),
  );
}

// Vercel handler
module.exports = async (req: FastifyRequest, res: FastifyReply) => {
  const app = await buildApp();
  app.server.emit("request", req, res);
};
