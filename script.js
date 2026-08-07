// ==========================
// CART DATA
// ==========================

let cart = [];

// ==========================
// AUTHENTICATION
// ==========================

const AUTH_API = "https://shiv-shambu-patez-backend.onrender.com/api/auth";
const ORDERS_API = "https://shiv-shambu-patez-backend.onrender.com/api/orders";

const authPopup = document.getElementById("authPopup");
const loginBtn = document.getElementById("loginBtn");
const authSection = document.getElementById("authSection");

let checkoutPending = false;
let myOrdersRefreshInterval = null;

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
                <span class="my-orders-link" id="myOrdersLink">My Orders</span>
                <span class="logout-link" id="logoutBtn">Logout</span>
            </div>
        `;

        document.getElementById("logoutBtn").addEventListener("click", () => {
            localStorage.removeItem("patezUser");
            updateAuthUI();
            alert("Logged out successfully");
        });

        document.getElementById("myOrdersLink").addEventListener("click", () => {
    document.getElementById("myOrdersPopup").style.display = "flex";
    loadMyOrders();

    // popup khula rehte hi har 10 second mein status khud check karta rahega
    clearInterval(myOrdersRefreshInterval);
    myOrdersRefreshInterval = setInterval(loadMyOrders, 10000);
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
// FORGOT PASSWORD
// ==========================

document.getElementById("showForgotPassword").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("loginFormBox").style.display = "none";
    document.getElementById("forgotPasswordBox").style.display = "block";
});

document.getElementById("backToLoginFromForgot").addEventListener("click", (e) => {
    e.preventDefault();
    document.getElementById("forgotPasswordBox").style.display = "none";
    document.getElementById("loginFormBox").style.display = "block";
});

document.getElementById("forgotPasswordForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("forgotEmail").value;
    const submitBtn = e.target.querySelector("button[type='submit']");
    const stopLoading = startAuthLoading(submitBtn, "Send New Password");

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

        alert("✅ " + data.message);
        document.getElementById("forgotPasswordForm").reset();
        document.getElementById("forgotPasswordBox").style.display = "none";
        document.getElementById("loginFormBox").style.display = "block";

    } catch (error) {
        alert("❌ Failed to send reset email. Try again.");
        console.error(error);
    } finally {
        stopLoading();
    }

});

// ==========================
// AUTH BUTTON LOADING STATE
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

updateAuthUI();

// ==========================
// MY ORDERS (tracking + cancel)
// ==========================

function statusLabel(status) {
    const labels = {
        pending: "🕓 Pending",
        Preparing: "👨‍🍳 Preparing",
        Ready: "📦 Ready - Pickup from Stall",
        Delivered: "✅ Delivered",
        cancelled: "❌ Cancelled"
    };
    return labels[status] || status;
}

async function loadMyOrders() {

    const listEl = document.getElementById("myOrdersList");
    listEl.innerHTML = "<p style='text-align:center; opacity:0.7;'>Loading...</p>";

    const user = getLoggedInUser();
    if (!user) return;

    try {

        const response = await fetch(`${ORDERS_API}?phone=${user.phone}`);
        const orders = await response.json();

        if (!response.ok) {
            listEl.innerHTML = "<p style='text-align:center;'>Could not load orders.</p>";
            return;
        }

        if (orders.length === 0) {
            listEl.innerHTML = "<p style='text-align:center; opacity:0.7;'>No orders yet.</p>";
            return;
        }

        listEl.innerHTML = orders.map(order => {

            const shortId = order._id.slice(-6).toUpperCase();
            const itemsText = order.items.map(i => `${i.name} x${i.quantity}`).join(", ");
           const canCancel = order.status === "pending" || order.status === "Preparing";

            return `
                <div class="order-card">
                    <div class="order-card-top">
                        <span>#${shortId}</span>
                        <span>${statusLabel(order.status)}</span>
                    </div>
                    <p class="order-card-items">${itemsText}</p>
                    <p class="order-card-total">₹${order.totalAmount}</p>
                    ${canCancel ? `<button class="cancel-order-btn" data-id="${order._id}">Cancel Order</button>` : ""}
                </div>
            `;

        }).join("");

        document.querySelectorAll(".cancel-order-btn").forEach(btn => {

            btn.addEventListener("click", async () => {

                if (!confirm("Are you sure you want to cancel this order?")) return;

                btn.disabled = true;
                btn.innerText = "Cancelling...";

                try {

                    const res = await fetch(`${ORDERS_API}/${btn.dataset.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "cancelled" })
                    });

                    const data = await res.json();

                    if (!res.ok) {
                        alert(data.message || "Could not cancel order");
                        btn.disabled = false;
                        btn.innerText = "Cancel Order";
                        return;
                    }

                    loadMyOrders();

                } catch (error) {
                    alert("❌ Failed to cancel order.");
                    console.error(error);
                    btn.disabled = false;
                    btn.innerText = "Cancel Order";
                }

            });

        });

    } catch (error) {
        listEl.innerHTML = "<p style='text-align:center;'>Could not load orders.</p>";
        console.error(error);
    }

}

document.getElementById("closeMyOrdersPopup").addEventListener("click", () => {
    document.getElementById("myOrdersPopup").style.display = "none";
    clearInterval(myOrdersRefreshInterval);
});
// Auto-refresh My Orders popup every 10 seconds while it's 

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
    updateCardButtons();


}
function updateCardButtons() {

    document.querySelectorAll(".food-card").forEach(card => {

        const name = card.querySelector("h3").innerText;
        const price = Number(card.dataset.price);
        const item = cart.find(i => i.name === name);
        const container = card.querySelector(".card-btn-container");

        if (item) {
            container.innerHTML = `
                <div class="card-qty">
                    <button onclick="decreaseByName('${name}')">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="increaseByName('${name}')">+</button>
                </div>
            `;
        } else {
            container.innerHTML = `<button onclick="addToCart('${name}', ${price})">Add To Cart</button>`;
        }

    });

}

function increaseByName(name) {
    const index = cart.findIndex(i => i.name === name);
    if (index > -1) increaseItem(index);
}

function decreaseByName(name) {
    const index = cart.findIndex(i => i.name === name);
    if (index > -1) decreaseItem(index);
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
    // ==========================
// CART DRAWER TOGGLE
// ==========================

const cartBtn = document.querySelector(".cart-btn");
const cartPanel = document.querySelector(".cart");

// backdrop banate hain jo cart khulne pe peeche dim ho
const cartBackdrop = document.createElement("div");
cartBackdrop.className = "cart-backdrop";
document.body.appendChild(cartBackdrop);

function openCart() {
    cartPanel.classList.add("active");
    cartBackdrop.classList.add("active");
}

function closeCart() {
    cartPanel.classList.remove("active");
    cartBackdrop.classList.remove("active");
}

cartBtn.addEventListener("click", () => {
    cartPanel.classList.contains("active") ? closeCart() : openCart();
});

cartBackdrop.addEventListener("click", closeCart);

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

function openCustomerPopupWithUser(user) {
    document.getElementById("customerName").value = user.name;
    document.getElementById("customerPhone").value = user.phone;
    document.getElementById("customerEmail").value = user.email;
    popup.style.display = "flex";
}
document.querySelector(".checkout").addEventListener("click", () => {

    if (cart.length === 0) {
        alert("Your Cart is Empty");
        return;
    }

    const user = getLoggedInUser();

    if (!user) {
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
    let houseNo = document.getElementById("houseNo").value;
    let streetArea = document.getElementById("streetArea").value;
    let landmark = document.getElementById("landmark").value;
    let city = document.getElementById("city").value;
    let pincode = document.getElementById("pincode").value;
    let district = document.getElementById("district").value;
    let state = document.getElementById("state").value;

    let address = `${houseNo}, ${streetArea}${landmark ? ", Landmark: " + landmark : ""}, ${city}, ${district}, ${state} - ${pincode}`;

    if (phone.length != 10) {
        alert("Enter Valid Mobile Number");
        return;
    }

    let itemNames = cart.map(item => `${item.name} x${item.quantity}`).join(", ");
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    pendingOrderData = {
        customerName: name,
        phone: phone,
        email: email,
        address: address,
        paymentMethod: paymentMethod,
        items: cart.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
        })),
        totalAmount: totalPrice
    };

    popup.style.display = "none";

    if (paymentMethod === "COD") {
        placeOrder(false);
    } else {

        const upiLink = `upi://pay?pa=${UPI_ID}&pn=Shiv%20Shambu%20Patez&am=${totalPrice}&cu=INR&tn=Order%20Payment`;

        document.getElementById("payAmountText").innerText = "Amount to Pay: ₹" + totalPrice;

        document.getElementById("retryUpiBtn").dataset.upiLink = upiLink;

        paymentPopup.style.display = "flex";

        openUpiApp(upiLink);

    }

});

// UPI app ko reliably open karta hai — <a> tag click ka use karta hai
// jo window.location.href se zyada fast/consistent hai mobile browsers pe
function openUpiApp(upiLink) {

    const link = document.createElement("a");
    link.href = upiLink;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

}

// "Open UPI App Again" button ko wire karo (pehle kaam hi nahi kar raha tha)
document.getElementById("retryUpiBtn").addEventListener("click", function () {
    const upiLink = this.dataset.upiLink;
    if (upiLink) {
        openUpiApp(upiLink);
    }
});
const useLocationBtn = document.getElementById("useLocationBtn");

if (useLocationBtn) {
    useLocationBtn.addEventListener("click", () => {

        if (!navigator.geolocation) {
            alert("Geolocation is not supported in your browser");
            return;
        }

        useLocationBtn.innerText = "📍 Fetching location...";

        navigator.geolocation.getCurrentPosition(async (pos) => {

            const { latitude, longitude } = pos.coords;

            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await response.json();

                const addr = data.address || {};

                document.getElementById("streetArea").value = addr.road || addr.suburb || "";
                document.getElementById("city").value = addr.city || addr.town || addr.village || "";
                document.getElementById("district").value = addr.state_district || addr.county || "";
                document.getElementById("state").value = addr.state || "";
                document.getElementById("pincode").value = addr.postcode || "";

            } catch (error) {
                alert("Could not fetch address details, please fill manually.");
            } finally {
                useLocationBtn.innerText = "📍 Use My Current Location";
            }

        }, () => {
            alert("Could not get your location. Please enable location access and try again.");
            useLocationBtn.innerText = "📍 Use My Current Location";
        });

    });
}
// ==========================
// LOADING UI
// ==========================

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

document.getElementById("paidBtn").addEventListener("click", () => {
    placeOrder(true);
});

async function placeOrder(closePaymentPopup) {

    const loadingText = ensureLoadingTextElement();
    const loadingMessage = document.getElementById("loadingMessage");
    const loadingTimer = document.getElementById("loadingTimer");
    const paidBtn = document.getElementById("paidBtn");

    if (closePaymentPopup) {
        loadingText.style.display = "block";
        paidBtn.disabled = true;
        paidBtn.innerText = "Processing...";
    }

    const startTime = Date.now();

    const timerInterval = setInterval(() => {
        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
        if (loadingTimer) loadingTimer.innerText = `${elapsedSec}s elapsed`;
        if (loadingMessage) {
            if (elapsedSec < 5) loadingMessage.innerText = "Processing your order...";
            else if (elapsedSec < 15) loadingMessage.innerText = "Waking up the server, please wait...";
            else if (elapsedSec < 30) loadingMessage.innerText = "Almost there, server is starting up...";
            else loadingMessage.innerText = "Taking longer than usual, please don't close this tab...";
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

        const itemsFormatted = pendingOrderData.items
            .map(item => `• ${item.name} — Qty: ${item.quantity} — ₹${item.price * item.quantity}`)
            .join("\n");

        const paymentStatusText = pendingOrderData.paymentMethod === "COD"
            ? "💵 Cash on Delivery"
            : "✅ Payment Done (UPI)";

        const orderSummary = `🍽️ *NEW ORDER - Shiv Shambu PATEZ*\n` +
            `━━━━━━━━━━━━━━\n\n` +
            `📋 *Order ID:* #${shortOrderId}\n\n` +
            `👤 *Customer:* ${pendingOrderData.customerName}\n` +
            `📞 *Phone:* ${pendingOrderData.phone}\n` +
            `📍 *Address:* ${pendingOrderData.address}\n\n` +
            `🛒 *Items:*\n${itemsFormatted}\n\n` +
            `💰 *Total: ₹${pendingOrderData.totalAmount}*\n` +
            `${paymentStatusText}`;

        const ownerWhatsappLink = `https://wa.me/917056468607?text=${encodeURIComponent(orderSummary)}`;
        window.open(ownerWhatsappLink, "_blank");

        alert(
            "✅ Order Placed Successfully!\n\n" +
            "Order ID: #" + shortOrderId +
            "\nPayment: " + (pendingOrderData.paymentMethod === "COD" ? "Cash on Delivery" : "UPI") +
            "\nTotal: ₹" + pendingOrderData.totalAmount +
            "\n\nPlease save this Order ID for reference."
        );

        cart = [];
        updateCart();
        document.getElementById("customerForm").reset();

    } catch (error) {
        alert("❌ Order place karne mein error aayi. Thoda wait karke phir try kar.");
        console.error(error);
    } finally {
        clearInterval(timerInterval);
        if (loadingText) loadingText.style.display = "none";
        if (paidBtn) {
            paidBtn.disabled = false;
            paidBtn.innerText = "✅ I Have Paid";
        }
    }

}

// ==========================
// PWA - INSTALL APP
// ==========================

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").then((registration) => {
        registration.update();
    }).catch(console.error);
}

let deferredInstallPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;

    const installBtn = document.createElement("button");
    installBtn.id = "installAppBtn";
    installBtn.innerHTML = '<i class="fa-solid fa-download"></i> Install App';
    installBtn.style.cssText = "background:#ff6b00;color:white;border:none;padding:8px 16px;border-radius:20px;cursor:pointer;font-size:13px;margin-right:12px;";

    const navRight = document.querySelector(".nav-right");
    navRight.prepend(installBtn);

    installBtn.addEventListener("click", async () => {
        installBtn.remove();
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
    });
});

// ==========================
// START
// ==========================

updateCart();