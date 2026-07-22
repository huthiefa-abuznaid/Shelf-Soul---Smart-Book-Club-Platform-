/**
 * Smart Book Club Platform — API Client
 * * APIs:
 * 1. OpenLibrary Search  — GET search.json (To search for books)
 * 2. OpenLibrary Works   — GET {key}.json (To fetch specific book details)
 * 3. DummyJSON Quotes    — GET /quotes/random/4 (To fetch random quotes)
 * 4. Open-Meteo Weather  — GET /forecast (To fetch Birzeit weather)
 * 5. Google Gemini AI    — POST /models/gemini-2.5-flash:generateContent (For smart summary)
 */

// 1. Grouping API URLs in a single Object to keep the code organized and make it easier to update links from one place.
const APIS = {
  openLibrary:  'https://openlibrary.org',
  quotes:       'https://dummyjson.com/quotes/random/4',
  weather:      'https://api.open-meteo.com/v1/forecast?latitude=31.96&longitude=35.18&current_weather=true',
  geminiUrl:    'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  geminiKey:    'AIzaSyCB9lFxDueWbbrrFkEUQqLJnUzKL_1vKlU' 
};

/* ─── Global State ─── */
// A global variable to store the data of the book clicked by the user.
// We need this to read the book title later when generating the "Meeting Ticket".
let currentSelectedBook = null;

/* ─── Core Elements (UI Elements Definition) ─── */
// Here we link HTML elements (like buttons and inputs) to JavaScript variables so we can control them.
const inputEl       = document.getElementById('search-input');
const searchBtn     = document.getElementById('search-btn');
const statusBar     = document.getElementById('status-bar');
const resultsSection= document.getElementById('results-section');
const booksGrid     = document.getElementById('books-grid');
const detailSection = document.getElementById('detail-section');
const detailContent = document.getElementById('detail-content');
const quotesSection = document.getElementById('quotes-section');
const quotesGrid    = document.getElementById('quotes-grid');

const pillOL        = document.getElementById('pill-ol');
const pillDetails   = document.getElementById('pill-details');
const pillQuotes    = document.getElementById('pill-quotes');
const pillAI        = document.getElementById('pill-ai');

// Helper function to update the status bar (for loading states or error messages).
function setStatus(msg, type = '') { statusBar.className = `status-bar ${type}`; statusBar.innerHTML = msg; }

// A crucial security function: sanitizes text coming from APIs before displaying it to prevent XSS attacks.
function esc(str = '') { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

/* ─── API Functions (External Server Calls) ─── */

// Function to search for books using the Axios library (GET Request).
async function searchBooks(query) {
  const res = await axios.get(`${APIS.openLibrary}/search.json`, { params: { q: query, limit: 9, fields: 'title,author_name,first_publish_year,cover_i,key' } });
  return res.data.docs || [];
}

// Function to fetch specific book details based on its Key (GET Request).
async function fetchBookDetails(key) {
  const res = await axios.get(`${APIS.openLibrary}${key}.json`);
  return res.data;
}

// Function to fetch random quotes (GET Request).
async function fetchQuotes() {
  const res = await axios.get(APIS.quotes);
  return res.data;
}

/* ─── AI Summarization Function ─── */
window.generateSummary = async function(title, author) {
  const btn = document.getElementById('generate-summary-btn');
  const textDiv = document.getElementById('ai-summary-text');
  
  const API_KEY = APIS.geminiKey;

  // Check if the API key exists.
  if (!API_KEY || API_KEY === 'AIzaSyDwdyoqpKwBGCoAHFzmeEbiLRm1pke7ZVM') {
    textDiv.style.display = 'block';
    textDiv.innerHTML = `<span style="color: #c0614e;">⚠️ Please insert your Gemini API Key in the code.</span>`;
    return;
  }

  // Change the button appearance to show a "Loading" state to the user.
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:12px;height:12px;border-width:1px;"></span> Summarizing with Gemini...`;
  textDiv.style.display = 'none';

  try {
    // Prepare the prompt to be sent to the AI.
    const prompt = `لخص كتاب "${title}" للمؤلف "${author}" في فقرة واحدة قصيرة ومفيدة باللغة العربية، موجهة لأعضاء نادي قراءة.`;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY.trim()}`;      
    
    // Send the request using Fetch API as a POST Request, sending data in JSON format.
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // Parse the response and display the summary on the page.
    const data = await response.json();
    const summary = data.candidates[0].content.parts[0].text;
    
    textDiv.style.display = 'block';
    textDiv.innerHTML = `<strong style="color: var(--gold);">Gemini Summary:</strong><br>` + esc(summary).replace(/\n/g, '<br>');
    btn.style.display = 'none'; 
    document.getElementById('pill-ai').classList.add('active'); 
  } catch (err) {
    // In case of an error, display the error message and reset the button to allow retrying.
    console.error(err);
    textDiv.style.display = 'block';
    textDiv.innerHTML = `<span style="color: #c0614e;">Failed to fetch summary: ${esc(err.message)}</span>`;
    btn.disabled = false;
    btn.innerHTML = `✨ Retry Summarization`;
  }
};

/* ─── Feature 1: Weather API ─── */
async function loadWeather() {
  try {
    const res = await axios.get(APIS.weather);
    const data = res.data.current_weather;
    
    // Simple logic to choose the weather icon (emoji) based on the weather code from the API.
    let weatherIcon = '☀️';
    if(data.weathercode > 1 && data.weathercode <= 3) weatherIcon = '⛅';
    if(data.weathercode >= 51) weatherIcon = '🌧️';

    // Inject the data into the UI.
    document.getElementById('weather-content').innerHTML = `
      <div style="font-size: 3.5rem; margin: 0.5rem 0; line-height: 1;">${weatherIcon}</div>
      <div style="font-size: 2rem; color: var(--gold); font-family: 'JetBrains Mono';">${data.temperature}°C</div>
      <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Wind: ${data.windspeed} km/h</p>
    `;
  } catch (error) {
    document.getElementById('weather-content').innerHTML = `<p style="color: #c0614e;">Weather API Error</p>`;
  }
}

/* ─── Feature 2: Ticket Generator ─── */
const meetingTypeSelect = document.getElementById('meeting-type');
const onlineGroup = document.getElementById('online-input-group');
const inpersonGroup = document.getElementById('inperson-input-group');

// Event Listener to toggle between online and in-person input fields based on user selection.
meetingTypeSelect.addEventListener('change', (e) => {
  if (e.target.value === 'online') {
    onlineGroup.style.display = 'block';
    inpersonGroup.style.display = 'none';
  } else {
    onlineGroup.style.display = 'none';
    inpersonGroup.style.display = 'block';
  }
});

// When the "Generate Meeting Card" button is clicked.
document.getElementById('generate-ticket-btn').addEventListener('click', () => {
  // Validation: Did the user select a book from the search results?
  if (!currentSelectedBook) {
    alert('⚠️ Please search and select a book first to add it to the ticket!');
    return;
  }

  const host = document.getElementById('host-name').value.trim() || 'Club Member';
  const dateVal = document.getElementById('meeting-date').value;
  const meetingType = meetingTypeSelect.value;
  
  let locationOrLinkHtml = '';
  let labelText = '';
  let ticketTitle = '';

  // Validation and data preparation based on the meeting type (online or in-person).
  if (meetingType === 'online') {
    const zoomLink = document.getElementById('zoom-link').value.trim();
    if (!dateVal || !zoomLink) {
      alert('⚠️ Please enter the meeting date and the Online invite link!');
      return;
    }
    labelText = 'Meeting Link';
    locationOrLinkHtml = `<a href="${zoomLink}" target="_blank" style="color: var(--gold); text-decoration: underline;">Join Zoom/Meet</a>`;
    ticketTitle = '💻 Online Book Club Meeting';
  } else {
    const locationVal = document.getElementById('location-input').value.trim();
    if (!dateVal || !locationVal) {
      alert('⚠️ Please enter the meeting date and the In-Person location!');
      return;
    }
    labelText = 'Location';
    locationOrLinkHtml = locationVal;
    ticketTitle = '☕ In-Person Book Club Meeting';
  }

  // Format the date to appear readable and elegant.
  const formattedDate = new Date(dateVal).toLocaleString('en-US', {
    weekday: 'short', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
  
  // Print the final values onto the invitation ticket (DOM Manipulation).
  document.getElementById('tkt-title').textContent = ticketTitle;
  document.getElementById('tkt-host').textContent = host;
  document.getElementById('tkt-book').textContent = currentSelectedBook.title;
  document.getElementById('tkt-book').title = currentSelectedBook.title; 
  document.getElementById('tkt-date').textContent = formattedDate;
  
  document.getElementById('tkt-location-label').textContent = labelText;
  document.getElementById('tkt-link').innerHTML = locationOrLinkHtml;
  
  // Show the ticket and smoothly scroll to it to grab the user's attention.
  const container = document.getElementById('ticket-container');
  container.style.display = 'block';
  container.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ─── Search & Display Logic ─── */

// Function that takes the data array from the API and converts it into HTML elements (book cards).
function renderBookCards(docs) {
  if (!docs.length) { booksGrid.innerHTML = '<p class="empty-state">No books found.</p>'; return; }
  
  // We use .map() to loop through each book and build its HTML using Template Literals.
  booksGrid.innerHTML = docs.map((doc, idx) => {
    const title = doc.title || 'Unknown'; const author = (doc.author_name || [])[0] || 'Unknown';
    const year = doc.first_publish_year || '—'; const coverSrc = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null;
    return `
      <div class="book-card" style="animation-delay: ${idx * 55}ms" data-key="${doc.key}" data-title="${esc(title)}" data-author="${esc(author)}" data-cover="${coverSrc || ''}" onclick="selectBook(this)">
        ${coverSrc ? `<img class="card-cover" src="${coverSrc}" alt="Cover">` : `<div class="card-cover-placeholder">📖</div>`}
        <div class="card-info"><div class="card-title">${esc(title)}</div><div class="card-author">${esc(author)}</div><div class="card-year">Published: ${year}</div></div>
      </div>`;
  }).join('');
}

// This function runs when the user clicks on any book card from the results.
window.selectBook = async function(cardEl) { 
  // Visually highlight the selected book (add 'active' class).
  document.querySelectorAll('.book-card').forEach(c => c.classList.remove('active')); cardEl.classList.add('active');
  const { key, title, author, cover } = cardEl.dataset;
  
  // Save the book data in the global variable to use it in the meeting ticket later.
  currentSelectedBook = { title: esc(title), author: esc(author) };

  // Prepare the details section and show the loading spinner.
  detailSection.style.display = 'block'; detailContent.innerHTML = `<p class="empty-state"><span class="spinner"></span> Fetching details...</p>`;
  quotesSection.style.display = 'none'; pillOL.classList.remove('active'); pillDetails.classList.remove('active'); pillQuotes.classList.remove('active'); pillAI.classList.remove('active');
  detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    // Fetch extra book details from the API.
    const detailsData = await fetchBookDetails(key);
    pillOL.classList.add('active'); pillDetails.classList.add('active');
    
    let description = 'No description available for this specific edition.';
    if (detailsData.description) description = typeof detailsData.description === 'string' ? detailsData.description : detailsData.description.value;

    // Build and display the details section including the AI button.
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

    // Fetch and display random quotes.
    quotesSection.style.display = 'block'; quotesGrid.innerHTML = `<p class="empty-state"><span class="spinner"></span> Loading inspiration...</p>`;
    const quotesData = await fetchQuotes(); pillQuotes.classList.add('active');
    if (quotesData && quotesData.length > 0) {
      quotesGrid.innerHTML = quotesData.map((q, i) => `<div class="quote-card" style="animation-delay:${i*80}ms"><p class="quote-text">${esc(q.quote)}</p><p class="quote-attribution">— ${esc(q.author)}</p></div>`).join('');
    }
  } catch (err) { detailContent.innerHTML = `<p class="empty-state" style="color: #c0614e;">Error: ${esc(err.message)}</p>`; }
}

// Function to handle the search process when the search button is clicked.
async function handleSearch() {
  const query = inputEl.value.trim(); if (!query) return setStatus('⚠ Please enter a book title.', 'error');
  
  setStatus('<span class="spinner"></span> Searching...', 'info'); searchBtn.disabled = true;
  resultsSection.style.display = 'none'; detailSection.style.display = 'none'; quotesSection.style.display = 'none';
  currentSelectedBook = null; 
  
  try {
    const docs = await searchBooks(query); setStatus(`Found ${docs.length} result(s).`, 'info');
    renderBookCards(docs); resultsSection.style.display = 'block';
  } catch (err) { setStatus(`Error: ${err.message}.`, 'error'); } finally { searchBtn.disabled = false; }
}

/* ─── Event Listeners & Init ─── */
searchBtn.addEventListener('click', handleSearch);

// Allow searching when pressing the 'Enter' key on the keyboard.
inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleSearch(); });

// Events executed automatically once the page is fully loaded (like fetching the weather).
window.addEventListener('DOMContentLoaded', () => {
  inputEl.value = ''; 
  loadWeather(); 
});