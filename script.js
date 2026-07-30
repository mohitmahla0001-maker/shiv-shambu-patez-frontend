// ==========================
// CART DATA
// ==========================

let cart = [];

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

document.querySelector(".checkout").addEventListener("click", () => {

    if (cart.length === 0) {
        alert("Your Cart is Empty");
        return;
    }

    popup.style.display = "flex";

});

document.getElementById("customerForm").addEventListener("submit", (e) => {

    e.preventDefault();

    let name = document.getElementById("customerName").value;
    let phone = document.getElementById("customerPhone").value;

    if (phone.length != 10) {
        alert("Enter Valid Mobile Number");
        return;
    }

    let itemNames = cart.map(item => `${item.name} x${item.quantity}`).join(", ");
    let totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    pendingOrderData = {
        customerName: name,
        phone: phone,
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

// "I Have Paid" button
document.getElementById("paidBtn").addEventListener("click", async () => {

    const loadingText = document.getElementById("loadingText");
    const paidBtn = document.getElementById("paidBtn");

    loadingText.style.display = "block";
    paidBtn.disabled = true;
    paidBtn.innerText = "Processing...";

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
        loadingText.style.display = "none";
        paidBtn.disabled = false;
        paidBtn.innerText = "✅ I Have Paid";
    }

});
// ==========================
// START
// ==========================

updateCart();