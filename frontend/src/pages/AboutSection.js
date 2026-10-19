import React from 'react';
import { Plane, Users, ArrowRight } from 'lucide-react';
import '../Style/AboutSection.css';

const AboutSection = () => {
  return (
    <section className="about-section">
      <div className="about-container">
        
        {/* القسم الأيسر: الصور المزخرفة */}
        <div className="about-images-grid">
          <div className="main-image-wrapper">
            <img src="/activity/1.jpg" alt="Forest" className="img-rounded-large" />
          </div>
          <div className="side-images-wrapper">
            <img src="/activity/2.jpg" alt="Ferris Wheel" className="img-rounded-top" />
            <img src="/activity/horse.jpg" alt="Snowmobile" className="img-rounded-bottom" />
          </div>
        </div>

        {/* القسم الأيمن: النصوص */}
        <div className="about-content">
         
          <span className="sub-title">Let's Go Together</span>
          <h2 className="main-title">Plan Your Trip <br /> <span>With us</span></h2>
          <p className="description">
            There are many variations of passages of available but the majority have suffered 
            alteration in some form, by injected hum randomised words which don't look even slightly.
          </p>

          <div className="feature-item">
            <div className="feature-icon">
              <Plane size={24} />
            </div>
            <div className="feature-text">
              <h4>Exclusive Trip</h4>
              <p>There are many variations of passages of available but the majority.</p>
            </div>
          </div>

          <div className="feature-item">
            <div className="feature-icon">
              <Users size={24} />
            </div>
            <div className="feature-text">
              <h4>Professional Guide</h4>
              <p>There are many variations of passages of available but the majority.</p>
            </div>
          </div>

        
        </div>

        {/* صورة المسافر (اختياري حسب التصميم) */}
        <div className="traveler-image">
            <img src="/activity/traveler.png" alt="Traveler" />
        </div>

      </div>
    </section>
  );
};

export default AboutSection;