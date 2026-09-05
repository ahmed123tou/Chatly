javascript
document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // STORAGE
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
    // CHECK ELEMENTS
    // =========================

    if (
        !authScreen ||
        !chatScreen ||
        !loginForm ||
        !signupForm ||
        !loginButton ||
        !signupButton ||
        !showSignup ||
        !showLogin ||
        !logoutButton ||
        !sendButton
    ) {
        console.error("Chatly: An HTML element is missing.");
        return;
    }


    // =========================
    // STORAGE FUNCTIONS
    // =========================

    function getUsers() {
        try {
            return JSON.parse(
                localStorage.getItem(USERS_KEY)
            ) || [];
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
    // SWITCH LOGIN / SIGNUP
    // =========================

    showSignup.addEventListener("click", () => {

        loginForm.classList.add("hidden");
        signupForm.classList.remove("hidden");

        authMessage.textContent = "";

    });


    showLogin.addEventListener("click", () => {

        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

        authMessage.textContent = "";

    });


    // =========================
    // SIGNUP
    // =========================

    signupButton.addEventListener("click", signup);


    signupPasswordConfirm.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                signup();
            }

        }
    );


    function signup() {

        const name = signupName.value.trim();
        const password = signupPassword.value;
        const confirmPassword =
            signupPasswordConfirm.value;


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


        const existingUser = users.find(
            user =>
                user.name.toLowerCase() ===
                name.toLowerCase()
        );


        if (existingUser) {

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


    loginPassword.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                login();
            }

        }
    );


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
                user.name.toLowerCase() ===
                name.toLowerCase() &&
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

    logoutButton.addEventListener(
        "click",
        logout
    );


    function logout() {

        localStorage.removeItem(
            CURRENT_USER_KEY
        );

        chatScreen.classList.add("hidden");
        authScreen.classList.remove("hidden");

        signupForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

        loginName.value = "";
        loginPassword.value = "";

        authMessage.textContent = "";
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
    // SEND MESSAGE
    // =========================

    sendButton.addEventListener(
        "click",
        sendMessage
    );


    messageInput.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {
                event.preventDefault();
                sendMessage();
            }

        }
    );


    function sendMessage() {

        const text =
            messageInput.value.trim();


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


        const messageList =
            getMessages();


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

        const messageList =
            getMessages();


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


            const header =
                document.createElement("div");

            header.className =
                "message-header";


            const username =
                document.createElement("span");

            username.className =
                "message-user";

            username.textContent =
                message.username;


            const id =
                document.createElement("span");

            id.className =
                "message-id";

            id.textContent =
                "ID: " + message.id;


            header.appendChild(username);
            header.appendChild(id);


            const content =
                document.createElement("div");

            content.className =
                "message-content";

            content.textContent =
                message.text;


            messageElement.appendChild(header);
            messageElement.appendChild(content);


            messages.appendChild(
                messageElement
            );

        });


        messages.scrollTop =
            messages.scrollHeight;
    }


    // =========================
    // ID GENERATORS
    // =========================

    function randomString(length) {

        const characters =
            "abcdefghijklmnopqrstuvwxyz0123456789";


        let result = "";


        for (
            let i = 0;
            i < length;
            i++
        ) {

            result +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }


        return result;
    }


    function generateUserID() {

        return (
            "user_" +
            Date.now().toString(36) +
            "_" +
            randomString(6)
        );
    }


    function generateMessageID() {

        return (
            "msg_" +
            Date.now().toString(36) +
            "_" +
            randomString(6)
        );
    }


    // =========================
    // START
    // =========================

    const currentUser =
        getCurrentUser();


    if (currentUser) {

        openChat();

    } else {

        authScreen.classList.remove("hidden");
        chatScreen.classList.add("hidden");

    }

});

