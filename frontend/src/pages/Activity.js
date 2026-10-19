import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../Style/Activity.css"; 
import { Link } from "react-router-dom"; // دمجناهم بصف واحد
import AboutSection from './AboutSection';
const ActivityPage = () => {
  const [popular, setPopular] = useState([]); // للقسم اللي تحت (Popular)
  const [categories, setCategories] = useState([]); // للقسم اللي فوق (Categories)
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // نطلب البيانات من الـ APIs اللي عملناها بالـ Backend
        const [catRes, popRes] = await Promise.all([
          axios.get("http://localhost:5000/categories"),
          axios.get("http://localhost:5000/activities") // هاد بجيب الـ Popular
        ]);
        setCategories(catRes.data);
        setPopular(popRes.data.slice(0, 5)); // بناخد أول 5 حبات بس عشان الـ CSS يضل فخم ومتداخل
        setLoading(false);
      } catch (err) { 
        console.error("Error fetching data:", err); 
        setLoading(false); 
      }
    };
    fetchData();
  }, []);

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  if (loading) return <div style={{textAlign: 'center', padding: '50px'}}>Loading Adventure...</div>;

  return (
    <div className="activity-page">
      {/* --- Section 1: Categories --- */}
      <div className="activity-header">
        <p className="subtitle">Wonderful Place For You</p>
        <h1 className="title">Tour Categories</h1>
      </div>

      <div className="categories-container">
        {categories.map((cat, index) => (
          <div className="category-card-wrapper" key={index}>
            <div className="category-card-inner">
              {/* لاحظ استخدام cat_image اللي جاي من الـ SQL Query الجديدة */}
              <img src={`/activity/${cat.cat_image}`} alt={cat.category} />
              <div className="category-label">
                <h3>{cat.category}</h3>
                <span>See More</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="slider-dots">
        {categories.slice(0, 4).map((_, i) => (
          <span 
            key={i} 
            className={`dot ${activeIndex === i ? 'active' : ''}`}
            onClick={() => handleDotClick(i)}
          ></span>
        ))}
      </div>

      {/* --- Section 2: Popular Destination --- */}
      <div className="popular-section">
          <p className="subtitle">Top Destination</p>
          <h2 className="title">Popular Destination</h2>
          <div className="popular-grid">
            {popular.map((act, index) => (
               <div className="popular-card" key={act.Activity_id || index}>
                  <img src={`/activity/${act.image}`} alt={act.name} />
                  <div className="popular-overlay">
                      <h3>{act.name}</h3>
                    <Link title="View Details" to={`/activity/${act.Activity_id}`}>
          <button>Book Now</button>
       </Link>
                  </div>
               </div>
            ))}
  
          </div>
      </div>
      <AboutSection></AboutSection>

    </div>
  );
};

export default ActivityPage;