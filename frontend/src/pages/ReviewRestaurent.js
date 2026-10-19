import React, { useState, useEffect } from "react";
import axios from "axios";
import "../Style/Reviews.css";

function ReviewRestaurent({ restaurantId }) {

  const [reviews, setReviews] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const [stats, setStats] = useState({
    avg: 0,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  });

  useEffect(() => {
    axios
      .get(`http://localhost:5000/restaurant-reviews/${restaurantId}`)
      .then((res) => {
        const data = res.data;
        setReviews(data);

        if (data.length > 0) {
          const total = data.reduce((acc, curr) => acc + curr.rating, 0);
          const avg = parseFloat((total / data.length).toFixed(1));

          const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

          data.forEach((r) => {
            const rounded = Math.round(r.rating);
            if (counts[rounded] !== undefined) counts[rounded]++;
          });

          setStats({
            avg,
            count: data.length,
            distribution: counts
          });
        }
      })
      .catch((err) => console.log(err));
  }, [restaurantId]);

  const displayed = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="tripto-wrapper">

      <h2 className="tripto-main-title">Reviews</h2>

      {/* HEADER */}
      <div className="tripto-header-box">

        <div className="tripto-score-section">
          <div className="tripto-big-circle">
            <span className="avg-num">{stats.avg}</span>
            <span className="avg-label">Out of 5</span>
          </div>

          <div className="tripto-verdict">
            <h3>
              {stats.avg >= 4.5 ? "Exceptional" : "Very Good"}
            </h3>
            <p>Based on {stats.count} reviews</p>
          </div>
        </div>

        <div className="tripto-bars-section">
          {[5,4,3,2,1].map((num) => {
            const percent = stats.count
              ? (stats.distribution[num] / stats.count) * 100
              : 0;

            return (
              <div key={num} className="tripto-bar-item">
                <span className="num">{num}</span>

                <div className="bar-rail">
                  <div
                    className="bar-track"
                    style={{ width: `${percent}% `}}
                  ></div>
                </div>

                <span className="percent">{Math.round(percent)}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="tripto-grid">
        {displayed.map((rev) => (
          <div key={rev.review_id} className="tripto-card">

            <div className="card-top">
              <div className="user-info">

                <div className="tripto-avatar-box">
                  {rev.name ? rev.name[0].toUpperCase() : "U"}
                </div>

                <div>
                  <h4 className="user-name">{rev.name}</h4>
                  <p className="post-date">
                    {new Date(rev.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="rating-pill">
                {rev.rating.toFixed(1)}
              </div>
            </div>

            {/* COMMENT */}
            <p className="comment-text">
              {rev.comments}
              
              
            </p>

           

          </div>
        ))}
      </div>

      {reviews.length > 3 && (
        <button
          className="tripto-load-all"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `View all ${stats.count} reviews`}
        </button>
      )}

    </div>
  );
}

export default ReviewRestaurent;