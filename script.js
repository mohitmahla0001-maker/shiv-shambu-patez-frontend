// ==========================
// CART DATA
// ==========================

let cart = [];

// ==========================
// AUTHENTICATION
// ==========================

const AUTH_API = "https://shiv-shambu-patez-backend.onrender.com/api/auth";

const authPopup = document.getElementById("authPopup");
const loginBtn = document.getElementById("loginBtn");
const authSection = document.getElementById("authSection");

// true when the user clicked Checkout without being logged in —
// tells us to auto-open the customer details popup right after login/register
let checkoutPending = false;

function getLoggedInUser() {
    const userData = localStorage.getItem("patezUser");
    return userData ? JSON.parse(userData) : null;
}

function updateAuthUI() {

    const user = getLoggedInUser();

    if (user) {
        authSection.innerHTML = `
            <div class="user-greeting">
                👋 Hi, ${user.name.split(" ")[0]}
                <span class="logout-link" id="logoutBtn">Logout</span>
            </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("patezUser");
            updateAuthUI();
            alert("Logged out successfully");
        });

    } else {
        authSection.innerHTML = `
            <button id="loginBtn" class="login-btn">
                <i class="fa-solid fa-user"></i> Login
            </button>
        `;

        document.getElementById("loginBtn").addEventListener("click", () => {
            authPopup.style.display = "flex";
        });
    }

}

document.getElementById("closeAuthPopup").addEventListener("click", () => {
    authPopup.style.display = "none";
    checkoutPending = false;
});

document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginFormBox").style.display = "none";
    document.getElementById("registerFormBox").style.display = "block";
});

document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("registerFormBox").style.display = "none";
    document.getElementById("loginFormBox").style.display = "block";
});

// ==========================
// AUTH BUTTON LOADING STATE
// (server can take 30-50s to wake up on Render's free tier)
// ==========================

function startAuthLoading(button, originalText) {

    button.disabled = true;

    const startTime = Date.now();

    const interval = setInterval(() => {

        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);

        if (elapsedSec < 5) {
            button.innerText = "Please wait...";
        } else if (elapsedSec < 15) {
            button.innerText = `Waking up server... ${elapsedSec}s`;
        } else if (elapsedSec < 30) {
            button.innerText = `Almost there... ${elapsedSec}s`;
        } else {
            button.innerText = `Still working... ${elapsedSec}s`;
        }

    }, 1000);

    return function stopAuthLoading() {
        clearInterval(interval);
        button.disabled = false;
        button.innerText = originalText;
    };

}

// REGISTER
document.getElementById("registerForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.getElementById("regName").value;
    const phone = document.getElementById("regPhone").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    const submitBtn = e.target.querySelector("button[type='submit']");
    const stopLoading = startAuthLoading(submitBtn, "Register");

    try {

        const response = await fetch(`${AUTH_API}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, phone, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Registration failed");
            return;
        }

        localStorage.setItem("patezUser", JSON.stringify(data.user));
        localStorage.setItem("patezToken", data.token);

        authPopup.style.display = "none";
        updateAuthUI();
        document.getElementById("registerForm").reset();

        if (checkoutPending) {
            checkoutPending = false;
            openCustomerPopupWithUser(data.user);
        } else {
            alert("✅ Registered successfully! Welcome " + data.user.name);
        }

    } catch (error) {
        alert("❌ Registration failed. Try again.");
        console.error(error);
    } finally {
        stopLoading();
    }

});

// LOGIN
document.getElementById("loginForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const identifier = document.getElementById("loginIdentifier").value;
    const password = document.getElementById("loginPassword").value;

    const submitBtn = e.target.querySelector("button[type='submit']");
    const stopLoading = startAuthLoading(submitBtn, "Login");

    try {

        const response = await fetch(`${AUTH_API}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed");
            return;
        }

        localStorage.setItem("patezUser", JSON.stringify(data.user));
        localStorage.setItem("patezToken", data.token);

        authPopup.style.display = "none";
        updateAuthUI();
        document.getElementById("loginForm").reset();

        if (checkoutPending) {
            checkoutPending = false;
            openCustomerPopupWithUser(data.user);
        } else {
            alert("✅ Welcome back, " + data.user.name + "!");
        }

    } catch (error) {
        alert("❌ Login failed. Try again.");
        console.error(error);
    } finally {
        stopLoading();
    }

});

// Page load pe UI update kar
updateAuthUI();

// ==========================
// ADD TO CART
// ==========================

function addToCart(name, price) {

    let item = cart.find(product => product.name === name);

    if (item) {

        item.quantity++;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });

    }

    updateCart();

}

// ==========================
// UPDATE CART
// ==========================

function updateCart() {

    const cartItems = document.getElementById("cart-items");
    const totalPrice = document.getElementById("total-price");
    const cartCount = document.getElementById("cart-count");

    cartItems.innerHTML = "";

    let total = 0;
    let count = 0;

    if (cart.length === 0) {

        cartItems.innerHTML = "<p>No Item Added</p>";

    }

    cart.forEach((item, index) => {

        total += item.price * item.quantity;

        count += item.quantity;

        cartItems.innerHTML += `

        <div class="cart-item">

            <div class="item-info">

                <h4>${item.name}</h4>

                <p>₹${item.price}</p>

            </div>

            <div class="qty">

                <button onclick="decreaseItem(${index})">-</button>

                <span>${item.quantity}</span>

                <button onclick="increaseItem(${index})">+</button>

            </div>

        </div>

        `;

    });

    totalPrice.innerText = total;

    cartCount.innerText = count;

}

// ==========================
// INCREASE
// ==========================

function increaseItem(index){

    cart[index].quantity++;

    updateCart();

}

// ==========================
// DECREASE
// ==========================

function decreaseItem(index){

    if(cart[index].quantity > 1){

        cart[index].quantity--;

    }else{

        cart.splice(index,1);

    }

    updateCart();

}

// ==========================
// SEARCH
// ==========================

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("keyup", function(){

    let value = this.value.toLowerCase();

    let cards = document.querySelectorAll(".food-card");

    cards.forEach(card=>{

        let name = card.querySelector("h3").innerText.toLowerCase();

        if(name.includes(value)){

            card.style.display="block";

        }

        else{

            card.style.display="none";

        }

    });

});

// ==========================
// CHECKOUT
// ==========================

const popup = document.getElementById("customerPopup");
const paymentPopup = document.getElementById("paymentPopup");
const UPI_ID = "7056468607@fam";

let pendingOrderData = null;
let pendingItemNames = "";
let pendingTotalPrice = 0;

// Fills the customer details popup with the logged-in user's info and opens it
function openCustomerPopupWithUser(user) {
    document.getElementById("customerName").value = user.name;
    document.getElementById("customerPhone").value = user.phone;
    document.getElementById("customerEmail").value = user.email;
    if (user.address) {
        document.getElementById("customerAddress").value = user.address;
    }
    popup.style.display = "flex";
}

document.querySelector(".checkout").addEventListener("click", () => {

    if (cart.length === 0) {
        alert("Your Cart is Empty");
        return;
    }

    const user = getLoggedInUser();

    if (!user) {
        // Not logged in — ask them to login/register first.
        // Once they succeed, openCustomerPopupWithUser() runs automatically.
        checkoutPending = true;
        authPopup.style.display = "flex";
        return;
    }

    openCustomerPopupWithUser(user);

});

document.getElementById("customerForm").addEventListener("submit", (e) => {

    e.preventDefault();

    let name = document.getElementById("customerName").value;
    let phone = document.getElementById("customerPhone").value;
    let email = document.getElementById("customerEmail").value;
    let address = document.getElementById("customerAddress").value;

    if (phone.length != 10) {
        alert("Enter Valid Mobile Number");
        return;
    }

    let itemNames = cart.map(item => `${item.name} x${item.quantity}`).join(", ");
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    pendingOrderData = {
        customerName: name,
        phone: phone,
        email: email,
        address: address,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: totalPrice
    };

    pendingItemNames = itemNames;
    pendingTotalPrice = totalPrice;

    // UPI payment link bana
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=Shiv Shambu Patez&am=${totalPrice}&cu=INR`;

    // QR code generate kar (free API use kar rahe hain)
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiLink)}`;

    document.getElementById("qrCodeImg").src = qrUrl;
    document.getElementById("payAmountText").innerText = "Amount to Pay: ₹" + totalPrice;

    popup.style.display = "none";
    paymentPopup.style.display = "flex";

});

// ==========================
// CLOSE POPUPS (no order placed on close)
// ==========================

document.getElementById("closeCustomerPopup").addEventListener("click", () => {
    popup.style.display = "none";
});

document.getElementById("cancelPayBtn").addEventListener("click", () => {
    paymentPopup.style.display = "none";
});

// ==========================
// LOADING UI (spinner + elapsed time + timeout messages)
// ==========================

// Inject spinner CSS once (no separate stylesheet edit needed)
(function injectLoadingStyles() {
    const style = document.createElement("style");
    style.textContent = `
        #loadingText {
            display: none;
            margin-top: 15px;
            text-align: center;
        }
        #loadingText .spinner {
            width: 34px;
            height: 34px;
            margin: 0 auto 10px;
            border: 4px solid rgba(0,0,0,0.1);
            border-top-color: #333;
            border-radius: 50%;
            animation: patez-spin 0.8s linear infinite;
        }
        #loadingText #loadingMessage {
            font-size: 14px;
            font-weight: 500;
            margin: 4px 0;
        }
        #loadingText #loadingTimer {
            font-size: 12px;
            opacity: 0.65;
            margin: 0;
        }
        @keyframes patez-spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
})();

// Make sure #loadingText exists even if the HTML wasn't updated.
// If it's missing, build it and drop it right before the paidBtn.
function ensureLoadingTextElement() {

    let loadingText = document.getElementById("loadingText");

    if (loadingText) return loadingText;

    const paidBtn = document.getElementById("paidBtn");

    loadingText = document.createElement("div");
    loadingText.id = "loadingText";
    loadingText.innerHTML = `
        <div class="spinner"></div>
        <p id="loadingMessage">Processing your order...</p>
        <p id="loadingTimer"></p>
    `;

    paidBtn.parentNode.insertBefore(loadingText, paidBtn);

    return loadingText;

}

// "I Have Paid" button
document.getElementById("paidBtn").addEventListener("click", async () => {

    const loadingText = ensureLoadingTextElement();
    const loadingMessage = document.getElementById("loadingMessage");
    const loadingTimer = document.getElementById("loadingTimer");
    const paidBtn = document.getElementById("paidBtn");

    loadingText.style.display = "block";
    paidBtn.disabled = true;
    paidBtn.innerText = "Processing...";

    const startTime = Date.now();

    // Update elapsed time + escalate the message the longer it takes
    // (useful for free-tier backends like Render that "cold start")
    const timerInterval = setInterval(() => {

        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);

        loadingTimer.innerText = `${elapsedSec}s elapsed`;

        if (elapsedSec < 5) {
            loadingMessage.innerText = "Processing your order...";
        } else if (elapsedSec < 15) {
            loadingMessage.innerText = "Waking up the server, please wait...";
        } else if (elapsedSec < 30) {
            loadingMessage.innerText = "Almost there, server is starting up...";
        } else {
            loadingMessage.innerText = "Taking longer than usual, please don't close this tab...";
        }

    }, 1000);

    try {

        const response = await fetch("https://shiv-shambu-patez-backend.onrender.com/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pendingOrderData)
        });

        if (!response.ok) throw new Error("Order failed to save");

        const savedOrder = await response.json();
        const shortOrderId = savedOrder._id.slice(-6).toUpperCase();

        paymentPopup.style.display = "none";

        // ===== WHATSAPP NOTIFICATION =====
        const orderSummary = `🍽️ *New Order - Shiv Shambu PATEZ*\n\n` +
            `Order ID: #${shortOrderId}\n` +
            `Name: ${pendingOrderData.customerName}\n` +
            `Phone: ${pendingOrderData.phone}\n` +
            `Address: ${pendingOrderData.address}\n\n` +
            `Items:\n${pendingItemNames}\n\n` +
            `Total: ₹${pendingTotalPrice}\n` +
            `Status: Payment Done ✅`;

        const ownerWhatsappLink = `https://wa.me/917056468607?text=${encodeURIComponent(orderSummary)}`;
        window.open(ownerWhatsappLink, "_blank");
        // ===== END WHATSAPP =====

        alert(
            "✅ Order Placed Successfully!\n\n" +
            "Order ID: #" + shortOrderId +
            "\nItems : " + pendingItemNames +
            "\nTotal : ₹" + pendingTotalPrice +
            "\n\nPlease save this Order ID for reference.\n\n" +
            "A WhatsApp message has opened — please tap Send to notify us!"
        );

        cart = [];
        updateCart();
        document.getElementById("customerForm").reset();

    } catch (error) {
        alert("❌ Order place karne mein error aayi. Thoda wait karke phir try kar.");
        console.error(error);
    } finally {
        clearInterval(timerInterval);
        loadingText.style.display = "none";
        paidBtn.disabled = false;
        paidBtn.innerText = "✅ I Have Paid";
    }

});
// ==========================
// START
// ==========================

updateCart();e
document.getElementById("forgotPasswordLink").addEventListener("click", async (e) => {

    e.preventDefault();

    const email = prompt("Enter your registered email address:");

    if (!email) return;

    try {

        const response = await fetch(`${AUTH_API}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Something went wrong");
            return;
        }

        alert("✅ " + data.message + "\n\nPlease check your email inbox (and spam folder).");

    } catch (error) {
        alert("❌ Failed to send reset email. Try again later.");
        console.error(error);
    }

});