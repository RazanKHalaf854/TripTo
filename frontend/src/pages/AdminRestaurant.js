import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Style/AdminRestaurant.css";
import {  IoCall} from "react-icons/io5";
import { FaEdit, FaEye, FaEyeSlash } from "react-icons/fa";

const AdminRestaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [editing, setEditing] = useState(null);

  // 📌 جلب المطاعم
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = () => {
    axios.get("http://localhost:5000/api/get-all-restaurants")
      .then(res => setRestaurants(res.data))
      .catch(err => console.log(err));
  };

  // 📌 فتح الفورم
  const handleEdit = (resto) => {
    setEditing(resto);
  };

  // 📌 التعديل
  const handleChange = (e) => {
    setEditing({
      ...editing,
      [e.target.name]: e.target.value
    });
  };

  // 📌 حفظ التعديل
  const handleUpdate = () => {
    axios.put(
      `http://localhost:5000/api/update-restaurant/${editing.restaurant_id}`,
      {
        name: editing.name,
        phone: editing.phone,
        map_link: editing.map_link,
        
      }
    )
    .then(() => {
      fetchRestaurants();
      setEditing(null);
    })
    .catch(err => console.log(err));
  };
const handleStatus = (id, status) => {
  axios.put(`http://localhost:5000/api/toggle-restaurant-status/${id}`, {
    status
  })
  .then(() => fetchRestaurants())
  .catch(err => console.log(err));
};
  return (
    <div className="ar-wrapper">
      <h2 className="ar-title">Restaurants</h2>

      {restaurants.map((r) => (
        <div
  className={`ar-card ${
    r.status === "inactive" ? "ar-card-inactive" : ""
  }`}
  key={r.restaurant_id}
>

          {/* 📸 Image */}
         {r.status === "inactive" && (
  <div className="ar-hidden-label">HIDDEN</div>
)}
          <img src={`/images/${r.image}`} alt={r.name} className="ar-image" />
         

         

          <div className="ar-info">
            <div className="ar-rating">
  ⭐ {r.rating}
</div>
            <h4 className="ar-name">{r.name}</h4>
            
          </div>
<div> 
  
  <div> 
   <button
            className="ar-btn ar-btn-edit"
            onClick={() => handleEdit(r)}
          >
             <FaEdit /> Edit Info
          </button>

   <button
      className={
        r.status === "active"
          ? "ar-btn ar-btn-hide"
          : "ar-btn ar-btn-show"
      }
      onClick={() =>
        handleStatus(
          r.restaurant_id,
          r.status === "active" ? "inactive" : "active"
        )
      }
    >
        {r.status === "active" ? (
    <>
      <FaEyeSlash /> Hide Restaurant
    </>
  ) : (
    <>
      <FaEye /> Show Restaurant
    </>
  )}
    </button>
    <p className="ar-phone"> Contact us: {r.phone}</p>

</div>




</div>
       
   

        </div>
      ))}

      {/* 🔥 Modal */}
      {editing && (
        <div className="ar-modal">
          <div className="ar-modal-box">
            <h3>Edit Restaurant</h3>

            <input
              className="ar-input"
              type="text"
              name="name"
              value={editing.name || ""}
              onChange={handleChange}
              placeholder="Name"
            />

            <input
              className="ar-input"
              type="text"
              name="phone"
              value={editing.phone || ""}
              onChange={handleChange}
              placeholder="Phone"
            />

            <input
              className="ar-input"
              type="text"
              name="map_link"
              value={editing.map_link || ""}
              onChange={handleChange}
              placeholder="Map Link"
            />
   

            

            <div className="ar-actions">
              <button className="ar-btn ar-save" onClick={handleUpdate}>
                Save
              </button>

              <button
                className="ar-btn ar-cancel"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRestaurant;