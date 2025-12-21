# Multi-Agent Coordination Simulator

An interactive web-based simulator that demonstrates multi-agent coordination and navigation on a grid using path planning and obstacle avoidance.

Users can dynamically assign goals to agents, visualize their planned paths, and observe collision-free movement in real time.

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

## ▶️ How to Run Locally

1. Clone the repository:
   ```bash
   git clone <your-repo-link>
