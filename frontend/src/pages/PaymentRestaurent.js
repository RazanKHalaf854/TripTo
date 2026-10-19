import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Style/paymentRestaurent.css";

const PaymentRestaurent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { cart = [], restaurant_id, total, formData } = location.state || {};

  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");

  const deliveryFee = formData?.orderType === "delivery" ? 2 : 0;

  const handleFinalOrder = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) return alert("Please login first ❌");
    if (!method) return alert("Select payment method ❌");

    try {
      const res = await axios.post("http://localhost:5000/api/create-order", {
        restaurant_id,
        cart,
        total,
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        payment_method: method,
        user_id: user.user_id,
          order_type: formData.orderType,
  delivery_fee: deliveryFee
      });

      if (res.data.success) {
        setStatus("done");
        alert("Payment Successful ✅");
        setTimeout(() => navigate("/"), 1500);
      }

    } catch (err) {
      console.log(err);
      alert("Payment failed ❌");
    }
  };

  return (
    <div className="booking-page-area">

      {/*  STEPPER */}
      <div className="stepper-wrapper payment-stepper">

        <div className="stepper-progress" style={{ width: "100%" }}></div>

        <div className="step-item completed">
          <span>1</span>
          <p>Cart</p>
        </div>

        <div className="step-item completed">
          <span>2</span>
          <p>Details</p>
        </div>

        <div className="step-item active">
          <span>3</span>
          <p>Finish</p>
        </div>

      </div>

    
      <div className="payment-grid-layout">

        {/* LEFT */}
        <div className="forms-column">

          <div className="luxury-card">

            <p>Payment methods</p>

            <div className="icons-row">

              <div
                className={`method-tag whish ${method === "whish" ? "active" : ""}`}
                onClick={() => setMethod("whish")}
              >
                Whish
              </div>

              <div
                className={`method-tag omt ${method === "omt" ? "active" : ""}`}
                onClick={() => setMethod("omt")}
              >
                OMT
              </div>

            </div>

            <h2 className="card-title">Card details</h2>

            <div className="field-group">
              <label>Cardholder's name *</label>
              <input placeholder="As printed on card" />
            </div>

            <div className="field-group">
              <label>Card number *</label>
              <input placeholder="Seen on your card" />
            </div>

            <div className="input-row">
              <div className="field-group">
                <label>Expiry *</label>
                <input placeholder="MM/YY" />
              </div>

              <div className="field-group">
                <label>CVC *</label>
                <input placeholder="CVC" />
              </div>
            </div>

            <div className="save-card">
              <input type="checkbox" /> <label>Save Card</label>
            </div>

            <div className="btn-actions">
              <button className="back-link" onClick={() => navigate(-1)}>
                Back
              </button>

              <button
                onClick={handleFinalOrder}
                disabled={status === "done"}
                className={status === "done" ? "btn-disabled" : "btn-primary"}
              >
                {status === "done" ? "Paid ✅" : "Confirm & Pay"}
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT */}
        <div className="summary-column">
          <div className="summary-card">

            <h3>Your Order</h3>

            {cart.map(item => (
              <div key={item.item_id} className="order-item">

                <img src={`/images/${item.image}`} alt={item.name} />

                <div>
                  <p>{item.name}</p>
                  <span>x{item.qty}</span>
                </div>

                <span>${(item.price * item.qty).toFixed(2)}</span>

              </div>
            ))}

            {/* delivery fee */}
            {formData?.orderType === "delivery" && (
              <div className="price-line">
                <span>Delivery Fee</span>
                <span>${deliveryFee}</span>
              </div>
            )}

            <hr />

            <div className="total-line">
              <span>Total</span>
             <span>${parseFloat(total).toFixed(2)}</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default  PaymentRestaurent ;