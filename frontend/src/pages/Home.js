import React from 'react';
import '../Style/Home.css';
import Hotel from "./Hotel";
import Explore from "./Explore";
import { Link } from 'react-router-dom'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SearchBox from '../Components/SearchBox';
import ExploreSection from './ExploreSection';
import { 
  faHotel, 
  faUtensils, 
  faRunning, 
  faMountain, 
  faSearch, 
  faDollarSign, 
  faCheckCircle, 
  faArrowsAltH 
} from '@fortawesome/free-solid-svg-icons';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Your Trip Starts Here</h1>
          <p>Find unique stays across hotels, villas, and more.</p>
          
          <div className="search-container">
            <div className="tabs">
            
              <Link to="/" className="tab-link active">
                <FontAwesomeIcon icon={faHotel} className="icon-tab" />Hotel
              </Link>
              <Link to="/restaurants" className="tab-link">
                <FontAwesomeIcon icon={faUtensils} className="icon-tab" />Restaurant
              </Link>
              <Link to="/activity" className="tab-link">
                <FontAwesomeIcon icon={faRunning} className="icon-tab" />Activity
              </Link>
              <Link to="/attractions" className="tab-link">
                <FontAwesomeIcon icon={faMountain} className="icon-tab" />Attractions
              </Link>
            </div>

            <div >
              
               <div className="home-container">
    
      <SearchBox />


  
    </div>

            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <h2>Why Travellers Trust Tripto</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon-container">
              <FontAwesomeIcon icon={faDollarSign} className="feature-icon" />
            </div>
            <h3>No hidden fees</h3>
            <p>Transparent pricing with no hidden fees.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-container">
              <FontAwesomeIcon icon={faCheckCircle} className="feature-icon" />
            </div>
            <h3>Instant booking</h3>
            <p>Get confirmation right after you reserve.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon-container">
              <FontAwesomeIcon icon={faArrowsAltH} className="feature-icon" />
            </div>
            <h3>Flexibility</h3>
            <p>Flexible options with free cancellation on many listings.</p>
          </div>
        </div>
      </div>
    <Hotel></Hotel>
    <Explore></Explore>
    
<ExploreSection></ExploreSection>
    </div>
    
  );
}

export default Home;