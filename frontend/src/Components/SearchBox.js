import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const SearchBox = () => {

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1 room, 2 adults");

  const navigate = useNavigate();

  const handleSearch = () => {
    if (!city.trim()) {
      alert("Please enter a location");
      return;
    }
    const searchParams = new URLSearchParams({
      city: city.trim(),
      checkIn: checkIn,
      checkOut: checkOut,
      guests: guests
    }).toString();

    navigate(`/hotels?${searchParams}`);
  };

  return (
    <div className="search-box luxury-style">
      <div className="input-group">
        <label>Location</label>
        <input 
          type="text" 
          placeholder="Where are you going?" 
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Check In</label>
        <input 
          type="date" 
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Check Out</label>
        <input 
          type="date" 
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
        />
      </div>

      <div className="input-group">
        <label>Rooms and Guests</label>
        <input 
          type="text" 
          placeholder="1 room, 2 adults" 
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        />
      </div>

      <button className="search-button" onClick={handleSearch}>
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </div>
  );
};

export default SearchBox;