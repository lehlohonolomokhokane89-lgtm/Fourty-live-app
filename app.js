const SUPABASE_URL = 'https://gagummjmpomxguuueenl.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZ3VtbWptcG9teGd1dXVlZW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NjUyOTEsImV4cCI6MjEwNjQ0MTI5MX0.AVNu99xppTWkyoRSrb26X5dZW-p-wl_VEi7faBaYUQ8';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const routes = [
  'Ngwathe-JHB', 'Ngwathe-Parys', 'Parys-Sasolburg', 'Sasolburg-Vanderbijlpark',
  'Vanderbijlpark-JHB', 'Ngwathe-Vereeniging', 'Parys-JHB', 'Kroonstad-JHB',
  'Heilbron-JHB', 'Sasolburg-JHB', 'Vredefort-Parys', 'Tumahole-Parys',
  'Soweto-JHB', 'Soweto-Pretoria', 'JHB-Durban', 'JHB-Cape Town', 'JHB-Polokwane',
  'JHB-Bloemfontein', 'Ngwathe-Bloemfontein', 'Parys-Bloemfontein'
];

let map;
let routeFilterTimeout;

function showPage(page) {
  document.getElementById('feedPage').style.display = page === 'feed' ? 'block' : 'none';
  document.getElementById('mapPage').style.display = page === 'map' ? 'block' : 'none';
  document.getElementById('chatPage').style.display = page === 'chat' ? 'block' : 'none';
  document.getElementById('verifyPage').style.display = page === 'verify' ? 'block' : 'none';

  if (page === 'map') {
    setTimeout(initMap, 300);
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 2600);
}

function fbLogin() {
  const name = document.getElementById('fbName').value || 'Youth';
  const phone = document.getElementById('fbPhone').value || '0655846692';
  const bio = document.getElementById('fbBio').value || 'Taxi user SA';

  if (phone.length < 10) {
    showToast('Phone number must be 10 digits', 'error');
    return;
  }

  const profile = { name, phone, bio };
  localStorage.setItem('fourforty_profile', JSON.stringify(profile));

  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appPage').style.display = 'block';

  document.getElementById('profileCard').innerHTML = `
    <div><strong>${name}</strong> ${phone}</div>
    <span class="badge-gold">USER</span>
    <small>${bio}</small>
  `;

  loadRoutes();
  loadTaxis();
  showToast('Profile saved successfully', 'success');

  try {
    supabase.from('users').upsert({ phone, name, bio }).then(() => {});
  } catch (error) {
    console.warn('Supabase save failed', error);
  }
}

function inviteFacebook() {
  const link = 'https://fourforty-zeta.vercel.app';
  const target = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`;
  window.open(target, '_blank');
}

function inviteWhatsApp() {
  const link = 'https://fourforty-zeta.vercel.app';
  const text = `Join 4FORTY LIVE - Taxi Booking SA - ${link} - Routes Ngwathe-JHB-Parys`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function loadRoutes() {
  const select = document.getElementById('routeSelect');
  const routeFilter = document.getElementById('routeFilter');
  select.innerHTML = '';

  routes.forEach((route) => {
    const option = document.createElement('option');
    option.value = route;
    option.textContent = route;
    select.appendChild(option);
  });

  routeFilter.addEventListener('input', () => {
    const value = routeFilter.value.trim().toLowerCase();
    clearTimeout(routeFilterTimeout);
    routeFilterTimeout = setTimeout(() => {
      const matchingRoutes = routes.filter((route) => route.toLowerCase().includes(value));
      select.innerHTML = '';
      if (!matchingRoutes.length) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No routes found';
        select.appendChild(option);
        return;
      }

      matchingRoutes.forEach((route) => {
        const option = document.createElement('option');
        option.value = route;
        option.textContent = route;
        select.appendChild(option);
      });
    }, 150);
  });
}

async function bookRoute() {
  const route = document.getElementById('routeSelect').value;
  const profile = getProfile();

  if (!route) {
    showToast('Select a route to book', 'warning');
    return;
  }

  const bookingMessage = `BOOK%20${encodeURIComponent(route)}%20${encodeURIComponent(profile.phone || '')}`;
  window.open(`https://wa.me/27796230493?text=${bookingMessage}`, '_blank');
  showToast(`Booking request sent for ${route}`, 'success');

  try {
    await supabase.from('bookings').insert({
      passenger_name: profile.name || 'Guest',
      phone: profile.phone || '',
      route,
    });
  } catch (error) {
    console.warn('Booking save failed', error);
  }
}

async function loadTaxis() {
  try {
    const { data, error } = await supabase.from('taxis').select('*').eq('is_live', true);

    if (error) {
      throw error;
    }

    const taxis = data || [];
    const list = document.getElementById('taxiList');

    if (!taxis.length) {
      list.innerHTML = '<h3>GOLD LIVE Taxis</h3><p>No GOLD taxis yet. GO LIVE!</p>';
      return;
    }

    list.innerHTML = `
      <h3>GOLD LIVE Taxis</h3>
      <div class="taxi-grid">
        ${taxis
          .map((taxi) => {
            const rating = getTaxiRating(taxi.plate);
            return `
              <div class="taxi-card">
                <div><strong>🚕 ${taxi.plate}</strong> - ${taxi.route}</div>
                <div class="taxi-meta">
                  <span class="badge-gold">${taxi.is_verified ? 'VERIFIED GOLD' : 'LIVE'}</span>
                  <span>${taxi.driver_phone || 'Phone hidden'}</span>
                </div>
                <div class="rating-row">
                  <span>Driver Rating:</span>
                  <div class="stars" data-plate="${taxi.plate}">
                    ${Array.from({ length: 5 }, (_, index) => `
                      <button
                        class="star ${index < rating ? 'active' : ''}"
                        data-plate="${taxi.plate}"
                        data-value="${index + 1}"
                        type="button"
                        aria-label="Rate ${index + 1} star"
                      >★</button>
                    `).join('')}
                  </div>
                </div>
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    document.querySelectorAll('.star').forEach((star) => {
      star.addEventListener('click', () => {
        const plate = star.dataset.plate;
        const value = Number(star.dataset.value);
        setTaxiRating(plate, value);
        showToast(`Rated ${plate} ${value}/5`, 'success');
        loadTaxis();
      });
    });
  } catch (error) {
    console.warn('Load taxis failed:', error);
    document.getElementById('taxiList').innerHTML = 'Offline - No data';
  }
}

function getTaxiRating(plate) {
  const ratings = JSON.parse(localStorage.getItem('fourforty_ratings') || '{}');
  return Number(ratings[plate] || 0);
}

function setTaxiRating(plate, value) {
  const ratings = JSON.parse(localStorage.getItem('fourforty_ratings') || '{}');
  ratings[plate] = value;
  localStorage.setItem('fourforty_ratings', JSON.stringify(ratings));
}

function initMap() {
  if (map) return;
  map = L.map('map').setView([-26.75, 27.45], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
}

async function goLive() {
  const plate = document.getElementById('plateInput').value || 'FS 123 GP';
  const profile = getProfile();

  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    if (map) {
      L.marker([lat, lng]).addTo(map).bindPopup(`${plate} LIVE`).openPopup();
      map.setView([lat, lng], 13);
    }

    try {
      await supabase.from('taxis').upsert({
        plate,
        route: document.getElementById('routeSelect').value || 'Ngwathe-JHB',
        lat,
        lng,
        is_live: true,
        driver_phone: profile.phone || '',
      });
    } catch (error) {
      console.warn('Driver live update failed', error);
    }

    showToast(`LIVE GOLD ${plate}`, 'success');
  }, () => {
    showToast('Location access denied. Please allow geolocation.', 'error');
  });
}

async function sendGroup() {
  const msg = document.getElementById('groupMsg').value.trim();
  const profile = getProfile();

  if (!msg) return;

  document.getElementById('groupChatBox').innerHTML += `<div><strong>${profile.name}:</strong> ${msg}</div>`;
  document.getElementById('groupMsg').value = '';

  try {
    await supabase.from('group_messages').insert({
      sender: profile.name,
      message: msg,
    });
  } catch (error) {
    console.warn('Group message save failed', error);
  }
}

async function sendOne() {
  const to = document.getElementById('chatToPhone').value.trim();
  const msg = document.getElementById('oneMsg').value.trim();
  const profile = getProfile();

  if (!msg || !to) {
    showToast('Enter a contact number and message', 'warning');
    return;
  }

  document.getElementById('oneChatBox').innerHTML += `<div><strong>You to ${to}:</strong> ${msg}</div>`;
  document.getElementById('oneMsg').value = '';

  try {
    await supabase.from('private_messages').insert({
      from_phone: profile.phone || '',
      to_phone: to,
      message: msg,
    });
  } catch (error) {
    console.warn('Private message save failed', error);
  }
}

function requestVerify() {
  const plate = document.getElementById('verifyPlate').value.trim();
  const proof = document.getElementById('verifyProof').value.trim();

  if (!plate || !proof) {
    showToast('Enter plate and cash reference', 'warning');
    return;
  }

  const profile = getProfile();
  document.getElementById('verifyStatus').innerHTML = `
    <div class="card">
      <strong>⏳ Request ${plate}</strong><br />
      Ref ${proof} - Admin check CashSend 0655846692
    </div>
  `;

  try {
    supabase.from('verifications').insert({
      plate,
      proof,
      phone: profile.phone || '',
      status: 'pending',
    });
  } catch (error) {
    console.warn('Verification save failed', error);
  }

  window.open(`https://wa.me/27655846692?text=${encodeURIComponent(`I sent R100 for ${plate} Ref:${proof}`)}`, '_blank');
  showToast('Verification request submitted', 'success');
}

function getProfile() {
  return JSON.parse(localStorage.getItem('fourforty_profile') || '{}');
}

window.onload = () => {
  loadRoutes();
  const savedProfile = localStorage.getItem('fourforty_profile');

  if (savedProfile) {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('appPage').style.display = 'block';
    const profile = JSON.parse(savedProfile);

    document.getElementById('profileCard').innerHTML = `
      <div><strong>${profile.name}</strong> ${profile.phone}</div>
      <small>${profile.bio}</small>
    `;
    loadTaxis();
  }

  showPage('feed');
};

setInterval(() => {
  const page = document.getElementById('appPage');
  if (page && page.style.display !== 'none') {
    loadTaxis();
  }
}, 30000);

