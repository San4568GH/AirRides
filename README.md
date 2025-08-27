
# ✈️ AirRides - Flight Booking System
[![React](https://img.shields.io/badge/React-18.0+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Chakra UI](https://img.shields.io/badge/Chakra%20UI-2.10+-319795?style=for-the-badge&logo=chakraui&logoColor=white)](https://chakra-ui.com/)

A comprehensive **MERN Stack** flight booking web application with advanced admin management, secure payments, and modern UI design.

## 🌟 Key Features

### Core Functionality
- **✈️ Flight Search & Booking** - Search flights by destination, date, and preferences
- **👤 User Authentication** - Secure JWT-based login/registration system
- **💳 Payment Integration** - RazorPay integration for secure transactions
- **📱 Responsive Design** - Mobile-first approach with Chakra UI components

### Advanced Admin System
- **🏢 Hierarchical Admin Access** - Master Admin (env-based) + Assigned Admin (database)
- **👥 User Management** - Complete CRUD operations for user accounts
- **🏙️ City Management** - Add/remove flight destinations
- **✈️ Flight Management** - Create, edit, and manage flight schedules
- **📊 Booking Analytics** - View and manage customer bookings

<<<<<<< HEAD
## 🛠️ Technology Stack

### Frontend
- **React** 18.0+ - Core UI framework
- **Vite** 5.0+ - Build tool and dev server
- **Chakra UI** 2.10+ - Component library & theming
- **React Router** 6.0+ - Client-side routing

### Backend
- **Node.js** 18.0+ - Runtime environment
- **Express.js** 4.19+ - Web application framework
- **MongoDB** 6.0+ - NoSQL database
- **Mongoose** 8.4+ - MongoDB ODM
- **JWT** 9.0+ - Authentication tokens
- **bcrypt** 5.1+ - Password hashing

### Payment & Security
- **RazorPay** 2.9+ - Payment gateway integration
- **CORS** 2.8+ - Cross-origin resource sharing
=======
1. Clone the repository:

   ```git clone https://github.com/San4568GH/AirRides.git```
   
   or download the .zip file and extract.
    

2. Change directory to frontend->client:
 
   ```cd frontend```

   ```cd client```

3. Install dependencies:

   ```npm install```

3. Run frontend server:
 
   ```npm run dev```
>>>>>>> 233ec62d146168eb93678d303cb8f3e5486b45a0

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18.0 or higher
- MongoDB 6.0 or higher
- RazorPay account (for payment integration)

### 1. Clone the repository
```bash
git clone https://github.com/San4568GH/AirRides.git
cd AirRides
```

### 2. Environment Setup
Copy `.env.example` to `.env` and configure your settings:
```bash
cp .env.example .env
```

Fill in your configuration in `.env`:
```env
# Database
MONGO_URL=your_mongodb_connection_string

<<<<<<< HEAD
# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# Master Admin Credentials
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_password

# Server Configuration
SERVER_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=4000
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 4. Frontend Setup
```bash
cd frontend/client
npm install
npm run dev
```

### 5. Access the Application
- **Frontend:** http://localhost:5173
- **Backend:** http://localhost:4000
- **Admin Access:** Use credentials from .env file

## 🔐 Admin Access

### Master Admin (Environment-based)
- Use credentials from `.env` file
- Full administrative privileges
- Red "Master Admin" badge

### Assigned Admin (Database-based)
- Created through setup page or user management
- Blue "Assigned Admin" badge
- Full administrative privileges

## 📁 Project Structure
```
AirRides/
├── frontend/client/     # React frontend
├── backend/            # Node.js backend
├── .env.example        # Environment template
└── README.md          # This file
```
=======
   ```nodemon server.js```
>>>>>>> 233ec62d146168eb93678d303cb8f3e5486b45a0

---

**Note:** Make sure to configure your `.env` file with proper credentials before starting the application.


