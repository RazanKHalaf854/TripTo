import React, { useState } from 'react';
import { MapPin, Gamepad2, Clock, ArrowLeft, CheckCircle, X, Calendar, Users, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast'; // استيراد التوست
import '../Style/AttractionDetail.css';

const AttractionDetail = ({ activity }) => {
  // --- States ---
  const [selectedGame, setSelectedGame] = useState(null); 
  const [isPaying, setIsPaying] = useState(false);        
  const [bookingData, setBookingData] = useState({ date: '', quantity: 1 });
  const [bookedInfo, setBookedInfo] = useState(null);     
  const [showTicket, setShowTicket] = useState(false);    

  // 1. فتح فورم الحجز
  const openBookingForm = (game) => {
    setSelectedGame(game);
    setBookingData({ date: '', quantity: 1 });
    setIsPaying(false);
  };

  // 2. معالجة الدفع والحجز
  const handlePaymentAndBook = async (e) => {
    e.preventDefault();

    // جلب البيانات من localStorage
    const userData = localStorage.getItem('user');
    
    if (!userData) {
      toast.error("Please login to complete your booking!", {
        duration: 4000,
        position: 'top-center',
      });
      return;
    }

    const storedUser = JSON.parse(userData);
    const userId = storedUser.user_id || storedUser.id; 

    if (!userId) {
      toast.error("User session error. Please login again.");
      return;
    }

    // محاكاة بيانات الدفع
    const paymentInfo = {
        status: 'paid',
        payment_id: "PAY-" + Math.random().toString(36).substr(2, 9).toUpperCase()
    };

    const finalBooking = {
      user_id: userId,
      activity_id: activity.Activity_id,
      ticket_id: selectedGame.id,
      booking_date: bookingData.date,
      quantity: bookingData.quantity,
      total_price: selectedGame.price * bookingData.quantity,
      category: activity.category,
      ...paymentInfo
    };

    const loadingToast = toast.loading("Processing your booking...");

    try {
      const res = await axios.post("http://localhost:5000/api/booking", finalBooking);
      
      if (res.data.success) {
        toast.dismiss(loadingToast);
        toast.success("Ticket Booked Successfully!");
        
        setBookedInfo({
          ...finalBooking,
          gameName: selectedGame.name,
          qrToken: res.data.qrToken
        });
        setIsPaying(false);
        setSelectedGame(null);
        setShowTicket(true);
      }
    } catch (err) {
      toast.dismiss(loadingToast);
      console.error(err);
      toast.error("Failed to save booking. Please check your connection.");
    }
  };

  return (
    <div className="attraction-page">
      {/* مكون التوست ليظهر فوق العناصر */}
      <Toaster />

      {/* Hero Section */}
      <div className="attr-hero">
        <img src={`/activity/${activity.image}`} alt={activity.name} className="attr-hero-img" />
        <div className="attr-overlay">
          <Link to="/activity" className="attr-back"><ArrowLeft /> Back to Activities</Link>
          <div className="attr-main-info">
             <h1>{activity.name}</h1>
             <p><MapPin size={18} /> {activity.location || "Lebanon"}</p>
          </div>
        </div>
      </div>

      <div className="attr-container">
        <section className="attr-games">
          <div className="section-title">
            <h3>About The {activity.name}:</h3>
             <p>{activity.description}</p>
          </div>

          <div className="games-list">
            {activity.tickets && activity.tickets.map((game, index) => (
              <div className="game-full-card" key={index}>
                <div className="game-img-box">
                  <img src={`/activity/${game.image}`} alt={game.name} />
                </div>
                <div className="game-details">
                  <div className="game-header">
                    <h3>{game.name}</h3>
                    <div className="game-price">${game.price}</div>
                  </div>
                  <p className="game-desc">{game.description}</p>
                  <div className="game-meta">
                     <Clock size={16} className='green-icon-sm' /> <span>{game.duration}</span>
                  </div>
                  <button className="book-game-btn" onClick={() => openBookingForm(game)}>
                    Book Ticket
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* مودال الحجز */}
      {selectedGame && !isPaying && (
        <div className="qr-modal-overlay">
          <div className="booking-popup">
            <button className="close-ticket" onClick={() => setSelectedGame(null)}><X /></button>
            <h3>Booking for {selectedGame.name}</h3>
            <p className="price-tag">Price: ${selectedGame.price}</p>
            <form onSubmit={(e) => { e.preventDefault(); setIsPaying(true); }}>
              <div className="input-field">
                <label><Calendar size={16}/> Visit Date</label>
                <input type="date" required onChange={(e) => setBookingData({...bookingData, date: e.target.value})} />
              </div>
              <div className="input-field">
                <label><Users size={16}/> People</label>
                <input type="number" min="1" required value={bookingData.quantity} onChange={(e) => setBookingData({...bookingData, quantity: e.target.value})} />
              </div>
              <div className="total-box">Total: <strong>${selectedGame.price * bookingData.quantity}</strong></div>
              <button type="submit" className="confirm-btn">Go to Payment</button>
            </form>
          </div>
        </div>
      )}

      {/* مودال الدفع */}
      {isPaying && (
        <div className="qr-modal-overlay">
          <div className="booking-popup payment-modal">
            <button className="close-ticket" onClick={() => setIsPaying(false)}><X /></button>
            <h3><CreditCard size={20} /> Secure Payment</h3>
            <form onSubmit={handlePaymentAndBook} className="payment-form">
              <div className="input-field">
                <label>Card Number</label>
                <input type="text" placeholder="1234 5678 9101 1121" required maxLength="16" />
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <div className="input-field"><label>Expiry</label><input type="text" placeholder="MM/YY" required maxLength="5" /></div>
                <div className="input-field"><label>CVV</label><input type="text" placeholder="123" required maxLength="3" /></div>
              </div>
              <button type="submit" className="confirm-btn">Confirm & Pay ${selectedGame.price * bookingData.quantity}</button>
            </form>
          </div>
        </div>
      )}

      {/* التذكرة النهائية والـ QR */}
      {showTicket && bookedInfo && (
        <div className="qr-modal-overlay">
          <div className="digital-ticket">
            <button className="close-ticket" onClick={() => setShowTicket(false)}><X /></button>
            <div className="ticket-top">
              <CheckCircle color="#22c55e" size={40} />
              <h2>Success!</h2>
            </div>
            <div className="ticket-qr-box">
              <QRCodeSVG value={bookedInfo.qrToken || "error"} size={180} />
            </div>
            <div className="ticket-info-grid">
              <div><span>Quantity</span><strong>{bookedInfo.quantity}</strong></div>
              <div><span>Total</span><strong>${bookedInfo.total_price}</strong></div>
              <div><span>Date</span><strong>{bookedInfo.booking_date}</strong></div>
              <div><span>ID</span><strong>#{bookedInfo.payment_id?.split('-')[1]}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionDetail;