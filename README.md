npm run setup:admin
```
ManoMitra
├─ agentic-server
│  ├─ .python-version
│  ├─ app
│  │  ├─ agents
│  │  │  ├─ supervisor.py
│  │  │  ├─ __init__.py
│  │  │  └─ __pycache__
│  │  │     ├─ supervisor.cpython-311.pyc
│  │  │     └─ __init__.cpython-311.pyc
│  │  ├─ config.py
│  │  ├─ main.py
│  │  ├─ schemas
│  │  │  ├─ demo_report.py
│  │  │  ├─ standard_report.py
│  │  │  ├─ __init__.py
│  │  │  └─ __pycache__
│  │  │     ├─ demo_report.cpython-311.pyc
│  │  │     ├─ standard_report.cpython-311.pyc
│  │  │     └─ __init__.cpython-311.pyc
│  │  ├─ services
│  │  │  ├─ report_service.py
│  │  │  ├─ __init__.py
│  │  │  └─ __pycache__
│  │  │     ├─ report_service.cpython-311.pyc
│  │  │     └─ __init__.cpython-311.pyc
│  │  ├─ tools
│  │  │  ├─ search_tools.py
│  │  │  ├─ __init__.py
│  │  │  └─ __pycache__
│  │  │     ├─ search_tools.cpython-311.pyc
│  │  │     └─ __init__.cpython-311.pyc
│  │  ├─ utils
│  │  │  ├─ logger.py
│  │  │  ├─ __init__.py
│  │  │  └─ __pycache__
│  │  │     ├─ logger.cpython-311.pyc
│  │  │     └─ __init__.cpython-311.pyc
│  │  ├─ __init__.py
│  │  └─ __pycache__
│  │     ├─ config.cpython-311.pyc
│  │     ├─ main.cpython-311.pyc
│  │     └─ __init__.cpython-311.pyc
│  ├─ Docs
│  │  ├─ agent-info.md
│  │  ├─ agent-workflow.md
│  │  ├─ demo-conversasion.md
│  │  ├─ ex.md
│  │  ├─ final-response.json
│  │  ├─ folder-struct.md
│  │  ├─ report.md
│  │  ├─ system-instruction.md
│  │  ├─ tools.md
│  │  └─ x
│  │     ├─ main.txt
│  │     ├─ report_service.txt
│  │     └─ supervisor.txt
│  ├─ pyproject.toml
│  ├─ README.md
│  ├─ requirements.txt
│  └─ uv.lock
├─ README.md
├─ server
│  ├─ auth
│  │  └─ jwt.js
│  ├─ constants
│  │  ├─ peer.js
│  │  └─ roles.js
│  ├─ controllers
│  │  ├─ admin.controller.js
│  │  ├─ auth.controller.js
│  │  ├─ booking.controller.js
│  │  ├─ conversation.controller.js
│  │  ├─ counsellor.controller.js
│  │  ├─ feedback.controller.js
│  │  ├─ notification.controller.js
│  │  ├─ report.controller.js
│  │  ├─ room.controller.js
│  │  ├─ student.controller.js
│  │  └─ volunteer.controller.js
│  ├─ create-dirs.sh
│  ├─ db
│  │  └─ connectDB.js
│  ├─ ensure-dirs.js
│  ├─ logs
│  │  ├─ access.log
│  │  ├─ combined.log
│  │  └─ error.log
│  ├─ middlewares
│  │  ├─ auth.middleware.js
│  │  ├─ error.middleware.js
│  │  ├─ logging.middleware.js
│  │  ├─ notFound.middleware.js
│  │  ├─ role.middleware.js
│  │  ├─ sanitize.middleware.js
│  │  ├─ upload.middleware.js
│  │  └─ validation.middleware.js
│  ├─ models
│  │  ├─ admin.model.js
│  │  ├─ booking.model.js
│  │  ├─ conversation.model.js
│  │  ├─ counsellor.model.js
│  │  ├─ feedback.model.js
│  │  ├─ message.model.js
│  │  ├─ notification.model.js
│  │  ├─ privateMessage.model.js
│  │  ├─ report.model.js
│  │  ├─ room.model.js
│  │  ├─ student.model.js
│  │  └─ volunteer.model.js
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ routes
│  │  ├─ admin.routes.js
│  │  ├─ auth.routes.js
│  │  ├─ booking.routes.js
│  │  ├─ conversation.routes.js
│  │  ├─ counsellor.routes.js
│  │  ├─ feedback.routes.js
│  │  ├─ notification.routes.js
│  │  ├─ report.routes.js
│  │  ├─ room.routes.js
│  │  ├─ student.routes.js
│  │  └─ volunteer.routes.js
│  ├─ scripts
│  │  └─ createSuperAdmin.js
│  ├─ server.js
│  └─ uploads
│     ├─ documents
│     ├─ profiles
│     └─ reports
└─ web
   ├─ app
   │  ├─ (auth)
   │  │  ├─ forgot-password
   │  │  │  └─ page.tsx
   │  │  ├─ login
   │  │  │  └─ page.tsx
   │  │  ├─ register
   │  │  │  └─ page.tsx
   │  │  └─ reset-password
   │  │     └─ [token]
   │  │        └─ page.tsx
   │  ├─ (chat)
   │  │  └─ chat
   │  │     ├─ page.tsx
   │  │     └─ [topic]
   │  │        └─ page.tsx
   │  ├─ (dashboard)
   │  │  ├─ admin
   │  │  │  ├─ analytics
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ counsellors
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ feedback
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ notifications
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ page.tsx
   │  │  │  ├─ profile
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ reports
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ rooms
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ students
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ system
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ users
   │  │  │  │  ├─ page.tsx
   │  │  │  │  └─ [userModel]
   │  │  │  │     └─ [userId]
   │  │  │  │        └─ page.tsx
   │  │  │  └─ volunteers
   │  │  │     └─ page.tsx
   │  │  ├─ counsellor
   │  │  │  ├─ notifications
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ page.tsx
   │  │  │  ├─ performance
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ profile
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ reports
   │  │  │  │  ├─ page.tsx
   │  │  │  │  └─ [id]
   │  │  │  │     └─ page.tsx
   │  │  │  ├─ schedule
   │  │  │  │  └─ page.tsx
   │  │  │  └─ students
   │  │  │     └─ page.tsx
   │  │  ├─ help
   │  │  │  └─ page.tsx
   │  │  ├─ layout.tsx
   │  │  ├─ messages
   │  │  │  ├─ page.tsx
   │  │  │  └─ [userId]
   │  │  │     └─ [role]
   │  │  │        └─ page.tsx
   │  │  ├─ page.tsx
   │  │  ├─ settings
   │  │  │  └─ page.tsx
   │  │  ├─ student
   │  │  │  ├─ bookings
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ chat
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ counsellors
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ create-report
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ feedback
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ notifications
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ page.tsx
   │  │  │  ├─ profile
   │  │  │  │  └─ page.tsx
   │  │  │  ├─ reports
   │  │  │  │  └─ page.tsx
   │  │  │  └─ volunteers
   │  │  │     └─ page.tsx
   │  │  └─ volunteer
   │  │     ├─ feedback
   │  │     │  └─ page.tsx
   │  │     ├─ notifications
   │  │     │  └─ page.tsx
   │  │     ├─ page.tsx
   │  │     ├─ performance
   │  │     │  └─ page.tsx
   │  │     ├─ profile
   │  │     │  └─ page.tsx
   │  │     ├─ rooms
   │  │     │  └─ page.tsx
   │  │     ├─ students
   │  │     │  └─ page.tsx
   │  │     └─ training
   │  │        └─ page.tsx
   │  ├─ api
   │  │  └─ chat
   │  │     └─ route.ts
   │  ├─ chat-bot
   │  │  └─ page.tsx
   │  ├─ components
   │  │  └─ CameraPreview.tsx
   │  ├─ conversational-bot
   │  │  └─ page.tsx
   │  ├─ favicon.ico
   │  ├─ globals.css
   │  ├─ layout.tsx
   │  ├─ page.tsx
   │  ├─ pre-dashboard
   │  │  └─ page.tsx
   │  ├─ services
   │  │  ├─ geminiWebSocket.ts
   │  │  ├─ prompt.ts
   │  │  └─ transcriptionService.ts
   │  └─ utils
   │     └─ audioUtils.ts
   ├─ components
   │  ├─ ai-elements
   │  │  ├─ actions.tsx
   │  │  ├─ branch.tsx
   │  │  ├─ code-block.tsx
   │  │  ├─ conversation.tsx
   │  │  ├─ image.tsx
   │  │  ├─ inline-citation.tsx
   │  │  ├─ loader.tsx
   │  │  ├─ message.tsx
   │  │  ├─ prompt-input.tsx
   │  │  ├─ reasoning.tsx
   │  │  ├─ response.tsx
   │  │  ├─ sources.tsx
   │  │  ├─ suggestion.tsx
   │  │  ├─ task.tsx
   │  │  ├─ tool.tsx
   │  │  └─ web-preview.tsx
   │  ├─ error-boundary.tsx
   │  ├─ forms
   │  │  ├─ ChangePasswordForm.tsx
   │  │  ├─ CreateBookingForm.tsx
   │  │  ├─ CreateCounsellorForm.tsx
   │  │  └─ UpdateAvailabilityForm.tsx
   │  ├─ layout
   │  │  ├─ header.tsx
   │  │  ├─ sidebar.tsx
   │  │  └─ SidebarNav.tsx
   │  ├─ notifications
   │  │  └─ NotificationCenter.tsx
   │  └─ ui
   │     ├─ accordion.tsx
   │     ├─ alert-dialog.tsx
   │     ├─ avatar.tsx
   │     ├─ badge.tsx
   │     ├─ button.tsx
   │     ├─ calendar.tsx
   │     ├─ card.tsx
   │     ├─ carousel.tsx
   │     ├─ checkbox.tsx
   │     ├─ collapsible.tsx
   │     ├─ dialog.tsx
   │     ├─ dropdown-menu.tsx
   │     ├─ form.tsx
   │     ├─ hover-card.tsx
   │     ├─ input.tsx
   │     ├─ label.tsx
   │     ├─ popover.tsx
   │     ├─ progress.tsx
   │     ├─ radio-group.tsx
   │     ├─ responsive-container.tsx
   │     ├─ scroll-area.tsx
   │     ├─ select.tsx
   │     ├─ sonner.tsx
   │     ├─ spinner.tsx
   │     ├─ switch.tsx
   │     ├─ table.tsx
   │     ├─ tabs.tsx
   │     ├─ textarea.tsx
   │     └─ tooltip.tsx
   ├─ components.json
   ├─ env.example
   ├─ eslint.config.mjs
   ├─ hooks
   │  ├─ api
   │  │  ├─ useAdmin.ts
   │  │  ├─ useAuth.ts
   │  │  ├─ useBookings.ts
   │  │  ├─ useConversations.ts
   │  │  ├─ useCounsellors.ts
   │  │  ├─ useFeedback.ts
   │  │  ├─ useNotifications.ts
   │  │  ├─ useReports.ts
   │  │  ├─ useRooms.ts
   │  │  ├─ useStudents.ts
   │  │  └─ useVolunteers.ts
   │  ├─ useActivityTracker.ts
   │  └─ useSocket.ts
   ├─ install-deps.sh
   ├─ lib
   │  ├─ api.ts
   │  ├─ axios.ts
   │  ├─ constants.ts
   │  └─ utils.ts
   ├─ middleware.ts
   ├─ next-env.d.ts
   ├─ next.config.ts
   ├─ package-lock.json
   ├─ package.json
   ├─ postcss.config.mjs
   ├─ providers
   │  ├─ auth-provider.tsx
   │  ├─ query-provider.tsx
   │  └─ theme-provider.tsx
   ├─ public
   │  ├─ avatars
   │  │  └─ gemini.png
   │  ├─ file.svg
   │  ├─ globe.svg
   │  ├─ next.svg
   │  ├─ vercel.svg
   │  ├─ window.svg
   │  └─ worklets
   │     └─ audio-processor.js
   ├─ store
   │  └─ auth.store.ts
   ├─ tsconfig.json
   └─ types
      └─ auth.d.ts

```