# Hastag Team App: Developer Handoff Guide

This documentation serves as a comprehensive overview of the recent architectural changes, optimizations, and CRM features implemented inside the `hastag-team-app` environment. 

---

## 1. CRM Architecture Transformation (Shopify-Style Layout)
The primary objective of the last sprint was to transition the management backend from a standard dashboard into a structurally robust CRM platform capable of managing Employees, Clients, and overarching Data Analytics in isolation.

### `AdminDashboard.tsx`
* **Timeline Feed Tracker**: A real-time chronological timeline feed maps `Task` generation and `Session` starts utilizing `date-fns` sorting. It reads from Postgres seamlessly bypassing static views.
* **Recharts Integration**: Implemented `<PieChart />` dynamically grouping total task throughput (`Done`, `Ongoing`, `Pending`). It provides an instantaneous view of Company execution health globally.
* **Component Usage**: `AdminDashboard.tsx` makes heavy use of Framer Motion (`<MotionCard delay={...} />`) to sequentially load rich data without jarring Layout Shifts.

### `AdminClients.tsx` (New Hub)
* **Creation**: Because mixing Employees and Clients confused management tracking, a strict `/admin/clients` layer was shipped bridging profiles tagged with the `'client'` role in `user_roles`.
* **LTV Assembly**: The client hub executes secondary queries against `deals` mapped through `projects` specifically to calculate **Total Deal LTV** (Lifetime Value) per client directly in the UI map function.

---

## 2. Deep Metrics Tracking
We scaled accountability by tracking friction data points, not just output data points.

### `AdminEmployeeDetail.tsx`
* **Break Time Mechanics**: Inside the fetching pipeline mapping `DayLog` intervals, the application now recursively extracts `s.break_time` generated from Employee `sessions`.
* **Isolated Reporting**: Mathematical calculations (`Array.prototype.reduce()`) map the breaks out securely to compute absolute Monthly and Weekly total break volumes. The data visually renders in Orange to stand apart from active working hours.

---

## 3. High-Concurrency & WebRTC Fixes
The app failed under heavy concurrent loads and shared window scenarios. These root causes have been terminated.

* **Playwright Suite**: `test/concurrency.spec.ts` handles complex integration tests mapping parallel simulated sessions across **4 distinct roles** (Admin, Client, Sales, Employee) ensuring massive server stress doesn't drop connections.
* **Session Collisions (`supabase/client.ts`)**: We transitioned Supabase's baseline cache from memory/localStorage towards `sessionStorage` avoiding multi-tab logout collisions while developing.
* **WebSockets Realtime Streams (`useTasks.ts`)**: We embedded a native `supabase.channel` to silently receive database inserts globally.
* **WebRTC Pipeline (`useWebRTC.ts`)**: The Peer-to-Peer streaming interface was rewritten utilizing a `Map()` object, allowing multiple targets to intercept standard Remote Streams safely rather than Cannibalizing the single default `RTCPeerConnection` object.

---

## 4. UI/UX Refactors & Globalizations

### 1-Click Task Workflow (`TaskList.tsx`)
* **Deprecation of Forms**: Employees no longer rely on dropdowns to record statuses. 
* **State Mapping**: We mapped custom toggle states directly over the array loop using localized API handlers to hit `updateTask()` rotating the string natively (`pending` ➔ `ongoing` ➔ `done`), visually altering standard `<Circle />` indicators to `<Check />`.

### Global Work Room (`WorkRoom.tsx`)
* **Removal of Partitioning**: Spliced off the `agency-work-room-{team}` partitions allowing universal CRM wide access pointing strictly to the `agency-work-room-global-hub`.
* **Role Restructures**: Disconnected the rigid Employee `<AppLayout requiredRole="employee" />` restriction, permitting Admins, Sales, and Clients lateral navigation into the WebRTC Jitsi hub natively from their isolated sidebars.

---

## 5. Critical Database Bug Addressed
**The Issue**: Employees were encountering silent view crashes preventing access to Client projects specifically inside `ProjectDetailsLead.tsx`.
**The Cause**: The Supabase relational query `profiles!project_tasks_assigned_to_fkey(name)` was strictly invalid because the `assigned_to` foreign key dynamically points to the internal `auth.users(id)` schema rather than the frontend `profiles(user_id)` table.
**The Fix**: Rewritten the retrieval map structure to invoke independent fetch calls retrieving baseline tasks, and mapping explicit `user_id` correlations securely via JS arrays avoiding the underlying Postgres layout restriction entirely.
