import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RestaurantCard from '../Components/RestaurantCard';
import '../Style/RestaurantCard.css';
import { useLocation } from "react-router-dom";

const AllRestaurants = () => {

  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/restaurants')
         .then(res => {
      const activeOnly = res.data.filter(r => r.status === "active");
      setRestaurants(activeOnly);
    });
        });
        const location = useLocation();
const searchFromHome = location.state?.search || "";

const [searchTerm, setSearchTerm] = useState(searchFromHome);
      
  

  return (
    <div className="main-app-container">

      <h2 style={{ margin: "20px" }}>All Restaurants</h2>

      <div className="vertical-res-list">
        {restaurants.map(resto => (
         <RestaurantCard
  key={resto.restaurant_id}
  id={resto.restaurant_id}   
  name={resto.name}
  image={resto.image}
  city={resto.city}


/>
        ))}
      </div>

    </div>
  );
};

export default AllRestaurants;