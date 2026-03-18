// ============================================================
//   HOTEL MANAGEMENT SYSTEM — STAFF ROUTES
//   File: backend/routes/staff.js
// ============================================================

const express = require('express');
const router  = express.Router();

// GET ALL STAFF
router.get('/', (req, res) => {
  const db  = req.app.locals.db;
  db.query('SELECT * FROM staff ORDER BY name ASC', (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// GET SINGLE STAFF
router.get('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('SELECT * FROM staff WHERE staff_id = ?', [req.params.id], (err, results) => {
    if (err)             return res.status(500).json({ success: false, message: err.message });
    if (!results.length) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: results[0] });
  });
});

// CREATE STAFF
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { name, role, email, phone, salary, join_date, status } = req.body;

  if (!name || !role || !email || !phone || !salary || !join_date) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }

  const sql    = 'INSERT INTO staff (name, role, email, phone, salary, join_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)';
  const values = [name, role, email, phone, salary, join_date, status || 'Active'];

  db.query(sql, values, (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ success: false, message: 'Email already exists' });
      return res.status(500).json({ success: false, message: err.message });
    }
    res.status(201).json({ success: true, message: 'Staff added successfully', staff_id: result.insertId });
  });
});

// UPDATE STAFF
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { name, role, email, phone, salary, join_date, status } = req.body;

  const sql    = 'UPDATE staff SET name=?, role=?, email=?, phone=?, salary=?, join_date=?, status=? WHERE staff_id=?';
  const values = [name, role, email, phone, salary, join_date, status, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err)                  return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, message: 'Staff updated successfully' });
  });
});

// DELETE STAFF
router.delete('/:id', (req, res) => {
  const db = req.app.locals.db;
  db.query('DELETE FROM staff WHERE staff_id = ?', [req.params.id], (err, result) => {
    if (err)                  return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, message: 'Staff deleted successfully' });
  });
});

module.exports = router;
