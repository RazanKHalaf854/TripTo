import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "../Style/payment.css";
import toast, { Toaster } from 'react-hot-toast'; // استيراد Toaster و toast

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [bookingStatus, setBookingStatus] = useState(""); 
    const { room, hotel, check_in, check_out, total_price, nights } = location.state || {};
    const [step, setStep] = useState(2); 
    const [paymentOption, setPaymentOption] = useState("full");
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "", 
        numChildren: 0,
        hasPets: 0,
        specialRequests: "",
        method: "OMT", 
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvc: ""
    });

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser && savedUser.name) {
            const nameParts = savedUser.name.trim().split(" ");
            const fName = nameParts[0]; 
            const lName = nameParts.slice(1).join(" "); 

            setFormData(prev => ({
                ...prev,
                firstName: fName || "",
                lastName: lName || "",
                email: savedUser.email || "",
                phone: savedUser.telephone || savedUser.phone || ""
            }));
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const isCardValid = () => {
        if (formData.method === "Whish" || formData.method === "OMT") return true;
        const { cardName, cardNumber, expiry, cvc } = formData;
        return (
            cardName.trim() !== "" &&
            cardNumber.length >= 16 && 
            expiry.includes("/") &&
            cvc.length >= 3
        );
    };

    const handleMethodChange = (selectedMethod) => {
        setFormData({ ...formData, method: selectedMethod });
    };

   const handleFinalBooking = async () => {
    const { cardName, cardNumber, expiry, cvc, method, phone } = formData;

    if (!phone) {
        toast.error("Please enter your phone number."); // استبدال alert
        return;
    }

    if (method === "OMT" || method === "Card") { 
        if (!cardName || !cardNumber || cardNumber.length < 16 || !expiry || !cvc) {
            toast.error(`Please enter valid card details (16 digits required).`); // استبدال alert
            return; 
        }
    }

    try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
            toast.error("Please login first!"); // استبدال alert
            return;
        }
        
        const h_id = hotel?.hotel_id || room?.hotel_id;
        const fullTotal = parseFloat(total_price) + 6.90;
        const amountToPayNow = paymentOption === "half" ? (fullTotal / 2).toFixed(2) : fullTotal.toFixed(2);

        const bookingData = {
            check_in: check_in,
            check_out: check_out,
            status: "confirmed", 
            num_children: parseInt(formData.numChildren) || 0,
            has_pets: parseInt(formData.hasPets) || 0,
            full_amount: fullTotal.toFixed(2),
            room_id: room?.room_id,
            hotel_id: h_id, 
            user_id: user?.user_id,
            telephone: formData.phone,
            offer_id: null,
            price: amountToPayNow, 
            payment_type: paymentOption === "half" ? "Partial" : "Full",
            method: formData.method 
        };

        // إظهار حالة "Loading" للمستخدم
        const loadingToast = toast.loading("Processing your booking...");

        const res = await axios.post("http://localhost:5000/api/bookings", bookingData);
        
        if (res.status === 201 || res.status === 200) {
            toast.dismiss(loadingToast); // إغلاق رسالة الـ Loading
            setBookingStatus("done");
            
            toast.success("Payment Successful! Your booking is confirmed.", {
                duration: 4000,
             
            });

            setTimeout(() => {
                navigate('/MyBookings');
            }, 2000);
        }
    } catch (err) {
        toast.dismiss(); // إغلاق أي لودينغ مفتوح
        const errorMsg = err.response?.data?.message || "Transaction Failed";
        toast.error(errorMsg); // استبدال alert
    }
};

    if (!room) return <div className="no-data">No booking data found!</div>;

    return (
        <div className="booking-page-area">
            {/* إضافة Toaster هنا ليظهر فوق المكونات */}
            <Toaster position="top-center" reverseOrder={false} />

            <div className="stepper-wrapper">
                <div className="step-item completed"><span>1</span><p>Your selection</p></div>
                <div className={`step-item ${step >= 2 ? "active" : ""}`}><span>2</span><p>Your details</p></div>
                <div className={`step-item ${step === 3 ? "active" : ""}`}><span>3</span><p>Finish booking</p></div>
            </div>

            <div className="payment-grid-layout">
                <div className="forms-column">
                {step === 2 ? (
                    <div className="luxury-card fade-in">
                        <h2 className="card-title">Guest Info</h2>
                        <div className="input-row">
                            <div className="field-group">
                                <label>First Name *</label>
                                <input name="firstName" value={formData.firstName} placeholder="Emmily" onChange={handleInputChange} />
                            </div>
                            <div className="field-group">
                                <label>Last Name *</label>
                                <input name="lastName" value={formData.lastName} placeholder="Morgan" onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="field-group">
                                <label>Email Address *</label>
                                <input name="email" type="email" value={formData.email} placeholder="example@gmail.com" onChange={handleInputChange} />
                            </div>
                            <div className="field-group">
                                <label>Phone Number * (Telephone)</label>
                                <input name="phone" value={formData.phone} placeholder="+961 00 000 000" onChange={handleInputChange} />
                            </div>
                        </div>
                        <div className="input-row">
                            <div className="field-group">
                                <label>Children</label>
                                <input name="numChildren" type="number" min="0" onChange={handleInputChange} />
                            </div>
                            <div className="field-group">
                                <label>Pets?</label>
                                <select name="hasPets" className="luxury-select" onChange={handleInputChange}>
                                    <option value="0">No Pets</option>
                                    <option value="1">Yes, with Pets</option>
                                </select>
                            </div>
                        </div>
                        <div className="field-group">
                            <label>Special Requests (optional)</label>
                            <textarea name="specialRequests" placeholder="Let the property know if there's anything..." onChange={handleInputChange}></textarea>
                        </div>
                        <button className="next-btn" onClick={() => setStep(3)}>Next step</button>
                    </div>
                ) : (
                    <div className="luxury-card fade-in">
                        <h2 className="card-title">Choose when to pay</h2>
                        <div className="payment-options-box">
                            <div className={`option-item ${paymentOption === 'full' ? 'selected' : ''}`} onClick={() => setPaymentOption('full')}>
                                <input type="radio" checked={paymentOption === 'full'} readOnly />
                                <div className="option-text">
                                    <strong>Pay ${(total_price + 6.90).toFixed(2)} now</strong>
                                    <span>Pay the total amount today.</span>
                                </div>
                            </div>
                            <div className={`option-item ${paymentOption === 'half' ? 'selected' : ''}`} onClick={() => setPaymentOption('half')}>
                                <input type="radio" checked={paymentOption === 'half'} readOnly />
                                <div className="option-text">
                                    <strong>Pay part now and part later</strong>
                                    <span>You will pay ${((total_price + 6.90) / 2).toFixed(2)} now.</span>
                                </div>
                            </div>
                        </div>

                        <div className="payment-methods-icons">
                            <p>Payment methods (Selected: <strong>{formData.method}</strong>)</p>
                            <div className="icons-row">
                                <div className={`method-tag whish ${formData.method === 'Whish' ? 'active-method' : ''}`} 
                                     onClick={() => handleMethodChange('Whish')}>Whish</div>
                                <div className={`method-tag omt ${formData.method === 'OMT' ? 'active-method' : ''}`} 
                                     onClick={() => handleMethodChange('OMT')}>OMT</div>
                            </div>
                        </div>

                        <h2 className="card-title">Card details</h2>
                        <div className="field-group">
                            <label>Cardholder's name *</label>
                            <input name="cardName" placeholder="As printed on card" onChange={handleInputChange} />
                        </div>
                        <div className="field-group">
                            <label>Card number *</label>
                            <input name="cardNumber" placeholder="16 digits" onChange={handleInputChange} />
                        </div>
                        <div className="input-row">
                            <div className="field-group">
                                <label>Expiry *</label>
                                <input name="expiry" placeholder="MM/YY" onChange={handleInputChange} />
                            </div>
                            <div className="field-group">
                                <label>CVC *</label>
                                <input name="cvc" placeholder="CVC" onChange={handleInputChange} />
                            </div>
                        </div>
                        
                        <div className="btn-actions">
                            <button className="back-link" onClick={() => setStep(2)}>Back</button>
                            <button 
                                onClick={handleFinalBooking} 
                                disabled={bookingStatus === "done" || !isCardValid()} 
                                className={bookingStatus === "done" || !isCardValid() ? "btn-disabled" : "btn-primary"}
                            >
                                {bookingStatus === "done" ? "Booking Confirmed" : "Confirm & Pay Now"}
                            </button>
                        </div>
                    </div>
                )}
                </div>

                <div className="summary-column">
                    <div className="summary-sticky-card">
                        <div className="hotel-brief">
                            <img src={`/image/${hotel?.hotel_image}`} alt="hotel" />
                            <div>
                             
<h4>{room?.description ||  "Premium Selected Room"}</h4>
<h4>{room?.type ||  "Premium Selected Room"}</h4>

                               
                            </div>
                        </div>
                        <div className="check-box">
                            <div><label>Check-in</label><span>{check_in}</span></div>
                            <div className="v-line"></div>
                            <div><label>Check-out</label><span>{check_out}</span></div>
                        </div>
                        <div className="price-list">
                            <div className="line"><span>${room?.price} * {nights} nights</span><span>${total_price}</span></div>
                            <div className="line"><span>Tripto service fee</span><span>$2.20</span></div>
                            <div className="line"><span>Taxes</span><span>$4.70</span></div>
                            <hr />
                            <div className="line total"><strong>Total USD</strong><strong>${(total_price + 6.90).toFixed(2)}</strong></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payment;