// ============================================================
//   HOTEL MANAGEMENT SYSTEM — BOOKINGS ROUTES
//   File: backend/routes/bookings.js
// ============================================================

const express = require('express');
const router  = express.Router();

// ============================================================
// GET ALL BOOKINGS (with guest & room details)
// ============================================================
router.get('/', (req, res) => {
  const db  = req.app.locals.db;
  const sql = `
    SELECT
      b.*,
      CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
      g.email AS guest_email,
      g.phone AS guest_phone,
      r.room_number,
      r.type  AS room_type,
      r.price_per_night,
      DATEDIFF(b.check_out, b.check_in) AS nights
    FROM bookings b
    JOIN guests g ON b.guest_id = g.guest_id
    JOIN rooms  r ON b.room_id  = r.room_id
    ORDER BY b.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// GET SINGLE BOOKING BY ID
// ============================================================
router.get('/:id', (req, res) => {
  const db  = req.app.locals.db;
  const sql = `
    SELECT
      b.*,
      CONCAT(g.first_name, ' ', g.last_name) AS guest_name,
      g.email AS guest_email, g.phone AS guest_phone,
      r.room_number, r.type AS room_type, r.price_per_night,
      DATEDIFF(b.check_out, b.check_in) AS nights
    FROM bookings b
    JOIN guests g ON b.guest_id = g.guest_id
    JOIN rooms  r ON b.room_id  = r.room_id
    WHERE b.booking_id = ?
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err)             return res.status(500).json({ success: false, message: err.message });
    if (!results.length) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: results[0] });
  });
});

// ============================================================
// GET BOOKINGS BY STATUS
// ============================================================
router.get('/filter/:status', (req, res) => {
  const db     = req.app.locals.db;
  const valid  = ['Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'];
  const status = req.params.status;

  if (!valid.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid booking status' });
  }

  const sql = `
    SELECT b.*,
      CONCAT(g.first_name,' ',g.last_name) AS guest_name,
      r.room_number, r.type AS room_type
    FROM bookings b
    JOIN guests g ON b.guest_id = g.guest_id
    JOIN rooms  r ON b.room_id  = r.room_id
    WHERE b.booking_status = ?
    ORDER BY b.check_in ASC
  `;

  db.query(sql, [status], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json({ success: true, data: results });
  });
});

// ============================================================
// CREATE NEW BOOKING  (POST)
// ============================================================
router.post('/', (req, res) => {
  const db = req.app.locals.db;
  const { guest_id, room_id, check_in, check_out, payment_status, booking_status, special_request } = req.body;

  if (!guest_id || !room_id || !check_in || !check_out) {
    return res.status(400).json({ success: false, message: 'guest_id, room_id, check_in and check_out are required' });
  }

  if (new Date(check_out) <= new Date(check_in)) {
    return res.status(400).json({ success: false, message: 'check_out must be after check_in' });
  }

  // Calculate total amount based on room price and number of nights
  const priceSQL = 'SELECT price_per_night FROM rooms WHERE room_id = ?';
  db.query(priceSQL, [room_id], (err, roomResult) => {
    if (err)                  return res.status(500).json({ success: false, message: err.message });
    if (!roomResult.length)   return res.status(404).json({ success: false, message: 'Room not found' });

    const price_per_night = roomResult[0].price_per_night;
    const nights          = Math.ceil((new Date(check_out) - new Date(check_in)) / (1000 * 60 * 60 * 24));
    const total_amount    = price_per_night * nights;

    const sql = `
      INSERT INTO bookings (guest_id, room_id, check_in, check_out, total_amount, payment_status, booking_status, special_request)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      guest_id, room_id, check_in, check_out,
      total_amount,
      payment_status  || 'Pending',
      booking_status  || 'Confirmed',
      special_request || null
    ];

    db.query(sql, values, (err2, result) => {
      if (err2) return res.status(500).json({ success: false, message: err2.message });

      // Mark room as Booked
      db.query("UPDATE rooms SET status = 'Booked' WHERE room_id = ?", [room_id]);

      res.status(201).json({
        success    : true,
        message    : 'Booking created successfully',
        booking_id : result.insertId,
        total_amount,
        nights
      });
    });
  });
});

// ============================================================
// UPDATE BOOKING  (PUT)
// ============================================================
router.put('/:id', (req, res) => {
  const db = req.app.locals.db;
  const { guest_id, room_id, check_in, check_out, total_amount, payment_status, booking_status, special_request } = req.body;

  const sql = `
    UPDATE bookings
    SET guest_id = ?, room_id = ?, check_in = ?, check_out = ?,
        total_amount = ?, payment_status = ?, booking_status = ?, special_request = ?
    WHERE booking_id = ?
  `;
  const values = [guest_id, room_id, check_in, check_out, total_amount, payment_status, booking_status, special_request || null, req.params.id];

  db.query(sql, values, (err, result) => {
    if (err)                  return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, message: 'Booking updated successfully' });
  });
});

// ============================================================
// UPDATE BOOKING STATUS ONLY  (PATCH)
// ============================================================
router.patch('/:id/status', (req, res) => {
  const db     = req.app.locals.db;
  const { booking_status, payment_status } = req.body;

  const sql = `
    UPDATE bookings
    SET booking_status = COALESCE(?, booking_status),
        payment_status = COALESCE(?, payment_status)
    WHERE booking_id = ?
  `;

  db.query(sql, [booking_status || null, payment_status || null, req.params.id], (err, result) => {
    if (err)                  return res.status(500).json({ success: false, message: err.message });
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Booking not found' });

    // If checked out, mark room as Available
    if (booking_status === 'Checked-Out' || booking_status === 'Cancelled') {
      const roomSQL = `
        UPDATE rooms r
        JOIN bookings b ON r.room_id = b.room_id
        SET r.status = 'Available'
        WHERE b.booking_id = ?
      `;
      db.query(roomSQL, [req.params.id]);
    }

    res.json({ success: true, message: 'Booking status updated successfully' });
  });
});

// ============================================================
// DELETE BOOKING  (DELETE)
// ============================================================
router.delete('/:id', (req, res) => {
  const db  = req.app.locals.db;

  // First get the room_id so we can free it
  db.query('SELECT room_id FROM bookings WHERE booking_id = ?', [req.params.id], (err, rows) => {
    if (err)          return res.status(500).json({ success: false, message: err.message });
    if (!rows.length) return res.status(404).json({ success: false, message: 'Booking not found' });

    const room_id = rows[0].room_id;

    db.query('DELETE FROM bookings WHERE booking_id = ?', [req.params.id], (err2, result) => {
      if (err2)                  return res.status(500).json({ success: false, message: err2.message });
      if (!result.affectedRows)  return res.status(404).json({ success: false, message: 'Booking not found' });

      // Free the room
      db.query("UPDATE rooms SET status = 'Available' WHERE room_id = ?", [room_id]);

      res.json({ success: true, message: 'Booking deleted and room marked as Available' });
    });
  });
});

// ============================================================
// STAFF ROUTES (included here for completeness)
// ============================================================
module.exports = router;
