// ============================================================
//   HOTEL MANAGEMENT SYSTEM — MAIN SERVER
//   File: backend/server.js
//   Cloud: Railway MySQL
// ============================================================

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express    = require('express');
const mysql      = require('mysql2');
const cors       = require('cors');

const roomRoutes    = require('./routes/rooms');
const guestRoutes   = require('./routes/guests');
const bookingRoutes = require('./routes/bookings');
const staffRoutes   = require('./routes/staff');

const app  = express();
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================
// DATABASE CONNECTION — RAILWAY MYSQL
// ============================================================

const dbConfig = {
  host           : process.env.DB_HOST     || 'localhost',
  user           : process.env.DB_USER     || 'root',
  password       : process.env.DB_PASSWORD || '',
  database       : process.env.DB_NAME     || 'railway',
  port           : parseInt(process.env.DB_PORT) || 3306,
  connectTimeout : 60000,
};

console.log('🚂 Connecting to Railway MySQL...');
console.log('   Host :', dbConfig.host);
console.log('   Port :', dbConfig.port);
console.log('   DB   :', dbConfig.database);
console.log('   User :', dbConfig.user);
console.log('   Pass :', dbConfig.password ? '***SET***' : '***EMPTY — CHECK .env***');

const db = mysql.createConnection(dbConfig);

// Make db accessible in all routes
app.locals.db = db;

// Auto-reconnect function
function connectWithRetry() {
  db.connect((err) => {
    if (err) {
      console.error('❌ Railway DB connection failed:', err.message);
      console.error('👉 Retrying in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
      return;
    }
    console.log('✅ Connected to Railway MySQL:', dbConfig.database, 'on', dbConfig.host);
  });
}

connectWithRetry();

// Handle unexpected disconnects
db.on('error', (err) => {
  console.error('⚠️  MySQL connection lost:', err.message);
  if (err.code === 'PROTOCOL_CONNECTION_LOST' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT') {
    console.log('🔄 Reconnecting to Railway MySQL...');
    connectWithRetry();
  }
});

// ============================================================
// ROUTES
// ============================================================
app.use('/api/rooms',    roomRoutes);
app.use('/api/guests',   guestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/staff',    staffRoutes);

// ============================================================
// DASHBOARD STATS ROUTE
// ============================================================
app.get('/api/dashboard', (req, res) => {
  const stats = {};
  const queries = [
    { key: 'totalRooms',     sql: 'SELECT COUNT(*) AS count FROM rooms' },
    { key: 'availableRooms', sql: "SELECT COUNT(*) AS count FROM rooms WHERE status = 'Available'" },
    { key: 'bookedRooms',    sql: "SELECT COUNT(*) AS count FROM rooms WHERE status = 'Booked'" },
    { key: 'totalGuests',    sql: 'SELECT COUNT(*) AS count FROM guests' },
    { key: 'totalBookings',  sql: 'SELECT COUNT(*) AS count FROM bookings' },
    { key: 'activeBookings', sql: "SELECT COUNT(*) AS count FROM bookings WHERE booking_status = 'Checked-In'" },
    { key: 'totalStaff',     sql: 'SELECT COUNT(*) AS count FROM staff' },
    { key: 'totalRevenue',   sql: 'SELECT IFNULL(SUM(amount), 0) AS count FROM payments' },
  ];

  let completed = 0;
  queries.forEach(({ key, sql }) => {
    db.query(sql, (err, results) => {
      stats[key] = err ? 0 : results[0].count;
      completed++;
      if (completed === queries.length) {
        res.json({ success: true, data: stats });
      }
    });
  });
});

// ============================================================
// PAYMENTS ROUTE
// ============================================================
app.get('/api/payments', (req, res) => {
  const sql = `
    SELECT p.*, b.check_in, b.check_out,
           CONCAT(g.first_name,' ',g.last_name) AS guest_name
    FROM payments p
    JOIN bookings b ON p.booking_id = b.booking_id
    JOIN guests   g ON b.guest_id   = g.guest_id
    ORDER BY p.payment_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// ROOT ROUTE
// ============================================================
app.get('/', (req, res) => {
  res.json({
    message  : '🏨 Hotel Management System API',
    version  : '1.0.0',
    database : 'Railway MySQL — ' + dbConfig.host,
    endpoints: {
      dashboard : 'GET  /api/dashboard',
      rooms     : 'GET | POST | PUT | DELETE /api/rooms',
      guests    : 'GET | POST | PUT | DELETE /api/guests',
      bookings  : 'GET | POST | PUT | DELETE /api/bookings',
      staff     : 'GET | POST | PUT | DELETE /api/staff',
      payments  : 'GET /api/payments',
    }
  });
});

// ============================================================
// 404 HANDLER
// ============================================================
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ============================================================
// ERROR HANDLER
// ============================================================
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ============================================================
// START SERVER
// ============================================================
app.listen(PORT, () => {
  console.log('🚀 Server running at http://localhost:' + PORT);
  console.log('📋 API Docs at  http://localhost:' + PORT + '/');
});