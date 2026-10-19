import React, { useEffect, useState } from 'react';
import { useParams , useLocation } from 'react-router-dom';
import axios from 'axios';
import '../Style/HotelDetails.css';
import Reviews from './Reviews';
import RoomCard from '../Components/RoomCard';
import { 
  FaWifi, 
  FaSmokingBan, 
  FaCar, 
  FaWheelchair, 
  FaConciergeBell, 
  FaClock,
  FaWind,
  FaUsers,FaCoffee,
  FaBed, FaCheckCircle
} from 'react-icons/fa'; 
import { MdOutlineLocalLaundryService, MdCoffeeMaker } from 'react-icons/md';

function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation(); // location

  const queryParams = new URLSearchParams(location.search);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/hotel/${id}`);
        setHotel(res.data);
      } catch (err) {
        console.log("Error fetching hotel details:", err);
      }
    };
    fetchHotelData();
  }, [id]);


  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!hotel) return <div className="loading">Loading...</div>;

  return (
    <div className="details-container">
      {/* Header Section */}
      <div className="details-header" id="overview">
        <div className="header-left">
          <h2>{hotel.name}</h2>
          <p className="location-info">{hotel.city}, Lebanon</p>
        </div>
      </div>

      {/* scroll*/}
      <div className="details-nav">
        <button className="nav-item" onClick={() => scrollToSection('overview')}>Overview</button>
        <button className="nav-item" onClick={() => scrollToSection('location')}>Location</button>
        <button className="nav-item" onClick={() => scrollToSection('rooms')}>Rooms</button>
        <button className="nav-item" onClick={() => scrollToSection('reviews')}>Reviews</button>
      </div>

      {/*  Overview Section */}
      <div  className="photo-grid">
        <div className="main-photo">
          {hotel.images && hotel.images[0] && (
            <img src={`/image/${hotel.images[0].image_url}`} alt="Main Hotel View" />
          )}
        </div>
        <div className="side-photos">
          {hotel.images && hotel.images.slice(1, 5).map((img, index) => (
            <div key={index} className="side-photo-item">
              <img src={`/image/${img.image_url}`} alt={`view ${index}`} />
            </div>
          ))}
        </div>
      </div>

      {/*  Description Section  */}
      <div className="description-section">
        <h2>Description</h2>
        <p className="hotel-meta">
          Hotel size: <strong>{hotel.nb_of_rooms || 1} rooms</strong> , 
          Arranged over <strong>{hotel.nb_of_floor || 2} floors</strong>
        </p>
        <div className="description-text">
          <p>{hotel.description}</p>
        </div>
        <button className="show-more-btn" onClick={() => setIsModalOpen(true)}>
          Show More Details
        </button>
      </div>

      {/* Amenities  */}
      <div className="amenities-container">
        <h3 className="section-title1">Most popular facilities</h3>
        <div className="amenities-grid">
      <div className="amenity-item">
          <span className="amenity-icon"><FaSmokingBan /></span>
          <span className="amenity-text">Non-smoking rooms</span></div>
      <div className="amenity-item">
            <span className="amenity-icon"><FaWifi /></span>
            <span className="amenity-text">Free WiFi</span></div>
      <div className="amenity-item">
            <span className="amenity-icon"><FaCar /></span>
            <span className="amenity-text">Free private parking</span></div>
      <div className="amenity-item">
        <span className="amenity-icon"><FaWind /></span>
        <span className="amenity-text">Air conditioning</span></div>
      <div className="amenity-item">
        <span className="amenity-icon"><FaConciergeBell /></span>
        <span className="amenity-text">Room service</span></div>
      <div className="amenity-item">
        <span className="amenity-icon"><FaWheelchair /></span>
        <span className="amenity-text">Facilities for disabled guests</span></div>
      <div className="amenity-item">
        <span className="amenity-icon"><FaClock /></span>
        <span className="amenity-text">24-hour front desk</span></div>
      <div className="amenity-item"><span className="amenity-icon"><MdCoffeeMaker /></span><span className="amenity-text">Tea/Coffee maker</span></div>
      <div className="amenity-item">
        <span className="amenity-icon"><MdOutlineLocalLaundryService /></span>
        <span className="amenity-text">Laundry</span></div>
        </div>
      </div>

      {/*  Location (Google Map)  */}
      <div id="location" className="location-section">
        <h2 className="section-title1">Location</h2>
        <div className="map-card">
          {hotel.location_url ? (
            <iframe
              src={hotel.location_url}
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            ></iframe>
          ) : (
            <p className="no-location">Location information is not available for this hotel.</p>
          )}
        </div>
      </div>
<div id="rooms">
  <h2>Rooms</h2>
{hotel.rooms.map((rm) => (
  <RoomCard
    key={rm.room_id} 
    rm={rm} 
    hotel_id={hotel.hotel_id} 
    hotelData={{
        
     
        hotel_image: hotel.images && hotel.images.length > 0 ? hotel.images[0].image_url : 'default.jpg'
    }} 
  
  />
))}</div>

            <div className="reviews-tab-section" id="reviews" >
                <Reviews hotel_id={id} />
            </div>
        
      {/* Modal show more  */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
              <h4>Hotel Details & Facilities</h4>
              <button className="close-modal" onClick={() => setIsModalOpen(false)}>&times;</button>
        </div>
        <div className="modal-body">
        <div className="facility-group">
              <h4>Description</h4>
              <p>{hotel.description}</p>
        </div>
        <div className="facility-group">
            <h4><FaClock /> Policies</h4>
            <ul>
            <li>Check-in from 15:00</li>
            <li>Check-out until 12:00</li>
            <li>Cancellation policies vary by room type</li>
             </ul>
        </div>
        <div className="facility-group">
            <h4><FaConciergeBell /> Extra Services</h4>
            <ul>
            <li>Daily housekeeping</li>
            <li>Airport shuttle (Additional charge)</li>
            <li>Meeting/banquet facilities</li>
            </ul>
            </div>
            </div>
            </div>
            </div>
      )}
            </div>
  );
}

export default HotelDetails;