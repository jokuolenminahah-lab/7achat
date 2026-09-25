const path = require("path");
const http = require("http");
const express = require("express");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const messages = [];
const MAX_MESSAGES = 200;

app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "7a Chat" });
});

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  }
}

wss.on("connection", (ws) => {
  ws.send(JSON.stringify({
    type: "history",
    messages
  }));

  ws.on("message", (raw) => {
    try {
      const payload = JSON.parse(raw.toString());
      const name = String(payload.name || "").trim().slice(0, 30);
      const text = String(payload.text || "").trim().slice(0, 500);

      if (!name || !text) return;

      const message = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        text,
        time: new Date().toISOString()
      };

      messages.push(message);
      if (messages.length > MAX_MESSAGES) messages.shift();

      broadcast({ type: "message", message });
    } catch {
      // Ignore malformed messages.
    }
  });
});

server.listen(PORT, () => {
  console.log(`7a Chat running on port ${PORT}`);
});