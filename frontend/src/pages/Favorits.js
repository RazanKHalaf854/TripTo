import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Hotellist from '../Components/Hotellist';
import { FaTrashAlt } from 'react-icons/fa'; 
import '../Style/Favorites.css'; 

function Favorites() {
    const [myFavs, setMyFavs] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        if (user) {
            axios.get(`http://localhost:5000/my-favorites/${user.user_id}`)
                .then(res => setMyFavs(res.data))
                .catch(err => console.log(err));
        }
    }, [user]);

   
    const handleRemove = async (hotelId) => {
        try {
            await axios.post("http://localhost:5000/toggle-favorite", {
                user_id: user.user_id,
                hotel_id: hotelId
            });
          
            setMyFavs(myFavs.filter(item => item.hotel_id !== hotelId));
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="favorites-page-container" style={{ padding: '100px 5%' }}>
            <h4 >My Wish List </h4>
 <div className="fav-list-flex">
 {myFavs.length > 0 ? (
 myFavs.map(hotel => (
  <div key={hotel.hotel_id} className="fav-item-wrapper" style={{ position: 'relative', marginBottom: '20px' }}>
                          
 <Hotellist {...hotel} />
                            
                          
 <button  className="trash-btn"  onClick={() => handleRemove(hotel.hotel_id)}
 title="Remove from favorites">
<FaTrashAlt />
</button>
 </div>
 )) ) : (
 <p>Your list is empty. Start adding some cabins!</p>
 )}
            </div>
        </div>
    );
}
export default Favorites;