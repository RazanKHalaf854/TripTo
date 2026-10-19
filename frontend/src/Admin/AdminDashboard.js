import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hotellist from '../Components/Hotellist'; 
import "../Style/Admin.css";
import { hasGrantedAllScopesGoogle } from '@react-oauth/google';

const AdminDashboard = () => {
    const [hotels, setHotels] = useState([]);
    const [editingHotel, setEditingHotel] = useState(null); 
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
       
    });

   const fetchHotels = () => {
  
    axios.get(`http://localhost:5000/api/admin/hotels?t=${Date.now()}`)
        .then(res => {
            console.log("Admin Hotels Data:", res.data); 
            setHotels(res.data);
        })
        .catch(err => console.log(err));
};

    useEffect(() => {
        fetchHotels();
    }, []);


    const handleEditClick = (hotel) => {
        setEditingHotel(hotel.hotel_id); 
        setEditFormData({
            name: hotel.name,
          
            description: hotel.description,
           
        });
        window.scrollTo(0, 0);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
           
            await axios.put(`http://localhost:5000/api/hotels/${editingHotel}`, editFormData);
            alert("Hotel updated successfully! ");
            setEditingHotel(null); 
            fetchHotels();
        } catch (err) {
            console.error("Update Error:", err);
            alert("Failed to update hotel.");
        }
    };
// داخل AdminDashboard.js

// هيدي الدالة رح تستقبل الـ id والـ status الجديد وتحدثه بالـ state فوراً
const updateHotelStatusLocally = (id, newStatus) => {
    setHotels(prevHotels => 
        prevHotels.map(h => 
            h.hotel_id === id ? { ...h, is_active: newStatus } : h
        )
    );
};


    const refreshAfterDelete = (id) => {
        setHotels(hotels.filter(h => h.hotel_id !== id));
    };

    return (
        <div className="admin-page-container" style={{ padding: '20px' }}>
            <h2>Hotel Management</h2>

           {editingHotel && (
    <div className="modal-overlay">
        <div className="edit-hotel-modal">
            <form onSubmit={handleUpdate}>
                <h2>Edit Hotel Details</h2>
                
                <div className="modal-group">
                    <label>Hotel Name</label>
                    <input 
                        value={editFormData.name} 
                        onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                        required
                    />
                </div>

                <div className="modal-group">
                    <label>Description</label>
                    <textarea 
                        rows="4"
                        value={editFormData.description} 
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} 
                    />
                </div>

              

                <div className="modal-buttons">
                    <button type="submit" className="save-btn">Update Now</button>
                    <button type="button" className="cancel-btn" onClick={() => setEditingHotel(null)}>Cancel</button>
                </div>
            </form>
        </div>
    </div>
)}
            <div className="hotels-grid"> 
                {hotels.map((hotel) => (
                    <div key={hotel.hotel_id} className="admin-hotel-item">
                

<Hotellist 
    {...hotel} 
    is_active={hotel.is_active} 
    isAdmin={true} 
    onDelete={() => fetchHotels()} 
    onEdit={() => handleEditClick(hotel)}
/>  
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;