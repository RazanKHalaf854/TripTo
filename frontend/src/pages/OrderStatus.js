import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Style/orderStatus.css";
import { FaClock, FaUtensils, FaTruck, FaCheckCircle,FaGift,FaBoxOpen,FaStore , FaStar} from "react-icons/fa";



const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [openReview, setOpenReview] = useState(null);

const [comments, setComments] = useState("");
const [rating, setRating] = useState(5);

  const user = JSON.parse(localStorage.getItem("user"));
  

 useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));

  console.log("USER FROM LOCALSTORAGE:", user);

  if (!user) return;

  axios
    .get(`http://localhost:5000/api/my-orders/${user.user_id}`)
    .then((res) => {
      console.log("API RESPONSE:", res.data);
      console.log("ORDER FROM API:", res.data);

      const grouped = res.data.reduce((acc, row) => {
        if (!acc[row.order_id]) {
          acc[row.order_id] = {
            order_id: row.order_id,
            status: row.status,
            total_amount: row.total_amount,
            reviewd: row.reviewd,
            restaurant_id: row.restaurant_id,
            order_type:row.order_type,
           restaurant_name:row.restaurant_name,
            items: []
          };
        }

        acc[row.order_id].items.push({
          name: row.item_name,
          image: row.item_image,
          quantity: row.quantity
          

        });

        return acc;
      }, {});

      console.log("GROUPED:", grouped); // 

      setOrders(Object.values(grouped));
    })
    .catch((err) => {
      console.log("ERROR:", err.response?.data || err.message);
    });
}, []);
 const getStep = (status, type) => {

  if (type === "pickup") {
    if (status === "pending") return 1;
    if (status === "preparing") return 2;
    if (status === "ready for pickup") return 3;
    if (status === "picked up") return 4;
  }

  if (type === "delivery") {
    if (status === "pending") return 1;
    if (status === "preparing") return 2;
    if (status === "on the way") return 3;
    if (status === "delivered") return 4;
  }

  return 1;
};
  useEffect(() => {
  console.log("ORDERS:", orders);
}, [orders]);
const handleSubmit = async (order) => {

  if (!comments) {
    return alert("Please write your review");
  }

  try {

    const res = await axios.post(
      "http://localhost:5000/api/add-review",
      {
        comments,
        rating,
        user_id: user.user_id,
        restaurant_id: order.restaurant_id,
        order_id: order.order_id
      }
    );

    if (res.data.success) {

      alert("Review added successfully +10 points ⭐");

      setOpenReview(null);

      window.location.reload();
    }

  } catch (err) {

    console.log(err);
    alert("Error adding review");

  }

};

  return (
    <div className="order-status-page">

      <h2 className="order-title">My Orders</h2>

      {orders?.map((order) => (
    

        <div key={order.order_id} className="order-card">
        
<div className="order-header">
  <div className="order-info">
          <p><strong>Order #{order.order_id}</strong></p>
          
         <div className="status-total">
          <p>Status: {order.status}</p>
          <p>Total: ${order.total_amount}</p>
          <p>Restaurant Name: {order.restaurant_name}</p>
          </div>
          </div>
       

 <div className="review-section">

{(
  (order.order_type?.toLowerCase()?.trim() === "delivery" &&
   order.status?.toLowerCase()?.trim() === "delivered") ||

  (order.order_type?.toLowerCase()?.trim() === "pickup" &&
   order.status?.toLowerCase()?.trim() === "picked up")
) &&
order.reviewd == 0 && (

<button
  className="review-btn"
  onClick={() =>
    setOpenReview(
      openReview === order.order_id
        ? null
        : order.order_id
    )
  }
>
  <FaGift />
  Rate & Earn
</button>

)}

{openReview === order.order_id && (

<div className="inline-review-box">

  <h3>Write Your Review</h3>

  <div className="rating-stars">

    {[1,2,3,4,5].map((star) => (

      <FaStar
        key={star}
        className={rating >= star ? "star active-star" : "star"}
        onClick={() => setRating(star)}
      />

    ))}

  </div>

  <textarea
    placeholder="Share your experience..."
    value={comments}
    onChange={(e) => setComments(e.target.value)}
  />

  <button
    className="submit-review-btn"
    onClick={() => handleSubmit(order)}
  >
    Submit Review
  </button>

</div>

)}

</div>
</div>



          <div className="items-box">

            {order.items.map((item, index) => (
              <div key={index} style={{ display: "flex", gap: "10px", marginTop: "10px" }}>

                <img
                  src={`/images/${item.image}`}
                  style={{ width: "60px", height: "60px", borderRadius: "10px" }}
                />

                <div>
                  <p>{item.name}</p>
                  <p>x{item.quantity}</p>
                  
                </div>

              </div>
            ))}

          </div>

          <div className="order-stepper" data-step={getStep(order.status, order.order_type)}>

            {order.order_type === "delivery" ? (

  <>
    <div className={`step ${getStep(order.status, order.order_type) >= 1 ? "active" : ""}`}>
      <FaClock />
      <p>Pending</p>
    </div>

    <div className={`step ${getStep(order.status, order.order_type) >= 2 ? "active" : ""}`}>
      <FaUtensils />
      <p>Preparing</p>
    </div>

    <div className={`step ${getStep(order.status, order.order_type) >= 3 ? "active" : ""}`}>
      <FaTruck />
      <p>On the way</p>
    </div>

    <div className={`step ${getStep(order.status, order.order_type) >= 4 ? "active" : ""}`}>
      <FaCheckCircle />
      <p>Delivered</p>
    </div>
  </>

) : (

  <>
    <div className={`step ${getStep(order.status, order.order_type) >= 1 ? "active" : ""}`}>
      <FaClock />
      <p>Pending</p>
    </div>

    <div className={`step ${getStep(order.status, order.order_type) >= 2 ? "active" : ""}`}>
      <FaUtensils />
      <p>Preparing</p>
    </div>

    <div className={`step ${getStep(order.status, order.order_type) >= 3 ? "active" : ""}`}>
     <FaStore></FaStore>
      <p>Ready for Pickup</p>
    </div>
     <div className={`step ${getStep(order.status, order.order_type) >= 3 ? "active" : ""}`}>
      <FaBoxOpen></FaBoxOpen>
      <p> Picked UP</p>
    </div>
  </>

)}

          </div>

        </div>
      ))}

    </div>
  );
};

export default OrderStatus;