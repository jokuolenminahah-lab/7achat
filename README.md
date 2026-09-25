# 7a Chat

A small realtime chat called **7a Chat**.

## Run locally

```bash
npm install
npm start
```

Then open:

```text
http://localhost:3000
```

## Wasmer

Use a Wasmer Node.js app/service that runs:

```bash
npm install
npm start
```

The server listens on `process.env.PORT` when Wasmer provides it.

### Important

This version uses WebSockets, so everyone connected to the same running server sees messages in realtime.

Messages are kept in memory (the latest 200 messages). If the server restarts, the chat history is cleared. For permanent history, connect the server to a database later.
