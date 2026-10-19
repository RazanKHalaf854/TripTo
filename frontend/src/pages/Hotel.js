import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom"; 
import Hotellist from "../Components/Hotellist";
import "../Style/hotellist.css";

function Hotel() {
  const [hotels, setHotels] = useState([]);
  const scrollRef = useRef(null);
  const location = useLocation();
const queryParams = new URLSearchParams(location.search);



  useEffect(() => {
    const fetchHotels = async () => {
      try {
      
        const res = await axios.get(`http://localhost:5000/hotel${location.search}`);
        setHotels(res.data);
      } catch (err) {
        console.log("Error fetching data:", err);
      }
    };
    fetchHotels();
  }, [location.search]); 

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth; 
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="category-section">
      <div className="section-header">
      <h2 className="region-title">Qammouaa Akkar</h2> 
        <div className="slider-controls">
          <button className="arrow-btn" onClick={() => handleScroll("left")}>‹</button>
          <button className="arrow-btn" onClick={() => handleScroll("right")}>›</button>
        </div>
      </div>

      <div className="menuContainer" ref={scrollRef}>
        {hotels.length > 0 ? (
          hotels.map((h) => (
            <Hotellist
              key={h.hotel_id}
              hotel_id={h.hotel_id}
              name={h.name}
              rating={h.rating}
              review_count={h.review_count}
              description={h.description}
              phone={h.phone}
              city={h.city}
              rating_label={h.rating_label}
              image={h.displayImage}
              location_url={h.location_url}
           

             
            />
          ))
        ) : (
          <p className="no-results">No hotels found for your search.</p>
        )}
      </div>
    </div>
  );
}

export default Hotel;