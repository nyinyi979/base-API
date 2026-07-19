"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = exports.authenticate = void 0;
const messages_1 = require("../api/messages");
const controllers_1 = require("../api/auth/controllers");
const authenticate = async function (req, res) {
    try {
        const token = req.headers["x-access-token"];
        if (!token || typeof token !== "string") {
            throw new Error("Missing X-Access-Token header");
        }
        else {
            const user = await (0, controllers_1.getUserByToken)(token);
            return user;
        }
    }
    catch (err) {
        res.status(401).send({ ...messages_1.messages.unthorizedAccess });
    }
};
exports.authenticate = authenticate;
const authenticateAdmin = async function (req, res) {
    try {
        const token = req.headers["x-access-token"];
        if (!token || typeof token !== "string") {
            throw new Error("Missing X-Access-Token header");
        }
        else {
            const user = await (0, controllers_1.getUserByToken)(token);
            if (user.role !== 1) {
                throw new Error("Unauthorized access");
            }
            return user;
        }
    }
    catch (err) {
        res.status(401).send({ ...messages_1.messages.unthorizedAccess });
    }
};
exports.authenticateAdmin = authenticateAdmin;
