# Multi-Agent Coordination Simulator

## 📌 Overview

A web-based simulator to visualize coordination between multiple agents 
on a grid environment.

---

## 🚀 Features

- Interactive grid-based environment
- Two autonomous agents with unique identities
- Click-to-assign targets using a modern UI (no prompts)
- BFS-based path planning for navigation
- Dynamic obstacle avoidance between agents
- Real-time path visualization
- Clean, modern, dark-themed UI

---

## 🧠 Algorithm Used

**Breadth-First Search (BFS)** is used for path planning.

Each agent computes the shortest collision-free path to the assigned target while treating other agents as dynamic obstacles. The planned path is visualized on the grid, and agents move step-by-step toward their goals.

This approach guarantees:
- Shortest path (if one exists)
- Deterministic behavior
- Reliable obstacle avoidance

---

## 🛠️ Tech Stack

- **HTML** – Structure
- **CSS** – Modern UI & layout
- **JavaScript** – Logic, simulation, and path planning
- **Algorithm** – Breadth-First Search (BFS)

---

## 📸 Demo
<img width="890" height="793" alt="Screenshot 2025-12-27 191415" src="https://github.com/user-attachments/assets/7fd02ebd-d74a-434c-a35b-a0accc2ea6f3" />
<img width="1920" height="819" alt="Screenshot 2025-12-27 191424" src="https://github.com/user-attachments/assets/07159b22-1b48-4a9e-9dfc-ddea69313b33" />


## ▶️ How to Run Locally

1. Clone the repository:
   ```bash
   git clone <your-repo-link>
