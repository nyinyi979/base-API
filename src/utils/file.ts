import { randomUUID } from "crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import path from "path";
import s3 from "../lib/aws";
import dotenv from "dotenv";
import mime from "mime-types";

dotenv.config();

export type TFile = {
  filename: string;
  buffer: Buffer<ArrayBufferLike>;
};

const isProd = process.env.NODE_ENV === "production";

export const uploadFileByBuffer = async (buffer: Buffer, filename: string) => {
  const s3Key = randomUUID() + filename;

  // Detect MIME type with SVG fallback
  let contentType = mime.lookup(filename) || "application/octet-stream";
  if (filename.toLowerCase().endsWith(".svg")) {
    contentType = "image/svg+xml";
  }

  const data = await s3
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

export const saveFileToTmp = ({ filename, buffer }: TFile) => {
  const safeFileName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const uniqueName = randomUUID() + "_" + safeFileName;

  const isProd = process.env.NODE_ENV === "production";

  const tmpDir = isProd ? "/tmp" : path.join(process.cwd(), "tmp");
  const tmpPath = path.join(tmpDir, uniqueName);

  // In local dev, make sure the tmp folder exists
  if (!isProd && !existsSync(tmpDir)) {
    mkdirSync(tmpDir);
  }

  writeFileSync(tmpPath, buffer);
  return isProd ? tmpPath : "/tmp" + tmpPath.split("/tmp")[1];
};

export const duplicateFileS3 = async (filePath: string) => {
  const response = await fetch(filePath);
  const buffer = Buffer.from(await response.arrayBuffer());

  const s3Key = randomUUID() + path.basename(filePath).replace(/\s+/g, "_");

  // Detect MIME type with SVG fallback
  let contentType = mime.lookup(filePath) || "application/octet-stream";
  if (filePath.toLowerCase().endsWith(".svg")) {
    contentType = "image/svg+xml";
  }
  const data = await s3
    .upload({
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: "inline", // 👈 Added
    }).promise();

  return data.Location;
};

export const uploadFile = async (tmpFilePath: string) => {
  const isProd = process.env.NODE_ENV === "production";
  const realFilePath = isProd
    ? tmpFilePath
    : path.join(process.cwd(), tmpFilePath);
  if (!existsSync(realFilePath)) {
    return "";
  }

  const buffer = readFileSync(realFilePath);

  // Detect MIME type with SVG fallback
  let contentType = mime.lookup(realFilePath) || "application/octet-stream";
  if (realFilePath.toLowerCase().endsWith(".svg")) {
    contentType = "image/svg+xml";
  }

  const data = await s3
    .upload({
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: path.basename(realFilePath),
      Body: buffer,
      ContentType: contentType,
      ContentDisposition: "inline", // 👈 Added
    })
    .promise();

  if (existsSync(realFilePath)) unlinkSync(realFilePath);
  return data.Location;
};

export const uploadFileRealPath = async (filePath: string) => {
  const buffer = readFileSync(filePath);
  const s3Key = randomUUID() + path.basename(filePath).replace(/\s+/g, "_");

  // Detect MIME type with SVG fallback
  let contentType = mime.lookup(filePath) || "application/octet-stream";
  if (filePath.toLowerCase().endsWith(".svg")) {
    contentType = "image/svg+xml";
  }

  const data = await s3
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

export const removeFiles = async (filePaths?: string[]) => {
  if (!filePaths) return;
  await Promise.all(
    filePaths.map((filePath) => {
      return removeFile(filePath);
    }),
  );
};

export const removeFile = async (filePath: string | null) => {
  if (!filePath) return;
  if (filePath.includes("s3")) {
    await s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME || "",
        Key: filePath.split(
          "https://stylo-collection.s3.ap-southeast-2.amazonaws.com/",
        )[1],
      })
      .promise();
  } else {
    const realFilePath = isProd ? filePath : path.join(process.cwd(), filePath);
    console.log(existsSync(realFilePath));
    if (existsSync(realFilePath)) {
      unlinkSync(realFilePath);
    }
  }
};
