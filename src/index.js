"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
const socket_1 = require("./config/socket");
const startServer = async () => {
    await (0, db_1.connectDb)(env_1.env.mongoUri);
    const server = http_1.default.createServer(app_1.app);
    (0, socket_1.setupSocket)(server);
    server.listen(env_1.env.port, () => {
        console.log(`Server listening on port ${env_1.env.port}`);
    });
};
startServer().catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
});
