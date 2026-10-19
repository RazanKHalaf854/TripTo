import React, { useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import "../Style/chekout.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdDeliveryDining } from "react-icons/md";
import { FaStore } from "react-icons/fa";

const Checkout = () => {
    const [usePoints, setUsePoints] = useState(false);
const [points, setPoints] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();

  const getProgressWidth = () => {
    if (step === 1) return "0%";
    if (step === 2) return "50%";
    if (step === 3) return "100%";
  };

  const { cart = [], restaurant_id } = location.state || {};

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    user: "",
    payment: "cash",
    orderType: "delivery",
  });

  const [error, setError] = useState("");
  const [step, setStep] = useState(2);
  useEffect(() => {

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return;

  axios
    .get(`http://localhost:5000/api/user-points/${user.user_id}`)
    .then(res => setPoints(res.data.points || 0 ));

}, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first ❌");
      navigate("/");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
  };

  const deliveryFee = formData.orderType === "delivery" ? 2 : 0;
const pointsDiscount = usePoints && points > 0 ? points * 0.05 : 0;

const total =
  cart.reduce((acc, item) => acc + item.price * item.qty, 0) +
  deliveryFee -
  pointsDiscount;

  const handleOrder = async () => {

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      alert("Please login first ❌");
      return;
    }

    //  FIXED VALIDATION
    if (
      !formData.name ||
      !formData.phone ||
     
      (formData.orderType === "delivery" && !formData.address)
    ) {
      setError("Please fill all fields ❌");
      return;
    }

    if (formData.payment === "cash") {
      try {
        const res = await axios.post("http://localhost:5000/api/create-order", {
          restaurant_id,
          cart,
          total,
          name: formData.name,
          address: formData.orderType === "delivery" ? formData.address : null,
          phone: formData.phone,
          
          payment_method: "cash",
          user_id: user.user_id,
          order_type: formData.orderType,
          delivery_fee: deliveryFee,
            use_points: usePoints,
  points_used: usePoints ? points : 0
        });

        if (res.data.success) {
          alert("Order placed successfully ✅");
        }

      } catch (err) {
        console.log(err);
        alert("Error placing order ❌");
      }
    } else {
      navigate("/PaymentRestaurent", {
        state: {
          cart,
          restaurant_id,
          total,
          formData
        }
      });
    }
  };


  return (
    <div className="checkout-page-area">

      {/* STEPS */}
      <div className="stepper-wrapper">

        <div
          className="stepper-progress"
          style={{ width: getProgressWidth() }}
        ></div>

        <div className={`step-item ${step >= 1 ? "completed" : ""}`}>
          <span>1</span>
          <p>Cart</p>
        </div>

        <div className={`step-item ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}>
          <span>2</span>
          <p>Details</p>
        </div>

        <div className={`step-item ${step === 3 ? "active" : ""}`}>
          <span>3</span>
          <p>Finish</p>
        </div>

      </div>

      {/* ORDER TYPE */}
      <h3 className="order-type-title" >
  Choose Delivery Option:
</h3>
      <div className={`order-type-toggle ${formData.orderType === "delivery" ? "delivery" : ""}`}>

        <button
          className={`pickup-btn ${formData.orderType === "pickup" ? "active" : ""}`}
          onClick={() => setFormData({ ...formData, orderType: "pickup" })}
        >
          <FaStore className="icon" />
          Pickup
        </button>

        <button
          className={`pickup-btn ${formData.orderType === "delivery" ? "active" : ""}`}
          onClick={() => setFormData({ ...formData, orderType: "delivery" })}
        >
          <MdDeliveryDining className="icon" />
          Delivery
        </button>

      </div>

      <div className="checkout-grid">

        {/* LEFT FORM */}
        <div className="luxury-card">

          <h2 className="card-title">
            {formData.orderType === "delivery" ? "Delivery Info" : "Pickup Info"}
          </h2>

          <div className="field-group">
            <label>Name</label>
            <input name="name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="field-group">
            <label>Phone</label>
            <input name="phone" value={formData.phone} onChange={handleChange} />
          </div>
           

          {formData.orderType === "delivery" && (
            <div className="field-group">
              <label>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
              ></textarea>
            </div>
          )}

          <div className="field-group">
            <label>Payment Method</label>
          <select name="payment" onChange={handleChange} value={formData.payment}>
  <option value="cash">Cash</option>

 
    <option value="card">Card</option>
  
</select>
  <label>
    <input
      type="checkbox"
      checked={usePoints}
      onChange={(e) => setUsePoints(e.target.checked)}
    />
    Use my points ({points} pts = ${(points * 0.05).toFixed(2)})
  </label>
          </div>

          {error && <p className="error-msg">{error}</p>}

          <button className="confirm-btn" onClick={handleOrder}>
            Confirm Order
          </button>
        </div>

        {/* RIGHT SUMMARY */}
        <div className="summary-card">
          <h3>Your Order</h3>

          {cart.length === 0 ? (
            <p>No items in cart</p>
          ) : (
            cart.map(item => (
              <div key={item.item_id} className="summary-line">

                <div className="summary-left">
                  <img
                    src={`/images/${item.image}`}
                    alt={item.name}
                    className="summary-img"
                  />
                  <span>{item.name} x{item.qty}</span>
                </div>

                <span>{item.price * item.qty}$</span>
                

              </div>
            ))
          )}

          {formData.orderType === "delivery" && (
            <div className="summary-line">
              <span>Delivery Fee</span>
              <span>{deliveryFee}$</span>
            </div>
          )}

          <hr />

          <div className="summary-total">
            <strong>Total</strong>
            <strong>{total}$</strong>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;