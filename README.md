# 🏨 Hotel Management System 

A full-stack Hotel Management System built with **Node.js**, **Express**, **MySQL**, and **HTML/CSS/JavaScript**. Manage rooms, guests, bookings, staff, and payments through a professional luxury-themed dashboard.

---

## 📁 Project Structure

```
hotel-management-system/
├── database/
│   └── hotel_db.sql          # MySQL schema + sample data
├── backend/
│   ├── .env                  # Environment variables (DB credentials)
│   ├── package.json          # Node.js dependencies
│   ├── server.js             # Main Express server
│   └── routes/
│       ├── rooms.js          # Rooms API
│       ├── guests.js         # Guests API
│       ├── bookings.js       # Bookings API
│       └── staff.js          # Staff API
└── frontend/
    ├── index.html            # Dashboard
    ├── rooms.html            # Rooms page
    ├── guests.html           # Guests page
    ├── bookings.html         # Bookings page
    ├── staff.html            # Staff page
    ├── css/
    │   └── style.css         # Luxury hotel theme
    └── js/
        └── app.js            # API calls & CRUD logic
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MySQL (Local / Railway / Aiven) |
| Styling | Custom CSS — Navy + Gold luxury theme |
| Fonts | Playfair Display + Lato (Google Fonts) |

---

## ⚙️ Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) v18 or above
- [MySQL](https://www.mysql.com/) v8 or above
- npm (comes with Node.js)

---

## 🚀 Setup & Installation

### Step 1 — Clone or Download the Project
```bash
git clone https://github.com/vivek-belwal/hotel-management-system.git
cd hotel-management-system
```

### Step 2 — Import the Database

**Option A — Using MySQL terminal:**
```bash
mysql -u root -p < database/hotel_db.sql
```

**Option B — Using MySQL Workbench:**
1. Open MySQL Workbench
2. Go to File → Open SQL Script
3. Select `database/hotel_db.sql`
4. Click ⚡ Execute

**Option C — Cloud MySQL (Railway/Aiven):**
- Copy contents of `hotel_db.sql`
- Paste into Railway Query Editor or Aiven Query Editor
- Remove the first 2 lines (`CREATE DATABASE` and `USE`) if using cloud
- Click Run ✅

### Step 3 — Configure Environment Variables

Go to `backend/` folder and open `.env`:

```env
PORT=3000

# Local MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=hotel_management
DB_PORT=3306
```

**For Railway MySQL:**
```env
PORT=3000
DB_HOST=monorail.proxy.rlwy.net
DB_USER=root
DB_PASSWORD=your_railway_password
DB_NAME=railway
DB_PORT=your_railway_port
```

**For Aiven MySQL:**
```env
PORT=3000
NODE_ENV=production
DB_HOST=mysql-xxxxx.aivencloud.com
DB_USER=avnadmin
DB_PASSWORD=your_aiven_password
DB_NAME=defaultdb
DB_PORT=14237
```

### Step 4 — Install Dependencies
```bash
cd backend
npm install
```

### Step 5 — Start the Server
```bash
# Development mode (auto-restart)
npm run dev

# Production mode
npm start
```

### Step 6 — Open the Frontend
Open `frontend/index.html` in your browser directly.

---

## ✅ Success Output

When everything is working you will see:
```
🚀 Server running at http://localhost:3000
✅ Connected to MySQL: hotel_management on localhost
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get all dashboard stats |
| GET | `/api/rooms` | Get all rooms |
| POST | `/api/rooms` | Add new room |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |
| GET | `/api/guests` | Get all guests |
| POST | `/api/guests` | Register new guest |
| PUT | `/api/guests/:id` | Update guest |
| DELETE | `/api/guests/:id` | Delete guest |
| GET | `/api/bookings` | Get all bookings |
| POST | `/api/bookings` | Create booking |
| PUT | `/api/bookings/:id` | Update booking |
| DELETE | `/api/bookings/:id` | Delete booking |
| GET | `/api/staff` | Get all staff |
| POST | `/api/staff` | Add staff member |
| PUT | `/api/staff/:id` | Update staff |
| DELETE | `/api/staff/:id` | Delete staff |
| GET | `/api/payments` | Get all payments |

---

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| `rooms` | Room details — type, price, status, floor |
| `guests` | Guest profiles — contact, ID proof, nationality |
| `bookings` | Reservations — check-in/out, payment status |
| `staff` | Staff records — role, salary, join date |
| `payments` | Payment transactions — method, amount |

---

## ✨ Features

- 📊 **Live Dashboard** — real-time stats for rooms, guests, bookings & revenue
- 🚪 **Room Management** — add, edit, delete rooms with status tracking
- 👤 **Guest Management** — register guests with ID proof and booking history
- 📋 **Booking System** — auto-calculates total amount and nights
- 👥 **Staff Management** — manage staff roles and salaries
- 🔍 **Search & Filter** — search and filter across all modules
- 🌍 **Cloud Ready** — supports Railway, Aiven, PlanetScale MySQL
- 📱 **Responsive** — works on desktop, tablet and mobile

---

## 🌍 Cloud Deployment

### Deploy Backend on Railway
1. Push project to GitHub
2. Go to Railway → New Project → Deploy from GitHub
3. Select your repo → choose `backend` folder
4. Add environment variables in Railway Variables tab
5. Railway gives you a public URL automatically

### Update Frontend API URL
After deploying backend, open `frontend/js/app.js` and update line 1:
```js
// Change this:
const API_BASE = 'http://localhost:3000/api';

// To your Railway URL:
const API_BASE = 'https://your-app.up.railway.app/api';
```

---

## 👨‍💻 Author

**Your Name**
- GitHub: [vivek-belwal](https://github.com/vivek-belwal)
- GitHub: [PoisonMunna](https://github.com/PoisonMunna)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
