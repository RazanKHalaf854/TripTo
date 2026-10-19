import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlay, FaStar } from 'react-icons/fa';
import '../Style/ExploreSection.css'; 

const ExploreSection = () => {
    const [mediaItems, setMediaItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      
        axios.get("http://localhost:5000/api/explore-media")
            .then(res => {
                setMediaItems(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching media:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div className="loading">Loading Explore...</div>;
    if (mediaItems.length === 0) return null;

  
    const mainCard = mediaItems[0];
   
    const sideCards = mediaItems.slice(1, 5);

    
    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <FaStar 
                key={i} 
                color={i < Math.round(rating || 0) ? "#ffc107" : "#e4e5e9"} 
                size={10}
                style={{ marginRight: '2px' }}
            />
        ));
    };

    return (
        <section className="explore-section">
            <div className="explore-header">
                <h2>Explore Tripto in Qammouaa</h2>
             
            </div>

            <div className="explore-grid">
                {/* big*/}
                <div className="main-explore-card">
                    <img src={`/image/${mainCard.media_url}`} alt={mainCard.hotel_name} />
                    <div className="main-overlay">
                        <span className="badge">Featured Experience</span>
                        <h1>Step Into a world of Luxury</h1>
                        <p>{mainCard.hotel_name}</p>
                        <div className="stars-wrapper">
                            {renderStars(mainCard.rating)}
                        </div>
                        <button className="explore-btn">Explore All Stories</button>
                    </div>
                </div>

                {/*  samll*/}
                <div className="side-explore-grid">
                    {sideCards.map((item) => (
                        <div key={item.media_id} className="small-explore-card">
                            <div className="media-wrapper">
                                <img src={`/image/${item.media_url}`} alt={item.hotel_name} />
                                {item.media_type === 'video' && (
                                    <div className="play-icon-overlay">
                                        <FaPlay />
                                    </div>
                                )}
                            </div>
                            <div className="small-card-info">
                                <h4>{item.hotel_name}</h4>
                                <div className="stars-row">
                                    {renderStars(item.rating)}
                                   
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ExploreSection;