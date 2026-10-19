import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../Style/RestaurantCard.css";
import { IoLocationSharp, IoCall, IoArrowRedo } from "react-icons/io5";
import { LuUtensils, LuCoffee, LuBeef } from "react-icons/lu";
import { FiShoppingCart } from "react-icons/fi";
import { FaHeart, FaRegHeart, FaPizzaSlice } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ReviewRestaurent from "./ReviewRestaurent";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [images, setImages] = useState([]);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);

  const categoryRefs = useRef({});
  const cartRef = useRef(null);

  /* ================= 1. Fetch Restaurant & Menu ================= */
  useEffect(() => {
    axios.get(`http://localhost:5000/api/restaurants/${id}`)
      .then(res => {
        setRestaurant(res.data.restaurant);
        setImages(res.data.images || []);
      })
      .catch(err => console.error("Error fetching restaurant:", err));

    axios.get(`http://localhost:5000/api/restaurants/${id}/menu`)
      .then(res => setMenu(res.data))
      .catch(err => console.error("Error fetching menu:", err));
  }, [id]);

  /* ================= 2. Fetch Favorites ================= */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.user_id) {
      axios
        .get(`http://localhost:5000/favorites/${storedUser.user_id}`)
        .then(res => setFavorites(res.data))
        .catch(err => console.error("Error fetching favorites (Check Backend):", err));
    }
  }, []); // يتم الجلب مرة واحدة عند تحميل الصفحة

  /* ================= 3. Toggle Favorite ================= */
  const toggleFavorite = (item) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (!storedUser) {
      alert("Please login first");
      return;
    }

    const exists = favorites.find(f => f.item_id === item.item_id);

    if (exists) {
      // إزالة من المفضلة
      axios.delete("http://localhost:5000/favorites", {
        data: {
          user_id: storedUser.user_id,
          menuitem_id: item.item_id,
          restaurant_id: restaurant.restaurant_id,
        }
      }).then(() => {
        setFavorites(favorites.filter(f => f.item_id !== item.item_id));
      }).catch(err => console.error("Delete favorite failed:", err));
    } else {
      // إضافة للمفضلة
      axios.post("http://localhost:5000/favorites", {
        user_id: storedUser.user_id,
        menuitem_id: item.item_id,
        restaurant_id: restaurant.restaurant_id,
      }).then(() => {
        setFavorites([...favorites, item]);
      }).catch(err => console.error("Post favorite failed:", err));
    }
  };

  /* ================= 4. Cart Logic ================= */
  const handleOrder = (item) => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      alert("Please login first");
      return;
    }

    const exist = cart.find(i => i.item_id === item.item_id);
    if (exist) {
      setCart(cart.map(i =>
        i.item_id === item.item_id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }

    setTimeout(() => {
      cartRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const updateQty = (itemId, delta) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.item_id === itemId) {
            const newQty = i.qty + delta;
            return newQty <= 0 ? null : { ...i, qty: newQty };
          }
          return i;
        })
        .filter(Boolean)
    );
  };

  /* ================= 5. Helper Functions ================= */
  const groupedMenu = menu.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  useEffect(() => {
    if (!activeCat && Object.keys(groupedMenu).length > 0) {
      setActiveCat(Object.keys(groupedMenu)[0]);
    }
  }, [groupedMenu, activeCat]);

  const scrollToCategory = (category) => {
    setActiveCat(category);
    categoryRefs.current[category]?.scrollIntoView({ behavior: "smooth" });
  };

  const categoryIcons = {
    Meals: <LuUtensils />,
    desserts: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 10h12v5H3z"/><path d="M3 10c0-2 2-3 4-3s4 1 4 3"/><path d="M7 7V5M11 7V5"/>
      </svg>
    ),
    Baverage: <LuCoffee />,
    Grilled: <LuBeef />,
    Breakfast: <FaPizzaSlice />,
  };

  if (!restaurant) return <p>Loading...</p>;

  return (
    <div className="main-app-container">
      <div className="details-page">
        {/* TOP SECTION */}
        <div className="top-section">
          <div className="left-card">
            <span className="status-badge">Open Now</span>
            <h4 className="details-title">Details Restaurant</h4>
            <h2 className="restaurant-name">{restaurant.name}</h2>
            <p className="restaurant-location"><IoLocationSharp /> {restaurant.city}</p>
            <p className="restaurant-phone"><IoCall /> {restaurant.phone}</p>
            <div className="map-box">
              <img src="/images/map.jpeg" alt="map" />
            </div>
            <button className="visit-btn" onClick={() => window.open(restaurant.map_link || "#", "_blank")}>
              <span className="icon-circle"><IoArrowRedo /></span>
              <span className="visit-text">Visit Restaurant</span>
            </button>
          </div>

          <div className="right-image image-slider">
            <img
              src={images.length > 0 ? `/images/${images[currentIndex].image_url}` : `/images/${restaurant.image}`}
              className="details-image"
              alt="restaurant"
            />
            {images.length > 1 && (
              <>
                <button className="arrow left" onClick={() => setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}>❮</button>
                <button className="arrow right" onClick={() => setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}>❯</button>
                <div className="dots">
                  {images.map((_, index) => (
                    <span
                      key={index}
                      className={`dot ${index === currentIndex ? "active" : ""}`}
                      onClick={() => setCurrentIndex(index)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* CATEGORY NAV */}
        <div className="category-toggle">
          {Object.keys(groupedMenu).map(cat => (
            <button key={cat} onClick={() => scrollToCategory(cat)} className={`toggle-btn ${activeCat === cat ? "active" : ""}`}>
              {categoryIcons[cat]} {cat}
            </button>
          ))}
        </div>

        {/* MAIN LAYOUT */}
        <div className="page-layout">
          <div className="main-content">
            {Object.keys(groupedMenu).map(category => (
              <div key={category} ref={(el) => (categoryRefs.current[category] = el)}>
                <h2 className="category-title">
                  <span className="title-with-icon">{categoryIcons[category]} {category}</span>
                </h2>
                <div className="menu-grid">
                  {groupedMenu[category].map(item => (
                    <div key={item.item_id} className="menu-card">
                      <div className="fav-icon" onClick={() => toggleFavorite(item)}>
                        {favorites.find(f => f.item_id === item.item_id) ? <FaHeart className="active-heart"/> : <FaRegHeart />}
                      </div>
                      <img src={`/images/${item.image}`} alt={item.name} />
                      <div className="menu-info">
                        <h4>{item.name}</h4>
                        <p>{item.description}</p>
                      </div>
                      <div className="card-bottom">
                        <span className="price">{item.price}$</span>
                        <button className="order-btn" onClick={() => handleOrder(item)}>Order <FiShoppingCart /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <ReviewRestaurent restaurantId={restaurant.restaurant_id} />
          </div>

          {/* CART SIDEBAR */}
          {cart.length > 0 && (
            <div className="cart-side">
              <div className="cart-box" ref={cartRef}>
                <h3>Your Cart</h3>
                {cart.map(item => (
                  <div className="cart-item" key={item.item_id}>
                    <div className="cart-left">
                      <img src={`/images/${item.image}`} alt={item.name} />
                      <div>
                        <p className="cart-name">{item.name}</p>
                        <span className="cart-price">{item.price}$</span>
                      </div>
                    </div>
                    <div className="qty-controls">
                      <button onClick={() => updateQty(item.item_id, -1)}>-</button>
                      <span>{item.qty}</span>
                      <button onClick={() => updateQty(item.item_id, 1)}>+</button>
                    </div>
                  </div>
                ))}
                <h4 className="cart-total">Total: {cart.reduce((acc, item) => acc + item.price * item.qty, 0)}$</h4>
                <button className="checkout-btn" onClick={() => navigate("/checkout", { state: { cart, restaurant_id: restaurant.restaurant_id } })}>
                  Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetails;