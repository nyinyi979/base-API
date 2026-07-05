"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@fastify/cors"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const fastify_1 = __importDefault(require("fastify"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const routes_1 = __importDefault(require("./api/auth/routes"));
const routes_2 = __importDefault(require("./api/master/routes"));
let cachedApp = null;
async function buildApp() {
    if (cachedApp)
        return cachedApp;
    const app = (0, fastify_1.default)({ logger: true });
    app.register(cors_1.default, {
        origin: "*",
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS", "PATCH"],
    });
    app.register(rate_limit_1.default, {
        max: 60,
        timeWindow: "1 minute",
    });
    app.register(multipart_1.default, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    });
    app.register(formbody_1.default);
    app.get("/api", (req, res) => {
        console.log("hello");
        res.send("hello");
    });
    app.register(routes_1.default, { prefix: "api/admin" });
    app.register(routes_2.default, { prefix: "api/master" });
    await app.ready();
    cachedApp = app;
    return app;
}
if (require.main === module) {
    buildApp().then((app) => app.listen({ port: +process.env.DEV_PORT || 7000, host: "127.0.0.1" }, (err, address) => {
        if (err) {
            app.log.error(err);
            process.exit(1);
        }
        console.log(`Server listening on ${address}`);
    }));
}
// Vercel handler
module.exports = async (req, res) => {
    const app = await buildApp();
    app.server.emit("request", req, res);
};
