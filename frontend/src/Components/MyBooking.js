import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaChild, FaDog, FaPhone, FaCalendarAlt, FaCheck, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "../Style/MyBookings.css"; 

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [showAll, setShowAll] = useState(false);
    
    const user = JSON.parse(localStorage.getItem("user"));
    const isAdmin = user?.role === "admin";

    useEffect(() => {
        if (!user || !user.user_id) return;

        // تحديد الرابط حسب إذا كان المستخدم Admin أو عادي
        const url = isAdmin 
            ? "http://localhost:5000/api/admin/bookings" 
            : `http://localhost:5000/api/user-bookings/${user.user_id}`;

        axios.get(url)
            .then(res => {
                setBookings(res.data);
            })
            .catch(err => console.error("Error fetching bookings:", err));
            
    }, [user?.user_id, isAdmin]); 

    const updateStatus = async (id, newStatus) => {
        if (!window.confirm(`Are you sure you want to ${newStatus} this booking?`)) return;
        try {
            await axios.put(`http://localhost:5000/api/bookings/${id}/status`, { status: newStatus });
            setBookings(bookings.map(b => b.booking_id === id ? { ...b, status: newStatus } : b));
        } catch (err) {
            alert("Error updating status");
        }
    };

    if (!user) return <h2 className="login-prompt">Please Login to see your bookings.</h2>;

    // عرض أول 3 حجوزات فقط إلا إذا ضغط المستخدم على See All
    const displayedBookings = showAll ? bookings : bookings.slice(0, 3);

    return (
        <div className="bookings-page-container">
            <h2 className="page-title">{isAdmin ? "Check Room Control" : "My Bookings"}</h2>
            
            <div className="bookings-list">
                {bookings.length > 0 ? (
                    displayedBookings.map((book) => (
                        <div key={book.booking_id} className="booking-card">
                            
                            <div className="booking-image-wrapper">
                                <img 
                                    src={`/room/${book.image_url || 'default.jpg'}`} 
                                    alt="Room" 
                                    onError={(e) => { e.target.src = "/room/default.jpg"; }} 
                                />
                            </div>
                            
                            <div className="booking-content">
                                <div className="booking-header">
                                    <div>
                                        <span className="hotel-name-tag">{book.name || "Tripto Partner"}</span>
                                        <h3>{isAdmin ? `Guest: ${book.user_name || "Client"}` : `Room ${book.room_number}`}</h3>
                                    </div>
                                    <span className={`status-badge ${book.status}`}>
                                        {book.status}
                                    </span>
                                </div>

                                {/* --- قسم مبالغ الدفع الذكي (Luxury Style) --- */}
                                <div className="price-section-refined">
                                    <div className="price-row total">
                                        <span className="price-label">Total Amount:</span>
                                        <span className="price-value">
                                            ${parseFloat(book.full_amount || book.price).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="price-row paid">
                                        <span className="price-label">Paid Amount:</span>
                                        <span className="price-value emerald">
                                            ${parseFloat(book.amount_paid || 0).toFixed(2)}
                                        </span>
                                    </div>

                                    {book.payment_type?.toLowerCase() === 'partial' && (
                                        <div className="partial-payment-badge">
                                            <FaCheck className="check-icon" /> 
                                            <span>
                                                Partial Payment (Remaining: ${( (book.full_amount || book.price) - (book.amount_paid || 0) ).toFixed(2)})
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="booking-body">
                                    <div className="date-info">
                                        <FaCalendarAlt className="date-icon-green" />
                                        <span>{new Date(book.check_in).toLocaleDateString()} To {new Date(book.check_out).toLocaleDateString()}</span>
                                    </div>

                                    <div className="details-grid">
                                        <div className="detail-item">
                                            <FaChild />
                                            <span><strong>Children:</strong> {book.num_children}</span>
                                        </div>
                                        <div className="detail-item">
                                            <FaDog />
                                            <span><strong>Pets:</strong> {book.has_pets ? "Yes" : "No"}</span>
                                        </div>
                                        <div className="detail-item">
                                            <FaPhone />
                                            <span><strong>Contact:</strong> {book.telephone || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                             
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="no-bookings">No bookings found.</p>
                )}
            </div>

            {bookings.length > 3 && (
                <div className="see-all-container">
                    <button 
                        className="see-all-btn" 
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? (
                            <>Show Less <FaChevronUp /></>
                        ) : (
                            <>See All ({bookings.length}) <FaChevronDown /></>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MyBookings;