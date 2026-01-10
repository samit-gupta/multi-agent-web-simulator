/********************
 * CONFIG & GLOBALS
 ********************/
const GRID_SIZE = 10;
const grid = document.getElementById("grid");
const selector = document.getElementById("robotSelector");
const algoSelect = document.getElementById("algoSelect");
const metricsPanel = document.getElementById("metrics");
const metricsBody = document.getElementById("metricsBody");
const agentCountSlider = document.getElementById("agentCount");
const agentCountLabel = document.getElementById("agentCountLabel");
const robotButtonsContainer = document.getElementById("robotButtons");

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
 * AGENT GENERATION
 ********************/
let agents = [];

function generateAgents(count) {
    agents = [];
    for (let i = 0; i < count; i++) {
        agents.push(
            new Agent(
                i + 1,
                i % GRID_SIZE,
                (GRID_SIZE - 1 - i) % GRID_SIZE,
                "BFS"
            )
        );
    }
}

/********************
 * ROBOT SELECTOR (DYNAMIC)
 ********************/
function updateRobotSelector() {
    robotButtonsContainer.innerHTML = "";

    agents.forEach(agent => {
        const btn = document.createElement("button");
        btn.textContent = `Robot ${agent.id}`;
        btn.onclick = () => {
            agent.algorithm = algoSelect.value;
            agent.target = selectedTarget;
            agent.plan(GRID_SIZE);

            selector.classList.add("hidden");
            selectedTarget = null;
        };

        robotButtonsContainer.appendChild(btn);
    });
}

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
            updateRobotSelector();
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
        cell.style.backgroundColor =
            a.id % 2 === 0 ? "#ff6b6b" : "#4f7cff";
    });
}

/********************
 * BFS + A* (UNCHANGED)
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
            if (nr>=0 && nc>=0 && nr<size && nc<size &&
                !visited[nr][nc] && !isOccupied(nr,nc,agent)) {
                visited[nr][nc] = true;
                parent[`${nr},${nc}`] = [r,c];
                q.push([nr,nc]);
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

    return {
        path,
        nodesVisited,
        executionTime: (performance.now() - startTime).toFixed(2)
    };
}

function heuristic(a, b) {
    return Math.abs(a[0]-b[0]) + Math.abs(a[1]-b[1]);
}

function astar(sr, sc, tr, tc, size, agent) {
    const startTime = performance.now();
    let open = [[sr, sc]];
    let parent = {};
    let gScore = { [`${sr},${sc}`]: 0 };
    let fScore = { [`${sr},${sc}`]: heuristic([sr,sc],[tr,tc]) };
    let nodesVisited = 0;

    while (open.length) {
        open.sort((a,b)=>fScore[`${a[0]},${a[1]}`]-fScore[`${b[0]},${b[1]}`]);
        let [r,c] = open.shift();
        nodesVisited++;
        if (r===tr && c===tc) break;

        for (let [dr,dc] of [[1,0],[-1,0],[0,1],[0,-1]]) {
            let nr=r+dr,nc=c+dc;
            if (nr<0||nc<0||nr>=size||nc>=size||isOccupied(nr,nc,agent)) continue;

            let g = gScore[`${r},${c}`] + 1;
            if (g < (gScore[`${nr},${nc}`] ?? Infinity)) {
                parent[`${nr},${nc}`] = [r,c];
                gScore[`${nr},${nc}`] = g;
                fScore[`${nr},${nc}`] = g + heuristic([nr,nc],[tr,tc]);
                open.push([nr,nc]);
            }
        }
    }

    let path=[],cur=[tr,tc];
    while (!(cur[0]===sr && cur[1]===sc)) {
        path.unshift(cur);
        cur = parent[`${cur[0]},${cur[1]}`];
        if (!cur) return { path: [], nodesVisited, executionTime: 0 };
    }

    return {
        path,
        nodesVisited,
        executionTime: (performance.now() - startTime).toFixed(2)
    };
}

/********************
 * MOVEMENT
 ********************/
function moveAgents() {
    agents.forEach(a => {
        if (!a.path.length) return;
        let [r,c] = a.path[0];
        if (!isOccupied(r,c,a)) {
            a.row=r; a.col=c; a.path.shift();
        }
    });
    draw();
}

/********************
 * UI
 ********************/
agentCountSlider.oninput = () => agentCountLabel.textContent = agentCountSlider.value;

startBtn.onclick = () => {
    if (!intervalId) intervalId = setInterval(moveAgents, 300);
};

resetBtn.onclick = () => {
    clearInterval(intervalId);
    intervalId = null;
    metricsBody.innerHTML="";
    metricsPanel.classList.add("hidden");
    generateAgents(Number(agentCountSlider.value));
    createGrid();
    draw();
};

/********************
 * INIT
 ********************/
generateAgents(Number(agentCountSlider.value));
createGrid();
draw();
