import React from 'react';
import { IoLocationSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

const RestaurantCard = ({ id, name, image, city }) => {

    const navigate = useNavigate();

    return (
        <div className="horizontal-res-card">
            <img src={`/images/${image}`} alt={name} className="res-thumb" />

            <div className="res-info-side">
                <h4>{name}</h4>

                <div className="city-tag">
                    <IoLocationSharp className="tiny-green-pin" />
                    <span>{city || "Akkar"}</span> 
                   
                </div>
               
            </div>

            <button
                className="green-book-btn"
                onClick={() => navigate(`/restaurant/${id}`)}
            >
               view
            </button>
        </div>
    );
};

export default RestaurantCard;