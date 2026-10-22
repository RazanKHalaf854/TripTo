TripTo — Travel, Dining & Entertainment Platform

TripTo is a full-stack web application developed as a university graduation project. It brings travel, dining, and entertainment services together in one platform, allowing users to explore destinations, book hotels, discover restaurants, order food, and access amusement park attractions.

The platform also integrates AI-powered features, including a voice assistant, a recommendation chatbot, and QR-code ticket validation, to provide a more convenient and personalized user experience.

✨ Key Features

🏨 Hotel Discovery & Booking

* Browse hotels and explore their details and locations.
* View available room options and booking information.
* Make hotel reservations through the platform.

🍽️ Restaurant Discovery & Food Ordering

* Explore restaurants and browse menus, food items, and prices.
* View restaurant locations on an interactive map.
* Order food for home delivery or pickup.
* Access supported payment options, including OMT and Whish.
* Share reviews and ratings based on personal experiences.

🎡 Amusement Parks & Attractions

* Discover amusement parks and available rides in the surrounding area.
* Explore attraction information.
* Obtain digital tickets with QR codes.

🤖 AI-Powered Features

🎙️ AI Voice Assistant

* Allows users to interact with the platform using voice commands.
* Helps users find destinations and access location-related information while driving.
* Provides a more convenient, hands-free way to interact with the application.

💬 AI Recommendation Chatbot

* Answers questions about restaurants and local services.
* Helps users discover highly rated restaurants based on available reviews and ratings.
* Provides recommendations to help users make informed decisions.

🎟️ Smart QR Code Ticket Validation

* Generates QR-code-based digital tickets.
* Checks whether a ticket has already been used.
* Helps prevent duplicate ticket use and unauthorized reuse.
* Improves ticket validation and access control.

👤 User Authentication

* User registration and login.
* Password recovery.
* Account-related functionality.

⭐ Reviews & Ratings

* Allow users to share feedback about supported services.
* Help other users make informed choices based on customer experiences.

📍 Location & Maps
* Display hotel and restaurant locations on maps.
* Help users explore nearby places and find destinations.
🛠️ Technology Stack
Technology            purpose
  React.js            frontend development
  Node.js             Backend development
  MySQL               Relational database
  Git                 Version Control
  GitHub              Source code hosting and collaboration
  🏗️ Project Architecture

TripTo follows a frontend-backend architecture:

* Frontend: React.js provides the user interface and allows users to interact with the platform.
* Backend: Node.js handles application logic and communication between the frontend and database.
* Database: MySQL manages structured application data, including information related to users, hotels, restaurants, bookings, orders, and reviews, according to the implemented database schema.
  📁 Project Structure
  TripTo/
├── frontend/
├── backend/
├── .gitignore
└── README.md
🚀 Getting Started

Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* MySQL
Installation

1. Clone the repository
git clone https://github.com/RazanKHalaf854/TripTo.git
2. Navigate to the project directory:
cd TripTo
3.Install frontend dependencies
cd frontend
npm install
4.Install backend dependencies:
cd ../backend
npm install
5. Configure the MySQL database and the required environment variables according to the project configuration.
6. Start the frontend and backend using the scripts defined in their respective package.json files.

🔐 Security

* Keep database credentials and API keys in environment variables.
* Do not commit .env files containing secrets.
* Validate QR-code tickets on the backend to prevent duplicate use.

🎓 Project Background

TripTo was developed as a university graduation project to apply full-stack web development concepts and integrate travel services, restaurant ordering, location-based features, AI-powered assistance, and digital ticketing into a unified platform.

👩‍💻 Author

Razan Khalaf

GitHub: RazanKHalaf854

* Display hotel and restaurant locations on maps.
* Help users explore nearby places and find destinations.
