# Hastag Team App: Complete Project Overview

## What is the Hastag Team App?
The **Hastag Team App** is a highly specialized, remote-first internal CRM and operational command center. Designed for digital agencies and remote startups, it bridges the gap between project management, employee tracking, client relations, and persistent communication into a single unified platform. 

Unlike off-the-shelf solutions, this application integrates strict operational friction (e.g., forcing employees to log tasks before they can clock in) alongside advanced WebRTC live-monitoring and Shopify-style analytics.

---

## Technical Stack
* **Frontend Layer**: React 18, Vite (for lightning-fast HMR builds), TypeScript.
* **Styling & UI**: Tailwind CSS coupled with `shadcn/ui` for high-end, accessible, and glassmorphic micro-components. `Framer Motion` powers the layout transitions. `Recharts` drives the SVG analytics.
* **Backend Database**: Supabase (PostgreSQL).
* **Authentication**: Supabase Auth (Row Level Security enforcing role-boundaries).
* **Real-time Sync**: Supabase Realtime (WebSockets mapping multi-user concurrency).
* **Video/Audio**: Injected Jitsi Meet React SDK layered over WebRTC.
* **Testing Engine**: Playwright (capable of triggering 4+ complex browser instances simultaneously to load-test realtime chat and database writes).

---

## Core Domain Modules

### 1. Role-Based Access Control (RBAC) System
Access is strictly delineated across Four Macro-Roles, orchestrated via a PostgreSQL `user_roles` architecture:
* **Admins**: Root-level executives. They receive widespread dashboard reporting, can view LTVs, assign tasks, and monitor active employee screens natively.
* **Employees**: Workhorses. They enter the system, assign priorities, manage granular task execution, and transmit project-specific milestones up the chain.
* **Clients**: Read-only oversight. They possess a locked-down dashboard view to monitor the specific tasks and updates attached *only* to the projects they fund.
* **Sales**: Deal engineers. Specialized views tailored heavily towards drafting new deals, onboarding clients, and managing internal project kickoffs.

### 2. The Operational CRM Tracker
Where traditional apps simply list tasks, this system *measures* work:
* **Session Economics**: Employees hit a "Start Work" gate. The system maps `start_time`, `end_time`, and recursively accumulates `break_time` logs natively in the PostgreSQL `sessions` schema.
* **Analytics Conversion**: The `AdminEmployeeDetail.tsx` engine continuously aggregates these records, outputting strict Daily, Weekly, and Monthly arrays comparing Hours vs Tasks vs Breaks side-by-side.
* **Clients LTV**: Admins possess a master CRM view tracking all individual clients, mapping their active projects backward into the `deals` architecture to aggregate exact **Total Deal Values** instantly.

### 3. "Work Room" Architecture Global Hub
Instead of relying on Zoom or external links, the application features an "always-on" global intercom system.
* **Jitsi WebRTC Injection**: Tapping the "Work Room" sidebar icon routes ANY user into `agency-work-room-global-hub`. Employees, Clients, and Admins can seamlessly fluidly drop in and out of active voice/video collaboration without leaving the localized React boundary. 

### 4. Project Life-Cycle Management
Projects act as the atomic container anchoring the entire agency:
* **Project Memberships**: Users are attached to Projects via `project_members`, unlocking visibility on customized arrays.
* **Granular Feed Tracking**: Employees log isolated "Updates." A Boolean flag dictates if that update pushes directly to the dashboard, or requires explicit Client Approval (`is_approved`) via standard Database Row Level locks.
* **Task Management**: Fully interactive 1-click status manipulation toggling operations from `Pending` -> `Ongoing` -> `Done`.

### 5. Multi-Level E2E Testing
Located in `/test/concurrency.spec.ts`, the app deploys an aggressive, fully autonomous testing mechanism.
* It spins up `BrowserContext` arrays, effectively mimicking up to 7 distinct human operators traversing the app—Admins validating screens, Sales updating deals, Clients checking read-only ports, and multiple Employees managing tasks—resolving concurrently without crashing the Supabase pipelines.
