"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const handlers_1 = require("./handlers");
const auth_1 = require("../../utils/auth");
async function authRoutes(app) {
    app.post("/signup", handlers_1.handleSignup);
    app.get("", handlers_1.handleGetUsers);
    app.get("/:id", handlers_1.handleGetUserById);
    app.post("/me", { preHandler: auth_1.authenticate }, handlers_1.handleGetUserByToken);
    app.put("/", handlers_1.handleUpdateUser);
    app.delete("/:id", handlers_1.handleDeleteAdmin);
    app.post("/login", handlers_1.handleLogin);
}
