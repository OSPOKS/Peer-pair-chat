// Firebase configuration (replace with your project details)
const firebaseConfig = {

};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const roomNameInput = document.getElementById('room-name');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const messageInput = document.getElementById('message-input');
const sendMessageButton = document.getElementById('send-message');
const messagesList = document.getElementById('messages');


function addMessage(sender, content) {
  const messageElement = document.createElement('li');
  messageElement.textContent = `${sender}: ${content}`;
  messagesList.appendChild(messageElement);
}

// Handle create room button click
createRoomButton.addEventListener('click', () => {
  roomName = roomNameInput.value;

  // Create a database reference for this room
  const messagesRef = database.ref(`chatrooms/${roomName}/messages`);




  function sendMessage(message) {
    messagesRef.push({
      sender: /* Get authenticated user's username */, // Replace with user identification
      content: message,
      timestamp: firebase.database.ServerValue.TIMESTAMP 
    });
  }


  messagesRef.on('child_added', (dataSnapshot) => {
    const message = dataSnapshot.val();
    addMessage(message.sender, message.content);
  });


});


joinRoomButton.addEventListener('click', () => {
  roomName = roomNameInput.value;
  const messagesRef = database.ref(`chatrooms/${roomName}/messages`);

