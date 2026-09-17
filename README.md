# 🎬 MovieExplorer

A responsive, high-performance **Movie & TV Explorer Web Application** built with **React**, **Vite**, and **Tailwind CSS**, powered by the free [TVMaze API](https://www.tvmaze.com/api).

---

## 🌐 Live Link

- [Clouflare Page](https://movie-exp.pages.dev/)

---

## ✨ Key Features

### 1. 🏠 Home Page
- Cinematic Hero Banner
- Featured Shows Section

### 2. 🔍 Movie Listing & Dynamic Search
- Instant Debounced Search
- Clear Search Action
- Genre Filter Chips
- Multi-Page Catalog Pagination
- Movie Details Modal

---

## 🛠️ Technology Stack

| Technology | Version |
|---|---|
| **React** | 19.3 |
| **Vite** | 8.3 |
| **Tailwind CSS** | 4.3 |
| **React Router** | 8.4 |
| **Lucide React** | 1.47 |
| **TVMaze REST API** | v1 |

---

## 📁 Project Structure

```text
NLFP_A2/
├── public/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx             # Reusable status and genre pill badge
│   │   │   ├── Pagination.jsx        # Numbered pagination, jump input & controls
│   │   │   └── StarRating.jsx        # Standardized star rating display
│   │   ├── layout/
│   │   │   ├── Footer.jsx            # Footer with attribution & repository link
│   │   │   └── Navbar.jsx            # Sticky responsive top navbar with animated CTA
│   │   └── movies/
│   │       ├── MovieCard.jsx         # Card with poster, title, rating & CTA
│   │       ├── MovieGrid.jsx         # Responsive grid container
│   │       ├── MovieModal.jsx        # In-depth modal with backdrop & summary
│   │       ├── MovieSkeleton.jsx     # Shimmer skeleton loading state
│   │       └── SearchBar.jsx         # Debounced search bar with clear button
│   ├── pages/
│   │   ├── HomePage.jsx              # Landing page with hero & featured shows
│   │   └── MovieListingPage.jsx      # Catalog browsing, search, pagination & modal
│   ├── services/
│   │   └── tvmaze.js                 # API client, data normalization & sanitizer
│   ├── App.jsx                       # Routing setup & layout frame
│   ├── index.css                     # Tailwind v4 directives, @theme & base styles
│   └── main.jsx                      # React DOM root entry
├── index.html                        # Application HTML shell & favicon
├── package.json                      # Dependencies and npm scripts
└── vite.config.js                    # Vite bundler with React & Tailwind plugins
```

---

## 📡 API Integration Details

The application consumes data from the [TVMaze Public API](https://www.tvmaze.com/api):

1. **Default Catalog with Multi-Page Pagination:**
   - **Endpoint:** `GET https://api.tvmaze.com/shows?page=:page`
   - Unlocks full access to the comprehensive TVMaze database (over 80,000 titles) by fetching 250 shows per catalog page (`page=0` for Page 1, `page=1` for Page 2, up to 375+).
   - Handles end-of-catalog HTTP 404 responses gracefully without network error states.
2. **Title-based Live Search:**
   - **Endpoint:** `GET https://api.tvmaze.com/search/shows?q=:query`
   - Triggered dynamically with a 400ms debounce when a query is entered into the search bar.

### Data Normalization & Sanitization
All raw API responses are processed through `normalizeShow()` in [`src/services/tvmaze.js`](file:///Users/shihab/vsc/NLFP_A2/src/services/tvmaze.js):
- Strips unwanted HTML tags from TVMaze summaries while preserving paragraph breaks.
- Standardizes release years, statuses, networks, and formats rating averages to one decimal place.
- Provides fallback handling for missing poster artwork or undefined fields.

---

## 🚦 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ShihabZzz/NLFP_A2.git
   cd NLFP_A2
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

4. **Create a production build:**
   ```bash
   npm run build
   ```
   The optimized production bundle will be generated in the `dist/` directory.

5. **Preview the production build:**
   ```bash
   npm run preview
   ```

---

## 📄 License

This project is open source and available under the terms of the [MIT License](LICENSE).
