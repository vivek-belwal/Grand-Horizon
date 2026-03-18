// ============================================================
//   HOTEL MANAGEMENT SYSTEM — FRONTEND JAVASCRIPT
//   File: frontend/js/app.js
//   Handles: API calls, CRUD, Modals, Toast, Pages
// ============================================================

const API_BASE = 'http://localhost:3000/api';

// ============================================================
// UTILITIES
// ============================================================

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
}

function formatCurrency(amount) {
  return '₹' + Number(amount || 0).toLocaleString('en-IN');
}

// ── Server Status Indicator ──
function setServerStatus(online) {
  const dot  = document.getElementById('statusDot');
  const text = document.getElementById('statusText');
  if (!dot || !text) return;
  if (online) {
    dot.className  = 'status-dot online';
    text.textContent = 'Server Online';
  } else {
    dot.className  = 'status-dot offline';
    text.textContent = 'Server Offline';
  }
}

// ── Toast Notifications ──
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ── Modal Helpers ──
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Close modal when clicking overlay
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// ============================================================
// API HELPER
// ============================================================
async function apiCall(method, endpoint, body = null) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res  = await fetch(`${API_BASE}${endpoint}`, opts);
    const json = await res.json();
    setServerStatus(true);
    return json;
  } catch (err) {
    setServerStatus(false);
    return { success: false, message: 'Cannot connect to server. Is it running?' };
  }
}

// ============================================================
// ── ROOMS PAGE ──
// ============================================================
let allRooms = [];

async function initRoomsPage() {
  await loadRooms();
  setupRoomForm();
}

async function loadRooms(filterStatus = 'All') {
  const json = await apiCall('GET', '/rooms');
  if (!json.success) {
    showToast(json.message, 'error');
    return;
  }
  allRooms = json.data;
  renderRoomsTable(filterStatus === 'All' ? allRooms : allRooms.filter(r => r.status === filterStatus));
}

function renderRoomsTable(rooms) {
  const tbody = document.getElementById('roomsTableBody');
  if (!tbody) return;

  if (!rooms.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-cell">No rooms found</td></tr>`;
    return;
  }

  tbody.innerHTML = rooms.map(r => `
    <tr>
      <td><strong>${r.room_number}</strong></td>
      <td>${r.type}</td>
      <td>${r.floor}</td>
      <td>${r.max_occupancy}</td>
      <td>${formatCurrency(r.price_per_night)}</td>
      <td>${r.description || '—'}</td>
      <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editRoom(${r.room_id})">✏️ Edit</button>
        <button class="btn btn-danger  btn-sm" onclick="deleteRoom(${r.room_id}, '${r.room_number}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function setupRoomForm() {
  const form = document.getElementById('roomForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('roomId').value;
    const data = {
      room_number    : document.getElementById('roomNumber').value,
      type           : document.getElementById('roomType').value,
      price_per_night: document.getElementById('roomPrice').value,
      status         : document.getElementById('roomStatus').value,
      floor          : document.getElementById('roomFloor').value,
      max_occupancy  : document.getElementById('roomOccupancy').value,
      description    : document.getElementById('roomDesc').value,
    };

    const method   = id ? 'PUT' : 'POST';
    const endpoint = id ? `/rooms/${id}` : '/rooms';
    const json     = await apiCall(method, endpoint, data);

    if (json.success) {
      showToast(json.message, 'success');
      closeModal('roomModal');
      form.reset();
      document.getElementById('roomId').value = '';
      loadRooms();
    } else {
      showToast(json.message, 'error');
    }
  });
}

function openAddRoomModal() {
  document.getElementById('roomModalTitle').textContent = 'Add New Room';
  document.getElementById('roomForm').reset();
  document.getElementById('roomId').value = '';
  openModal('roomModal');
}

async function editRoom(id) {
  const json = await apiCall('GET', `/rooms/${id}`);
  if (!json.success) { showToast(json.message, 'error'); return; }
  const r = json.data;
  document.getElementById('roomModalTitle').textContent = 'Edit Room';
  document.getElementById('roomId').value          = r.room_id;
  document.getElementById('roomNumber').value      = r.room_number;
  document.getElementById('roomType').value        = r.type;
  document.getElementById('roomPrice').value       = r.price_per_night;
  document.getElementById('roomStatus').value      = r.status;
  document.getElementById('roomFloor').value       = r.floor;
  document.getElementById('roomOccupancy').value   = r.max_occupancy;
  document.getElementById('roomDesc').value        = r.description || '';
  openModal('roomModal');
}

async function deleteRoom(id, number) {
  if (!confirm(`Delete Room ${number}? This cannot be undone.`)) return;
  const json = await apiCall('DELETE', `/rooms/${id}`);
  if (json.success) { showToast(json.message, 'success'); loadRooms(); }
  else showToast(json.message, 'error');
}

function filterRooms() {
  const status = document.getElementById('roomFilter').value;
  renderRoomsTable(status === 'All' ? allRooms : allRooms.filter(r => r.status === status));
}

function searchRooms() {
  const q = document.getElementById('roomSearch').value.toLowerCase();
  const filtered = allRooms.filter(r =>
    r.room_number.toLowerCase().includes(q) ||
    r.type.toLowerCase().includes(q) ||
    (r.description || '').toLowerCase().includes(q)
  );
  renderRoomsTable(filtered);
}

// ============================================================
// ── GUESTS PAGE ──
// ============================================================
let allGuests = [];

async function initGuestsPage() {
  await loadGuests();
  setupGuestForm();
}

async function loadGuests() {
  const json = await apiCall('GET', '/guests');
  if (!json.success) { showToast(json.message, 'error'); return; }
  allGuests = json.data;
  renderGuestsTable(allGuests);
}

function renderGuestsTable(guests) {
  const tbody = document.getElementById('guestsTableBody');
  if (!tbody) return;

  if (!guests.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-cell">No guests found</td></tr>`;
    return;
  }

  tbody.innerHTML = guests.map(g => `
    <tr>
      <td><strong>#${g.guest_id}</strong></td>
      <td>${g.first_name} ${g.last_name}</td>
      <td>${g.email}</td>
      <td>${g.phone}</td>
      <td>${g.nationality || '—'}</td>
      <td>${g.id_proof || '—'}</td>
      <td>${formatDate(g.created_at)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editGuest(${g.guest_id})">✏️ Edit</button>
        <button class="btn btn-danger  btn-sm" onclick="deleteGuest(${g.guest_id}, '${g.first_name}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function setupGuestForm() {
  const form = document.getElementById('guestForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('guestId').value;
    const data = {
      first_name  : document.getElementById('guestFirstName').value,
      last_name   : document.getElementById('guestLastName').value,
      email       : document.getElementById('guestEmail').value,
      phone       : document.getElementById('guestPhone').value,
      address     : document.getElementById('guestAddress').value,
      id_proof    : document.getElementById('guestIdProof').value,
      nationality : document.getElementById('guestNationality').value,
    };

    const method   = id ? 'PUT' : 'POST';
    const endpoint = id ? `/guests/${id}` : '/guests';
    const json     = await apiCall(method, endpoint, data);

    if (json.success) {
      showToast(json.message, 'success');
      closeModal('guestModal');
      form.reset();
      document.getElementById('guestId').value = '';
      loadGuests();
    } else {
      showToast(json.message, 'error');
    }
  });
}

function openAddGuestModal() {
  document.getElementById('guestModalTitle').textContent = 'Register New Guest';
  document.getElementById('guestForm').reset();
  document.getElementById('guestId').value = '';
  openModal('guestModal');
}

async function editGuest(id) {
  const json = await apiCall('GET', `/guests/${id}`);
  if (!json.success) { showToast(json.message, 'error'); return; }
  const g = json.data;
  document.getElementById('guestModalTitle').textContent = 'Edit Guest';
  document.getElementById('guestId').value          = g.guest_id;
  document.getElementById('guestFirstName').value   = g.first_name;
  document.getElementById('guestLastName').value    = g.last_name;
  document.getElementById('guestEmail').value       = g.email;
  document.getElementById('guestPhone').value       = g.phone;
  document.getElementById('guestAddress').value     = g.address || '';
  document.getElementById('guestIdProof').value     = g.id_proof || '';
  document.getElementById('guestNationality').value = g.nationality || '';
  openModal('guestModal');
}

async function deleteGuest(id, name) {
  if (!confirm(`Delete guest ${name}? All bookings will also be removed.`)) return;
  const json = await apiCall('DELETE', `/guests/${id}`);
  if (json.success) { showToast(json.message, 'success'); loadGuests(); }
  else showToast(json.message, 'error');
}

function searchGuests() {
  const q = document.getElementById('guestSearch').value.toLowerCase();
  const filtered = allGuests.filter(g =>
    (g.first_name + ' ' + g.last_name).toLowerCase().includes(q) ||
    g.email.toLowerCase().includes(q) ||
    g.phone.includes(q)
  );
  renderGuestsTable(filtered);
}

// ============================================================
// ── BOOKINGS PAGE ──
// ============================================================
let allBookings = [];

async function initBookingsPage() {
  await loadBookings();
  await populateBookingDropdowns();
  setupBookingForm();
}

async function loadBookings(filterStatus = 'All') {
  const json = await apiCall('GET', '/bookings');
  if (!json.success) { showToast(json.message, 'error'); return; }
  allBookings = json.data;
  const filtered = filterStatus === 'All' ? allBookings
    : allBookings.filter(b => b.booking_status === filterStatus);
  renderBookingsTable(filtered);
}

function renderBookingsTable(bookings) {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  if (!bookings.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="loading-cell">No bookings found</td></tr>`;
    return;
  }

  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td><strong>#${b.booking_id}</strong></td>
      <td>${b.guest_name}</td>
      <td>${b.room_number} <small>(${b.room_type})</small></td>
      <td>${formatDate(b.check_in)}</td>
      <td>${formatDate(b.check_out)}</td>
      <td>${b.nights} night(s)</td>
      <td><span class="badge badge-${b.booking_status.toLowerCase().replace('-','')}">${b.booking_status}</span></td>
      <td><span class="badge badge-${b.payment_status.toLowerCase()}">${b.payment_status}</span></td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="editBooking(${b.booking_id})">✏️</button>
        <button class="btn btn-danger  btn-sm" onclick="deleteBooking(${b.booking_id})">🗑️</button>
      </td>
    </tr>
  `).join('');
}

async function populateBookingDropdowns() {
  const [guestsJson, roomsJson] = await Promise.all([
    apiCall('GET', '/guests'),
    apiCall('GET', '/rooms')
  ]);

  const guestSel = document.getElementById('bookingGuestId');
  const roomSel  = document.getElementById('bookingRoomId');
  if (!guestSel || !roomSel) return;

  if (guestsJson.success) {
    guestSel.innerHTML = '<option value="">— Select Guest —</option>' +
      guestsJson.data.map(g => `<option value="${g.guest_id}">${g.first_name} ${g.last_name} (${g.phone})</option>`).join('');
  }

  if (roomsJson.success) {
    roomSel.innerHTML = '<option value="">— Select Room —</option>' +
      roomsJson.data.map(r => `<option value="${r.room_id}">${r.room_number} — ${r.type} (₹${r.price_per_night}/night) [${r.status}]</option>`).join('');
  }
}

function setupBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('bookingId').value;
    const data = {
      guest_id        : document.getElementById('bookingGuestId').value,
      room_id         : document.getElementById('bookingRoomId').value,
      check_in        : document.getElementById('bookingCheckIn').value,
      check_out       : document.getElementById('bookingCheckOut').value,
      payment_status  : document.getElementById('bookingPayStatus').value,
      booking_status  : document.getElementById('bookingStatus').value,
      special_request : document.getElementById('bookingRequest').value,
    };

    const method   = id ? 'PUT' : 'POST';
    const endpoint = id ? `/bookings/${id}` : '/bookings';
    const json     = await apiCall(method, endpoint, data);

    if (json.success) {
      let msg = json.message;
      if (json.total_amount) msg += ` | Total: ₹${Number(json.total_amount).toLocaleString('en-IN')} (${json.nights} nights)`;
      showToast(msg, 'success');
      closeModal('bookingModal');
      form.reset();
      document.getElementById('bookingId').value = '';
      loadBookings();
    } else {
      showToast(json.message, 'error');
    }
  });
}

function openAddBookingModal() {
  document.getElementById('bookingModalTitle').textContent = 'New Booking';
  document.getElementById('bookingForm').reset();
  document.getElementById('bookingId').value = '';
  openModal('bookingModal');
}

async function editBooking(id) {
  const json = await apiCall('GET', `/bookings/${id}`);
  if (!json.success) { showToast(json.message, 'error'); return; }
  const b = json.data;
  document.getElementById('bookingModalTitle').textContent = 'Edit Booking';
  document.getElementById('bookingId').value         = b.booking_id;
  document.getElementById('bookingGuestId').value    = b.guest_id;
  document.getElementById('bookingRoomId').value     = b.room_id;
  document.getElementById('bookingCheckIn').value    = b.check_in?.split('T')[0];
  document.getElementById('bookingCheckOut').value   = b.check_out?.split('T')[0];
  document.getElementById('bookingPayStatus').value  = b.payment_status;
  document.getElementById('bookingStatus').value     = b.booking_status;
  document.getElementById('bookingRequest').value    = b.special_request || '';
  openModal('bookingModal');
}

async function deleteBooking(id) {
  if (!confirm(`Cancel & delete Booking #${id}? Room will be marked Available.`)) return;
  const json = await apiCall('DELETE', `/bookings/${id}`);
  if (json.success) { showToast(json.message, 'success'); loadBookings(); }
  else showToast(json.message, 'error');
}

function filterBookings() {
  const status = document.getElementById('bookingFilter').value;
  const filtered = status === 'All' ? allBookings
    : allBookings.filter(b => b.booking_status === status);
  renderBookingsTable(filtered);
}

function searchBookings() {
  const q = document.getElementById('bookingSearch').value.toLowerCase();
  const filtered = allBookings.filter(b =>
    b.guest_name.toLowerCase().includes(q) ||
    b.room_number.toLowerCase().includes(q) ||
    String(b.booking_id).includes(q)
  );
  renderBookingsTable(filtered);
}

// ============================================================
// ── STAFF PAGE ──
// ============================================================
let allStaff = [];

async function initStaffPage() {
  await loadStaff();
  setupStaffForm();
}

async function loadStaff() {
  const json = await apiCall('GET', '/staff');
  if (!json.success) { showToast(json.message, 'error'); return; }
  allStaff = json.data;
  renderStaffTable(allStaff);
}

function renderStaffTable(staff) {
  const tbody = document.getElementById('staffTableBody');
  if (!tbody) return;

  if (!staff.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="loading-cell">No staff found</td></tr>`;
    return;
  }

  tbody.innerHTML = staff.map(s => `
    <tr>
      <td><strong>#${s.staff_id}</strong></td>
      <td>${s.name}</td>
      <td>${s.role}</td>
      <td>${s.email}</td>
      <td>${s.phone}</td>
      <td>${formatCurrency(s.salary)}</td>
      <td>${formatDate(s.join_date)}</td>
      <td>
        <span class="badge badge-${s.status.toLowerCase()}">${s.status}</span>
        <button class="btn btn-outline btn-sm" onclick="editStaff(${s.staff_id})">✏️</button>
        <button class="btn btn-danger  btn-sm" onclick="deleteStaff(${s.staff_id}, '${s.name}')">🗑️</button>
      </td>
    </tr>
  `).join('');
}

function setupStaffForm() {
  const form = document.getElementById('staffForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id   = document.getElementById('staffId').value;
    const data = {
      name     : document.getElementById('staffName').value,
      role     : document.getElementById('staffRole').value,
      email    : document.getElementById('staffEmail').value,
      phone    : document.getElementById('staffPhone').value,
      salary   : document.getElementById('staffSalary').value,
      join_date: document.getElementById('staffJoinDate').value,
      status   : document.getElementById('staffStatus').value,
    };

    const method   = id ? 'PUT' : 'POST';
    const endpoint = id ? `/staff/${id}` : '/staff';
    const json     = await apiCall(method, endpoint, data);

    if (json.success) {
      showToast(json.message, 'success');
      closeModal('staffModal');
      form.reset();
      document.getElementById('staffId').value = '';
      loadStaff();
    } else {
      showToast(json.message, 'error');
    }
  });
}

function openAddStaffModal() {
  document.getElementById('staffModalTitle').textContent = 'Add Staff Member';
  document.getElementById('staffForm').reset();
  document.getElementById('staffId').value = '';
  openModal('staffModal');
}

async function editStaff(id) {
  const json = await apiCall('GET', `/staff/${id}`);
  if (!json.success) { showToast(json.message, 'error'); return; }
  const s = json.data;
  document.getElementById('staffModalTitle').textContent = 'Edit Staff';
  document.getElementById('staffId').value        = s.staff_id;
  document.getElementById('staffName').value      = s.name;
  document.getElementById('staffRole').value      = s.role;
  document.getElementById('staffEmail').value     = s.email;
  document.getElementById('staffPhone').value     = s.phone;
  document.getElementById('staffSalary').value    = s.salary;
  document.getElementById('staffJoinDate').value  = s.join_date?.split('T')[0];
  document.getElementById('staffStatus').value    = s.status;
  openModal('staffModal');
}

async function deleteStaff(id, name) {
  if (!confirm(`Remove staff member ${name}?`)) return;
  const json = await apiCall('DELETE', `/staff/${id}`);
  if (json.success) { showToast(json.message, 'success'); loadStaff(); }
  else showToast(json.message, 'error');
}

function searchStaff() {
  const q = document.getElementById('staffSearch').value.toLowerCase();
  const filtered = allStaff.filter(s =>
    s.name.toLowerCase().includes(q) ||
    s.role.toLowerCase().includes(q) ||
    s.email.toLowerCase().includes(q)
  );
  renderStaffTable(filtered);
}
