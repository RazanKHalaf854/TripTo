import React, { useState, useEffect } from "react";
import Login from "../pages/Login";
import "./Navbar.css";
import { Link } from "react-router-dom";
import {
  FaUser,
  FaCreditCard,
  FaSuitcase,
  FaHeart,
  FaStar,
  FaCog,
  FaSignOutAlt,
  FaTachometerAlt,
  FaHotel,
  
  FaUsers,
} from "react-icons/fa";
import { Sparkles, CheckCircle, XCircle, ArrowLeft, Volume2 } from 'lucide-react';

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // --- ميزة إغلاق المنيو عند الضغط خارجها ---
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // إذا المنيو مفتوحة والضغطة صارت برا حاوية المنيو، سكرها
      if (isMenuOpen && !event.target.closest(".user-menu-container")) {
        setIsMenuOpen(false);
      }
    };

    // إضافة الـ Event Listener للشاشة
    document.addEventListener("mousedown", handleOutsideClick);
    
    // تنظيف الـ Event Listener عند مسح الـ Component
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    closeMenu();
    window.location.reload();
  };

  return (
    <>
      {/* الـ Overlay: بيظهر خلف المنيو وبيسكرها بس تفقصي عليه */}
      {isMenuOpen && <div className="menu-overlay active" onClick={closeMenu}></div>}

      <nav className="navbar">
        <div className="logo-container">
          <Link to="/" onClick={closeMenu}>
            <img src="/logo.png" alt="tripto logo" className="logo-image" />
          </Link>
        </div>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu-container">
              <div 
                className="user-profile-trigger" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <div className="user-avatar-initials">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="nav-username">{user.name}</span>
              </div>

              <div className={`dropdown-menu ${isMenuOpen ? 'active' : ''}`}>
                <div className="user-header">
                  <strong>{user.name}</strong>
                  <p>
                    {user.role === "admin" ? "System Administrator" : "Customer Operations"}
                  </p>
                </div>
                <hr />
                <ul>
                  {user.role === "admin" ? (
                    <>
                      <li>
                        <Link to="/admin-dashboard" className="menu-link" onClick={closeMenu}>
                          <FaTachometerAlt /> Hotel
                        </Link>
                      </li>
                      <li>
                        <Link to="/Mybookings" className="menu-link" onClick={closeMenu}>
                          <FaHotel /> Booking Room
                        </Link>
                      </li>
                      <li>
                        <Link to="/Manage" className="menu-link" onClick={closeMenu}>
                          <FaUsers /> Manage Users
                        </Link>
                      </li> 
                      <li>
                        <Link to="/admin/orders" className="menu-link" onClick={closeMenu}>
                          <FaTachometerAlt /> Manage orders
                        </Link>
                      </li>
                       <li>
                        <Link to="/AdminScanner" className="menu-link" onClick={closeMenu}>
                          <CheckCircle/> Scanner
                        </Link>
                      </li>
                       <li>
                        <Link to="/admin/restaurants" className="menu-link" onClick={closeMenu}>
                          <FaTachometerAlt /> Manage Restaurant
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link to="/MyBookings" className="menu-link" onClick={closeMenu}>
                          <FaUser /> My Bookings
                        </Link>
                      </li>
                      <li>
                        <Link to="/payments" className="menu-link" onClick={closeMenu}>
                          <FaCreditCard /> Payment Account
                        </Link>
                      </li>
                    <li>
                        <Link to="/orders" className="menu-link"  onClick={closeMenu}>
                          <FaSuitcase /> My Orders
                        </Link>
                      </li>       <li>
                        <Link to="/favorites" className="menu-link" onClick={closeMenu}>
                          <FaHeart /> Favorite Hotels
                        </Link>
                      </li>
                         
                      <li>
                        <Link to="/favorites1" className="menu-link" onClick={closeMenu}>
                          <FaHeart /> Favorite Menu
                        </Link>
                      </li>
                      <li>
                        <Link to="/reviews" className="menu-link" onClick={closeMenu}>
                          <FaStar /> My Reviews
                        </Link>
                      </li>
                    </>
                  )}
                  <hr />
                  <li>
                    <Link to="/settings" className="menu-link" onClick={closeMenu}>
                      <FaCog /> Settings
                    </Link>
                  </li>
                  <li className="logout-item" onClick={handleLogout}>
                    <FaSignOutAlt /> Log out
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <button className="login-btn" onClick={() => setShowLogin(true)}>
              Login
            </button>
          )}
        </div>
      </nav>
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default Navbar;