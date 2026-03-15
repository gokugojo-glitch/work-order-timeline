# Work Order Timeline

A real-time work order management application built with Angular and Supabase. Visualize, create, and manage work orders across different work centers with a reactive timeline interface.

### 🌐 Live Environments
- **PROD**: [https://work-order-timeline-two.vercel.app/](https://work-order-timeline-two.vercel.app/)
- **IMPL**: [https://work-order-timeline-impl.vercel.app/](https://work-order-timeline-impl.vercel.app/)
- **DEV**: [https://work-order-timeline-dev.vercel.app/](https://work-order-timeline-dev.vercel.app/)

## 💻 Device Support

> [!WARNING]
> This application is currently optimized for **Desktop/PC** environments only. It is not currently mobile-friendly.

### Reasoning:
- **Grid-Based Layout**: The interactive timeline requires substantial screen width to display multiple work centers and a readable schedule simultaneously.
- **Precision Tapping**: Creating and managing work order bars involves small targets and grid-based clicking that are difficult to execute accurately on touchscreens.
- **Fixed Sidebar**: The persistent sidebar providing work center context consumes significant screen real estate on narrow mobile displays.

Generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.2.

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm start
```
Navigate to `http://localhost:4200/`. The app will automatically reload when you modify source files.

### 3. Setup Supabase (Optional)
By default, the app uses `localStorage`. To enable cloud synchronization and real-time updates, see [SUPABASE_SETUP.md](SUPABASE_SETUP.md).

## 🧪 Testing

### Unit Tests
This project uses **Vitest** for unit testing.
```bash
npm test
```
> [!IMPORTANT]
> **Junie** (AI Assistant) was used for writing and refactoring the comprehensive test cases in this project.

### End-to-End Tests
For end-to-end testing with Playwright:
```bash
npm run e2e
```

## 🏗️ Build
To create a production-ready build:
```bash
npm run build
```
Build artifacts are stored in the `dist/` directory.

## 🛠️ Key Features

- **Interactive Timeline**: A dynamic, grid-based visual representation of work orders across multiple work centers.
  - Fixed sidebar with real-time order counts per work center.
  - Smooth horizontal scrolling for exploring long-term schedules.
- **Real-time Synchronization**: Instant multi-user updates powered by Supabase Realtime.
  - Automatic fallback to `localStorage` for zero-configuration local development.
- **Advanced Search & Filtering**:
  - Filter orders by name or work center name simultaneously.
  - Quick filters for status (Open, In Progress, Complete, Blocked) to declutter the view.
- **Comprehensive Work Order Management**:
  - **Create**: Quickly add new orders by clicking any empty space on the grid to pre-assign work center and dates.
  - **Edit**: Dedicated detail panel for updating name, status, and dates with built-in range validation.
  - **Delete**: Instant removal via the context menu or detail panel.
- **Flexible Time Navigation**:
  - **Dynamic Zoom**: Toggle between **Day**, **Week**, and **Month** views.
  - **Easy Browsing**: Jump to **Today** or navigate chronologically with intuitive controls.
- **Contextual UI/UX Enhancements**:
  - Right-click (or menu button) for quick access to common actions.
  - Visual today marker and weekend highlighting for easier planning.
  - Informative tooltips on work order bars.
- **Modern Architecture**:
  - Built with **Angular 19+** using **Signals** for fine-grained reactivity and optimized performance.
  - Fully standalone component architecture for clean and modular code.
- **Auto-Seeding**: Automatically populates with sample data if the database is empty, making it ready for immediate demonstration.
