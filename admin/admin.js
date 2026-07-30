const API = "https://shiv-shambu-patez-backend.onrender.com/api/orders";

let allOrders = [];
let currentFilter = "all";
let searchTerm = "";

async function loadOrders() {

    try {

        const response = await fetch(API);
        allOrders = await response.json();

        // Latest orders sabse upar
        allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        updateStats();
        renderOrders();

    } catch (error) {
        console.error(error);
        document.getElementById("ordersContainer").innerHTML =
            "<p class='loading-text'>⚠️ Failed to load orders. Check backend.</p>";
    }

}

function updateStats() {

    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === "pending").length;
    const preparing = allOrders.filter(o => o.status === "Preparing").length;
    const delivered = allOrders.filter(o => o.status === "Delivered").length;
    const revenue = allOrders
        .filter(o => o.status === "Delivered")
        .reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0);

    document.getElementById("statTotalOrders").innerText = total;
    document.getElementById("statPending").innerText = pending;
    document.getElementById("statPreparing").innerText = preparing;
    document.getElementById("statDelivered").innerText = delivered;
    document.getElementById("statRevenue").innerText = "₹" + revenue;

}

function renderOrders() {

    const container = document.getElementById("ordersContainer");

    let filtered = allOrders;

    if (currentFilter !== "all") {
        filtered = filtered.filter(o => o.status === currentFilter);
    }

    if (searchTerm) {
        filtered = filtered.filter(o =>
            (o.customerName || "").toLowerCase().includes(searchTerm) ||
            (o.phone || "").includes(searchTerm)
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = "<p class='loading-text'>No orders found.</p>";
        return;
    }

    container.innerHTML = filtered.map(order => {

        const itemsHtml = order.items && order.items.length
            ? order.items.map(item => `${item.name} × ${item.quantity} — ₹${item.price * item.quantity}`).join("<br>")
            : (order.item ? `${order.item} × ${order.quantity}` : "No Items");

        const total = order.totalAmount || order.total || 0;
        const time = order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "";
        const status = order.status || "pending";

        return `
            <div class="order-card ${status}">

                <div class="order-top">
                    <h3>${order.customerName || order.name || "N/A"}</h3>
                    <span class="order-time">${time}</span>
                </div>

                <div class="order-phone">
                    📞 <a href="tel:${order.phone}">${order.phone || "N/A"}</a>
                </div>

                <div class="order-items">
                    ${itemsHtml}
                </div>

                <div class="order-total">
                    Total: <span>₹${total}</span>
                </div>

                <select class="status-select" onchange="updateStatus('${order._id}', this.value)">
                    <option value="pending" ${status === "pending" ? "selected" : ""}>⏳ Pending</option>
                    <option value="Preparing" ${status === "Preparing" ? "selected" : ""}>🔥 Preparing</option>
                    <option value="Delivered" ${status === "Delivered" ? "selected" : ""}>✅ Delivered</option>
                    <option value="cancelled" ${status === "cancelled" ? "selected" : ""}>❌ Cancelled</option>
                </select>

            </div>
        `;

    }).join("");

}

async function updateStatus(id, status) {

    try {

        const response = await fetch(`${API}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status })
        });

        if (!response.ok) throw new Error("Status update failed");

        loadOrders();

    } catch (error) {
        console.error(error);
        alert("Status Update Failed");
    }

}

// Filter buttons
document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.dataset.filter;
        renderOrders();
    });
});

// Search
document.getElementById("searchOrder").addEventListener("keyup", (e) => {
    searchTerm = e.target.value.toLowerCase();
    renderOrders();
});

// Refresh button
document.getElementById("refreshBtn").addEventListener("click", loadOrders);

// First load
loadOrders();

// Auto refresh every 10 seconds
setInterval(loadOrders, 10000);