const API = "https://shiv-shambu-patez-backend.onrender.com/api/orders";

document.getElementById("trackBtn").addEventListener("click", async () => {

    const shortId = document.getElementById("orderIdInput").value.trim().toUpperCase();
    const resultDiv = document.getElementById("trackResult");

    if (!shortId || shortId.length < 4) {
        resultDiv.innerHTML = `<p class="error-msg">Please enter a valid Order ID</p>`;
        return;
    }

    resultDiv.innerHTML = `<p style="text-align:center; color:#999;">Searching...</p>`;

    try {

        const response = await fetch(API);
        const orders = await response.json();

        const order = orders.find(o => o._id.slice(-6).toUpperCase() === shortId);

        if (!order) {
            resultDiv.innerHTML = `<p class="error-msg">❌ Order not found. Please check your Order ID.</p>`;
            return;
        }

        const status = order.status || "pending";

        const statuses = ["pending", "Preparing", "Delivered"];
        const currentIndex = statuses.findIndex(s => s.toLowerCase() === status.toLowerCase());

        const itemsHtml = order.items && order.items.length
            ? order.items.map(item => `${item.name} × ${item.quantity}`).join(", ")
            : "N/A";

        let timelineHtml = "";

        if (status.toLowerCase() === "cancelled") {

            timelineHtml = `<p style="color:#d9534f; text-align:center; font-weight:bold; margin-top:15px;">❌ This order was cancelled</p>`;

        } else {

            timelineHtml = `
                <div class="status-timeline">
                    <div class="status-line"></div>
                    <div class="status-step ${currentIndex >= 0 ? 'active' : ''}">
                        <div class="circle"><i class="fa-solid fa-clock"></i></div>
                        <p>Pending</p>
                    </div>
                    <div class="status-step ${currentIndex >= 1 ? 'active' : ''}">
                        <div class="circle"><i class="fa-solid fa-fire-burner"></i></div>
                        <p>Preparing</p>
                    </div>
                    <div class="status-step ${currentIndex >= 2 ? 'active' : ''}">
                        <div class="circle"><i class="fa-solid fa-check"></i></div>
                        <p>Delivered</p>
                    </div>
                </div>
            `;

        }

        resultDiv.innerHTML = `
            <div class="order-found">
                <h3>Order #${shortId}</h3>
                <p><strong>Name:</strong> ${order.customerName || "N/A"}</p>
                <p><strong>Items:</strong> ${itemsHtml}</p>
                <p><strong>Total:</strong> ₹${order.totalAmount || 0}</p>
                ${timelineHtml}
            </div>
        `;

    } catch (error) {
        console.error(error);
        resultDiv.innerHTML = `<p class="error-msg">⚠️ Failed to fetch order. Try again later.</p>`;
    }

});

// Enter key se bhi track ho jaye
document.getElementById("orderIdInput").addEventListener("keyup", (e) => {
    if (e.key === "Enter") {
        document.getElementById("trackBtn").click();
    }
});