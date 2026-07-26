# Nakniki Quoridor

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.x-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB.svg?style=flat-square&logo=python)](https://www.python.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-purple.svg?style=flat-square&logo=socketdotio)](https://socket.io/)
[![Supabase](https://img.shields.io/badge/Supabase-black?style=flat-square&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)

🎮 **Play live here:** [nakniki-quoridor.brandale.co.il](https://nakniki-quoridor.brandale.co.il)

A high-fidelity, real-time multiplayer implementation of the classic abstract strategy game **Quoridor**. This system features a highly optimized asynchronous AI engine and real-time socket-based matchmaking lobby synchronization.

---

<p align="center">
  <a href="#-creators">👥 Creators</a> •
  <a href="#-key-core-features">🚀 Key Core Features</a> •
  <a href="#️-technology-stack-breakdown">🛠️ Technology Stack Breakdown</a> •
  <a href="#-game-rules-summary">📜 Game Rules Summary</a>
</p>

---

## 👥 Creators
* **Kfir Eitan** - [GitHub](https://github.com/Kfir15) / [LinkedIn](https://www.linkedin.com/in/kfir-eitan-946153413/)
* **Avi Ben David** - [GitHub](https://github.com/RavHaloof) / [LinkedIn](https://www.linkedin.com/in/%D7%90%D7%91%D7%99-%D7%91%D7%9F-%D7%93%D7%95%D7%93-ba3162413/)

---

## 🚀 Key Core Features

### 🧠 Intelligent AI Engine
* Implements a deeply optimized lookahead **Minimax Algorithm** wrapped with custom heuristics.
* Real-time pathfinding verification validates wall-placement legality synchronously before committing a state mutation, completely preventing rule violations (e.g., locking a player completely out of their goal line).

### ⚡Multiplayer Hub
* Low-latency, bidirectional data streaming powered by a custom abstracted `SocketManager` connection pool.
* Synchronized room creation for both **Public Matchmaking Arena** (with live room lists, automatic host metadata, and ELO calculations) and password-isolated **Private Match Access Keys**.

### 📊 Post-Game Analysis
* Review completed games step-by-step with an integrated engine breakdown of every turn.
* Compares player choices directly against the optimal move discovered by the **analysis AI system**, highlighting positional blunders and strategic opportunities.

### 🏆 Bracket Style Competitions
* Set up tournaments instantly to play directly with strangers or your friends.
* Track standings dynamically through structured bracket stages until the final games determine the ultimate tournament winner.

---

## 🛠️ Technology Stack Breakdown

* **Frontend Core:** React (Vite), TypeScript, Radix UI Themes.
* **Real-Time Network Protocol:** Socket.io-client.
* **Backend & Network State:** Node.js, Express, Socket.io Engine, Supabase.
* **AI Engine:** Python, optimized lookahead Minimax algorithm.
* **Analysis Engine:** Action evaluation system that breaks down individual decisions step-by-step, comparing player actions against engine-backed optimal moves to accelerate player learning.

---

## 📜 Game Rules Summary
1. **Objective:** Reach any cell on your target opposite edge line first.
2. **On Your Turn:** Choose one action:
    * **Move:** Advance one cell orthogonally.
    * **Place a Wall:** Intercept your opponent's pathing vector.
3. *Wall Restraint:* You can never place a wall that completely isolates a pawn from its goal line. A minimum of one valid path matrix must exist at all times.