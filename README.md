# SagarMitra AI 🌊
### "Ask the Ocean. Understand the Risk. Navigate Smarter."

An Agentic AI-powered Marine Intelligence & Decision Support Platform built for the Smart India Hackathon.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                │
│   Landing │ Dashboard │ Map │ Chat │ Safety │ Routes │
├─────────────────────────────────────────────────────┤
│                   REST API (FastAPI)                 │
├─────────────────────────────────────────────────────┤
│             LangGraph Multi-Agent System             │
│  Planner │ Marine │ Weather │ Ocean │ Geospatial    │
│  Risk │ Route │ Visualization │ Alert │ Conversational│
├─────────────────────────────────────────────────────┤
│              Data Sources & Demo Data                │
│  INCOIS │ IMD │ NOAA │ Open-Meteo │ Demo Fixtures   │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker (Full Stack)
```bash
docker-compose up --build
```

## 🎯 Key Features

- **Multi-Agent AI System** — 10 specialized agents coordinated by a planner
- **Interactive Marine Maps** — MapLibre GL JS with ocean data layers
- **PFZ Intelligence** — Potential Fishing Zone discovery and analysis
- **Marine Safety** — Real-time risk assessment with explainable scoring
- **Route Optimization** — Safe maritime route planning
- **Geofencing** — Restricted zone monitoring and alerts
- **Multilingual** — 10 Indian languages supported
- **Explainable AI** — Every recommendation shows evidence and reasoning

## 📁 Project Structure

```
SIH_proto/
├── frontend/          # Next.js + TypeScript + Tailwind
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   ├── services/      # API client services
│   ├── hooks/         # Custom React hooks
│   └── types/         # TypeScript type definitions
├── backend/           # Python + FastAPI
│   └── app/
│       ├── agents/    # LangGraph multi-agent system
│       ├── api/       # REST API routes
│       ├── core/      # Configuration & database
│       ├── schemas/   # Pydantic models
│       ├── data_sources/ # Data source abstractions
│       └── tools/     # Agent tools
├── data/              # Demo data & GeoJSON
│   ├── demo/          # Demo fixtures
│   └── geojson/       # Geospatial data
└── docker/            # Docker configuration
```

## 🌐 Environment

Copy `.env.example` to `.env` and configure:
- `DEMO_MODE=true` for hackathon demo (no external APIs needed)
- Set `OPENAI_API_KEY` or `GEMINI_API_KEY` for LLM-powered responses
- All features work in demo mode with realistic simulated data

## ⚠️ Disclaimer

This is a decision-support tool. Always verify conditions with official marine advisories before real-world maritime activity.

## 📜 License

Built for Smart India Hackathon 2024.
