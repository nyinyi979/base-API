"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFile = exports.removeFiles = exports.uploadFileRealPath = exports.uploadFile = exports.duplicateFileS3 = exports.saveFileToTmp = exports.uploadFileByBuffer = void 0;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const aws_1 = __importDefault(require("../lib/aws"));
const dotenv_1 = __importDefault(require("dotenv"));
const mime_types_1 = __importDefault(require("mime-types"));
dotenv_1.default.config();
const isProd = process.env.NODE_ENV === "production";
const uploadFileByBuffer = async (buffer, filename) => {
    const s3Key = (0, crypto_1.randomUUID)() + filename;
    // Detect MIME type with SVG fallback
    let contentType = mime_types_1.default.lookup(filename) || "application/octet-stream";
    if (filename.toLowerCase().endsWith(".svg")) {
        contentType = "image/svg+xml";
    }
    const data = await aws_1.default
        .upload({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        ContentDisposition: "inline", // 👈 Added
    })
        .promise();
    return data.Location;
};
exports.uploadFileByBuffer = uploadFileByBuffer;
const saveFileToTmp = ({ filename, buffer }) => {
    const safeFileName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueName = (0, crypto_1.randomUUID)() + "_" + safeFileName;
    const isProd = process.env.NODE_ENV === "production";
    const tmpDir = isProd ? "/tmp" : path_1.default.join(process.cwd(), "tmp");
    const tmpPath = path_1.default.join(tmpDir, uniqueName);
    // In local dev, make sure the tmp folder exists
    if (!isProd && !(0, fs_1.existsSync)(tmpDir)) {
        (0, fs_1.mkdirSync)(tmpDir);
    }
    (0, fs_1.writeFileSync)(tmpPath, buffer);
    return isProd ? tmpPath : "/tmp" + tmpPath.split("/tmp")[1];
};
exports.saveFileToTmp = saveFileToTmp;
const duplicateFileS3 = async (filePath) => {
    const response = await fetch(filePath);
    const buffer = Buffer.from(await response.arrayBuffer());
    const s3Key = (0, crypto_1.randomUUID)() + path_1.default.basename(filePath).replace(/\s+/g, "_");
    // Detect MIME type with SVG fallback
    let contentType = mime_types_1.default.lookup(filePath) || "application/octet-stream";
    if (filePath.toLowerCase().endsWith(".svg")) {
        contentType = "image/svg+xml";
    }
    const data = await aws_1.default
        .upload({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        ContentDisposition: "inline", // 👈 Added
    }).promise();
    return data.Location;
};
exports.duplicateFileS3 = duplicateFileS3;
const uploadFile = async (tmpFilePath) => {
    const isProd = process.env.NODE_ENV === "production";
    const realFilePath = isProd
        ? tmpFilePath
        : path_1.default.join(process.cwd(), tmpFilePath);
    if (!(0, fs_1.existsSync)(realFilePath)) {
        return "";
    }
    const buffer = (0, fs_1.readFileSync)(realFilePath);
    // Detect MIME type with SVG fallback
    let contentType = mime_types_1.default.lookup(realFilePath) || "application/octet-stream";
    if (realFilePath.toLowerCase().endsWith(".svg")) {
        contentType = "image/svg+xml";
    }
    const data = await aws_1.default
        .upload({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: path_1.default.basename(realFilePath),
        Body: buffer,
        ContentType: contentType,
        ContentDisposition: "inline", // 👈 Added
    })
        .promise();
    if ((0, fs_1.existsSync)(realFilePath))
        (0, fs_1.unlinkSync)(realFilePath);
    return data.Location;
};
exports.uploadFile = uploadFile;
const uploadFileRealPath = async (filePath) => {
    const buffer = (0, fs_1.readFileSync)(filePath);
    const s3Key = (0, crypto_1.randomUUID)() + path_1.default.basename(filePath).replace(/\s+/g, "_");
    // Detect MIME type with SVG fallback
    let contentType = mime_types_1.default.lookup(filePath) || "application/octet-stream";
    if (filePath.toLowerCase().endsWith(".svg")) {
        contentType = "image/svg+xml";
    }
    const data = await aws_1.default
        .upload({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: s3Key,
        Body: buffer,
        ContentType: contentType,
        ContentDisposition: "inline",
    })
        .promise();
    return data.Location;
};
exports.uploadFileRealPath = uploadFileRealPath;
const removeFiles = async (filePaths) => {
    if (!filePaths)
        return;
    await Promise.all(filePaths.map((filePath) => {
        return (0, exports.removeFile)(filePath);
    }));
};
exports.removeFiles = removeFiles;
const removeFile = async (filePath) => {
    if (!filePath)
        return;
    if (filePath.includes("s3")) {
        await aws_1.default
            .deleteObject({
            Bucket: process.env.S3_BUCKET_NAME || "",
            Key: filePath.split("https://stylo-collection.s3.ap-southeast-2.amazonaws.com/")[1],
        })
            .promise();
    }
    else {
        const realFilePath = isProd ? filePath : path_1.default.join(process.cwd(), filePath);
        console.log((0, fs_1.existsSync)(realFilePath));
        if ((0, fs_1.existsSync)(realFilePath)) {
            (0, fs_1.unlinkSync)(realFilePath);
        }
    }
};
exports.removeFile = removeFile;
