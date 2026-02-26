# AI Fitness & Health Assistance

A full-stack web app for personalized meal planning, workout plans, health metrics, and an AI chatbot—powered by Google Gemini.

## Features

- **Meal planning** – AI-generated meal plans based on your goals and preferences  
- **Workout planner** – Custom workout plans tailored to your fitness level and goals  
- **Health dashboard** – Track metrics and progress over time  
- **AI chatbot** – Get fitness and nutrition advice in real time  
- **User accounts** – Sign up, log in, and save your preferences and history  

## Tech Stack

| Layer    | Stack |
|----------|--------|
| Frontend | React 19, React Router, Material UI, Bootstrap, Chart.js |
| Backend  | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI       | Google Gemini API |

## Prerequisites

- **Node.js** (v18 or later)
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Google Gemini API key** – [Get one here](https://aistudio.google.com/apikey)

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/vishnuvardhan1911/AIHealthFitnessAssiatnce.git
cd AIHealthFitnessAssiatnce
```

### 2. Environment variables

**Server** (`server/`)

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set:

- `PORT` – e.g. `5001`
- `MONGODB_URI` – e.g. `mongodb://localhost:27017/aimealplan` or your Atlas URI
- `GEMINI_API_KEY` – your Gemini API key
- `GEMINI_MODEL` – e.g. `gemini-2.5-flash`

**Client** (`client/`)

```bash
cd client
cp .env.example .env
```

Edit `client/.env` and set:

- `REACT_APP_API_URL` – backend API URL, e.g. `http://localhost:5001/api` (port must match server `PORT`)

### 3. Install dependencies

```bash
# From project root
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 4. Run the app

**Terminal 1 – backend**

```bash
cd server
npm start
```

Server runs at `http://localhost:5001` (or your `PORT`).

**Terminal 2 – frontend**

```bash
cd client
npm start
```

App opens at `http://localhost:3000`.

## Project structure

```
├── client/          # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
├── server/          # Express API
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
├── .env.example     # (see server/ and client/ for env templates)
└── README.md
```

## License

ISC
