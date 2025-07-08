let peer, conn;
let username = 'Anonymous';
let secretKey = null;
let peerName = 'Peer';

async function initializePeer() {
  const nameInput = document.getElementById("username").value.trim();
  const passInput = document.getElementById("passphrase").value.trim();
  if (!passInput) return alert("Enter a shared passphrase!");

  username = nameInput || 'Anonymous';
  secretKey = await deriveKey(passInput);

  peer = new Peer();
  peer.on("open", id => {
    document.getElementById("your-id").textContent = id;
    document.getElementById("peer-info").style.display = "block";
  });

  peer.on("connection", incoming => {
    conn = incoming;
    setupConnection();
  });
}

function connectToPeer() {
  const targetId = document.getElementById("peer-id-input").value.trim();
  if (!targetId || !peer || !secretKey) return alert("Set name/passphrase first.");
  conn = peer.connect(targetId);
  setupConnection();
}

function setupConnection() {
  conn.on("data", async data => {
    if (data.type === 'chat') {
      try {
        const decrypted = await decryptMessage(data);
        addMessage(decrypted.text, "them", decrypted.from, decrypted.time);
      } catch (e) {
        addMessage("[Decryption failed]", "them", "Unknown", new Date().toLocaleTimeString());
      }
    } else if (data.type === 'typing') {
      document.getElementById("typing-indicator").textContent = `${peerName} is typing...`;
      setTimeout(() => {
        document.getElementById("typing-indicator").textContent = '';
      }, 2000);
    } else if (data.type === 'intro') {
      peerName = data.name;
      document.getElementById("chat-status").textContent = `Connected to ${peerName}`;
    }
  });

  conn.on("open", () => {
    conn.send({ type: "intro", name: username });
    document.getElementById("chat-status").textContent = "Connected";
  });

  conn.on("close", () => {
    document.getElementById("chat-status").textContent = "🔴 Disconnected";
  });
}

async function sendMessage() {
  const input = document.getElementById("message-input");
  const text = input.value.trim();
  if (!text || !conn || !conn.open || !secretKey) return;

  const time = new Date().toLocaleTimeString();
  const encrypted = await encryptMessage(text, time, username);
  conn.send(encrypted);
  addMessage(text, "you", "You", time);
  input.value = '';
}

function addMessage(text, sender, name, time) {
  const box = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.innerHTML = `<strong>${name}</strong><span>${text}</span><small>${time}</small>`;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

document.getElementById("message-input").addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
  if (conn && conn.open) conn.send({ type: "typing" });
});

// E2EE Functions
async function deriveKey(pass) {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw", enc.encode(pass), { name: "PBKDF2" }, false, ["deriveKey"]
  );
  return await window.crypto.subtle.deriveKey({
    name: "PBKDF2",
    salt: enc.encode("p2p-salt"),
    iterations: 100000,
    hash: "SHA-256"
  }, keyMaterial, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

async function encryptMessage(text, time, from) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const enc = new TextEncoder();
  const encoded = enc.encode(JSON.stringify({ text, time, from }));
  const ciphertext = await window.crypto.subtle.encrypt({ name: "AES-GCM", iv }, secretKey, encoded);
  return {
    type: "chat",
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv)
  };
}

async function decryptMessage({ ciphertext, iv }) {
  const dec = new TextDecoder();
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
    secretKey,
    base64ToArrayBuffer(ciphertext)
  );
  return JSON.parse(dec.decode(decrypted));
}

// Utility functions
function arrayBufferToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ToArrayBuffer(base64) {
  const bin = atob(base64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}
function copyId() {
  navigator.clipboard.writeText(document.getElementById("your-id").textContent)
    .then(() => alert("Copied!"))
    .catch(() => alert("Failed to copy."));
}
