import React from 'react';
import '../Style/Footer.css';



const Footer = () => {
  return (
    <footer className="tripto-footer">
      <div className="footer-container">
        
        {/* Logo & About */}
        <div className="footer-section about">
          <div className="footer-logo">TRIPTO<span>.</span></div>
          <p>
            Redefining your travel experience. By merging AI with luxury booking services, we ensure an exceptional journey at every step.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section links">
          <h3>Explore</h3>
          <ul>
            <li><a href="/hotels">Top Hotels</a></li>
            <li><a href="/restaurants">Restaurants</a></li>
            <li><a href="/">AI Voice</a></li>
            <li><a href="/Activity">Activity</a></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="footer-section contact">
          <h3>Newsletter</h3>
          <p>Be the first to know about new destinations and exclusive offers.</p>
          <form className="subscribe-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email address" />
            <button type="submit">Subscribe</button>
          </form>
        </div>

      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Tripto Experience. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;