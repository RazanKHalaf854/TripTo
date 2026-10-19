import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaLock } from 'react-icons/fa'; // إذا عندك react-icons
import "../Style/ResetPassword.css"; // يفضل تفصلي الـ CSS بملف جديد

const ResetPassword = () => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanId = id.toString().replace(/[^0-9]/g, '');

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:5000/reset-password/${cleanId}`, { password });
      alert(res.data.message);
      navigate("/"); 
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-container">
      <div className="reset-card">
        <div className="reset-icon-circle">
          <FaLock className="lock-icon" />
        </div>
        
        <h2>Create New Password</h2>
        <p className="reset-subtitle">Keep your Tripto account secure</p>
        
        <form onSubmit={handleSubmit} className="reset-form">
          {error && <div className="error-banner">{error}</div>}
          
          <div className="input-group">
            <input 
              type="password" 
              placeholder="New Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          
          <div className="input-group">
            <input 
              type="password" 
              placeholder="Confirm Password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
          </div>
          
          <button type="submit" className="reset-btn" disabled={loading}>
            {loading ? "Processing..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;