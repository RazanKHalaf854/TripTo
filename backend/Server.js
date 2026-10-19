import express from "express";
import mysql from "mysql";
import cors from "cors";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";

const app = express();
app.use(cors());
app.use(express.json());


const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "senior1",
});
//Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const Q = "SELECT * FROM user WHERE email = ?"; 

  db.query(Q, [email], async (err, data) => { 
    if (err) return res.status(500).json({ message: "Server Error" });

    if (data.length > 0) {
     
      const match = await bcrypt.compare(password, data[0].password);
      
      if (match) {
        const { password, ...userWithoutPassword } = data[0];
        return res.status(200).json(userWithoutPassword);
      } else {
        return res.status(401).json({ message: "Wrong email or password!" });
      }
    } else {
      return res.status(401).json({ message: "Wrong email or password!" });
    }
  });
});

// 1. طلب إعادة تعيين كلمة المرور (Forgot Password)
app.post("/forgot-password", (req, res) => {
  const { email } = req.body;
  const Q = "SELECT * FROM user WHERE email = ?";

  db.query(Q, [email], (err, data) => {
    if (err) return res.status(500).json({ message: "Server Error" });
    if (data.length === 0) return res.status(404).json({ message: "Email not found!" });

    // سحب الـ user_id الصحيح بناءً على اسم العمود عندك
    const userID = data[0].user_id; 
    const resetLink = `http://localhost:3000/reset-password/${userID}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: 'Mayarifai25@gmail.com', 
        pass: 'zhox qses zovz lxce' // الـ App Password تبعك
      }
    });

    const mailOptions = {
      from: 'Tripto Support <Mayarifai25@gmail.com>',
      to: email,
      subject: 'Reset Your Password - Tripto',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #27ae60;">Hello ${data[0].name},</h2>
          <p>You requested to reset your password for your Tripto account.</p>
          <p>Click the button below to set a new password:</p>
          <a href="${resetLink}" style="background: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Reset Password</a>
          <p style="margin-top: 20px; font-size: 12px; color: #777;">If the button doesn't work, copy this link: ${resetLink}</p>
        </div>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) return res.status(500).json({ message: "Error sending email" });
  
    });
  });
});

// 2. تحديث كلمة المرور الجديدة (Update Password)
app.post("/reset-password/:id", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  // تنظيف الـ ID لضمان إنه رقم فقط (بيشيل أي :1 أو رموز ثانية)
  const cleanId = id.replace(/[^0-9]/g, '');

  try {
    // تشفير الباسورد الجديدة
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // استخدام اسم العمود user_id مثل ما هو عندك بالداتابيز
    const Q = "UPDATE user SET password = ? WHERE user_id = ?"; 
    
    db.query(Q, [hashedPassword, cleanId], (err, data) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ message: "Database Error" });
      }
      return res.status(200).json({ message: "Password updated successfully!" });
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});
// register

app.post("/register", async (req, res) => {
  const { name, email, password, phone, address, gender, birth_date } = req.body;
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const Q = `INSERT INTO user (name, email, password, phone, address, gender, birth_date, role) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'user')`;
             
  const values = [name, email, hashedPassword, phone, address, gender, birth_date];

  db.query(Q, values, (err, data) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: "Email already exists!" });
      return res.status(500).json({ message: "Database Error" });
    }
    return res.status(200).json({ message: "User registered successfully!" });
  });});

// Hotel API for Users
app.get("/hotel", (req, res) => {
  const city = req.query.city;
  
  let Q = `
    SELECT 
      h.*, 
      a.city,
      COUNT(r.review_id) AS review_count,
      AVG(r.rating) AS average_rating,
      (SELECT comments FROM Review WHERE hotel_id = h.hotel_id LIMIT 1) AS rating_label,
      (SELECT image_url FROM Image WHERE hotel_id = h.hotel_id AND image_url LIKE 'img%' LIMIT 1) AS displayImage
    FROM Hotel h
    JOIN Address a ON h.address_id = a.address_id
    LEFT JOIN Review r ON h.hotel_id = r.hotel_id
    WHERE h.is_active = 1
  `;

  // إذا اليوزر منقّي مدينة، بنضيف الـ AND عشان يضل شرط الـ active شغّال
  if (city) {
    Q += ` AND a.city LIKE ? `;
  }

  Q += ` GROUP BY h.hotel_id`;

  db.query(Q, city ? [`%${city}%`] : [], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json(err);
    }

    const formattedData = data.map(h => ({
      ...h,
      rating: h.average_rating ? parseFloat(h.average_rating).toFixed(1) : "0.0",
      review_count: h.review_count || 0,
      rating_label: h.rating_label || "No comment"
    }));

    res.json(formattedData);
  });
});
// هيدا الـ API خاص بس للـ Admin (بجيب الكل)
app.get("/api/admin/hotels", (req, res) => {
  let Q = `
    SELECT 
      h.*, 
      a.city,
      COUNT(r.review_id) AS review_count,
      AVG(r.rating) AS average_rating,
      (SELECT comments FROM Review WHERE hotel_id = h.hotel_id LIMIT 1) AS rating_label,
      (SELECT image_url FROM Image WHERE hotel_id = h.hotel_id AND image_url LIKE 'img%' LIMIT 1) AS displayImage
    FROM Hotel h
    JOIN Address a ON h.address_id = a.address_id
    LEFT JOIN Review r ON h.hotel_id = r.hotel_id
    GROUP BY h.hotel_id
  `;

  db.query(Q, (err, data) => {
    if (err) return res.status(500).json(err);

    const formattedData = data.map(h => ({
      ...h,
      rating: h.average_rating ? parseFloat(h.average_rating).toFixed(1) : "0.0",
      review_count: h.review_count || 0,
      rating_label: h.rating_label || "No comment"
    }));

    res.json(formattedData);
  });
});
// Hotel Details 
app.get("/hotel/:id", (req, res) => {
  const hotelId = req.params.id;

  const hotelQuery = `
    SELECT h.*, a.city
    FROM Hotel h
    JOIN Address a ON h.address_id = a.address_id
    WHERE h.hotel_id = ?
    `;

  db.query(hotelQuery, [hotelId], (err, hotelData) => {
    if (err) return res.status(500).json(err);
    if (hotelData.length === 0) return res.status(404).json("Hotel not found");

    const imagesQuery = "SELECT image_url FROM Image WHERE hotel_id = ? AND room_id IS NULL";
    
    db.query(imagesQuery, [hotelId], (err, imagesData) => {
      if (err) return res.status(500).json(err);

  
      const roomsQuery = `
        SELECT r.*, GROUP_CONCAT(i.image_url) as room_images
        FROM Room r 
        LEFT JOIN Image i ON r.room_id = i.room_id 
        WHERE r.hotel_id = ?
        GROUP BY r.room_id`; 

      db.query(roomsQuery, [hotelId], (err, roomsData) => {
        if (err) return res.status(500).json(err);

       
        const processedRooms = roomsData.map(rm => ({
          ...rm,
          room_images: rm.room_images ? rm.room_images.split(',') : ['default.jpg']
        }));

        res.json({
          ...hotelData[0],
          images: imagesData,
          rooms: processedRooms 
        });
      });
    });
  });
});

//user and delete favorites
app.post("/toggle-favorite", (req, res) => {
    const { user_id, hotel_id } = req.body;
    const checkQ = "SELECT * FROM favorites WHERE user_id = ? AND hotel_id = ?";
    db.query(checkQ, [user_id, hotel_id], (err, result) => {
if (result.length > 0) {
db.query("DELETE FROM favorites WHERE user_id = ? AND hotel_id = ?", [user_id, hotel_id], (err, data) => {
    return res.json({ status: "removed" });
 });
} else {
           
 db.query("INSERT INTO favorites (user_id, hotel_id) VALUES (?, ?)", [user_id, hotel_id], (err, data) => {
  return res.json({ status: "added" });
            });
        }
    });
});
//get favorites
app.get("/my-favorites/:user_id", (req, res) => {
    const userId = req.params.user_id;
    const Q = `
        SELECT h.*, i.image_url AS image
        FROM hotel h 
        INNER JOIN favorites f ON h.hotel_id = f.hotel_id 
        LEFT JOIN image i ON h.hotel_id = i.hotel_id
        WHERE f.user_id = ?
        GROUP BY h.hotel_id
    `;
    
    db.query(Q, [userId], (err, data) => {
        if (err) {
            console.log("Database Error:", err);
            return res.status(500).json(err);
        }
        return res.status(200).json(data);
    });
});

//Reviews
app.get('/hotel-reviews/:id', (req, res) => {
    const hotelId = req.params.id;
    const sql = `
    SELECT 
        r.*, 
        u.name, 
        rm.media_url 
    FROM review r
    INNER JOIN user u ON r.user_id = u.user_id
    LEFT JOIN reviewmedia rm ON r.review_id = rm.review_id
    WHERE r.hotel_id = ?
    `;

    db.query(sql, [hotelId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

//admin activity
// تغيير حالة الفندق (نشط / غير نشط)
app.put('/api/hotels/toggle-status/:id', (req, res) => {
    const hotelId = req.params.id;
    const { is_active } = req.body; // نرسل الحالة الجديدة من الفرونت إند

    const q = "UPDATE hotel SET is_active = ? WHERE hotel_id = ?";
    
    db.query(q, [is_active, hotelId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Hotel status updated successfully!" });
    });
});

//Admin edit
app.put("/api/hotels/:id", (req, res) => {
    const { id } = req.params;
   
    const { name, description} = req.body;

    const sql = `
        UPDATE hotel 
        SET name = ?, description = ?
        WHERE hotel_id = ?
    `;

    db.query(sql, [name, description,  id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json(err);
        }
        res.json({ message: "Hotel updated successfully!" });
    });
});

// Booking Room 
app.post("/api/bookings", (req, res) => {
    const { 
        check_in, check_out, status, num_children, has_pets, 
        price, room_id, hotel_id, user_id, telephone,
        method, payment_type, full_amount 
    } = req.body;

    const insertBookingSql = `
        INSERT INTO booking 
        (check_in, check_out, status, num_children, has_pets, price, room_id, hotel_id, user_id, telephone, full_amount) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(insertBookingSql,
        [check_in, check_out, status, num_children, has_pets, price, room_id, hotel_id, user_id, telephone, full_amount], 
        (err, result) => {
            if (err) return res.status(500).json(err);
            
            const newBookingId = result.insertId;

            // التعديل هنا: نحدد أن order_id هو NULL لأننا نحجز غرفة
            const insertPaymentSql = `
                INSERT INTO payment (method, payment_date, amount, status, booking_id, payment_type, order_id)
                VALUES (?, NOW(), ?, 'Completed', ?, ?, NULL)
            `;

            db.query(insertPaymentSql, [method || 'OMT', price, newBookingId, payment_type], (err, payResult) => {
                if (err) return res.status(500).json({ message: "Payment failed" });
                res.status(201).json({ message: "Booking Success", booking_id: newBookingId });
            });
        }
    );
});
// في ملف الـ Backend
app.get("/api/user-bookings/:user_id", (req, res) => {
    const userId = req.params.user_id;

    const sql = `
        SELECT 
            b.*, 
            r.room_number, 
            h.name,
            -- بيحسب مجموع المبالغ المدفوعة فعلياً من جدول الدفع
            COALESCE((SELECT SUM(p.amount) FROM payment p WHERE p.booking_id = b.booking_id), 0) AS amount_paid,
            -- بيجيب حالة الدفع (Partial أو Full)
            (SELECT p.payment_type FROM payment p WHERE p.booking_id = b.booking_id LIMIT 1) AS payment_type,
            (SELECT i.image_url FROM image i WHERE i.room_id = r.room_id LIMIT 1) AS image_url
        FROM booking b
        JOIN room r ON b.room_id = r.room_id
        JOIN hotel h ON b.hotel_id = h.hotel_id
        WHERE b.user_id = ?  
        ORDER BY b.booking_id DESC
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json(err);
        res.status(200).json(results);
    });
});
//booking hotel admin
// في ملف الـ Server (index.js أو app.js)
app.get("/api/admin/bookings", (req, res) => {
    const sql = `
        SELECT 
            b.*, 
            u.name as user_name,
            h.name as hotel_name,
            r.room_number,
            -- هاد السطر هو اللي بيجيب الصورة من جدول الصور
            (SELECT i.image_url FROM image i WHERE i.room_id = b.room_id LIMIT 1) AS image_url,
            COALESCE(SUM(p.amount), 0) as amount_paid, 
            MAX(p.payment_type) as payment_type,
            b.price as total_required
        FROM booking b
        JOIN user u ON b.user_id = u.user_id
        JOIN hotel h ON b.hotel_id = h.hotel_id
        JOIN room r ON b.room_id = r.room_id
        LEFT JOIN payment p ON b.booking_id = p.booking_id
        GROUP BY b.booking_id
        ORDER BY b.booking_id DESC
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});
//exlpore section
app.get("/api/explore-media", (req, res) => {
    
    const sql = `
        SELECT 
            rm.*, 
            h.name as hotel_name, 
            r.rating 
        FROM reviewmedia rm
        LEFT JOIN Review r ON rm.review_id = r.review_id
        LEFT JOIN hotel h ON r.hotel_id = h.hotel_id
        LIMIT 4
    `;

    db.query(sql, (err, data) => {
        if (err) {
            console.error("Database Error:", err); 
            return res.status(500).json({ error: "Database query failed", details: err });
        }
        res.json(data);
    });
});
// 1. التأكد من توافر الغرفة (هاد الكود تبعك صح 100%)
app.get("/api/check-room-availability", (req, res) => {
    const { room_id, check_in, check_out } = req.query;
    const sql = `
        SELECT (
            (SELECT room_quantity FROM room WHERE room_id = ?) - 
            (SELECT COUNT(*) FROM booking 
             WHERE room_id = ? 
             AND status = 'Confirmed' 
             AND NOT (check_out <= ? OR check_in >= ?))
        ) as available_now`;

    db.query(sql, [room_id, room_id, check_in, check_out], (err, result) => {
        if (err) return res.status(500).json(err);
        const isAvailable = result[0].available_now > 0;
        res.json({ isAvailable });
    });
});

// 2. جلب التواريخ المحجوزة وتنسيقها (هون التعديل الضروري)
app.get("/api/room-booked-dates/:room_id", (req, res) => {
    const q = "SELECT check_in, check_out FROM booking WHERE room_id = ? AND status = 'Confirmed'";
    
    db.query(q, [req.params.room_id], (err, data) => {
        if (err) return res.status(500).json(err);

        let allBookedDates = [];

        // تحويل كل Range (من-إلى) لمجموعة أيام منفصلة
        data.forEach(booking => {
            let start = new Date(booking.check_in);
            let end = new Date(booking.check_out);
            
            while (start < end) {
                // تنسيق التاريخ ليكون YYYY-MM-DD
                allBookedDates.push(start.toLocaleDateString('en-CA'));
                start.setDate(start.getDate() + 1);
            }
        });

        // هيك رح نبعث مصفوفة صريحة للـ React
        res.json(allBookedDates); 
    });
});
// 1. جلب كل الأنشطة
app.get("/activities", (req, res) => {
  const Q = "SELECT * FROM activity";
  db.query(Q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});

// 2. جلب الفئات (بناءً على العمود الموجود في جدول الأنشطة)
app.get("/categories", (req, res) => {
  // هذي بتجيب أسماء الفئات بدون تكرار وصورة واحدة لكل فئة
  const Q = "SELECT category, MIN(image) as cat_image FROM activity GROUP BY category";
  db.query(Q, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.status(200).json(data);
  });
});
app.get("/activity/:id", (req, res) => {
  const activityId = req.params.id;
  const Q = `
    SELECT a.*, t.ticket_id, t.game_name, t.category_name, t.description AS ticket_desc, 
           t.price AS ticket_price, t.duration AS ticket_duration, t.game_image
    FROM activity a
    LEFT JOIN ticketcategory t ON a.Activity_id = t.activity_id
    WHERE a.Activity_id = ?`;

  db.query(Q, [activityId], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json("Not found");

    const result = {
      ...data[0],
      tickets: data[0].ticket_id ? data.map(row => ({
        id: row.ticket_id,
        name: row.game_name,
        category: row.category_name,
        description: row.ticket_desc,
        price: row.ticket_price,
        duration: row.ticket_duration,
        image: row.game_image
      })) : []
    };
    res.status(200).json(result);
  });
});

//qrcode Attraction

app.post("/api/booking", (req, res) => {
    const { user_id, activity_id, ticket_id, booking_date, quantity, total_price, category, status, payment_id } = req.body;
    
    // توليد الـ QR Token فقط إذا كانت الحالة 'paid'
    let qrToken = null;
    if (status === 'paid') {
        qrToken = crypto.randomBytes(16).toString('hex');
    }

    const Q = `INSERT INTO activitybooking 
               (user_id, activity_id, ticket_id, booking_date, quantity, total_price, qr_token, status, payment_id) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(Q, [user_id, activity_id, ticket_id, booking_date, quantity, total_price, qrToken, status, payment_id], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json(err);
        }
        res.status(200).json({ 
            success: true, 
            qrToken: qrToken,
            bookingId: result.insertId 
        });
    });
});
//Razan Restaurant
// get menu
app.get("/api/menu", (req, res) => {
  const sql = `
    SELECT m.*, r.name AS restaurant_name, a.city 
    FROM menuitem m
    JOIN restaurant r ON m.restaurant_id = r.restaurant_id
    JOIN address a ON r.address_id = a.address_id
    ORDER BY restaurant_id ASC 
  `;
  
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

/* RESTAURANTS */
app.get("/api/restaurants", (req, res) => {
  const sql = `
    SELECT r.*, a.city 
    FROM restaurant r 
    LEFT JOIN address a ON r.address_id = a.address_id
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// restaurant details
app.get("/api/restaurants/:id", (req, res) => {

  const restaurantQuery = `
    SELECT r.*, a.city 
    FROM restaurant r 
    LEFT JOIN address a ON r.address_id = a.address_id 
    WHERE r.restaurant_id = ?
  `;

  const imageQuery = `
    SELECT image_url FROM image 
    WHERE restaurant_id = ?
  `;

  db.query(restaurantQuery, [req.params.id], (err, restaurantData) => {
    if (err) return res.status(500).json(err);

    db.query(imageQuery, [req.params.id], (err, imageData) => {
      if (err) return res.status(500).json(err);

      res.json({
        restaurant: restaurantData[0],
        images: imageData
      });
    });
  });

});

/* MENU PER RESTO */
app.get("/api/restaurants/:id/menu", (req, res) => {
  const q = "SELECT * FROM menuitem WHERE restaurant_id = ?";
  db.query(q, [req.params.id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});

/* ORDER */
app.post("/api/create-order", (req, res) => {

  const { 
    restaurant_id, 
    cart, 
    total, 
    name, 
    address, 
    phone, 
    
    payment_method, 
    user_id,
    order_type,
    delivery_fee,
    use_points,
    points_used
  } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: "You must login first" });
  }

  if (!name || !phone || (order_type === "delivery" && !address)) {
    return res.status(400).json({ success: false, message: "Missing data ❌" });
  }

  // 🔥 calculate final total after points
  let finalTotal = total;

  if (use_points && points_used > 0) {
    finalTotal = total - (points_used * 0.05);
    if (finalTotal < 0) finalTotal = 0;
  }

  const qOrder = `
    INSERT INTO foodorder 
    (status, total_amount, order_date, user_id, restaurant_id, customer_name, customer_address, phone_number, order_type, delivery_fee)
    VALUES ('pending', ?, NOW(), ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    qOrder, 
    [finalTotal, user_id, restaurant_id, name, address || null, phone, order_type, delivery_fee],
    (err, result) => {

      if (err) return res.status(500).json(err);

      const orderId = result.insertId;

      const itemsValues = cart.map(item => [
        item.qty,
        item.price,
        orderId,
        item.item_id
      ]);

      const qItems = `
        INSERT INTO orderitem (quantity, price, order_id, item_id) 
        VALUES ?
      `;

      db.query(qItems, [itemsValues], (err2) => {

        if (err2) return res.status(500).json(err2);

        const qPayment = `
          INSERT INTO payment 
          (order_id, amount, method, status, payment_date)
          VALUES (?, ?, ?, ?, NOW())
        `;

        let payStatus = "pending";

        if (payment_method === "cash") {
          payStatus = "pending";
        }

        db.query(qPayment, [orderId, finalTotal, payment_method, payStatus], (err3) => {

          if (err3) return res.status(500).json(err3);

          // 🔥 deduct points from user
          if (use_points && points_used > 0) {

            const deduct = `
              UPDATE user
              SET points = points - ?
              WHERE user_id = ?
            `;

            db.query(deduct, [points_used, user_id]);
          }

          res.json({ success: true, orderId });

        });

      });

    }
  );

});
//Reviews
app.get('/restaurant-reviews/:id', (req, res) => {
    const restaurantId = req.params.id;

    const sql = `
    SELECT 
        r.*, 
        u.name, 
        rm.media_url 
    FROM review r
    INNER JOIN user u ON r.user_id = u.user_id
    LEFT JOIN reviewmedia rm ON r.review_id = rm.review_id
    WHERE r.restaurant_id = ?
    ORDER BY r.date DESC
    `;

    db.query(sql, [restaurantId], (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});
// zdne app.post lal review
app.post("/api/add-review", (req, res) => {

  const {
    comments,
    rating,
    user_id,
    restaurant_id,
    order_id
  } = req.body;

  const q = `
    INSERT INTO review
    (comments, rating, date, user_id, restaurant_id,order_id)
    VALUES (?, ?, NOW(), ?, ?,?)
  `;

  db.query(
    q,
    [comments, rating, user_id, restaurant_id, order_id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res.status(500).json(err);
      }

      // 🔥 add points
      const addPoints = `
        UPDATE user
        SET points = points + 10
        WHERE user_id = ?
      `;

      db.query(addPoints, [user_id], (err2) => {

        if (err2) {
          console.log(err2);
          return res.status(500).json(err2);
        }

        // 🔥 mark reviewed
        const reviewedQuery = `
          UPDATE foodorder
          SET reviewd = 1
          WHERE order_id = ?
        `;

        db.query(reviewedQuery, [order_id], (err3) => {

          if (err3) {
            console.log(err3);
            return res.status(500).json(err3);
          }

          res.json({
            success: true,
            message: "Review added + points earned"
          });

        });

      });

    }
  );

});
//get points 
app.get("/api/user-points/:id", (req, res) => {

  const q = `
    SELECT points
    FROM user
    WHERE user_id = ?
  `;

  db.query(q, [req.params.id], (err, data) => {

    if (err) return res.status(500).json(err);

    res.json(data[0]);

  });

});
//orders status:
app.get("/api/my-orders/:user_id", (req, res) => {
  const q = `
    SELECT 
      fo.order_id,
      fo.status,
      fo.total_amount,
      COALESCE(fo.reviewd, 0) AS reviewd,
      fo.restaurant_id,
      fo.order_type,
      re.name AS restaurant_name,
      


      oi.quantity,
      oi.price,

      mi.name AS item_name,
      mi.image AS item_image

    FROM foodorder fo
    LEFT JOIN orderitem oi ON fo.order_id = oi.order_id
    LEFT JOIN menuitem mi ON oi.item_id = mi.item_id
     LEFT JOIN restaurant re ON fo.restaurant_id = re.restaurant_id

    WHERE fo.user_id = ?
    ORDER BY fo.order_id DESC
  `;

  db.query(q, [req.params.user_id], (err, data) => {
  if (err) {
    console.log("SQL ERROR FULL:", err);
    return res.status(500).json(err);
  }

  res.json(data);
});
});
//get all orders(admin)

app.get("/admin/orders", (req, res) => {
  const query = `
    SELECT 
      fo.order_id,
      fo.customer_name,
      fo.customer_address,
      fo.phone_number,
      fo.total_amount,
      fo.delivery_fee,
      fo.status,
      fo.order_type,
      r.name AS restaurant_name,
      p.method AS payment_method,
      p.status AS payment_status,
u.email AS customer_email,
      oi.quantity,
      oi.price,
      mi.name AS item_name,
      mi.image AS item_image

    FROM foodorder fo
    LEFT JOIN restaurant r ON fo.restaurant_id = r.restaurant_id
    LEFT JOIN payment p ON fo.order_id = p.order_id
    LEFT JOIN orderitem oi ON fo.order_id = oi.order_id
    LEFT JOIN menuitem mi ON oi.item_id = mi.item_id
    LEFT JOIN user u ON fo.user_id = u.user_id

    ORDER BY fo.order_id DESC
  `;

  db.query(query, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json(err);
    }

    res.json(result);
  });
});


// 🔥 UPDATE ORDER STATUS
app.put("/api/update-order-status", (req, res) => {
  const { order_id, status } = req.body;

  const query = `
    UPDATE foodorder 
    SET status = ? 
    WHERE order_id = ?
  `;

  db.query(query, [status, order_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error updating status");
    }

    res.send("Status updated");
  });
});
/* 🔥 IMAGES */
app.use("/image", express.static("public/images"));
//admin add edit delete




//favorites page
//add
app.post("/favorites", (req, res) => {
  const { user_id, menuitem_id, restaurant_id } = req.body;

  const q = `
    INSERT INTO favorites (user_id, menuitem_id ,restaurant_id)
    VALUES (?, ?,?)
  `;

  db.query(q, [user_id, menuitem_id,restaurant_id ], (err) => {
    if (err) return res.status(500).json(err);
    res.json("added");
  });
});
//delete
app.delete("/favorites", (req, res) => {
  const { user_id, menuitem_id, restaurant_id } = req.body;

  const q = `
    DELETE FROM favorites 
    WHERE user_id=? AND  menuitem_id=? AND  restaurant_id=? 
  `;

  db.query(q, [user_id, menuitem_id , restaurant_id ], (err) => {
    if (err) return res.status(500).json(err);
    res.json("removed");
  });
});
//Get favorites
app.get("/favorites/:user_id", (req, res) => {
  const q = `
    SELECT m.*,
    r.name AS restaurant_name,
    r.restaurant_id
    FROM favorites f
    JOIN menuitem m ON f.menuitem_id = m.item_id
     JOIN restaurant r ON f.restaurant_id = r.restaurant_id
     WHERE f.user_id = ?
  `;

  db.query(q, [req.params.user_id], (err, data) => {
    if (err) return res.status(500).json(err);
    res.json(data);
  });
});
//admin add restaurants

app.get("/api/get-all-restaurants", (req, res) => {
  const sql = "SELECT * FROM restaurant ";

  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }

    res.json(result);
  });
});
app.get("/api/restaurants-user", (req, res) => {
  const sql = "SELECT * FROM restaurant WHERE status='active'";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);

    res.json(result);
  });
});
app.put("/api/toggle-restaurant-status/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `
    UPDATE restaurant 
    SET status=? 
    WHERE restaurant_id=?
  `;

  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).send(err);

    res.json({ message: "Restaurant status updated successfully" });
  });
});

app.put("/api/update-restaurant/:id", (req, res) => {
  const { id } = req.params;
  const { name, phone, map_link } = req.body;

  const sql = `
    UPDATE restaurant 
    SET name=?, phone=?, map_link=? 
    WHERE restaurant_id=?
  `;

  db.query(sql, [name, phone, map_link, id], (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Updated successfully" });
  });
});
app.put("/api/toggle-restaurant/:id", (req, res) => {
  const { id } = req.params;

  const sqlGet = "SELECT status FROM restaurant WHERE restaurant_id=?";

  db.query(sqlGet, [id], (err, result) => {
    if (err) return res.status(500).send(err);

    const currentStatus = result[0].status;
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    const sqlUpdate = `
      UPDATE restaurant 
      SET status=? 
      WHERE restaurant_id=?
    `;

    db.query(sqlUpdate, [newStatus, id], (err2) => {
      if (err2) return res.status(500).send(err2);

      res.json({ message: "Status updated", status: newStatus });
    });
  });
});


app.post("/api/check-in", (req, res) => {
    const { qr_token } = req.body;

    // الربط بين جدول الحجوزات، المستخدم، والنشاط لجلب الأسماء
    // ملاحظة: استخدمت Activity_id (حرف A كبير) كما هو ظاهر في جدولك
    const selectSql = `
        SELECT 
            ab.is_scanned, 
            u.name AS user_name, 
            a.name AS activity_name 
        FROM activitybooking ab
        JOIN user u ON ab.user_id = u.user_id
        JOIN activity a ON ab.activity_id = a.Activity_id
        WHERE ab.qr_token = ?`;

    db.query(selectSql, [qr_token], (err, result) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ success: false, message: "Database Error" });
        }

        if (result.length > 0) {
            const booking = result[0];

            // 1. فحص الأمان: إذا التذكرة ممسوحة سابقاً
            if (booking.is_scanned === 1) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Security Alert: This ticket was already scanned!" 
                });
            }

            // 2. تحديث حالة التذكرة لـ "ممسوحة"
            const updateSql = `UPDATE activitybooking SET is_scanned = 1 WHERE qr_token = ?`;
            
            db.query(updateSql, [qr_token], (updateErr, updateResult) => {
                if (updateErr) {
                    return res.status(500).json({ success: false, message: "Error during update" });
                }

                if (updateResult.affectedRows > 0) {
                    // 3. إرسال رسالة الـ AI الشخصية (بالإنكليزي كما طلبتِ سابقاً)
                    return res.json({
                        success: true,
                        aiMessage: `Welcome, ${booking.user_name}! Your entry for ${booking.activity_name} has been confirmed. Enjoy your premium adventure in Lebanon with Tripto! `
                    });
                } else {
                    return res.status(500).json({ success: false, message: "Failed to update ticket status" });
                }
            });

        } else {
            // إذا الـ Token غير صحيح أو غير موجود
            res.status(404).json({ success: false, message: "Invalid or Fake Ticket!" });
        }
    });
});
//AI chatbot
app.post("/api/tripto-combined", (req, res) => {
    const { question } = req.body;
    const text = question.toLowerCase().trim();

    // القوائم اللي بعتيها مع الـ IDs
    const hotels = [
        { name: 'breeze cabin', id: 1 },
        { name: 'the cave resort', id: 4 },
        { name: 'sous ciel', id: 2 },
        { name: 'sama qammouaa', id: 3 }
    ];

    const restaurants = [
        { name: 'nasmt hawa', id: 3 },
        { name: 'wadi al shouh', id: 1 },
        { name: 'monto resto', id: 5 },
        { name: 'tiger land', id: 2 },
        { name: 'arz forest', id: 4 }
    ];

    // 1. فحص إذا المستخدم بدو يروح لصفحة فندق محدد (ID)
    for (let h of hotels) {
        if (text.includes(h.name)) {
            return res.json({ 
                action: 'NAVIGATE', 
                path: `/hotel/${h.id}`, 
                reply: `Certainly! Opening details for ${h.name}` 
            });
        }
    }

    // 2. فحص إذا المستخدم بدو يروح لصفحة مطعم محدد (ID)
    for (let r of restaurants) {
        if (text.includes(r.name)) {
            return res.json({ 
                action: 'NAVIGATE', 
                path: `/restaurant/${r.id}`, 
                reply: `Certainly! Opening details for ${r.name}` 
            });
        }
    }

    // 3. منطق البحث عن "الأفضل" (الداتابيز)
    if (text.includes("best") || text.includes("top") || text.includes("أفضل")) {
        let table = text.includes("hotel") ? "hotel" : "restaurant";
        let sql = `
            SELECT r.name, COALESCE(AVG(rv.rating), r.rating, 0) as avg_rating, COUNT(rv.review_id) as total_reviews
            FROM ${table} r
            LEFT JOIN review rv ON r.${table}_id = rv.${table}_id
            GROUP BY r.${table}_id, r.name
            ORDER BY avg_rating DESC, total_reviews DESC
            LIMIT 1`;

        return db.query(sql, (err, result) => {
            if (err) return res.json({ reply: "Sorry, I can't access reviews right now." });
            if (result.length > 0) {
                const best = result[0];
                res.json({ 
                    reply: `The best rated ${table} is ${best.name} with ${Number(best.avg_rating).toFixed(1)}/5 stars.`,
                    action: 'NONE' 
                });
            } else {
                res.json({ reply: `I found the ${table}s, but no reviews yet!` });
            }
        });
    }

    // 4. الفحص العام للـ Routes (الروابط العامة)
    if (text.includes('activity') || text.includes('نشاطات')) 
        return res.json({ action: 'NAVIGATE', path: '/activity', reply: 'Opening activities page. Enjoy your time!' });
    
    if (text.includes('hotel')) 
        return res.json({ action: 'NAVIGATE', path: '/hotels', reply: 'Heading to Hotels page.' });
    
    if (text.includes('restaurant')) 
        return res.json({ action: 'NAVIGATE', path: '/restaurants', reply: 'Opening Restaurants.' });
    
    if (text.includes('home')) 
        return res.json({ action: 'NAVIGATE', path: '/', reply: 'Going to Home page.' });
    
    if (text.includes('favorite')) 
        return res.json({ action: 'NAVIGATE', path: '/favorites', reply: 'Opening your Favorites.' });
    
    if (text.includes('booking') || text.includes('reservation')) 
        return res.json({ action: 'NAVIGATE', path: '/MyBookings', reply: 'Opening your Bookings.' });

    // رد افتراضي إذا ما فهم شي
    res.json({ action: 'NONE', reply: `I heard "${text}". How can I help you with that?` });
});
app.listen(5000, 
  () => console.log("Backend running on port 5000")
);