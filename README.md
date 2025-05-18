# AI Interview Frontend

A modern, containerized React frontend for the Interview AI Helper, built with Vite, TypeScript, and Firebase integration.

---

## 📁 Project Structure

| Path                        | Description                                 |
|-----------------------------|---------------------------------------------|
| `src/main.tsx`              | App entry point, router setup               |
| `src/App.tsx`               | Main App component                          |
| `src/routes/`               | Route/page components                       |
| `src/Components/`           | UI components (e.g., Auth forms)            |
| `src/Commons/`              | Shared UI and utility components            |
| `src/Firebase/`             | Firebase integration logic                  |
| `src/Types/`                | TypeScript type definitions                 |
| `public/`                   | Static assets (empty by default)            |
| `index.html`                | HTML template                               |
| `vite.config.ts`            | Vite and plugin configuration               |
| `Dockerfile.dev`            | Dev container build instructions            |
| `Dockerfile.prod`           | Production container build instructions     |
| `nginx.conf`                | Nginx config for production                 |
| `docker-compose.yml`        | Local dev orchestration                     |
| `.github/workflows/`        | CI/CD pipeline (Docker build & push)        |
| `.gitignore`                | VCS ignore rules                            |

---

## 🚀 Features

- **React 19 + Vite**: Fast, modern frontend stack.
- **TypeScript**: Type-safe codebase.
- **Firebase Auth**: User authentication via Firebase.
- **Form Validation**: `react-hook-form` + `yup` schemas.
- **Componentized UI**: Modular, reusable components.
- **PWA Support**: Installable, offline-ready (via Vite PWA plugin).
- **Dockerized**: Dev and prod container setups.
- **CI/CD**: Automated Docker build & push via GitHub Actions.

---

## 🏗️ Application Overview

### Main App Initialization (`src/main.tsx`)
- Sets up React root and router (TanStack Router).
- Loads global styles.

### Routing (`src/routes/`)
- Defines main pages: login, signup, and root.
- Uses TanStack Router for type-safe navigation.

### Authentication (`src/Components/Auth/`)
- `LoginForm.tsx` and `SignUpForm.tsx` for user auth.
- Validation schemas in `Schema/SignupSchema.ts`.
- Styled with Emotion and custom styles.

### Firebase Integration (`src/Firebase/`)
- Handles authentication logic and error types.

### Shared Components (`src/Commons/`)
- Reusable UI: buttons, input fields, shared styles.

---

## 🗂️ Main Routes/Pages

| Path      | Component         | Description           |
|-----------|-------------------|-----------------------|
| `/`       | Root              | Main/root page        |
| `/login`  | LoginForm         | User login            |
| `/SignUp` | SignUpForm        | User registration     |

---

## 🧩 Dependencies

### Main (`package.json`)

| Package                | Purpose                        |
|------------------------|---------------------------------|
| react, react-dom       | UI framework                    |
| @tanstack/react-router | Routing                         |
| firebase               | Auth/backend integration        |
| react-hook-form        | Form state management           |
| yup                    | Schema validation               |
| @emotion/styled        | CSS-in-JS styling               |
| react-toastify         | Toast notifications             |
| lucide-react           | Icon set                        |

### Dev

| Package                | Purpose                        |
|------------------------|---------------------------------|
| typescript             | Type safety                     |
| eslint, plugins        | Linting                         |
| @vitejs/plugin-react   | Vite React integration          |
| vite-plugin-pwa        | PWA support                     |

---

## 🐳 Dockerization

### Development (`Dockerfile.dev`)
- Node 20 Alpine base.
- Installs dependencies, builds app, runs `npm run dev`.
- Exposes port 5173.

### Production (`Dockerfile.prod`)
- Multi-stage: Node 20 Alpine for build, Nginx for serve.
- Accepts Firebase env vars at build time.
- Copies built static files to Nginx.
- Exposes port 80.
- Custom Nginx config with `/health` endpoint.

### Nginx (`nginx.conf`)
- Serves SPA with fallback to `index.html`.
- `/health` returns 200 for health checks.

### Compose (`docker-compose.yml`)
- Local dev: builds from Dockerfile, watches `src/`, exposes 5173.

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/push.yaml`)
| Step                        | Description                                  |
|-----------------------------|----------------------------------------------|
| Checkout code               | Pulls repo code                              |
| Authenticate to GCP         | Uses service account for Docker push         |
| Set up Cloud SDK            | Prepares gcloud CLI                          |
| Configure Docker            | Auths Docker for GCP Artifact Registry       |
| Build Docker image          | Builds image using `Dockerfile.prod`         |
| Push Docker image           | Pushes to GCP Artifact Registry (latest & SHA tags) |

---

## 📝 .gitignore
- Ignores node_modules, build outputs, logs, editor configs, and environment files.

---

## 🏁 Quickstart

### Local Development
```bash
npm install
npm run dev
```

### With Docker (Dev)
```bash
docker build -f Dockerfile.dev -t ai-interview-frontend-dev .
docker run -p 5173:5173 ai-interview-frontend-dev
```

### With Docker (Production)
```bash
docker build -f Dockerfile.prod -t ai-interview-frontend .
docker run -p 80:80 ai-interview-frontend
```

### With Docker Compose
```bash
docker-compose up --build
```

---

## 📚 Extending
- Add new pages in `src/routes/`
- Create new UI components in `src/Components/`
- Add shared logic/UI in `src/Commons/`
- Update types in `src/Types/`
- Integrate new Firebase features in `src/Firebase/`

---

## 📞 Health Check Example
```bash
curl http://localhost:80/health
# Response: ok
```
