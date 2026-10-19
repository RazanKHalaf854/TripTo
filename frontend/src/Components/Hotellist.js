import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RoomCard from './RoomCard';
import { FaHeart, FaEdit, FaEye, FaEyeSlash } from 'react-icons/fa'; // استبدلنا الحذف بالعين
import axios from 'axios';

function Hotellist({ 
  hotel_id, name, rating, review_count, description, phone, city, 
  image, displayImage, rating_label, location_url, rooms, isAdmin, onDelete, onEdit, is_active 
}) {
  
  const [isFavorite, setIsFavorite] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Please login to add to favorites!");
      return;
    }
    try {
      await axios.post("http://localhost:5000/toggle-favorite", {
        user_id: user.user_id,
        hotel_id: hotel_id
      });
      setIsFavorite(!isFavorite);
    } catch (err) {
      console.log("Error in favorite:", err);
    }
  };

  // داخل Hotellist.js
const handleToggleStatus = async (e) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    
    const newStatus = is_active === 1 ? 0 : 1; 

    try {
        await axios.put(`http://localhost:5000/api/hotels/toggle-status/${hotel_id}`, {
            is_active: newStatus
        });
        
        // نادى الدالة بدون تمرير الـ id
        // هيك الـ AdminDashboard بيعرف إنه لازم يعمل Fetch من جديد مش Delete من الـ state
        onDelete(); 
        
    } catch (err) {
        alert("Error updating status");
    }
};
  return (
    <Link to={`/hotel/${hotel_id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={`hotel-card ${isAdmin ? 'admin-hotel-style' : 'user-hotel-style'} ${is_active === 0 ? 'hotel-hidden' : ''}`}>
        
        <div className="image-section">
          <img src={`/image/${image || displayImage}`} alt={name} />
          {!isAdmin && (
            <div className="heart-badge" onClick={handleFavorite} style={{ color: isFavorite ? 'red' : 'black' }}>
              <FaHeart />
            </div>
          )}
          {/* علامة بسيطة للـ Admin بفرجي إنو الفندق مخفي */}
          {isAdmin && is_active === 0 && (
            <div className="hidden-label">Hidden</div>
          )}
        </div>
        
        <div className="info-section">
          <div className="rating-container">
            <span className="rating-score">{rating}</span>
            <span className="rating-label">{rating_label}</span>
            <span className="review-count">{review_count} Reviews</span>
          </div>
          
          <h3 className="hotel-title">{name}</h3>
          <p className="hotel-desc">{description} in {city}</p>
          
          <div className="rooms-container">
            {rooms && rooms.map((room) => (
              <RoomCard key={room.room_id} rm={room} />
            ))}
          </div>

          {isAdmin ? (
            <div className="admin-actions-zone">
              <button className="edit-btn" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}>
                <FaEdit /> Edit Info
              </button>
              
              {/* زر الـ Activity بدل الـ Delete */}
              <button 
                className={is_active === 1 ? "hide-btn" : "show-btn"} 
                onClick={handleToggleStatus}
                style={{ 
                    backgroundColor: is_active === 1 ? '#e67e22' : '#27ae60',
                    color: 'white', padding: '8px 15px', border: 'none', borderRadius: '5px', cursor: 'pointer'
                }}
              >
                {is_active === 1 ? <><FaEyeSlash /> Hide from Users</> : <><FaEye /> Show to Users</>}
              </button>
            </div>
          ) : (
            <button className="map-button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (location_url) window.open(location_url, '_blank'); }}>
              Show in map
            </button>
          )}

          <p className="call-info">Call us: {phone}</p>
        </div>
      </div>
    </Link>
  );
}

export default Hotellist;