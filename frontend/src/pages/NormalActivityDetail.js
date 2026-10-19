import React, { useState } from 'react';
import { 
  MapPin, Clock, DollarSign, Calendar, 
  Users, X, Leaf, ShieldCheck, 
  ChevronRight, CheckCircle, Info, ArrowLeft, CreditCard 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import "../Style/ActivityDetails.css"; 

const NormalActivityDetail = ({ activity }) => {
  // --- States للتحكم بالدفع والحجز ---
  const [showModal, setShowModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [bookingData, setBookingData] = useState({ date: '', quantity: 1 });
  const [bookedInfo, setBookedInfo] = useState(null);
  const [showTicket, setShowTicket] = useState(false);
const user = JSON.parse(localStorage.getItem("user"));
  // دالة الدفع النهائي
  const handlePaymentAndBook = async (e) => {
    e.preventDefault();
    
    const paymentInfo = {
        status: 'paid',
        payment_id: "PAY-ACT-" + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    const finalBooking = {
      user_id: user.user_id, // استبدليه بالـ ID الحقيقي
      activity_id: activity.Activity_id,
      ticket_id: null, 
      booking_date: bookingData.date,
      quantity: bookingData.quantity,
      total_price: activity.price * bookingData.quantity,
      category: activity.category,
      ...paymentInfo
    };

    try {
      const res = await axios.post("http://localhost:5000/api/booking", finalBooking);
      if (res.data.success) {
        setBookedInfo({
          ...finalBooking,
          activityName: activity.name,
          qrToken: res.data.qrToken
        });
        setIsPaying(false);
        setShowModal(false);
        setShowTicket(true);
      }
    } catch (err) {
      alert("Error processing your booking.");
    }
  };

  return (
    <div className="adp-page-wrapper">
      <div className="adp-main-container">
        
        <div className="adp-top-nav">
          <Link to="/activity" className="adp-back-link">
            <ArrowLeft size={20} />
            <span>Back to Activities</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="adp-hero">
          <img src={`/activity/${activity.image}`} alt={activity.name} className="adp-hero-img" />
          <div className="adp-hero-overlay">
            <div className="adp-breadcrumb">
              Activities <ChevronRight size={14} /> {activity.category}
            </div>
            <h1 className="adp-title">{activity.name}</h1>
            <div className="adp-quick-tags">
              <span className="adp-tag"><MapPin size={16} /> Lebanon</span>
            </div>
          </div>
        </div>

        <div className="adp-grid-layout">
          <div className="adp-info-side">
            <div className="adp-card adp-description-card">
              <h2 className="adp-section-title">
                <Leaf size={24} className="adp-green-icon" /> Experience Details
              </h2>
              <p className="adp-text">{activity.description}</p>
              
              <div className="adp-features-strip">
                <div className="adp-f-item">
                  <Clock className="adp-green-icon" size={24} />
                  <div><strong>Duration</strong><span>{activity.duration || 'Flexible'}</span></div>
                </div>
                <div className="adp-f-item">
                  <DollarSign className="adp-green-icon" size={24} />
                  <div><strong>Price</strong><span>${activity.price}</span></div>
                </div>
                <div className="adp-f-item">
                  <ShieldCheck className="adp-green-icon" size={24} />
                  <div><strong>Status</strong><span>Verified</span></div>
                </div>
              </div>
            </div>

            <div className="adp-card">
              <h3 className="adp-section-title">
                <Info size={22} className="adp-green-icon" /> Highlights
              </h3>
              <ul className="adp-checklist">
                <li><CheckCircle size={18} className="adp-check-icon"/> Professional local guides.</li>
                <li><CheckCircle size={18} className="adp-check-icon"/> Safety equipment included.</li>
              </ul>
            </div>
          </div>

          <div className="adp-booking-side">
            <div className="adp-booking-card">
              <div className="adp-price-area">
                <span className="adp-price-label">Price per person</span>
                <div className="adp-main-price">${activity.price}</div>
              </div>
              <button className="adp-main-btn" onClick={() => { setShowModal(true); setIsPaying(false); }}>
                Reserve Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- مودال الحجز والدفع المدمج --- */}
      {showModal && (
        <div className="adp-modal-overlay">
          <div className="adp-modal" style={{ maxWidth: '450px' }}>
            <button className="adp-close" onClick={() => setShowModal(false)}><X /></button>
            
            {!isPaying ? (
              // الخطوة 1: اختيار التاريخ والعدد
              <>
                <h2 className="adp-modal-title">Booking Details</h2>
                <form className="adp-form" onSubmit={(e) => { e.preventDefault(); setIsPaying(true); }}>
                  <div className="adp-input-box">
                    <label><Calendar size={18} /> Visit Date</label>
                    <input type="date" required onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
                  </div>
                  <div className="adp-input-box">
                    <label><Users size={18} /> Visitors</label>
                    <input type="number" min="1" required value={bookingData.quantity} 
                      onChange={(e) => setBookingData({...bookingData, quantity: e.target.value})} />
                  </div>
                  <div className="total-box-simple" style={{ padding: '15px', background: '#f0fdf4', borderRadius: '12px', margin: '15px 0' }}>
                    Total Price: <strong>${activity.price * bookingData.quantity}</strong>
                  </div>
                  <button type="submit" className="adp-confirm-btn" style={{ background: '#1aa260' }}>Go to Payment</button>
                </form>
              </>
            ) : (
              // الخطوة 2: الدفع
              <>
                <h2 className="adp-modal-title">Payment</h2>
                <form className="adp-form" onSubmit={handlePaymentAndBook}>
                  <p>Paying: <strong>${activity.price * bookingData.quantity}</strong></p>
                  <div className="adp-input-box">
                    <label><CreditCard size={18} /> Card Details</label>
                    <input type="text" placeholder="Card Number" required  autoComplete="off" className="pay-input-style" />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="text" placeholder="MM/YY" required className="pay-input-style" />
                    <input type="text" placeholder="CVV" required className="pay-input-style" />
                  </div>
                  <button type="submit" className="adp-confirm-btn" style={{ background: '#1aa260' }}>Pay & Get QR Code</button>
                  <button type="button" onClick={() => setIsPaying(false)} style={{ background: 'none', border: 'none', color: '#1aa260', marginTop: '10px', cursor: 'pointer' }}>Back</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* --- التذكرة النهائية مع الـ QR Code --- */}
      {showTicket && bookedInfo && (
        <div className="qr-modal-overlay">
          <div className="digital-ticket">
            <button className="close-ticket" onClick={() => setShowTicket(false)}><X /></button>
            <div className="ticket-top">
              <CheckCircle color="#fff" size={40} />
              <h2>Booking Confirmed!</h2>
              <p>{bookedInfo.activityName}</p>
            </div>
            <div className="ticket-qr-box">
              <QRCodeSVG value={bookedInfo.qrToken} size={160} />
            </div>
            <div className="ticket-info-grid">
              <div><span>Quantity</span><strong>{bookedInfo.quantity}</strong></div>
              <div><span>Total</span><strong>${bookedInfo.total_price}</strong></div>
              <div><span>Date</span><strong>{bookedInfo.booking_date}</strong></div>
              <div><span>Ref</span><strong>{bookedInfo.payment_id?.split('-')[2]}</strong></div>
            </div>
            <p className="ticket-note">Show this QR at the entrance. Enjoy!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NormalActivityDetail;