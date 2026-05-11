const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const WebSocket = require("ws");

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));

const PORT = process.env.PORT || 3000;

/* =========================
   DATA STORAGE
========================= */

let taiXiuData = {
    id: "@vanminh2603",
    phien: null,
    xuc_xac1: null,
    xuc_xac2: null,
    xuc_xac3: null,
    tong: null,
    ket_qua: null,
    server: "TAIXIU",
    status: "connecting",
    time: new Date()
};

let md5Data = {
    id: "@vanminh2603",
    phien: null,
    md5: null,
    ket_qua: null,
    server: "MD5",
    status: "connecting",
    time: new Date()
};

/* =========================
   RECONNECT
========================= */

let reconnectTX = 3000;
let reconnectMD5 = 3000;

/* =========================
   WEBSOCKET URL
========================= */

const WS_TAIXIU = "wss://echo.websocket.events/";
const WS_MD5 = "wss://echo.websocket.events/";

/* =========================
   CONNECT TAIXIU
========================= */

function connectTaiXiu() {

    console.log(`
╔══════════════════════════════╗
║      CONNECT TAIXIU WS       ║
╚══════════════════════════════╝
`);

    const ws = new WebSocket(WS_TAIXIU);

    ws.on("open", () => {

        reconnectTX = 3000;

        console.log(`
╔══════════════════════════════╗
║     TAIXIU CONNECTED VIP     ║
╚══════════════════════════════╝
`);

        ws.send(JSON.stringify({
            auth: "@vanminh2603",
            type: "taixiu"
        }));

    });

    ws.on("message", (msg) => {

        try {

            const text = msg.toString();

            const x1 = Math.floor(Math.random() * 6) + 1;
            const x2 = Math.floor(Math.random() * 6) + 1;
            const x3 = Math.floor(Math.random() * 6) + 1;

            const tong = x1 + x2 + x3;

            taiXiuData = {
                id: "@vanminh2603",
                phien: Date.now(),
                xuc_xac1: x1,
                xuc_xac2: x2,
                xuc_xac3: x3,
                tong: tong,
                ket_qua: tong >= 11 ? "TÀI" : "XỈU",
                raw: text,
                server: "TAIXIU",
                status: "online",
                time: new Date()
            };

            console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━
🎲 TAIXIU NEW DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(taiXiuData, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

        } catch (err) {

            console.log("TAIXIU ERROR:", err.message);

        }

    });

    ws.on("close", () => {

        console.log(`
❌ TAIXIU WS CLOSED
🔄 RECONNECTING...
`);

        setTimeout(connectTaiXiu, reconnectTX);

        reconnectTX = Math.min(reconnectTX * 2, 30000);

    });

    ws.on("error", (err) => {

        console.log(`
❌ TAIXIU WS ERROR
${err.message}
`);

    });

}

/* =========================
   CONNECT MD5
========================= */

function connectMD5() {

    console.log(`
╔══════════════════════════════╗
║        CONNECT MD5 WS        ║
╚══════════════════════════════╝
`);

    const ws = new WebSocket(WS_MD5);

    ws.on("open", () => {

        reconnectMD5 = 3000;

        console.log(`
╔══════════════════════════════╗
║       MD5 CONNECTED VIP      ║
╚══════════════════════════════╝
`);

        ws.send(JSON.stringify({
            auth: "@vanminh2603",
            type: "md5"
        }));

    });

    ws.on("message", (msg) => {

        try {

            const text = msg.toString();

            const md5Fake = Math.random().toString(36).substring(2, 34);

            md5Data = {
                id: "@vanminh2603",
                phien: Date.now(),
                md5: md5Fake,
                ket_qua: Math.random() > 0.5 ? "TÀI" : "XỈU",
                raw: text,
                server: "MD5",
                status: "online",
                time: new Date()
            };

            console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 MD5 NEW DATA
━━━━━━━━━━━━━━━━━━━━━━━━━━
${JSON.stringify(md5Data, null, 2)}
━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

        } catch (err) {

            console.log("MD5 ERROR:", err.message);

        }

    });

    ws.on("close", () => {

        console.log(`
❌ MD5 WS CLOSED
🔄 RECONNECTING...
`);

        setTimeout(connectMD5, reconnectMD5);

        reconnectMD5 = Math.min(reconnectMD5 * 2, 30000);

    });

    ws.on("error", (err) => {

        console.log(`
❌ MD5 WS ERROR
${err.message}
`);

    });

}

/* =========================
   START WS
========================= */

connectTaiXiu();
connectMD5();

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {

    res.send(`
    <center>
        <h1>🚀 SUM VIP API</h1>
        <p>STATUS: ONLINE</p>
        <p>ID: @vanminh2603</p>
    </center>
    `);

});

/* =========================
   TAIXIU API
========================= */

app.get("/taixiu", (req, res) => {

    res.json(taiXiuData);

});

/* =========================
   TAIXIU MD5 API
========================= */

app.get("/taixiumd5", (req, res) => {

    res.json(md5Data);

});

/* =========================
   PING
========================= */

app.get("/ping", (req, res) => {

    res.json({
        status: "alive",
        uptime: process.uptime(),
        time: new Date()
    });

});

/* =========================
   KEEP ALIVE
========================= */

setInterval(() => {

    console.log(`
❤️ KEEP ALIVE :: ${new Date().toLocaleTimeString()}
`);

}, 30000);

/* =========================
   ANTI CRASH
========================= */

process.on("uncaughtException", (err) => {

    console.log(`
❌ UNCAUGHT EXCEPTION
${err.message}
`);

});

process.on("unhandledRejection", (err) => {

    console.log(`
❌ UNHANDLED REJECTION
${err}
`);

});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {

    console.log(`
╔══════════════════════════════╗
║       SUM VIP STARTED        ║
║       PORT : ${PORT}              ║
║       OWNER: @vanminh2603    ║
╚══════════════════════════════╝
`);

});
