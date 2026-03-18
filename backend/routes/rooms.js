// ============================================================
//   HOTEL MANAGEMENT SYSTEM — ROOMS ROUTES
//   File: backend/routes/rooms.js
// ============================================================

const express = require('express');
const router  = express.Router();

// ============================================================
// GET ALL ROOMS
// ============================================================
router.get('/', (req, res) => {
  const db  = req.app.locals.db;
  const sql = 'SELECT * FROM rooms ORDER BY room_number ASC';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// GET SINGLE ROOM BY ID
// ============================================================
router.get('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const sql = 'SELECT * FROM rooms WHERE room_id = ?';

  db.query(sql, [req.params.id], (err, results) => {
    if (err)               return res.status(500).json({ success: false, message: err.message });
    if (!results.length)   return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, data: results[0] });
  });
});

// ============================================================
// GET AVAILABLE ROOMS ONLY
// ============================================================
router.get('/status/available', (req, res) => {
  const db  = req.app.locals.db;
  const sql = "SELECT * FROM rooms WHERE status = 'Available' ORDER BY room_number ASC";

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// CREATE NEW ROOM  (POST)
// ============================================================
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { room_number, type, price_per_night, status, floor, max_occupancy, description } = req.body;

  // Validation
  if (!room_number || !type || !price_per_night || !floor || !max_occupancy) {
    return res.status(400).json({ success: false, message: 'Please provide all required fields' });
  }

  const sql = `
    INSERT INTO rooms (room_number, type, price_per_night, status, floor, max_occupancy, description)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [room_number, type, price_per_night, status || 'Available', floor, max_occupancy, description || null];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: `Room number ${room_number} already exists` });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    res.status(201).json({ success: true, message: 'Room created successfully', room_id: result.insertId });
  });
});

// ============================================================
// UPDATE ROOM  (PUT)
// ============================================================
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { room_number, type, price_per_night, status, floor, max_occupancy, description } = req.body;

  const sql = `
    UPDATE rooms
    SET room_number = ?, type = ?, price_per_night = ?, status = ?,
        floor = ?, max_occupancy = ?, description = ?
    WHERE room_id = ?
  `;
  const values = [room_number, type, price_per_night, status, floor, max_occupancy, description, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err)               return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: 'Room updated successfully' });
  });
});

// ============================================================
// UPDATE ROOM STATUS ONLY  (PATCH)
// ============================================================
router.patch('/:id/status', (req, res) => {
  const db  = req.app.locals.db;
  const { status } = req.body;

  if (!['Available', 'Booked', 'Maintenance'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const sql = 'UPDATE rooms SET status = ? WHERE room_id = ?';

  db.query(sql, [status, req.params.id], (err, result) => {
    if (err)               return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: `Room status updated to ${status}` });
  });
});

// ============================================================
// DELETE ROOM  (DELETE)
// ============================================================
router.delete('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const sql = 'DELETE FROM rooms WHERE room_id = ?';

  db.query(sql, [req.params.id], (err, result) => {
    if (err)               return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Room not found' });
    res.json({ success: true, message: 'Room deleted successfully' });
  });
});

module.exports = router;
