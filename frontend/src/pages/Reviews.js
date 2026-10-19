import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../Style/Reviews.css";

function Reviews() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [stats, setStats] = useState({ 
    avg: 0, 
    count: 0, 
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } 
  });
  const [expandedReview, setExpandedReview] = useState(null);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/hotel-reviews/${id}`)
      .then((res) => {
        const data = res.data;
        setReviews(data);

        if (data.length > 0) {
          const total = data.reduce((acc, curr) => acc + curr.rating, 0);
          const avgScore = parseFloat((total / data.length).toFixed(1));
          
          const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          data.forEach(rev => {
            const r = Math.round(rev.rating);
            if (counts[r] !== undefined) counts[r]++;
          });

          setStats({ avg: avgScore, count: data.length, distribution: counts });
        }
      })
      .catch((err) => console.log(err));
  }, [id]);

  const toggleExpand = (reviewId) => {
    setExpandedReview(expandedReview === reviewId ? null : reviewId);
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="tripto-wrapper">
      <h2 > Reviews</h2>

      {/* Roll Rating */}
      <div className="tripto-header-box">
        <div className="tripto-score-section">
          <div className="tripto-big-circle">
            <span className="avg-num">{stats.avg}</span>
            <span className="avg-label">Out of 5</span>
          </div>
          <div className="tripto-verdict">
            <h3>{stats.avg >= 4.5 ? "Exceptional" : "Very Good"}</h3>
            <p>Based on {stats.count} verified stays</p>
          </div>
        </div>

        <div className="tripto-bars-section">
          {[5, 4, 3, 2, 1].map((num) => {
            const percentage = stats.count > 0 ? (stats.distribution[num] / stats.count) * 100 : 0;
            return (
              <div key={num} className="tripto-bar-item">
                <span className="num">{num}</span>
                <div className="bar-rail">
                  <div className="bar-track" style={{ width: `${percentage}%` }}></div>
                </div>
                <span className="percent">{Math.round(percentage)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="tripto-grid">
        {displayedReviews.map((rev) => (
          <div key={rev.review_id} className="tripto-card">
            <div className="card-top">
              <div className="user-info">
                <div className="tripto-avatar-box">
                  {rev.name ? rev.name.charAt(0).toUpperCase() : "T"}
                </div>
                <div>
                  <h4 className="user-name">{rev.name}</h4>
                  <p className="post-date">
                    {new Date(rev.date).toLocaleDateString("en-GB", { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
              <div className="rating-pill">{rev.rating.toFixed(1)}</div>
            </div>
            
            <p className="comment-text">
              {expandedReview === rev.review_id ? rev.comments : `${rev.comments.substring(0, 120)}...`}
            </p>

            {expandedReview === rev.review_id && rev.media_url && (
              <div className="media-box fade-in">
                <img src={`/Reviews/${rev.media_url}`} alt="Traveler experience" />
              </div>
            )}

            <button className="read-more-link" onClick={() => toggleExpand(rev.review_id)}>
              {expandedReview === rev.review_id ? "Show less" : "Read more"}
            </button>
          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button className="tripto-load-all" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Show less" : `View all ${stats.count} reviews`}
        </button>
      )}
    </div>
  );
}

export default Reviews;