"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.deleteUser = exports.updateUser = exports.getUserByToken = exports.getUserById = exports.getUsers = exports.signUp = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = __importDefault(require("../../db"));
const jsonwebtoken_1 = require("jsonwebtoken");
const user_1 = require("../../db/user");
const drizzle_orm_1 = require("drizzle-orm");
const signUp = async (data) => {
    const user = await db_1.default.query.usersTable.findFirst({
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.email, data.email),
    });
    if (user)
        return { error: "User already exists" };
    const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    const response = await db_1.default
        .insert(user_1.usersTable)
        .values({
        ...data,
        password: hashedPassword,
    })
        .returning({
        id: user_1.usersTable.id,
        email: user_1.usersTable.email,
        role: user_1.usersTable.role,
    });
    return { message: "Successfully created!", data: response };
};
exports.signUp = signUp;
const getUsers = async ({ page, perPage }) => {
    return await db_1.default.transaction(async (tx) => {
        const data = await tx.query.usersTable.findMany({
            limit: perPage,
            offset: page * perPage,
            columns: {
                id: true,
                email: true,
                role: true,
            },
        });
        const count = await tx.$count(user_1.usersTable);
        return { data, count };
    });
};
exports.getUsers = getUsers;
const getUserById = async (id) => {
    const user = await db_1.default.query.usersTable.findFirst({
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.id, id),
        columns: {
            id: true,
            username: true,
            email: true,
            role: true,
        },
    });
    if (!user)
        throw new Error("User not found");
    return user;
};
exports.getUserById = getUserById;
const getUserByToken = async (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not configured");
    const payload = (0, jsonwebtoken_1.verify)(token, secret, { algorithms: ["HS256"] });
    if (typeof payload === "string" || typeof payload.id !== "string") {
        throw new Error("Invalid token payload");
    }
    return (0, exports.getUserById)(payload.id);
};
exports.getUserByToken = getUserByToken;
const updateUser = async (data) => {
    const user = await db_1.default.query.usersTable.findFirst({
        columns: {
            id: true,
            password: true,
            email: true,
        },
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.id, data.id),
    });
    if (!user)
        throw new Error("User not found");
    let hashedPassword = null;
    if (data.password) {
        hashedPassword = await bcrypt_1.default.hash(data.password, 10);
    }
    const response = await db_1.default
        .update(user_1.usersTable)
        .set({
        ...data,
        password: hashedPassword || user.password,
    })
        .where((0, drizzle_orm_1.eq)(user_1.usersTable.id, data.id))
        .returning({
        id: user_1.usersTable.id,
        email: user_1.usersTable.email,
        role: user_1.usersTable.role,
    });
    return response[0];
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const data = await db_1.default
        .delete(user_1.usersTable)
        .where((0, drizzle_orm_1.eq)(user_1.usersTable.id, id))
        .returning();
    return data;
};
exports.deleteUser = deleteUser;
const login = async (data) => {
    const user = await db_1.default.query.usersTable.findFirst({
        columns: {
            id: true,
            password: true,
            email: true,
        },
        where: (0, drizzle_orm_1.eq)(user_1.usersTable.email, data.email),
    });
    if (!user)
        throw new Error("User not found");
    const password = await bcrypt_1.default.compare(data.password, user.password);
    if (!password)
        throw new Error("Invalid password");
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error("JWT_SECRET is not configured");
    const token = (0, jsonwebtoken_1.sign)({ id: user.id }, secret, {
        algorithm: "HS256",
        expiresIn: "7d",
    });
    return { user: { ...user, password: null }, token };
};
exports.login = login;
