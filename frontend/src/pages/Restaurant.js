import React, { useEffect, useState } from 'react';
import axios from 'axios';
import RestaurantCard from '../Components/RestaurantCard';
import { IoLocationSharp, IoSearchOutline ,IoChevronForward} from "react-icons/io5";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import '../Style/RestaurantCard.css';
import { Link } from "react-router-dom";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";

const Restaurant = () => {

    const [restaurants, setRestaurants] = useState([]);
    const [todayMenu, setTodayMenu] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
const restaurantRefs = useRef({});
const navigate = useNavigate();
    useEffect(() => {
        axios.get('http://localhost:5000/api/restaurants')
                .then(res => {
            const activeOnly = res.data.filter(r => r.status === "active");
            setRestaurants(activeOnly);
        });

        axios.get('http://localhost:5000/api/menu')
            .then(res => setTodayMenu(res.data));
    }, []);
const topRestaurants = restaurants.slice(0, 3);

const filteredTop = topRestaurants.filter(r =>
  r.name.toLowerCase().includes(searchTerm.toLowerCase())
);

const filteredAll = restaurants.filter(r =>
  r.name.toLowerCase().includes(searchTerm.toLowerCase())
);

    const filteredRestaurants = restaurants.filter(resto =>
        resto.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="top-header">

            <div className="top-row">
                <HiOutlineMenuAlt2 className="menu-icon" />

                <div className="location-center">
                    <IoLocationSharp className="location-icon" />
                    <span>Fnaidek Amouaa Akkar</span>
                </div>

                <div className="profile-circle"></div>
            </div>

            <div className="search-container">
                <IoSearchOutline className="inner-search-icon" />
                <input
                    type="text"
                    className="modern-input"
                    placeholder="Search restaurant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
{searchTerm && (
  <div className="search-dropdown">

    
    {filteredTop.map(resto => (
      <div
        key={resto.restaurant_id}
        className="search-item"
        onClick={() => {
          restaurantRefs.current[resto.restaurant_id]?.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
          setSearchTerm("");
        }}
      >
        {resto.name}
      </div>
    ))}

   
    {filteredTop.length === 0 && filteredAll.length > 0 && (
      <div
        className="search-item see-more"
        onClick={() => {
          navigate("/restaurants/all", {
            state: { search: searchTerm }
          });
        }}
      >
        Show more results in All Restaurants →
      </div>
    )}

    
    {filteredAll.length === 0 && (
      <div className="search-item">
        No restaurant found ❌
      </div>
    )}

  </div>
)}


  
            </div>

            <div className="section-title-row">
    <div>
        <h3>Today New Arrival</h3>
        <p className="section-subtitle">
            Best of the today food list update
        </p>
    </div>
</div>

            <div className="horizontal-scroll-wrapper">
                <div className="scroll-track">

                    {todayMenu.map(item => (
                        <div className="food-square-card" key={item.item_id}>
                            <div className="food-img-frame">
                                <img src={`/images/${item.image}`} />
                            </div>

                            <h4>{item.name} </h4>
                            

                            <div className="res-tag">
                                <IoLocationSharp className="tiny-green-pin" />
                                <span>{item.restaurant_name || "Restaurant"} </span>
                               
                            </div>
                        </div>
                    ))}

                    {/* duplicate */}
                    {todayMenu.map(item => (
                        <div className="food-square-card" key={"dup-" + item.item_id}>
                            <div className="food-img-frame">
                                <img src={`/images/${item.image}`} />
                            </div>

                            <h4>{item.name}</h4>
                            

                            <div className="res-tag">
                                <IoLocationSharp className="tiny-green-pin" />
                                <span>{item.restaurant_name} </span>  
                               

                            </div>
                        </div>
                    ))}

                </div>
            </div>
<div className="section-title-row">
    <div>
        <h3>Explore Restaurant</h3>
        <p className="section-subtitle">
            Check your city Near by Restaurant
        </p>
    </div>
<Link to="/restaurants/all" className="see-all-link">
  See All  <IoChevronForward></IoChevronForward>
</Link>
</div>

            <div className="vertical-res-list">
  {topRestaurants.slice(0,3).map(resto => (
    <div
      key={resto.restaurant_id}
      ref={(el) => (restaurantRefs.current[resto.restaurant_id] = el)}
    >
      <RestaurantCard
        id={resto.restaurant_id}
        name={resto.name}
        image={resto.image}
        city={resto.city}
      />
    </div>
  ))}
</div>

        </div>
    );
};

export default Restaurant;