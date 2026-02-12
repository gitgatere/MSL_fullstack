# Low-Power Localization Dashboard
## Frontend Application (React + TypeScript + Vite)

---

## 1. Overview

This frontend is the visualization layer for the Low-Power Localization System.

The backend performs signal fingerprinting and proximity classification.  
This frontend:

- Visualizes live scan results
- Displays device presence classification
- Shows system confidence metrics
- Enables demonstration and monitoring
- Provides a polished investor/demo interface

It does NOT perform localization logic.

The system demonstrates how cellular signals (without GPS) can determine indoor proximity with reasonable confidence.

---

## 2. Tech Stack

| Technology | Purpose |
|------------|----------|
| React 18 | UI framework |
| TypeScript | Strict typing and reliability |
| Vite | Fast dev server + build tool |
| Native Fetch API | Backend communication |
| Custom CSS (No frameworks) | Controlled, minimal UI design |

No UI libraries (Material UI, Chakra, Tailwind, etc.) are used to ensure:
- Design consistency
- Lightweight bundle size
- Full styling control

---


