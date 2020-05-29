import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
// import socialRoutes from "@colyseus/social/express"

// import { MyRoom } from "./MyRoom";
import { GameRoom } from "./GameRoom";

// const port = Number(process.env.PORT || 2567);
const port = Number(process.env.PORT || 2567) + Number(process.env.NODE_APP_INSTANCE || 0);

const app = express()

app.use(cors());
app.use(express.json())

const server = http.createServer(app);
const gameServer = new Server({
  server,
  express:app
});

// register your room handlers
gameServer.define('game', GameRoom);

/**
 * Register @colyseus/social routes
 *
 * - uncomment if you want to use default authentication (https://docs.colyseus.io/authentication/)
 * - also uncomment the import statement
 */
// app.use("/", socialRoutes);
// register colyseus monitor AFTER registering your room handlers
app.use("/colyseus", monitor());

gameServer.onShutdown(function () {
  console.log(`game server is going down.`);
});
gameServer.listen(port);
console.log(`Listening on ws://localhost:${ port }`)
