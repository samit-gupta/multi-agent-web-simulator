const GRID_SIZE = 10;
const grid = document.getElementById("grid");
const selector = document.getElementById("robotSelector");

let cells = [];
let intervalId = null;
let selectedTarget = null;

// Agents
let agents = [
    { id: 1, row: 0, col: 0, path: [], target: null },
    { id: 2, row: 9, col: 9, path: [], target: null }
];

// Helpers
function getIndex(r, c) {
    return r * GRID_SIZE + c;
}

function isOccupied(r, c, curr) {
    return agents.some(a => a !== curr && a.row === r && a.col === c);
}

// Grid
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

// Draw
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

// BFS Path
function findPath(sr, sc, tr, tc, agent) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    let q = [[sr, sc]];
    let visited = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false));
    let parent = {};

    visited[sr][sc] = true;

    while (q.length) {
        let [r, c] = q.shift();
        if (r === tr && c === tc) break;

        for (let [dr, dc] of dirs) {
            let nr = r + dr, nc = c + dc;
            if (nr>=0 && nc>=0 && nr<GRID_SIZE && nc<GRID_SIZE &&
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
        if (!cur) return [];
    }
    return path;
}

// Movement
function moveAgents() {
    agents.forEach(a => {
        if (!a.path.length) return;
        let [r,c] = a.path.shift();
        if (!isOccupied(r,c,a)) {
            a.row = r;
            a.col = c;
        }
        if (!a.path.length) a.target = null;
    });
    draw();
}

// Robot selection buttons
document.querySelectorAll("#robotSelector button").forEach(btn => {
    btn.onclick = () => {
        const id = Number(btn.dataset.robot);
        const agent = agents.find(a => a.id === id);
        if (agent && selectedTarget) {
            agent.target = selectedTarget;
            agent.path = findPath(agent.row, agent.col,
                                  selectedTarget.row, selectedTarget.col, agent);
        }
        selector.classList.add("hidden");
        selectedTarget = null;
    };
});

// Controls
startBtn.onclick = () => {
    if (!intervalId) intervalId = setInterval(moveAgents, 300);
};

resetBtn.onclick = () => {
    clearInterval(intervalId);
    intervalId = null;
    agents = [
        { id: 1, row: 0, col: 0, path: [], target: null },
        { id: 2, row: 9, col: 9, path: [], target: null }
    ];
    createGrid();
    draw();
};

// Init
createGrid();
draw();
