import { useEffect, useState } from "react";
import axios from "axios";

const FavoritesItem = () => {
  const [items, setItems] = useState([]);
  
  const user = JSON.parse(localStorage.getItem("user"));

 useEffect(() => {
  if (user) {
    console.log("USER IN FAVORITES PAGE:", user);

    axios
      .get(`http://localhost:5000/favorites/${user.user_id}`)
      .then(res => {
        console.log("FAVORITES DATA:", res.data); 
        setItems(res.data);
      })
      .catch(err => console.log("ERROR:", err));
  } else {
    console.log("NO USER FOUND ");
  }
}, []);

  return (
    <div className="favorites-page">
      <h2 className="favorites-title"> List of Favorites  </h2>
 <div className="menu-grid">
  
      {items.map(item => (
        <div className="menu-card" key={item.item_id}>
          <h4>{item.restaurant_name}</h4>
          
          
          <img src={`/images/${item.image}`} />
          <div className="title-row">
 <h4>{item.name}</h4>
 <span className="category"> {item.category}</span>
            </div>
         
          <span className="price"> {item.price}$</span>
          
          
       
           
        </div>
      ))}
    </div>
    </div>
   
  );
};

export default FavoritesItem;