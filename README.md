# Jam Digital Masjid (JDM) 🕋⏱️

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![Tailwind CSS Version](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Docker Compose](https://img.shields.io/badge/Docker_Compose-Supported-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

**Jam Digital Masjid (JDM)** is a real-time, interactive information system application designed to be displayed on TV screens or monitors in mosques. This application displays a digital clock, prayer schedules, iqomah countdown times, daily hadiths, financial cash reports, event agendas, and other relevant information.

The application uses a **Client-Server (MERN Stack)** architecture with real-time data synchronization via WebSockets.

---

## ✨ Main Features

- **JDM TV Screen (Public View):** Displays the digital clock, 5 daily prayer times + Shuruq, automatic iqomah countdown timer, daily hadith, mosque cash reports, and announcement slides.
- **Admin Dashboard (Private View):** A management panel to manage mosque profiles, ustadz/preachers, cash flow records, hadiths, prayer schedules, and donation programs.
- **Real-Time Data Sync:** Powered by **Socket.io** integrated with a custom **Mongoose Global Plugin**, ensuring the TV screen updates instantly when an administrator alters data in the Dashboard without page refreshes.
- **Background Jobs (Scheduler):** Uses **node-cron** to automate monthly prayer schedule synchronization from an external API (equran.id) and rotate daily hadiths.
- **Secure Authentication:** Admin login is secured using **JWT** stored in **httpOnly Cookies** to mitigate XSS (Cross-Site Scripting) attacks.

---

## 🛠️ Tech Stack

### Frontend
- **Framework & Bundler:** React.js (v19) & Vite
- **Styling:** Tailwind CSS (v4) & Framer Motion (for UI transitions and micro-animations)
- **State Management:** React Query (for smart server-state caching and invalidation)
- **Communication:** Socket.io-client & React Router DOM

### Backend
- **Runtime & Framework:** Node.js & Express.js
- **Database:** MongoDB with Mongoose ODM
- **Real-time Engine:** Socket.io
- **Security:** JSON Web Token (JWT) & BcryptJS
- **Task Scheduler:** Node-Cron

---

## 📂 Project Directory Structure

This project is organized as a monorepo consisting of two main services:

```text
.
├── backend/               # REST API & Websocket Server codebase
│   ├── src/
│   │   ├── config/        # Database & Socket.io configuration
│   │   ├── controllers/   # HTTP request handlers / controllers
│   │   ├── middlewares/   # JWT auth & upload middlewares
│   │   ├── models/        # Mongoose schemas (MongoDB models)
│   │   ├── routes/        # API route definitions
│   │   ├── seeders/       # Database seeding scripts (admin initialization)
│   │   ├── services/      # Third-party integrations (external prayer API)
│   │   └── testing/       # Scheduler testing utilities
│   └── package.json
│
├── frontend/              # React Single Page Application (SPA) codebase
│   ├── src/
│   │   ├── components/    # Reusable UI components (Navbar, Cards, TV screen slides)
│   │   ├── context/       # Global State (AuthContext, SocketContext)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components (Dashboard, Login, TV Display)
│   │   ├── routes/        # React Router configuration
│   │   └── services/      # API services & query integration
│   └── package.json
│
├── docker-compose.yml     # Docker orchestration config
└── README.md
```

---

## 🚀 Prerequisites & Installation

Ensure you have one of the following setups installed on your machine.

### Option 1: Using Docker (Recommended)
This is the fastest method to get up and running, as it encapsulates all dependencies (MongoDB, Backend, and Frontend) automatically.

1. **Clone this repository:**
   ```bash
   git clone https://github.com/SubhanFaqih/jdm.git
   cd jdm
   ```
2. **Run Docker Compose:**
   ```bash
   docker compose up -d --build
   ```
3. The services will be accessible at:
   - **Frontend:** [http://localhost:5173](http://localhost:5173)
   - **Backend:** [http://localhost:5000](http://localhost:5000)
   - **MongoDB:** `mongodb://localhost:27017`

---

### Option 2: Manual Installation (Development Mode)
Use this option if you want to develop and run the code locally outside of Docker containers.

#### 1. Backend Setup
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in the `backend/` directory and configure the environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://admin:password@localhost:27017/jdm?authSource=admin
   JWT_SECRET=supersecretkeyjdm123!@#
   ```
3. Start the backend server in development mode (using nodemon):
   ```bash
   npm run dev
   ```

#### 2. Frontend Setup
1. Open a new terminal, navigate to the frontend directory, and install dependencies:
   ```bash
   cd frontend
   npm install
   ```
2. Start the Vite development server:
   ```bash
   npm run dev
   ```
3. Access the application in your browser at [http://localhost:5173](http://localhost:5173).

---

## 🔑 Demo Account & Default Credentials

When the MongoDB database is initialized, it is empty. You need to run the seeding script to create the default administrator account.

### A. If using Docker:
Execute the seeding command inside the running backend container:
```bash
docker exec -it jdm-backend node src/seeders/admin.js admin admin123 "Administrator"
```

### B. If running locally/manually:
Run the seeding script directly in your backend terminal:
```bash
node src/seeders/admin.js admin admin123 "Administrator"
```

*   **Default Username:** `admin`
*   **Default Password:** `admin123`

---

## 🔌 Complete REST API Reference

All REST API requests should be sent to the base URL `http://localhost:5000/api`.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Log in the administrator and set HttpOnly JWT cookie | ❌ Public |
| **POST** | `/api/auth/logout` | Log out the administrator and clear the session cookie | ❌ Public |
| **GET** | `/api/auth/me` | Retrieve current logged-in user profile details | 🔐 Private |

### 2. Mosque Profile (`/api/profile-masjid`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/profile-masjid` | Get the currently active mosque profile | ❌ Public |
| **GET** | `/api/profile-masjid/:id` | Get mosque profile details by ID | 🔐 Private |
| **POST** | `/api/profile-masjid` | Create a new mosque profile (supports logo upload via multipart `logo_url`) | 🔐 Private |
| **PUT** | `/api/profile-masjid/:id` | Update mosque profile details by ID (supports logo upload) | 🔐 Private |
| **PATCH** | `/api/profile-masjid/:id/toggle-active` | Toggle activation status of a mosque profile | 🔐 Private |
| **DELETE** | `/api/profile-masjid/:id` | Delete a mosque profile by ID | 🔐 Private |

### 3. Prayer Schedule JWS (`/api/jws`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/jws` | Get daily or monthly prayer schedules | ❌ Public |
| **POST** | `/api/jws/sync` | Manually trigger monthly prayer schedule sync from external API to local DB | 🔐 Private |

### 4. Hadith (`/api/hadist`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/hadist` | Retrieve a random hadith from the local database | ❌ Public |
| **POST** | `/api/hadist/sync` | Sync 20 random hadiths for a given theme from external API to local DB | 🔐 Private |
| **GET** | `/api/hadist/themes` | List all available hadith themes | 🔐 Private |
| **GET** | `/api/hadist/themes/:id` | Get hadith theme details by ID | 🔐 Private |
| **POST** | `/api/hadist/themes` | Create a new hadith theme | 🔐 Private |
| **PUT** | `/api/hadist/themes/:id` | Update a hadith theme by ID | 🔐 Private |
| **DELETE** | `/api/hadist/themes/:id` | Delete a hadith theme by ID | 🔐 Private |

### 5. Ustadz / Preachers (`/api/ustadz`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/ustadz` | Get all preachers | 🔐 Private |
| **GET** | `/api/ustadz/:id` | Get preacher details by ID | 🔐 Private |
| **POST** | `/api/ustadz` | Add a new preacher (supports photo upload via multipart `foto_url`) | 🔐 Private |
| **PUT** | `/api/ustadz/:id` | Update preacher details by ID (supports photo upload) | 🔐 Private |
| **DELETE** | `/api/ustadz/:id` | Remove a preacher by ID | 🔐 Private |

### 6. Friday Sermon / Khotib (`/api/jadwal-khotib`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/jadwal-khotib` | Retrieve all Friday sermon/khotib assignments | ❌ Public |
| **GET** | `/api/jadwal-khotib/:id` | Get Friday sermon assignment details by ID | 🔐 Private |
| **POST** | `/api/jadwal-khotib` | Create a new Friday sermon assignment | 🔐 Private |
| **POST** | `/api/jadwal-khotib/import` | Bulk import Friday sermon assignments via JSON/Excel sheet | 🔐 Private |
| **PUT** | `/api/jadwal-khotib/:id` | Update Friday sermon assignment by ID | 🔐 Private |
| **DELETE** | `/api/jadwal-khotib/:id` | Delete Friday sermon assignment by ID | 🔐 Private |

### 7. Donation Program (`/api/program-donasi`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/program-donasi` | Get list of all donation programs | ❌ Public |
| **GET** | `/api/program-donasi/:id` | Get donation program details by ID | 🔐 Private |
| **POST** | `/api/program-donasi` | Create a new donation program | 🔐 Private |
| **PUT** | `/api/program-donasi/:id` | Update donation program by ID | 🔐 Private |
| **PATCH** | `/api/program-donasi/:id/toggle-active` | Toggle active/inactive status of a donation program | 🔐 Private |
| **DELETE** | `/api/program-donasi/:id` | Delete a donation program by ID | 🔐 Private |

### 8. Financial Cash Reports (`/api/kas`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/kas` | Retrieve list of all cash transactions/logs | 🔐 Private |
| **POST** | `/api/kas` | Log a new cash flow transaction (debit/credit) | 🔐 Private |
| **PUT** | `/api/kas/:id` | Update an existing cash flow transaction record by ID | 🔐 Private |
| **DELETE** | `/api/kas/:id` | Delete a cash flow transaction record by ID | 🔐 Private |
| **GET** | `/api/kas/stats` | Retrieve total balance statistics (used on the TV Screen) | ❌ Public |

### 9. Audit Logs (`/api/audit-logs`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/audit-logs` | Retrieve log of system events/actions performed by administrators | 🔐 Private |

### 10. Region Proxy (`/api/wilayah`)
| Method | Endpoint | Description | Authentication |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/wilayah/provinces` | Proxy request to fetch all Indonesian provinces from external API | ❌ Public |
| **GET** | `/api/wilayah/regencies/:provinceCode` | Proxy request to fetch regencies/cities by province code | ❌ Public |

---

## 🐳 Essential Docker Compose Commands

Below are standard Docker Compose commands for running and managing the services:

- **Start all containers in background:**
  ```bash
  docker compose up -d
  ```
- **Stop and remove all running containers:**
  ```bash
  docker compose down
  ```
- **View logs in real-time:**
  ```bash
  docker compose logs -f
  ```
- **Stop, remove containers, and purge volumes (hard reset data):**
  ```bash
  docker compose down -v
  ```
