# 📚 نادي القراءة العالمي — Global Birzeit Book Club

**COM4381: Web Services Technologies** | 2nd Semester 2025/2026 | Birzeit University

---

## 👥 Group Members

| الاسم | Student ID |
|-------|-----------|
| [اسم الطالب الأول] | [1234567] |
| [اسم الطالب الثاني] | [7654321] |

---

## 📌 Project Description

A responsive, Arabic-first (RTL) web application that consumes the **Open Library REST API** to power a Book Club Management system. Users can:

1. **Search for any book** by title using the Open Library API
2. **Browse multiple results** returned from the API in an interactive card grid
3. **Schedule a discussion session** with presenter name, date/time, and meeting link
4. **Generate a formatted invitation card** to share with book club members
5. **View the raw JSON response** from the API to understand REST representation formats

---

## 🌐 REST APIs Used

### 1. Open Library API

| Property | Value |
|----------|-------|
| Provider | Internet Archive / Open Library |
| Website  | https://openlibrary.org |
| API Docs | https://openlibrary.org/developers/api |
| Auth Required | ❌ No — completely free and open |
| Response Format | **JSON** |

#### Endpoint

```
GET https://openlibrary.org/search.json?title={book_name}&limit=10
```

| REST Principle | Detail |
|----------------|--------|
| **Root Resource URL** | `https://openlibrary.org` |
| **Resource Path** | `/search.json` |
| **HTTP Method** | `GET` |
| **Query Parameters** | `title`, `limit`, `fields` |
| **Response** | `application/json` |

---

### 2. OpenWeatherMap API

| Property | Value |
|----------|-------|
| Provider | OpenWeather Ltd |
| Website  | https://openweathermap.org |
| API Docs | https://openweathermap.org/current |
| Auth Required | ✅ Free API key (register at openweathermap.org/api) |
| Response Format | **JSON** |

#### Endpoint

```
GET https://api.openweathermap.org/data/2.5/weather?q=Birzeit,PS&units=metric&lang=ar&appid={API_KEY}
```

| REST Principle | Detail |
|----------------|--------|
| **Root Resource URL** | `https://api.openweathermap.org` |
| **Resource Path** | `/data/2.5/weather` |
| **HTTP Method** | `GET` |
| **Query Parameters** | `q` (city,country), `units`, `lang`, `appid` |
| **Response** | `application/json` |

**Why weather?** The weather widget in the header serves a real use-case: when members generate a meeting invitation, the app automatically suggests whether to hold the session **in the university gardens** (good weather) or **indoors** (rain / extreme temperature) — making the invitation smarter, not just prettier.

---

## 🏗️ Architecture

The JavaScript is split into **two clean layers**:

```
OpenLibraryAPI (module)     — All REST communication (fetch, URL building, parsing)
    ↓
UI Functions               — All DOM rendering (skeleton, cards, grid, invite)
    ↓
State Object               — Single source of truth (selected book, raw JSON, etc.)
```

### File Structure

```
assignment1/
├── index.html    — Application markup (Arabic RTL, semantic HTML)
├── style.css     — Styling (CSS variables, responsive, glassmorphism accents)
├── app.js        — Modular JavaScript (API layer + UI layer separated)
└── README.md     — This file
```

---

## ▶️ How to Run

**No build tools or npm needed. It's pure HTML/CSS/JS.**

### Option 1 — Open directly in browser (simplest)
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO/assignment1

# Open index.html in any modern browser
# On Windows:
start index.html
# On macOS:
open index.html
```

### Option 2 — Use a local server (recommended to avoid CORS issues)

```bash
# If you have Python installed:
cd assignment1
python -m http.server 8000
# Then open: http://localhost:8000

# Or with Node.js:
npx serve .
# Then open the URL shown in terminal
```

### Option 3 — VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

---

## ✨ Key Features Demonstrated

- **REST Principles Panel**: Live URL updates as you type, showing root URL, path, and query params
- **Loading Skeleton**: Animated placeholder while API fetches data
- **Error Handling**: Clear Arabic error messages for 404 / network failures
- **JSON View Toggle**: Switch between UI and raw JSON representation (demonstrates REST content negotiation concept)
- **Multi-result Grid**: Browse up to 10 search results, click to select
- **Invite Card Generator**: Creates a formatted, shareable meeting invitation
- **Copy to Clipboard**: One-click copy of meeting details
- **Responsive Design**: Works on mobile, tablet, and desktop
- **RTL Arabic Support**: Full right-to-left layout with Tajawal font

---

## 🔗 Resources

- [Open Library API Documentation](https://openlibrary.org/developers/api)
- [Open Library Covers API](https://openlibrary.org/dev/docs/api#anchor_covers)
- [Public APIs Repository](https://github.com/public-apis/public-apis)

---

*Assignment 1 — COM4381 Web Services Technologies — Birzeit University 2025/2026*
