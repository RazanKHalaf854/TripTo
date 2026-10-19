import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // دمجناهم بصف واحد
import Navbar from "./Components/Navbar";
import Home from "./pages/Home";
import HotelDetails from "./pages/HotelDetails";
import Hotel from "./pages/Hotel";
import Favorites from "./pages/Favorits";
import AdminDashboard from "./Admin/AdminDashboard";
import Login from "./pages/Login";
import Payment from "./pages/Payment";
import MyBooking from "./Components/MyBooking";
import ExploreSection from "./pages/ExploreSection";
import ResetPassword from "./Components/ResetPassword";
import ActivityPage from "./pages/Activity";
import ActivityDetails from "./pages/ActivityDetails";
import Restaurant from "./pages/Restaurant";
import AllRestaurants from "./pages/AllRestaurants";
import RestaurantDetails from "./pages/RestaurantDetails";
import Checkout from "./pages/Checkout";
import PaymentRestaurent from "./pages/PaymentRestaurent";
import OrderStatus from "./pages/OrderStatus";
import AdminOrders from "./pages/AdminOrders";
import FavoritesItem from "./pages/FavoritesItem";
import AdminRestaurant from "./pages/AdminRestaurant";
import Footer from "./Components/Footer";
import AdminScanner from "./pages/AdminScanner";
import TriptoBot from "./pages/TriptoBot";
import ScrollToTop from "./pages/ScrollToTop";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    
    <BrowserRouter>
      <Navbar />
      <ScrollToTop></ScrollToTop>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotels" element={<Hotel />} />
        <Route path="/hotel/:id" element={<HotelDetails />} />
        <Route path="/favorites" element={<Favorites />} />
<Route path="/login" element={<Login />} />
<Route path="/payment" element={<Payment />} />
<Route path="/MyBookings" element={<MyBooking/>} />
<Route path="/ExploreSection" element={<ExploreSection/>} />
<Route path="/reset-password/:id" element={<ResetPassword />} />
           <Route path="/activity" element={<ActivityPage />} />
          <Route path="/activity/:id" element={<ActivityDetails />} />
       <Route path="/restaurants" element={<Restaurant />} />
        <Route path="/restaurants/all" element={<AllRestaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/PaymentRestaurent" element={<PaymentRestaurent />} />
        <Route path="/orders" element={<OrderStatus />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/restaurants" element={<AdminRestaurant></AdminRestaurant>} />
        <Route path="/favorites1" element={<FavoritesItem></FavoritesItem>} />
                <Route path="/AdminScanner" element={<AdminScanner/>} />

        <Route 
          path="/admin-dashboard" 
          element={
            user && user.role === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/" />
            )
          } 
        />
      </Routes>
 
         <TriptoBot></TriptoBot>
         <Footer></Footer>
    </BrowserRouter>
    
  );
}

export default App;