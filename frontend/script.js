/********************
 * CONFIG & GLOBALS
 ********************/
const GRID_SIZE = 10;
const grid = document.getElementById("grid");
const selector = document.getElementById("robotSelector");
const algoSelect = document.getElementById("algoSelect");
const metricsPanel = document.getElementById("metrics");
const metricsBody = document.getElementById("metricsBody");

let cells = [];
let intervalId = null;
let selectedTarget = null;

/********************
 * AGENT CLASS
 ********************/
class Agent {
    constructor(id, row, col, algorithm = "BFS") {
        this.id = id;
        this.row = row;
        this.col = col;
        this.algorithm = algorithm;
        this.path = [];
        this.target = null;
        this.metrics = null;
    }

    plan(gridSize) {
        if (!this.target) return;

        this.metrics =
            this.algorithm === "A_STAR"
                ? astar(this.row, this.col, this.target.row, this.target.col, gridSize, this)
                : bfs(this.row, this.col, this.target.row, this.target.col, gridSize, this);

        this.path = this.metrics.path;
    }
}

/********************
 * AGENTS
 ********************/
let agents = [
    new Agent(1, 0, 0, "BFS"),
    new Agent(2, 9, 9, "A_STAR")
];

/********************
 * HELPERS
 ********************/
function getIndex(r, c) {
    return r * GRID_SIZE + c;
}

function isOccupied(r, c, curr) {
    return agents.some(a => a !== curr && a.row === r && a.col === c);
}

/********************
 * GRID
 ********************/
function createGrid() {
    grid.innerHTML = "";
    cells = [];

    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const cell = document.createElement("div");
        cell.className = "cell";

        cell.onclick = () => {
            selectedTarget = {
                row: Math.floor(i / GRID_SIZE),
                col: i % GRID_SIZE
            };
            selector.classList.remove("hidden");
        };

        grid.appendChild(cell);
        cells.push(cell);
    }
}

/********************
 * DRAWING
 ********************/
function clearGrid() {
    cells.forEach(c => {
        c.className = "cell";
        c.textContent = "";
        c.style.backgroundColor = "";
    });
}

function draw() {
    clearGrid();

    agents.forEach(a => {
        a.path.forEach(([r, c]) =>
            cells[getIndex(r, c)].classList.add("path")
        );

        if (a.target)
            cells[getIndex(a.target.row, a.target.col)].classList.add("target");
    });

    agents.forEach(a => {
        const cell = cells[getIndex(a.row, a.col)];
        cell.classList.add("agent");
        cell.textContent = a.id;
        cell.style.backgroundColor = a.id === 1 ? "#4f7cff" : "#ff6b6b";
    });
}

/********************
 * BFS WITH METRICS
 ********************/
function bfs(sr, sc, tr, tc, size, agent) {
    const startTime = performance.now();
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];

    let q = [[sr, sc]];
    let visited = Array(size).fill().map(() => Array(size).fill(false));
    let parent = {};
    let nodesVisited = 0;

    visited[sr][sc] = true;

    while (q.length) {
        let [r, c] = q.shift();
        nodesVisited++;

        if (r === tr && c === tc) break;

        for (let [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            if (
                nr >= 0 && nc >= 0 && nr < size && nc < size &&
                !visited[nr][nc] &&
                !isOccupied(nr, nc, agent)
            ) {
                visited[nr][nc] = true;
                parent[`${nr},${nc}`] = [r, c];
                q.push([nr, nc]);
            }
        }
    }

    let path = [];
    let cur = [tr, tc];
    while (!(cur[0] === sr && cur[1] === sc)) {
        path.unshift(cur);
        cur = parent[`${cur[0]},${cur[1]}`];
        if (!cur) return { path: [], nodesVisited, executionTime: 0 };
    }

    const endTime = performance.now();

    return {
        path,
        nodesVisited,
        executionTime: (endTime - startTime).toFixed(2)
    };
}

/********************
 * A* WITH METRICS
 ********************/
function heuristic(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function astar(sr, sc, tr, tc, size, agent) {
    const startTime = performance.now();
    let open = [[sr, sc]];
    let parent = {};
    let gScore = {};
    let fScore = {};
    let nodesVisited = 0;

    gScore[`${sr},${sc}`] = 0;
    fScore[`${sr},${sc}`] = heuristic([sr, sc], [tr, tc]);

    while (open.length) {
        open.sort((a, b) =>
            fScore[`${a[0]},${a[1]}`] - fScore[`${b[0]},${b[1]}`]
        );

        let [r, c] = open.shift();
        nodesVisited++;

        if (r === tr && c === tc) break;

        for (let [dr, dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            let nr = r + dr, nc = c + dc;
            if (
                nr < 0 || nc < 0 || nr >= size || nc >= size ||
                isOccupied(nr, nc, agent)
            ) continue;

            let tentative = gScore[`${r},${c}`] + 1;
            let key = `${nr},${nc}`;

            if (tentative < (gScore[key] ?? Infinity)) {
                parent[key] = [r, c];
                gScore[key] = tentative;
                fScore[key] = tentative + heuristic([nr, nc], [tr, tc]);
                if (!open.some(p => p[0] === nr && p[1] === nc))
                    open.push([nr, nc]);
            }
        }
    }

    let path = [];
    let cur = [tr, tc];
    while (!(cur[0] === sr && cur[1] === sc)) {
        path.unshift(cur);
        cur = parent[`${cur[0]},${cur[1]}`];
        if (!cur) return { path: [], nodesVisited, executionTime: 0 };
    }

    const endTime = performance.now();

    return {
        path,
        nodesVisited,
        executionTime: (endTime - startTime).toFixed(2)
    };
}

/********************
 * MOVEMENT + METRICS
 ********************/
function moveAgents() {
    agents.forEach(a => {
        if (!a.path.length) return;

        let [r, c] = a.path[0];
        if (!isOccupied(r, c, a)) {
            a.row = r;
            a.col = c;
            a.path.shift();
        }

        if (!a.path.length && a.metrics) {
            metricsPanel.classList.remove("hidden");

            metricsBody.innerHTML += `
                <tr>
                    <td>${a.id}</td>
                    <td>${a.algorithm}</td>
                    <td>${a.metrics.path.length}</td>
                    <td>${a.metrics.nodesVisited}</td>
                    <td>${a.metrics.executionTime}</td>
                </tr>
            `;

            a.target = null;
        }
    });

    draw();
}

/********************
 * UI CONTROLS
 ********************/
document.querySelectorAll("#robotSelector button").forEach(btn => {
    btn.onclick = () => {
        const id = Number(btn.dataset.robot);
        const agent = agents.find(a => a.id === id);

        if (agent && selectedTarget) {
            agent.algorithm = algoSelect.value; // 🔥 HTML integration
            agent.target = selectedTarget;
            agent.plan(GRID_SIZE);
        }

        selector.classList.add("hidden");
        selectedTarget = null;
    };
});

startBtn.onclick = () => {
    if (!intervalId) intervalId = setInterval(moveAgents, 300);
};

resetBtn.onclick = () => {
    clearInterval(intervalId);
    intervalId = null;

    metricsBody.innerHTML = "";
    metricsPanel.classList.add("hidden");

    agents = [
        new Agent(1, 0, 0, "BFS"),
        new Agent(2, 9, 9, "A_STAR")
    ];

    createGrid();
    draw();
};

/********************
 * INIT
 ********************/
createGrid();
draw();
