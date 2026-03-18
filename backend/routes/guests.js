// ============================================================
//   HOTEL MANAGEMENT SYSTEM — GUESTS ROUTES
//   File: backend/routes/guests.js
// ============================================================

const express = require('express');
const router  = express.Router();

// ============================================================
// GET ALL GUESTS
// ============================================================
router.get('/', (req, res) => {
  const db  = req.app.locals.db;
  const sql = 'SELECT * FROM guests ORDER BY created_at DESC';

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// GET SINGLE GUEST BY ID
// ============================================================
router.get('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const sql = 'SELECT * FROM guests WHERE guest_id = ?';

  db.query(sql, [req.params.id], (err, results) => {
    if (err)             return res.status(500).json({ success: false, message: err.message });
    if (!results.length) return res.status(404).json({ success: false, message: 'Guest not found' });
    res.json({ success: true, data: results[0] });
  });
});

// ============================================================
// SEARCH GUESTS BY NAME OR EMAIL
// ============================================================
router.get('/search/:query', (req, res) => {
  const db    = req.app.locals.db;
  const term  = `%${req.params.query}%`;
  const sql   = `
    SELECT * FROM guests
    WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?
    ORDER BY first_name ASC
  `;

  db.query(sql, [term, term, term, term], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// GET BOOKING HISTORY OF A GUEST
// ============================================================
router.get('/:id/bookings', (req, res) => {
  const db  = req.app.locals.db;
  const sql = `
    SELECT b.*, r.room_number, r.type AS room_type, r.price_per_night
    FROM bookings b
    JOIN rooms r ON b.room_id = r.room_id
    WHERE b.guest_id = ?
    ORDER BY b.check_in DESC
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// CREATE NEW GUEST  (POST)
// ============================================================
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { first_name, last_name, email, phone, address, id_proof, nationality } = req.body;

  // Validation
  if (!first_name || !last_name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'first_name, last_name, email and phone are required' });
  }

  const sql = `
    INSERT INTO guests (first_name, last_name, email, phone, address, id_proof, nationality)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [first_name, last_name, email, phone, address || null, id_proof || null, nationality || null];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, message: `Email ${email} is already registered` });
      }
      return res.status(500).json({ success: false, message: err.message });
    }
    res.status(201).json({ success: true, message: 'Guest registered successfully', guest_id: result.insertId });
  });
});

// ============================================================
// UPDATE GUEST  (PUT)
// ============================================================
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { first_name, last_name, email, phone, address, id_proof, nationality } = req.body;

  if (!first_name || !last_name || !email || !phone) {
    return res.status(400).json({ success: false, message: 'first_name, last_name, email and phone are required' });
  }

  const sql = `
    UPDATE guests
    SET first_name = ?, last_name = ?, email = ?, phone = ?,
        address = ?, id_proof = ?, nationality = ?
    WHERE guest_id = ?
  `;
  const values = [first_name, last_name, email, phone, address || null, id_proof || null, nationality || null, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err)                  return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Guest not found' });
    res.json({ success: true, message: 'Guest updated successfully' });
  });
});

// ============================================================
// DELETE GUEST  (DELETE)
// ============================================================
router.delete('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const sql = 'DELETE FROM guests WHERE guest_id = ?';

  db.query(sql, [req.params.id], (err, result) => {
    if (err)                  return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Guest not found' });
    res.json({ success: true, message: 'Guest deleted successfully' });
  });
});

module.exports = router;
