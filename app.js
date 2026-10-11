/**
 * Smart Book Club Platform — API Client
 * 
 * APIs:
 * 1. OpenLibrary Search  — GET search.json (To search for books)
 * 2. OpenLibrary Works   — GET {key}.json (To fetch specific book details)
 * 3. DummyJSON Quotes    — GET /quotes/random/4 (To fetch random quotes)
 * 4. Open-Meteo Weather  — GET /forecast (To fetch Birzeit weather)
 * 5. Gemini AI Summary   — POST /api/summary (Secure Serverless Function)
 */

// 1. Grouping API URLs in a single Object
const APIS = {
  openLibrary: 'https://openlibrary.org',
  quotes:      'https://dummyjson.com/quotes/random/4',
  weather:     'https://api.open-meteo.com/v1/forecast?latitude=31.96&longitude=35.18&current=temperature_2m,wind_speed_10m,weather_code'
};

/* ─── Global State ─── */
let currentSelectedBook = null;

/* ─── Core Elements (UI Elements Definition) ─── */
const inputEl        = document.getElementById('search-input');
const searchBtn      = document.getElementById('search-btn');
const statusBar      = document.getElementById('status-bar');
const resultsSection = document.getElementById('results-section');
const booksGrid      = document.getElementById('books-grid');
const detailSection  = document.getElementById('detail-section');
const detailContent  = document.getElementById('detail-content');
const quotesSection  = document.getElementById('quotes-section');
const quotesGrid     = document.getElementById('quotes-grid');

const pillOL         = document.getElementById('pill-ol');
const pillDetails    = document.getElementById('pill-details');
const pillQuotes     = document.getElementById('pill-quotes');
const pillAI         = document.getElementById('pill-ai');

function setStatus(msg, type = '') { 
  if (statusBar) {
    statusBar.className = `status-bar ${type}`; 
    statusBar.innerHTML = msg; 
  }
}

function esc(str = '') { 
  const d = document.createElement('div'); 
  d.textContent = str; 
  return d.innerHTML; 
}

/* ─── API Functions ─── */
async function searchBooks(query) {
  const res = await axios.get(`${APIS.openLibrary}/search.json`, { 
    params: { q: query, limit: 9, fields: 'title,author_name,first_publish_year,cover_i,key' } 
  });
  return res.data.docs || [];
}

async function fetchBookDetails(key) {
  const res = await axios.get(`${APIS.openLibrary}${key}.json`);
  return res.data;
}

async function fetchQuotes() {
  const res = await axios.get(APIS.quotes);
  return res.data;
}

/* ─── AI Summarization Function (Secure Call via /api/summary) ─── */
window.generateSummary = async function(title, author) {
  const btn = document.getElementById('generate-summary-btn');
  const textDiv = document.getElementById('ai-summary-text');

  if (!btn || !textDiv) return;

  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:1px;"></span> Summarizing with Gemini...`;
  textDiv.style.display = 'none';

  try {
    // إرسال الطلب إلى Serverless Function بدلاً من الاتصال المباشر بمفتاح محظور
    const response = await fetch('/api/summary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, author })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP Error: ${response.status}`);
    }

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary available.';

    textDiv.style.display = 'block';
    textDiv.innerHTML = `<strong style="color: var(--gold);">Gemini Summary:</strong><br>` + esc(summary).replace(/\n/g, '<br>');
    btn.style.display = 'none'; 
    if (pillAI) pillAI.classList.add('active'); 
  } catch (err) {
    console.error(err);
    textDiv.style.display = 'block';
    textDiv.innerHTML = `<span style="color: #c0614e;">Failed to fetch summary: ${esc(err.message)}</span>`;
    btn.disabled = false;
    btn.innerHTML = `✨ Retry Summarization`;
  }
};

/* ─── Feature 1: Weather API ─── */
async function loadWeather() {
  const weatherContainer = document.getElementById('weather-content');
  if (!weatherContainer) return;

  try {
    const res = await axios.get(APIS.weather);
    const current = res.data.current || res.data.current_weather;
    
    const temp = current ? (current.temperature_2m ?? current.temperature) : '--';
    const wind = current ? (current.wind_speed_10m ?? current.windspeed) : '--';
    const code = current ? (current.weather_code ?? current.weathercode) : 0;

    let weatherIcon = '☀️';
    if (code > 1 && code <= 3) weatherIcon = '⛅';
    if (code >= 51) weatherIcon = '🌧️';

    weatherContainer.innerHTML = `
      <div style="font-size: 3.5rem; margin: 0.5rem 0; line-height: 1;">${weatherIcon}</div>
      <div style="font-size: 2rem; color: var(--gold); font-family: 'JetBrains Mono';">${temp}°C</div>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Wind: ${wind} km/h</p>
    `;
  } catch (error) {
    console.error(error);
    weatherContainer.innerHTML = `<p style="color: #c0614e;">Weather API Error</p>`;
  }
}

/* ─── Feature 2: Ticket Generator ─── */
const meetingTypeSelect = document.getElementById('meeting-type');
const onlineGroup = document.getElementById('online-input-group');
const inpersonGroup = document.getElementById('inperson-input-group');

if (meetingTypeSelect) {
  meetingTypeSelect.addEventListener('change', (e) => {
    if (e.target.value === 'online') {
      if (onlineGroup) onlineGroup.style.display = 'block';
      if (inpersonGroup) inpersonGroup.style.display = 'none';
    } else {
      if (onlineGroup) onlineGroup.style.display = 'none';
      if (inpersonGroup) inpersonGroup.style.display = 'block';
    }
  });
}

const generateTicketBtn = document.getElementById('generate-ticket-btn');
if (generateTicketBtn) {
  generateTicketBtn.addEventListener('click', () => {
    if (!currentSelectedBook) {
      alert('⚠️ Please search and select a book first to add it to the ticket!');
      return;
    }

    const host = document.getElementById('host-name')?.value.trim() || 'Club Member';
    const dateVal = document.getElementById('meeting-date')?.value;
    const meetingType = meetingTypeSelect?.value;
    
    let locationOrLinkHtml = '';
    let labelText = '';
    let ticketTitle = '';

    if (meetingType === 'online') {
      const zoomLink = document.getElementById('zoom-link')?.value.trim();
      if (!dateVal || !zoomLink) {
        alert('⚠️ Please enter the meeting date and the Online invite link!');
        return;
      }
      labelText = 'Meeting Link';
      locationOrLinkHtml = `<a href="${esc(zoomLink)}" target="_blank" style="color: var(--gold); text-decoration: underline;">Join Zoom/Meet</a>`;
      ticketTitle = '💻 Online Book Club Meeting';
    } else {
      const locationVal = document.getElementById('location-input')?.value.trim();
      if (!dateVal || !locationVal) {
        alert('⚠️ Please enter the meeting date and the In-Person location!');
        return;
      }
      labelText = 'Location';
      locationOrLinkHtml = esc(locationVal);
      ticketTitle = '☕ In-Person Book Club Meeting';
    }

    const formattedDate = new Date(dateVal).toLocaleString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    
    document.getElementById('tkt-title').textContent = ticketTitle;
    document.getElementById('tkt-host').textContent = host;
    document.getElementById('tkt-book').textContent = currentSelectedBook.title;
    document.getElementById('tkt-book').title = currentSelectedBook.title; 
    document.getElementById('tkt-date').textContent = formattedDate;
    
    document.getElementById('tkt-location-label').textContent = labelText;
    document.getElementById('tkt-link').innerHTML = locationOrLinkHtml;
    
    const container = document.getElementById('ticket-container');
    if (container) {
      container.style.display = 'block';
      container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

/* ─── Search & Display Logic ─── */
function renderBookCards(docs) {
  if (!booksGrid) return;
  if (!docs.length) { 
    booksGrid.innerHTML = '<p class="empty-state">No books found.</p>'; 
    return; 
  }
  
  booksGrid.innerHTML = docs.map((doc, idx) => {
    const title = doc.title || 'Unknown'; 
    const author = (doc.author_name || [])[0] || 'Unknown';
    const year = doc.first_publish_year || '—'; 
    const coverSrc = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null;
    return `
      <div class="book-card" style="animation-delay: ${idx * 55}ms" data-key="${doc.key}" data-title="${esc(title)}" data-author="${esc(author)}" data-cover="${coverSrc || ''}" onclick="selectBook(this)">
        ${coverSrc ? `<img class="card-cover" src="${coverSrc}" alt="Cover">` : `<div class="card-cover-placeholder">📖</div>`}
        <div class="card-info"><div class="card-title">${esc(title)}</div><div class="card-author">${esc(author)}</div><div class="card-year">Published: ${year}</div></div>
      </div>`;
  }).join('');
}

window.selectBook = async function(cardEl) { 
  document.querySelectorAll('.book-card').forEach(c => c.classList.remove('active')); 
  cardEl.classList.add('active');
  const { key, title, author, cover } = cardEl.dataset;
  
  currentSelectedBook = { title: esc(title), author: esc(author) };

  if (detailSection) detailSection.style.display = 'block'; 
  if (detailContent) detailContent.innerHTML = `<p class="empty-state"><span class="spinner"></span> Fetching details...</p>`;
  if (quotesSection) quotesSection.style.display = 'none'; 

  if (pillOL) pillOL.classList.remove('active'); 
  if (pillDetails) pillDetails.classList.remove('active'); 
  if (pillQuotes) pillQuotes.classList.remove('active'); 
  if (pillAI) pillAI.classList.remove('active');
  
  if (detailSection) detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    const detailsData = await fetchBookDetails(key);
    if (pillOL) pillOL.classList.add('active'); 
    if (pillDetails) pillDetails.classList.add('active');
    
    let description = 'No description available for this specific edition.';
    if (detailsData.description) {
      description = typeof detailsData.description === 'string' ? detailsData.description : detailsData.description.value;
    }

    if (detailContent) {
      detailContent.innerHTML = `
        <div class="detail-grid">
          ${cover ? `<img class="detail-cover" src="${cover}">` : `<div class="detail-cover-placeholder">📚</div>`}
          <div>
            <div class="detail-title">${esc(title)}</div>
            <div class="detail-author">by ${esc(author)}</div>
            <p class="detail-description">${esc(description)}</p>
            
            <div style="margin-top: 1.5rem; padding: 1rem; border: 1px dashed rgba(201,168,76,0.3); border-radius: var(--radius); background: rgba(201,168,76,0.03);">
              <button id="generate-summary-btn" onclick="generateSummary('${esc(title)}', '${esc(author)}')" style="font-size: 0.8rem; padding: 0.6rem 1.2rem; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                ✨ Generate AI Summary (Gemini)
              </button>
              <div id="ai-summary-text" style="font-size: 0.95rem; color: var(--cream); display: none; line-height: 1.6; margin-top: 0.5rem;"></div>
            </div>
          </div>
        </div>`;
    }

    if (quotesSection) quotesSection.style.display = 'block'; 
    if (quotesGrid) quotesGrid.innerHTML = `<p class="empty-state"><span class="spinner"></span> Loading inspiration...</p>`;
    
    const quotesData = await fetchQuotes(); 
    if (pillQuotes) pillQuotes.classList.add('active');
    
    const quotesList = quotesData.quotes || quotesData;
    if (quotesGrid && Array.isArray(quotesList) && quotesList.length > 0) {
      quotesGrid.innerHTML = quotesList.map((q, i) => `<div class="quote-card" style="animation-delay:${i*80}ms"><p class="quote-text">${esc(q.quote)}</p><p class="quote-attribution">— ${esc(q.author)}</p></div>`).join('');
    }
  } catch (err) { 
    if (detailContent) detailContent.innerHTML = `<p class="empty-state" style="color: #c0614e;">Error: ${esc(err.message)}</p>`; 
  }
};

async function handleSearch() {
  const query = inputEl?.value.trim(); 
  if (!query) return setStatus('⚠ Please enter a book title.', 'error');
  
  setStatus('<span class="spinner"></span> Searching...', 'info'); 
  if (searchBtn) searchBtn.disabled = true;

  if (resultsSection) resultsSection.style.display = 'none'; 
  if (detailSection) detailSection.style.display = 'none'; 
  if (quotesSection) quotesSection.style.display = 'none';
  currentSelectedBook = null; 
  
  try {
    const docs = await searchBooks(query); 
    setStatus(`Found ${docs.length} result(s).`, 'info');
    renderBookCards(docs); 
    if (resultsSection) resultsSection.style.display = 'block';
  } catch (err) { 
    setStatus(`Error: ${err.message}.`, 'error'); 
  } finally { 
    if (searchBtn) searchBtn.disabled = false; 
  }
}

/* ─── Event Listeners & Init ─── */
if (searchBtn) searchBtn.addEventListener('click', handleSearch);
if (inputEl) inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });

window.addEventListener('DOMContentLoaded', () => {
  if (inputEl) inputEl.value = ''; 
  loadWeather(); 
});
