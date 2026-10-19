import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Style/adminOrders.css";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
      alert("Access denied ");
      window.location.href = "/";
      return;
    }

    fetchOrders();
  }, []);

  const fetchOrders = () => {
    axios
      .get("http://localhost:5000/admin/orders")
      .then((res) => {
        const grouped = res.data.reduce((acc, item) => {
          if (!acc[item.order_id]) {
            acc[item.order_id] = {
              ...item,
              items: [],
            };
          }

          acc[item.order_id].items.push({
            name: item.item_name,
            price: item.price,
            quantity: item.quantity,
            image: item.item_image,
          });

          return acc;
        }, {});

        setOrders(Object.values(grouped));
      })
      .catch((err) => console.log(err));
  };

  const updateStatus = (order_id, newStatus) => {
    axios
      .put("http://localhost:5000/api/update-order-status", {
        order_id,
        status: newStatus,
      })
      .then(() => {
        fetchOrders();
      });
  };
 

  return (
    <div className="admin-orders-page">
      <h2 className="admin-title">Admin Dashboard 👑</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        orders.map((order) => (
          <div key={order.order_id} className="admin-order-card">

            <div className="order-header">
              <h3>Order #{order.order_id}</h3>

              <span className={`status ${order.status.replace(/\s/g, "-")}`}>
  {order.order_type === "pickup" && order.status === "delivered"
    ? "Picked up"
    : order.status}
</span>
            </div>

            <div className="order-grid">
              <div>
                <p><strong>Customer:</strong> {order.customer_name}</p>
                <p><strong>Email:</strong> {order.customer_email}</p>
                <p><strong>Phone:</strong> {order.phone_number}</p>
                <p><strong>Address:</strong> {order.customer_address}</p>
              </div>

              <div>
                <p><strong>Restaurant:</strong> {order.restaurant_name}</p>
                <p><strong>Total:</strong> ${order.total_amount}</p>
                <p>
  <strong>Delivery:</strong>{" "}
  {order.order_type === "delivery" ? `$${order.delivery_fee} `: "Pickup (No fee)"}
</p>
              </div>

              <div>
                <p><strong>Payment:</strong></p>
                <p>{order.payment_method}</p>
                <p className="payment-status">{order.payment_status}</p>
              </div>
            </div>

            {/* ITEMS */}
            <div className="items-container">
              {order.items &&
                order.items.map((item, index) => {
                  console.log("Image:",item.image); 

                  return (
                    <div key={index} className="item-box">

                  
                      <img
                        src={`/images/${item.image}`}
                        alt={item.name}
                        className="item-image"
                      />

                      <p className="item-name">{item.name}</p>
                      <p className="item-price">
                        ${item.price} x {item.quantity}
                      </p>
                    </div>
                  );
                })}
            </div>

            <div className="status-control">
       <select
  value={order.status}
  onChange={(e) => updateStatus(order.order_id, e.target.value)}
>
  <option value="pending">Pending</option>
  <option value="preparing">Preparing</option>

  {order.order_type === "delivery" ? (
    <>
      <option value="on the way">On the way</option>
      <option value="delivered">Delivered</option>
    </>
  ) : (
    <>
      <option value="ready for pickup">Ready for Pickup</option>
      <option value="picked up">Picked up</option>
    </>
  )}
</select>
            </div>

          </div>
        ))
      )}
    </div>
  );
};

export default AdminOrders;