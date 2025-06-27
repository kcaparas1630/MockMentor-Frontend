# MockMentor Frontend

A modern, containerized React frontend for the Interview AI Helper, built with Vite, TypeScript, and Firebase integration. Features comprehensive JSDoc documentation for maintainable, well-documented code.

---

## 📁 Project Structure

| Path                        | Description                                 |
|-----------------------------|---------------------------------------------|
| `src/main.tsx`              | App entry point, router setup               |
| `src/App.tsx`               | Main App component                          |
| `src/routes/`               | Route/page components                       |
| `src/Components/`           | UI components (Auth, Interview, Profile)    |
| `src/Commons/`              | Shared UI and utility components            |
| `src/Hooks/`                | Custom React hooks                          |
| `src/Context/`              | React context providers                     |
| `src/Firebase/`             | Firebase integration logic                  |
| `src/Types/`                | TypeScript type definitions                 |
| `src/Assets/`               | Static assets and icons                     |
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
- **TypeScript**: Type-safe codebase with comprehensive type definitions.
- **Firebase Auth**: User authentication via Firebase with Google OAuth.
- **Form Validation**: `react-hook-form` + `yup` schemas.
- **Componentized UI**: Modular, reusable components with consistent styling.
- **Media Device Management**: Camera and microphone access with real-time testing.
- **Voice Activity Detection**: Advanced audio processing with noise suppression.
- **WebSocket Integration**: Real-time communication for interview features.
- **PWA Support**: Installable, offline-ready (via Vite PWA plugin).
- **Dockerized**: Dev and prod container setups.
- **CI/CD**: Automated Docker build & push via GitHub Actions.
- **Comprehensive Documentation**: JSDoc documentation for all components, hooks, and utilities.

---

## 🏗️ Application Overview

### Main App Initialization (`src/main.tsx`)
- Sets up React root with StrictMode and TanStack Router.
- Configures React Query for server state management.
- Provides MediaDevicesContext for global media device access.
- Loads global styles and initializes routing.

### Routing (`src/routes/`)
- Defines main pages: login, signup, profile creation, video testing, and interview rooms.
- Uses TanStack Router for type-safe navigation.
- Implements route protection with AuthGuard.

### Authentication (`src/Components/Auth/`)
- `LoginForm.tsx` and `SignUpForm.tsx` for user authentication.
- Google OAuth integration with Firebase.
- Form validation and error handling.
- Styled with Emotion and custom styles.

### Interview Components (`src/Components/Interview/`)
- `VideoTestCard.tsx`: Device testing interface.
- `InterviewRoom.tsx`: Main interview interface.
- `AiCoach.tsx`: AI assistant component.
- `ChatPanel.tsx`: Real-time chat interface.
- `VideoDisplay.tsx`: Video stream display.

### Media Device Management (`src/Hooks/`)
- `useMediaDevices.ts`: Comprehensive media device management.
- `useDetectAudio.ts`: Voice activity detection with noise suppression.
- `useMicTesting.ts`: Microphone testing with real-time visualization.
- `useWebSocketConnection.ts`: WebSocket connection management.

### Firebase Integration (`src/Firebase/`)
- Handles authentication logic and error types.
- Environment-based configuration.
- User session management.

### Shared Components (`src/Commons/`)
- Reusable UI: buttons, input fields, select dropdowns, spinners.
- Consistent styling and behavior across the application.

---

## 🗂️ Main Routes/Pages

| Path              | Component         | Description                    |
|-------------------|-------------------|--------------------------------|
| `/`               | Root              | Redirects to login             |
| `/login`          | LoginForm         | User login                     |
| `/SignUp`         | SignUpForm        | User registration              |
| `/profile-create` | ProfileCreator    | User profile setup             |
| `/video-test`     | VideoTestCard     | Device testing                 |
| `/interview-room/$sessionId` | InterviewRoom | Interview interface |

---

## 📚 Documentation

The project includes comprehensive JSDoc documentation for all components, hooks, and utilities:

### Documentation Standards
- **File Overview**: Each file includes a detailed description of its purpose and role in the system.
- **Function Documentation**: All functions include parameter descriptions, return types, examples, and error handling.
- **Component Documentation**: React components include prop interfaces, usage examples, and side effects.
- **Hook Documentation**: Custom hooks include return value descriptions and usage patterns.
- **Error Handling**: Documents known issues, limitations, and error scenarios.
- **Design Decisions**: Explains architectural choices and implementation rationale.

### Documentation Coverage
- ✅ Main application files (`App.tsx`, `main.tsx`)
- ✅ Authentication components and helpers
- ✅ Common UI components
- ✅ Context providers
- ✅ Custom hooks (media devices, audio detection, WebSocket)
- ✅ Helper functions
- ✅ Route configurations
- ✅ Asset components

---

## 🧩 Dependencies

### Main (`package.json`)

| Package                | Purpose                        |
|------------------------|---------------------------------|
| react, react-dom       | UI framework                    |
| @tanstack/react-router | Routing                         |
| @tanstack/react-query  | Server state management         |
| firebase               | Auth/backend integration        |
| react-hook-form        | Form state management           |
| yup                    | Schema validation               |
| @emotion/styled        | CSS-in-JS styling               |
| react-toastify         | Toast notifications             |
| lucide-react           | Icon set                        |
| @sapphi-red/web-noise-suppressor | Audio noise suppression |

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

### Adding New Components
- Create components in `src/Components/` with appropriate subdirectories
- Add JSDoc documentation following the established template
- Include TypeScript interfaces for props
- Add to relevant route configurations

### Adding New Hooks
- Create hooks in `src/Hooks/` directory
- Include comprehensive JSDoc documentation
- Define return type interfaces
- Document side effects and error handling

### Adding New Routes
- Create route files in `src/routes/`
- Update route tree generation
- Add authentication guards where needed
- Include route-specific documentation

### Adding New Types
- Define types in `src/Types/` with appropriate subdirectories
- Use descriptive names and comprehensive interfaces
- Include JSDoc comments for complex types

---

## 📞 Health Check Example
```bash
curl http://localhost:80/health
# Response: ok
```

---

## 👨‍💻 Author

**kcaparas1630@gmail.com**

This project features comprehensive JSDoc documentation for maintainable, well-documented code that follows industry best practices for React and TypeScript development.
