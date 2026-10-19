import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DatePicker, ConfigProvider } from "antd";
import dayjs from "dayjs";
import toast, { Toaster } from 'react-hot-toast'; // استيراد التوست
import {
  FaWifi,
  FaSmokingBan,
  FaWind,
  FaUsers,
  FaCoffee,
  FaBed,
  FaLock,
  FaCalendarAlt
} from "react-icons/fa";

// استيراد ملفات الـ CSS
import '../Style/HotelDetails.css';
import '../Style/CustomCalendar.css';

const { RangePicker } = DatePicker;

const RoomCard = ({ rm, hotel_id, hotelData }) => {
  const navigate = useNavigate();
  const [currentImg, setCurrentImg] = useState(0);

  // States
  const [bookedDates, setBookedDates] = useState([]);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nights, setNights] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const images = rm.room_images
    ? Array.isArray(rm.room_images)
      ? rm.room_images
      : rm.room_images.split(",")
    : ["default.jpg"];

  // 1. جلب التواريخ المحجوزة
  useEffect(() => {
    axios.get(`http://localhost:5000/api/room-booked-dates/${rm.room_id}`)
      .then(res => {
        const disabled = res.data.map(date => dayjs(date).format("YYYY-MM-DD"));
        setBookedDates(disabled);
      })
      .catch(err => console.error("Error fetching booked dates:", err));
  }, [rm.room_id]);

  // 2. معالجة اختيار التاريخ
  const handleDateChange = (values, dateStrings) => {
    if (values && values[0] && values[1]) {
      const start = dateStrings[0];
      const end = dateStrings[1];
      const diff = values[1].diff(values[0], 'day');

      setCheckIn(start);
      setCheckOut(end);
      setNights(diff);
      setTotalPrice(diff * rm.price);
    } else {
      setCheckIn("");
      setCheckOut("");
      setNights(0);
      setTotalPrice(0);
    }
  };

  // 3. التأكد من توافر الغرفة
  useEffect(() => {
    if (checkIn && checkOut && nights > 0) {
      setLoadingAvailability(true);
      axios.get(`http://localhost:5000/api/check-room-availability`, {
        params: { room_id: rm.room_id, check_in: checkIn, check_out: checkOut }
      })
      .then(res => {
        setIsAvailable(res.data.isAvailable);
        setLoadingAvailability(false);
      })
      .catch(err => {
        setLoadingAvailability(false);
      });
    } else {
      setIsAvailable(true);
    }
  }, [checkIn, checkOut, nights, rm.room_id]);

  const handleReserve = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    
    if (!user) {
      toast.error("Please login to book this room!", {
        icon: <FaLock />,
       
      });
      return;
    }

    if (!checkIn || !checkOut || nights <= 0) {
      toast.error("Please select your stay dates first.", {
        icon: <FaCalendarAlt />,
      });
      return;
    }

    // إذا كان كل شيء تمام، ننتقل للدفع
    navigate("/payment", {
      state: {
        room: rm,
        hotel: hotelData,
        check_in: checkIn,
        check_out: checkOut,
        nights: nights,
        total_price: totalPrice
      }
    });
  };

  const disabledDate = (current) => {
    if (!current) return false;
    const isPast = current < dayjs().startOf('day');
    const isBooked = bookedDates.includes(current.format("YYYY-MM-DD"));
    return isPast || isBooked;
  };

  return (
    <div className="rm-c">
      {/* حاوية التنبيهات */}
      <Toaster position="bottom-right" reverseOrder={false} />

      <div className="rm-i">
        {images.length > 1 && (
          <>
            <button className="img-arrow left" onClick={() => setCurrentImg((prev) => (prev - 1 + images.length) % images.length)}>‹</button>
            <button className="img-arrow right" onClick={() => setCurrentImg((prev) => (prev + 1) % images.length)}>›</button>
          </>
        )}
        <img src={`/room/${images[currentImg]}`} alt="room" onError={(e) => (e.target.src = "/room/default.jpg")} />
      </div>

      <div className="rm-d">
        <div className="calendar-wrapper">
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: '#1aa260',
                borderRadius: 6,
              },
            }}
          >
            <RangePicker
              disabledDate={disabledDate}
              onChange={handleDateChange}
              format="YYYY-MM-DD"
              placeholder={['Check-in', 'Check-out']}
              className="custom-range-picker"
            />
          </ConfigProvider>
        </div>

        <h4 className="rm-title">{rm.description}</h4>

        <div className="rm-basic-info">
          <div className="info-box"><FaBed className="top-icon"/> {rm.type}</div>
          <div className="info-box"><FaUsers className="top-icon"/> {rm.capacity} {rm.capacity > 1 ? "Persons" : "Person"}</div>
        </div>
        
        <h5 className="details-title">Amenities</h5>
        <div className="rm-fac-list">
          <div className="fac-item"><FaCoffee className="u-icon"/> Breakfast</div>
          <div className="fac-item"><FaWifi className="u-icon"/> Free WiFi</div>
          <div className="fac-item"><FaWind className="u-icon"/> AC</div>
          <div className="fac-item"><FaSmokingBan className="u-icon"/> Non-Smoking</div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="rm-p">
        <div className="price-header">
           <span className="p-v">${rm.price}</span>
           <span className="p-u"> / night</span>
        </div>
        <div className="total-calculation-area">
          {nights > 0 ? (
            <>
              <span className="nights-badge">{nights === 1 ? "1 Night" : `${nights} nights`}</span>
              <h4>Total: ${totalPrice.toFixed(0)}</h4>
    
              {!isAvailable && <p className="error-text" style={{color: '#d32f2f', fontSize: '12px', fontWeight: 'bold'}}>Room is occupied for these dates</p>}
              
              <button 
                className={`rs-b ${(!isAvailable || loadingAvailability) ? "disabled-btn" : ""}`} 
                onClick={handleReserve}
                disabled={!isAvailable || loadingAvailability}
              >
                {loadingAvailability ? "Checking..." : (isAvailable ? "Reserve Now" : "Reserved")}
              </button>
            </>
          ) : (
            <>
              <p>Select dates to see total</p>
              <button className="rs-b" onClick={handleReserve}>Reserve</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomCard;