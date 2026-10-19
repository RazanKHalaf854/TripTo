import React, { useState } from 'react';
import axios from 'axios';
import "../Style/Login.css";
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // استيراد التوست
import { FaEnvelopeOpenText } from 'react-icons/fa'; // أيقونة لإضفاء لمسة احترافية

const Login = ({ onClose }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", address: "", gender: "", birthday: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // معالجة "نسيان كلمة المرور" بدون alert
  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email first!");
      return;
    }
    
    const loadingToast = toast.loading("Sending reset link...");

    try {
      const res = await axios.post("http://localhost:5000/forgot-password", { email: formData.email });
      toast.dismiss(loadingToast);
      
      // إظهار رسالة النجاح مع أيقونة "شيكي على الإيميل"
      toast.success(res.data.message || "Please check your email for the reset link!", {
        duration: 5000,
        icon: <FaEnvelopeOpenText style={{color: '#1aa260'}} />,
        style: {
          border: '1px solid #1aa260',
          padding: '16px',
          color: '#333',
        },
      });

    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMsg = err.response?.data?.message || "Error sending reset link";
      toast.error(errorMsg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const endpoint = isLogin ? "/login" : "/register";

    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, formData);

      if (isLogin) {
        localStorage.setItem("user", JSON.stringify(res.data));
        
        toast.success(`Welcome back, ${res.data.name}!`, {
          duration: 3000,
          style: {
            border: '1px solid #1aa260',
            padding: '16px',
            color: '#1aa260',
          },
          iconTheme: {
            primary: '#1aa260',
            secondary: '#FFFAEE',
          },
        });

        setTimeout(() => {
          onClose();
          if (res.data.role === "admin") {
            navigate("/admin-dashboard");
          } else {
            navigate("/");
          }
          window.location.reload();
        }, 1500);

      } else {
        toast.success("Account created successfully! Please log in.");
        setIsLogin(true);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="login-modal-wrapper">
      <Toaster position="top-center" reverseOrder={false} />
      
      <div className="modal-overlay">
        <div className={`login-modal ${!isLogin ? "scrollable-modal" : ""}`}>
          <button className="close-btn" onClick={onClose}>&times;</button>
          
          <h3>{isLogin ? "Welcome to Tripto" : "Join Tripto"}</h3>
          <p className="subtitle">{isLogin ? "Log in to your account" : "Create a new account"}</p>
          
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required />
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} required />
                <input type="text" name="address" placeholder="Address" onChange={handleChange} required />
                <select name="gender" className="gender-select" onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div className="input-field-container">
                  <label className="form-label-style">Birthday</label>
                  <input type="date" name="birthday" onChange={handleChange} required className="birthday-input" />
                </div>
              </>
            )}

            <input type="email" name="email" placeholder="Email address" onChange={handleChange} required />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

            {isLogin && (
              <div className="forgot-password-container" style={{ textAlign: 'right', marginBottom: '15px' }}>
                <span className="forgot-link" onClick={handleForgotPassword} style={{ cursor: 'pointer', color: '#1aa260', fontSize: '13px', fontWeight: 'bold' }}>
                  Forgot Password?
                </span>
              </div>
            )}

            <button type="submit" className="continue-btn" style={{backgroundColor: '#1aa260'}}>
              {isLogin ? "Log In" : "Create Account"}
            </button>
          </form>

          <div className="divider-text">or</div>
          <p className="switch-text">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <span onClick={() => setIsLogin(!isLogin)} style={{color: '#1aa260'}}>
              {isLogin ? " Sign Up" : " Log In"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;