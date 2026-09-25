const nameInput = document.getElementById("name");
const messageInput = document.getElementById("message");
const chatForm = document.getElementById("chatForm");
const sendButton = document.getElementById("send");
const messagesEl = document.getElementById("messages");
const statusEl = document.getElementById("status");

let socket;

nameInput.value = localStorage.getItem("7a-chat-name") || "";

function setStatus(online) {
  statusEl.textContent = online ? "Online" : "Connecting…";
  statusEl.className = `status ${online ? "online" : "offline"}`;
  messageInput.disabled = !online || !nameInput.value.trim();
  sendButton.disabled = !online || !nameInput.value.trim();
}

function connect() {
  const protocol = location.protocol === "https:" ? "wss:" : "ws:";
  socket = new WebSocket(`${protocol}//${location.host}`);

  socket.addEventListener("open", () => {
    setStatus(true);
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "history") {
      messagesEl.innerHTML = "";
      if (!data.messages.length) showEmpty();
      data.messages.forEach(addMessage);
      scrollToBottom();
    }

    if (data.type === "message") {
      removeEmpty();
      addMessage(data.message);
      scrollToBottom();
    }
  });

  socket.addEventListener("close", () => {
    setStatus(false);
    setTimeout(connect, 1500);
  });

  socket.addEventListener("error", () => {
    socket.close();
  });
}

function showEmpty() {
  if (!document.querySelector(".empty")) {
    messagesEl.innerHTML = '<div class="empty">No messages yet. Say hello 👋</div>';
  }
}

function removeEmpty() {
  document.querySelector(".empty")?.remove();
}

function addMessage(message) {
  const item = document.createElement("article");
  item.className = "message";

  if (message.name === nameInput.value.trim()) {
    item.classList.add("mine");
  }

  const meta = document.createElement("div");
  meta.className = "meta";

  const name = document.createElement("span");
  name.className = "name";
  name.textContent = message.name;

  const time = document.createElement("time");
  time.className = "time";
  time.textContent = new Date(message.time).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  const text = document.createElement("div");
  text.className = "text";
  text.textContent = message.text;

  meta.append(name, time);
  item.append(meta, text);
  messagesEl.appendChild(item);
}

function scrollToBottom() {
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

nameInput.addEventListener("input", () => {
  const name = nameInput.value.trim();
  localStorage.setItem("7a-chat-name", name);
  const online = socket && socket.readyState === WebSocket.OPEN;
  messageInput.disabled = !online || !name;
  sendButton.disabled = !online || !name;
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const text = messageInput.value.trim();

  if (!name || !text || !socket || socket.readyState !== WebSocket.OPEN) return;

  socket.send(JSON.stringify({ name, text }));
  messageInput.value = "";
  messageInput.focus();
});

showEmpty();
connect();
