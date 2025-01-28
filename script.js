const peer = new Peer(); // Create a new Peer instance
let conn; // Store the active connection

// DOM elements
const peerIdInput = document.getElementById('peer-id');
const connectIdInput = document.getElementById('connect-id');
const connectBtn = document.getElementById('connect-btn');
const messagesDiv = document.getElementById('messages');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');

// Display your Peer ID when ready
peer.on('open', (id) => {
  peerIdInput.value = id;
  console.log(`Your Peer ID: ${id}`);
});

// Connect to another peer
connectBtn.addEventListener('click', () => {
  const connectId = connectIdInput.value;
  if (!connectId) {
    alert('Please enter a Peer ID to connect.');
    return;
  }

  conn = peer.connect(connectId);

  conn.on('open', () => {
    console.log('Connected to:', connectId);
    addMessage(`Connected to ${connectId}`, 'system');
    setupConnection();
  });

  conn.on('error', (err) => {
    console.error('Connection error:', err);
    alert('Connection failed.');
  });
});

// Handle incoming connections
peer.on('connection', (connection) => {
  conn = connection;
  console.log('Incoming connection from:', conn.peer);
  addMessage(`Connected to ${conn.peer}`, 'system');
  setupConnection();
});

// Setup event listeners for an active connection
function setupConnection() {
  conn.on('data', (data) => {
    console.log('Received:', data);
    addMessage(data, 'peer');
  });

  conn.on('close', () => {
    console.log('Connection closed.');
    addMessage('Connection closed.', 'system');
  });
}

// Send a message
sendBtn.addEventListener('click', () => {
  const message = messageInput.value.trim();
  if (!message) return;

  conn.send(message); // Send message to peer
  addMessage(message, 'self'); // Display it in the chat
  messageInput.value = ''; // Clear the input field
});

// Add a message to the chat box
function addMessage(message, type) {
  const messageDiv = document.createElement('div');
  messageDiv.textContent = message;

  if (type === 'self') {
    messageDiv.style.color = 'blue';
    messageDiv.style.textAlign = 'right';
  } else if (type === 'peer') {
    messageDiv.style.color = 'green';
    messageDiv.style.textAlign = 'left';
  } else {
    messageDiv.style.color = 'gray';
    messageDiv.style.textAlign = 'center';
  }

  messagesDiv.appendChild(messageDiv);
  messagesDiv.scrollTop = messagesDiv.scrollHeight; // Scroll to the latest message
}
