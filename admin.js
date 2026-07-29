const API = "https://shiv-shambu-patez-backend.onrender.com/api/orders";

async function loadOrders() {

    try {

        const response = await fetch(API);
        const orders = await response.json();

        const table = document.getElementById("ordersTable");
        table.innerHTML = "";

        orders.forEach(order => {

            table.innerHTML += `
                <tr>

                    <td>${order.customerName || "N/A"}</td>

                    <td>${order.phone || "N/A"}</td>

                    <td>
                        ${
                            order.items && order.items.length
                                ? order.items.map(item =>
                                    `${item.name} x${item.quantity}`
                                  ).join("<br>")
                                : "No Items"
                        }
                    </td>

                    <td>₹${order.totalAmount || 0}</td>

                    <td>
                        <select onchange="updateStatus('${order._id}', this.value)">
                            <option value="pending" ${order.status === "pending" ? "selected" : ""}>
                                Pending
                            </option>

                            <option value="Preparing" ${order.status === "Preparing" ? "selected" : ""}>
                                Preparing
                            </option>

                            <option value="Delivered" ${order.status === "Delivered" ? "selected" : ""}>
                                Delivered
                            </option>
                        </select>
                    </td>

                </tr>
            `;

        });

    } catch (error) {

        console.error(error);
        alert("Orders Load Failed");

    }

}

async function updateStatus(id, status) {

    try {

        const response = await fetch(`${API}/${id}`, {

            method: "PUT",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({ status })

        });

        if (!response.ok) {
            throw new Error("Status update failed");
        }

        loadOrders();

    } catch (error) {

        console.error(error);
        alert("Status Update Failed");

    }

}

// First Load
loadOrders();

// Auto Refresh Every 5 Seconds
setInterval(loadOrders, 5000);