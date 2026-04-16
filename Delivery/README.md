# Delivery Partner - Advanced Food Delivery Ecosystem

![Delivery Partner](https://via.placeholder.com/1200x400/E23744/ffffff?text=Delivery+Partner+-+Premium+Food+Delivery+Platform)

A full-featured, cutting-edge food delivery platform built with **Django REST Framework** (backend) and **React 19** (frontend). 
It features a high-frequency real-time update system, role-based authentication, an advanced restaurant management portal, order tracking, and a premium, user-friendly UI/UX.

## 🚀 Advanced Features / Highlights

* **High-Frequency Real-Time Polling:** Re-engineered the synchronization engine to poll updates every 5 seconds, ensuring vendors and delivery partners receive live order status changes nearly instantaneously.
* **Premium User-Friendly Interface:** Upgraded to a more modern, cohesive styling system with enhanced micro-animations, glassmorphism, and intuitive navigation that wows at first glance.
* **Advanced "Unique" Restaurant Ecosystem:** Carefully curated dummy data includes advanced unique restaurants (e.g., *Cyberpunk Wok Fusion*, *Neon Slice Pizzeria*, *Maharaja Royal Feast*) to showcase robust category and menu management.
* **Role-Based Authentication Contexts:** Comprehensive JWT-based security granting specialized dashboards for **Customers**, **Vendors**, **Delivery Partners**, and **Administrators**.

---

## 🛠️ Tech Stack

**Backend:** Django 5.1, Django REST Framework, SimpleJWT, drf-spectacular, SQLite  
**Frontend:** React 19 (Vite), React Router, Axios, React Toastify, React Icons

---

## 📂 Project Structure

```text
├── backend/                  # Django backend
│   ├── delivery_backend/       # Project settings & URLs
│   ├── users/                # User auth, profiles, permissions
│   ├── restaurants/          # Restaurant & menu management
│   ├── orders/               # Order placement & tracking
│   ├── notifications/        # User notifications
│   └── requirements.txt
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── api/              # Axios instance with JWT interceptors
│   │   ├── context/          # Auth & Notification contexts
│   │   ├── components/       # Navbar, ProtectedRoute, RestaurantCard
│   │   └── pages/            # All page components
│   └── package.json
└── README.md
```

---

## ⚡ Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Load dummy data (creates users, advanced restaurants, menus, orders)
python manage.py load_dummy_data

# Start the server
python manage.py runserver
```

*Backend runs at:* **http://localhost:8000**

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

*Frontend runs at:* **http://localhost:5173**

---

## 📚 API Documentation

Once the backend is running, explore our auto-generated API specifications:

- **Swagger UI:** http://localhost:8000/api/docs/
- **ReDoc:** http://localhost:8000/api/redoc/
- **OpenAPI Schema:** http://localhost:8000/api/schema/
- **Django Admin:** http://localhost:8000/admin/

---

## 🔑 Login Credentials (Dummy Data)

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123456` |
| **Vendor** | `vendor_spice` | `vendor123456` |
| **Vendor** | `vendor_pizza` | `vendor123456` |
| **Vendor** | `vendor_dragon` | `vendor123456` |
| **Vendor** | `vendor_burger` | `vendor123456` |
| **Vendor** | `vendor_sushi` | `vendor123456` |
| **Delivery** | `delivery_ravi` | `delivery123456` |
| **Delivery** | `delivery_amit` | `delivery123456` |
| **Delivery** | `delivery_suresh` | `delivery123456` |
| **Customer** | `customer_alice` | `customer123456` |
| **Customer** | `customer_bob` | `customer123456` |
| **Customer** | `customer_priya` | `customer123456` |

---

## ✨ Detailed Features

### 👤 Customer Experience
- Browse and search restaurants using an ultra-smooth, responsive UI.
- Filter by dynamic categories (e.g., North Indian, Italian, Quick Bites).
- Browse rich menu categories with "bestseller" and "veg/non-veg" dynamic tags.
- High-frequency order timeline view dynamically tracking fulfillment.

### 🏢 Vendor / Partner Dashboard
- Advanced live dashboard polling every 5s to instantaneously receive new orders.
- Comprehensive UI for categorizing menu items and toggling availability.
- One-click order status progression (Confirm → Preparing → Ready for Pickup).

### 🛵 Delivery Partner Portal
- Toggle Online/Offline availability seamlessly.
- See available orders ready for pickup with real-time refresh mechanisms.
- Simple, optimized action tracking to update statuses (Picked Up → On The Way → Delivered).

### 👑 Admin Overview
- Platform-wide statistics dashboard with high-level aggregations.
- Approve/reject vendors and delivery partners securely.
- Cross-platform granular filtering for all orders and users.

---

> Built rigorously to demonstrate full-stack excellence with advanced capabilities, dynamic dummy data, and premium UI design patterns.
