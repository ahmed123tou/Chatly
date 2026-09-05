javascript
/*
    CHATLY
    Version 1

    Account data is stored locally in this browser.

    Later we will replace the local chat storage
    with an online database so different people
    can actually chat together.
*/


// =========================
// STORAGE KEYS
// =========================

const USERS_KEY = "CHATLY_USERS";
const CURRENT_USER_KEY = "CHATLY_CURRENT_USER";
const MESSAGES_KEY = "CHATLY_MESSAGES";


// =========================
// ELEMENTS
// =========================

const authScreen = document.getElementById("authScreen");
const chatScreen = document.getElementById("chatScreen");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginName = document.getElementById("loginName");
const loginPassword = document.getElementById("loginPassword");

const signupName = document.getElementById("signupName");
const signupPassword = document.getElementById("signupPassword");
const signupPasswordConfirm =
    document.getElementById("signupPasswordConfirm");

const loginButton = document.getElementById("loginButton");
const signupButton = document.getElementById("signupButton");

const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");

const authMessage = document.getElementById("authMessage");

const currentUsername =
    document.getElementById("currentUsername");

const logoutButton =
    document.getElementById("logoutButton");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const messages =
    document.getElementById("messages");


// =========================
// STORAGE HELPERS
// =========================

function getUsers() {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );
}

function getMessages() {
    try {
        return JSON.parse(
            localStorage.getItem(MESSAGES_KEY)
        ) || [];
    } catch {
        return [];
    }
}

function saveMessages(messageList) {
    localStorage.setItem(
        MESSAGES_KEY,
        JSON.stringify(messageList)
    );
}


// =========================
// AUTH SCREEN
// =========================

function showLoginScreen() {
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");

    authMessage.textContent = "";

    loginName.value = "";
    loginPassword.value = "";
}

function showSignupScreen() {
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");

    authMessage.textContent = "";

    signupName.value = "";
    signupPassword.value = "";
    signupPasswordConfirm.value = "";
}


// =========================
// SIGN UP
// =========================

signupButton.addEventListener("click", signup);

signupPasswordConfirm.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        signup();
    }
});

function signup() {

    const name = signupName.value.trim();
    const password = signupPassword.value;
    const confirmPassword = signupPasswordConfirm.value;

    authMessage.style.color = "#ff6b6b";

    if (name.length < 2) {
        authMessage.textContent =
            "Name must be at least 2 characters.";
        return;
    }

    if (name.length > 24) {
        authMessage.textContent =
            "Name must be 24 characters or less.";
        return;
    }

    if (password.length < 4) {
        authMessage.textContent =
            "Password must be at least 4 characters.";
        return;
    }

    if (password !== confirmPassword) {
        authMessage.textContent =
            "Passwords do not match.";
        return;
    }

    const users = getUsers();

    const nameExists = users.some(
        user => user.name.toLowerCase() === name.toLowerCase()
    );

    if (nameExists) {
        authMessage.textContent =
            "That name is already being used.";
        return;
    }

    const newUser = {
        id: generateUserID(),
        name: name,
        password: password,
        createdAt: Date.now()
    };

    users.push(newUser);

    saveUsers(users);

    // Automatically log the new user in.
    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({
            id: newUser.id,
            name: newUser.name
        })
    );

    openChat();
}


// =========================
// LOGIN
// =========================

loginButton.addEventListener("click", login);

loginPassword.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        login();
    }
});

function login() {

    const name = loginName.value.trim();
    const password = loginPassword.value;

    authMessage.style.color = "#ff6b6b";

    if (!name || !password) {
        authMessage.textContent =
            "Enter your name and password.";
        return;
    }

    const users = getUsers();

    const user = users.find(
        user =>
            user.name.toLowerCase() === name.toLowerCase() &&
            user.password === password
    );

    if (!user) {
        authMessage.textContent =
            "Incorrect name or password.";
        return;
    }

    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify({
            id: user.id,
            name: user.name
        })
    );

    openChat();
}


// =========================
// LOGOUT
// =========================

logoutButton.addEventListener("click", logout);

function logout() {

    localStorage.removeItem(CURRENT_USER_KEY);

    chatScreen.classList.add("hidden");
    authScreen.classList.remove("hidden");

    showLoginScreen();
}


// =========================
// OPEN CHAT
// =========================

function openChat() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    authScreen.classList.add("hidden");
    chatScreen.classList.remove("hidden");

    currentUsername.textContent =
        user.name;

    renderMessages();

    setTimeout(() => {
        messageInput.focus();
    }, 100);
}


// =========================
// CURRENT USER
// =========================

function getCurrentUser() {

    try {

        return JSON.parse(
            localStorage.getItem(CURRENT_USER_KEY)
        );

    } catch {

        return null;
    }
}


// =========================
// SEND MESSAGE
// =========================

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});

function sendMessage() {

    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const message = {
        id: generateMessageID(),
        userId: user.id,
        username: user.name,
        text: text,
        createdAt: Date.now()
    };

    const messageList = getMessages();

    messageList.push(message);

    saveMessages(messageList);

    messageInput.value = "";

    renderMessages();

    messageInput.focus();
}


// =========================
// RENDER MESSAGES
// =========================

function renderMessages() {

    const messageList = getMessages();

    messages.innerHTML = "";

    if (messageList.length === 0) {

        messages.innerHTML = `
            <div class="empty-chat">
                <div>💬</div>
                <h2>Welcome to Chatly</h2>
                <p>Start the conversation.</p>
            </div>
        `;

        return;
    }

    messageList.forEach(message => {

        const messageElement =
            document.createElement("div");

        messageElement.className =
            "chat-message";

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-user">
                    ${escapeHTML(message.username)}
                </span>

                <span class="message-id">
                    ID: ${escapeHTML(message.id)}
                </span>
            </div>

            <div class="message-content">
                ${escapeHTML(message.text)}
            </div>
        `;

        messages.appendChild(messageElement);

    });

    messages.scrollTop =
        messages.scrollHeight;
}


// =========================
// ID GENERATORS
// =========================

function generateUserID() {

    return "user_" +
        Date.now().toString(36) +
        "_" +
        randomString(6);
}

function generateMessageID() {

    return "msg_" +
        Date.now().toString(36) +
        "_" +
        randomString(6);
}

function randomString(length) {

    const characters =
        "abcdefghijklmnopqrstuvwxyz0123456789";

    let result = "";

    for (let i = 0; i < length; i++) {

        result +=
            characters.charAt(
                Math.floor(
                    Math.random() * characters.length
                )
            );
    }

    return result;
}


// =========================
// SECURITY
// =========================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// =========================
// PAGE START
// =========================

function startApp() {

    const currentUser =
        getCurrentUser();

    if (currentUser) {
        openChat();
    } else {
        authScreen.classList.remove("hidden");
        chatScreen.classList.add("hidden");
        showLoginScreen();
    }
}

showSignup.addEventListener(
    "click",
    showSignupScreen
);

showLogin.addEventListener(
    "click",
    showLoginScreen
);

startApp();

