// Gestione del menu principale e navigazione
let currentGame = null;

function selectGame(gameName) {
    currentGame = gameName;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-container').classList.remove('hidden');
    
    const gameTitle = document.getElementById('game-title');
    const gameContent = document.getElementById('game-content');
    
    switch(gameName) {
        case 'hanoi':
            gameTitle.textContent = 'Torre di Hanoi';
            gameContent.innerHTML = getHanoiHTML();
            initHanoi();
            break;
        case 'minesweeper':
            gameTitle.textContent = 'Prato Fiorito';
            gameContent.innerHTML = getMinesweeperHTML();
            initMinesweeper();
            break;
        case 'snake':
            gameTitle.textContent = 'Snake';
            gameContent.innerHTML = getSnakeHTML();
            initSnake();
            break;
    }
}

function backToMenu() {
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('game-container').classList.add('hidden');
    
    // Ferma eventuali timer attivi
    if (currentGame === 'snake' && snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
    }
    
    currentGame = null;
}

// =================== TORRE DI HANOI ===================

let hanoiGame = {
    poles: [[], [], []],
    selectedDisk: null,
    selectedPole: null,
    moves: 0,
    numberOfDisks: 3
};

function getHanoiHTML() {
    return `
        <div class="hanoi-container">
            <div class="hanoi-info">
                <p>Obiettivo: Sposta tutti i dischi dalla prima torre alla terza torre.</p>
                <p>Regole: Puoi spostare solo un disco alla volta e non puoi mettere un disco grande sopra uno piccolo.</p>
                <p>Mosse: <span id="hanoi-moves">0</span></p>
            </div>
            
            <div class="hanoi-controls">
                <button onclick="resetHanoi(3)">Facile (3 dischi)</button>
                <button onclick="resetHanoi(4)">Medio (4 dischi)</button>
                <button onclick="resetHanoi(5)">Difficile (5 dischi)</button>
            </div>
            
            <div class="hanoi-game">
                <div class="hanoi-pole" id="pole-0" onclick="selectPole(0)"></div>
                <div class="hanoi-pole" id="pole-1" onclick="selectPole(1)"></div>
                <div class="hanoi-pole" id="pole-2" onclick="selectPole(2)"></div>
            </div>
            
            <div id="hanoi-message"></div>
        </div>
    `;
}

function initHanoi() {
    resetHanoi(3);
}

function resetHanoi(numDisks) {
    hanoiGame.numberOfDisks = numDisks;
    hanoiGame.poles = [[], [], []];
    hanoiGame.selectedDisk = null;
    hanoiGame.selectedPole = null;
    hanoiGame.moves = 0;
    
    // Inizializza i dischi sulla prima torre
    for (let i = numDisks; i >= 1; i--) {
        hanoiGame.poles[0].push(i);
    }
    
    updateHanoiDisplay();
    document.getElementById('hanoi-message').textContent = '';
}

function selectPole(poleIndex) {
    if (hanoiGame.selectedDisk === null) {
        // Seleziona un disco
        if (hanoiGame.poles[poleIndex].length > 0) {
            hanoiGame.selectedDisk = hanoiGame.poles[poleIndex][hanoiGame.poles[poleIndex].length - 1];
            hanoiGame.selectedPole = poleIndex;
            updateHanoiDisplay();
        }
    } else {
        // Sposta il disco
        if (poleIndex === hanoiGame.selectedPole) {
            // Deseleziona
            hanoiGame.selectedDisk = null;
            hanoiGame.selectedPole = null;
        } else {
            // Prova a spostare
            if (canMoveDisk(hanoiGame.selectedDisk, poleIndex)) {
                hanoiGame.poles[hanoiGame.selectedPole].pop();
                hanoiGame.poles[poleIndex].push(hanoiGame.selectedDisk);
                hanoiGame.moves++;
                document.getElementById('hanoi-moves').textContent = hanoiGame.moves;
                
                hanoiGame.selectedDisk = null;
                hanoiGame.selectedPole = null;
                
                if (checkHanoiWin()) {
                    const minMoves = Math.pow(2, hanoiGame.numberOfDisks) - 1;
                    document.getElementById('hanoi-message').innerHTML = 
                        `<h3 style="color: green;">🎉 Complimenti! Hai vinto in ${hanoiGame.moves} mosse!</h3>
                         <p>Mosse minime possibili: ${minMoves}</p>`;
                }
            } else {
                document.getElementById('hanoi-message').innerHTML = 
                    '<p style="color: red;">⚠️ Mossa non valida! Non puoi mettere un disco grande sopra uno piccolo.</p>';
                setTimeout(() => {
                    document.getElementById('hanoi-message').textContent = '';
                }, 2000);
            }
        }
        updateHanoiDisplay();
    }
}

function canMoveDisk(disk, toPole) {
    const targetPole = hanoiGame.poles[toPole];
    return targetPole.length === 0 || targetPole[targetPole.length - 1] > disk;
}

function checkHanoiWin() {
    return hanoiGame.poles[2].length === hanoiGame.numberOfDisks;
}

function updateHanoiDisplay() {
    for (let i = 0; i < 3; i++) {
        const poleElement = document.getElementById(`pole-${i}`);
        poleElement.innerHTML = '';
        
        hanoiGame.poles[i].forEach(diskSize => {
            const diskElement = document.createElement('div');
            diskElement.className = `hanoi-disk disk-${diskSize}`;
            diskElement.onclick = (e) => {
                e.stopPropagation();
                selectPole(i);
            };
            
            if (hanoiGame.selectedDisk === diskSize && hanoiGame.selectedPole === i) {
                diskElement.classList.add('selected');
            }
            
            poleElement.appendChild(diskElement);
        });
    }
}

// =================== PRATO FIORITO ===================

let minesweeperGame = {
    grid: [],
    revealed: [],
    flagged: [],
    mines: [],
    rows: 9,
    cols: 9,
    mineCount: 10,
    gameOver: false,
    gameWon: false,
    firstClick: true
};

function getMinesweeperHTML() {
    return `
        <div class="minesweeper-container">
            <div class="minesweeper-controls">
                <button onclick="initMinesweeper(9, 9, 10)">Facile (9x9, 10 mine)</button>
                <button onclick="initMinesweeper(16, 16, 40)">Medio (16x16, 40 mine)</button>
                <button onclick="initMinesweeper(16, 30, 99)">Difficile (16x30, 99 mine)</button>
            </div>
            
            <div class="minesweeper-info">
                <div>Mine rimanenti: <span id="mines-remaining">10</span></div>
                <div>Stato: <span id="game-status">In corso</span></div>
            </div>
            
            <div id="minesweeper-grid"></div>
            
            <div class="minesweeper-instructions">
                <p><strong>Istruzioni:</strong></p>
                <p>• Click sinistro per rivelare una cella</p>
                <p>• Click destro per mettere/togliere una bandierina</p>
                <p>• I numeri indicano quante mine ci sono nelle celle adiacenti</p>
                <p>• Trova tutte le mine per vincere!</p>
            </div>
        </div>
    `;
}

function initMinesweeper(rows = 9, cols = 9, mines = 10) {
    minesweeperGame = {
        grid: [],
        revealed: [],
        flagged: [],
        mines: [],
        rows: rows,
        cols: cols,
        mineCount: mines,
        gameOver: false,
        gameWon: false,
        firstClick: true
    };
    
    // Inizializza le griglie
    for (let i = 0; i < rows; i++) {
        minesweeperGame.grid[i] = [];
        minesweeperGame.revealed[i] = [];
        minesweeperGame.flagged[i] = [];
        for (let j = 0; j < cols; j++) {
            minesweeperGame.grid[i][j] = 0;
            minesweeperGame.revealed[i][j] = false;
            minesweeperGame.flagged[i][j] = false;
        }
    }
    
    createMinesweeperGrid();
    updateMinesweeperDisplay();
    document.getElementById('mines-remaining').textContent = mines;
    document.getElementById('game-status').textContent = 'In corso';
}

function createMinesweeperGrid() {
    const gridElement = document.getElementById('minesweeper-grid');
    gridElement.innerHTML = '';
    gridElement.className = 'minesweeper-grid';
    
    for (let i = 0; i < minesweeperGame.rows; i++) {
        const rowElement = document.createElement('div');
        rowElement.className = 'minesweeper-row';
        
        for (let j = 0; j < minesweeperGame.cols; j++) {
            const cellElement = document.createElement('div');
            cellElement.className = 'minesweeper-cell';
            cellElement.onclick = () => revealCell(i, j);
            cellElement.oncontextmenu = (e) => {
                e.preventDefault();
                toggleFlag(i, j);
            };
            cellElement.id = `cell-${i}-${j}`;
            
            rowElement.appendChild(cellElement);
        }
        
        gridElement.appendChild(rowElement);
    }
}

function placeMines(excludeRow, excludeCol) {
    let minesPlaced = 0;
    minesweeperGame.mines = [];
    
    while (minesPlaced < minesweeperGame.mineCount) {
        const row = Math.floor(Math.random() * minesweeperGame.rows);
        const col = Math.floor(Math.random() * minesweeperGame.cols);
        
        // Non mettere mine nella prima cella cliccata o dove c'è già una mina
        if ((row === excludeRow && col === excludeCol) || 
            minesweeperGame.mines.some(mine => mine.row === row && mine.col === col)) {
            continue;
        }
        
        minesweeperGame.mines.push({row, col});
        minesweeperGame.grid[row][col] = -1; // -1 indica una mina
        minesPlaced++;
    }
    
    // Calcola i numeri per le celle adiacenti
    for (let i = 0; i < minesweeperGame.rows; i++) {
        for (let j = 0; j < minesweeperGame.cols; j++) {
            if (minesweeperGame.grid[i][j] !== -1) {
                minesweeperGame.grid[i][j] = countAdjacentMines(i, j);
            }
        }
    }
}

function countAdjacentMines(row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < minesweeperGame.rows && 
                newCol >= 0 && newCol < minesweeperGame.cols &&
                minesweeperGame.grid[newRow][newCol] === -1) {
                count++;
            }
        }
    }
    return count;
}

function revealCell(row, col) {
    if (minesweeperGame.gameOver || minesweeperGame.revealed[row][col] || minesweeperGame.flagged[row][col]) {
        return;
    }
    
    if (minesweeperGame.firstClick) {
        placeMines(row, col);
        minesweeperGame.firstClick = false;
    }
    
    minesweeperGame.revealed[row][col] = true;
    
    if (minesweeperGame.grid[row][col] === -1) {
        // Cliccato su una mina
        minesweeperGame.gameOver = true;
        document.getElementById('game-status').textContent = '💥 Game Over!';
        revealAllMines();
    } else if (minesweeperGame.grid[row][col] === 0) {
        // Rivela automaticamente le celle adiacenti se il numero è 0
        revealAdjacentCells(row, col);
    }
    
    updateMinesweeperDisplay();
    checkMinesweeperWin();
}

function revealAdjacentCells(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < minesweeperGame.rows && 
                newCol >= 0 && newCol < minesweeperGame.cols &&
                !minesweeperGame.revealed[newRow][newCol] &&
                !minesweeperGame.flagged[newRow][newCol]) {
                revealCell(newRow, newCol);
            }
        }
    }
}

function toggleFlag(row, col) {
    if (minesweeperGame.gameOver || minesweeperGame.revealed[row][col]) {
        return;
    }
    
    minesweeperGame.flagged[row][col] = !minesweeperGame.flagged[row][col];
    
    const flaggedCount = minesweeperGame.flagged.flat().filter(f => f).length;
    document.getElementById('mines-remaining').textContent = minesweeperGame.mineCount - flaggedCount;
    
    updateMinesweeperDisplay();
}

function revealAllMines() {
    minesweeperGame.mines.forEach(mine => {
        minesweeperGame.revealed[mine.row][mine.col] = true;
    });
}

function checkMinesweeperWin() {
    let revealedSafeCells = 0;
    const totalSafeCells = minesweeperGame.rows * minesweeperGame.cols - minesweeperGame.mineCount;
    
    for (let i = 0; i < minesweeperGame.rows; i++) {
        for (let j = 0; j < minesweeperGame.cols; j++) {
            if (minesweeperGame.revealed[i][j] && minesweeperGame.grid[i][j] !== -1) {
                revealedSafeCells++;
            }
        }
    }
    
    if (revealedSafeCells === totalSafeCells) {
        minesweeperGame.gameWon = true;
        minesweeperGame.gameOver = true;
        document.getElementById('game-status').textContent = '🎉 Hai vinto!';
    }
}

function updateMinesweeperDisplay() {
    for (let i = 0; i < minesweeperGame.rows; i++) {
        for (let j = 0; j < minesweeperGame.cols; j++) {
            const cellElement = document.getElementById(`cell-${i}-${j}`);
            cellElement.className = 'minesweeper-cell';
            cellElement.textContent = '';
            
            if (minesweeperGame.flagged[i][j]) {
                cellElement.classList.add('flagged');
                cellElement.textContent = '🚩';
            } else if (minesweeperGame.revealed[i][j]) {
                cellElement.classList.add('revealed');
                
                if (minesweeperGame.grid[i][j] === -1) {
                    cellElement.classList.add('mine');
                    cellElement.textContent = '💣';
                } else if (minesweeperGame.grid[i][j] > 0) {
                    cellElement.textContent = minesweeperGame.grid[i][j];
                    cellElement.classList.add(`number-${minesweeperGame.grid[i][j]}`);
                }
            }
        }
    }
}

// =================== SNAKE ===================

let snakeGame = {
    canvas: null,
    ctx: null,
    snake: [{x: 10, y: 10}],
    direction: {x: 0, y: 0},
    food: {x: 15, y: 15},
    score: 0,
    gameLoop: null,
    gameRunning: false,
    gridSize: 20,
    tileCount: 20
};

function getSnakeHTML() {
    return `
        <div class="snake-container">
            <div class="snake-controls">
                <button onclick="startSnake()">Inizia Gioco</button>
                <button onclick="pauseSnake()">Pausa</button>
                <button onclick="resetSnake()">Reset</button>
            </div>
            
            <div class="snake-info">
                Punteggio: <span id="snake-score">0</span>
            </div>
            
            <canvas id="snake-canvas" class="snake-game" width="400" height="400"></canvas>
            
            <div class="snake-instructions">
                <p><strong>Istruzioni:</strong></p>
                <p>• Usa le frecce della tastiera per controllare il serpente</p>
                <p>• Mangia il cibo rosso per crescere e guadagnare punti</p>
                <p>• Non colpire i muri o te stesso!</p>
                <p>• Usa WASD come alternativa alle frecce</p>
            </div>
        </div>
    `;
}

function initSnake() {
    snakeGame.canvas = document.getElementById('snake-canvas');
    snakeGame.ctx = snakeGame.canvas.getContext('2d');
    
    resetSnake();
    
    // Event listeners per i controlli
    document.addEventListener('keydown', handleSnakeInput);
    
    drawSnake();
}

function resetSnake() {
    snakeGame.snake = [{x: 10, y: 10}];
    snakeGame.direction = {x: 0, y: 0};
    snakeGame.food = generateFood();
    snakeGame.score = 0;
    snakeGame.gameRunning = false;
    
    if (snakeGame.gameLoop) {
        clearInterval(snakeGame.gameLoop);
    }
    
    document.getElementById('snake-score').textContent = '0';
    drawSnake();
}

function startSnake() {
    if (!snakeGame.gameRunning) {
        snakeGame.gameRunning = true;
        snakeGame.gameLoop = setInterval(updateSnake, 150);
    }
}

function pauseSnake() {
    if (snakeGame.gameRunning) {
        snakeGame.gameRunning = false;
        clearInterval(snakeGame.gameLoop);
    }
}

function updateSnake() {
    const head = {x: snakeGame.snake[0].x + snakeGame.direction.x, y: snakeGame.snake[0].y + snakeGame.direction.y};
    
    // Controlla collisioni con i muri
    if (head.x < 0 || head.x >= snakeGame.tileCount || head.y < 0 || head.y >= snakeGame.tileCount) {
        gameOverSnake();
        return;
    }
    
    // Controlla collisioni con se stesso
    if (snakeGame.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOverSnake();
        return;
    }
    
    snakeGame.snake.unshift(head);
    
    // Controlla se ha mangiato il cibo
    if (head.x === snakeGame.food.x && head.y === snakeGame.food.y) {
        snakeGame.score += 10;
        document.getElementById('snake-score').textContent = snakeGame.score;
        snakeGame.food = generateFood();
    } else {
        snakeGame.snake.pop();
    }
    
    drawSnake();
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * snakeGame.tileCount),
            y: Math.floor(Math.random() * snakeGame.tileCount)
        };
    } while (snakeGame.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
}

function drawSnake() {
    // Pulisci canvas
    snakeGame.ctx.fillStyle = 'black';
    snakeGame.ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    // Disegna il serpente
    snakeGame.ctx.fillStyle = 'lime';
    snakeGame.snake.forEach(segment => {
        snakeGame.ctx.fillRect(segment.x * snakeGame.gridSize, segment.y * snakeGame.gridSize, 
                              snakeGame.gridSize - 2, snakeGame.gridSize - 2);
    });
    
    // Disegna il cibo
    snakeGame.ctx.fillStyle = 'red';
    snakeGame.ctx.fillRect(snakeGame.food.x * snakeGame.gridSize, snakeGame.food.y * snakeGame.gridSize, 
                          snakeGame.gridSize - 2, snakeGame.gridSize - 2);
}

function handleSnakeInput(event) {
    if (!snakeGame.gameRunning) return;
    
    const key = event.key;
    
    // Previeni il movimento opposto
    switch(key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            if (snakeGame.direction.y === 0) {
                snakeGame.direction = {x: 0, y: -1};
            }
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            if (snakeGame.direction.y === 0) {
                snakeGame.direction = {x: 0, y: 1};
            }
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            if (snakeGame.direction.x === 0) {
                snakeGame.direction = {x: -1, y: 0};
            }
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            if (snakeGame.direction.x === 0) {
                snakeGame.direction = {x: 1, y: 0};
            }
            break;
    }
}

function gameOverSnake() {
    snakeGame.gameRunning = false;
    clearInterval(snakeGame.gameLoop);
    
    snakeGame.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    snakeGame.ctx.fillRect(0, 0, snakeGame.canvas.width, snakeGame.canvas.height);
    
    snakeGame.ctx.fillStyle = 'red';
    snakeGame.ctx.font = '30px Arial';
    snakeGame.ctx.textAlign = 'center';
    snakeGame.ctx.fillText('GAME OVER', snakeGame.canvas.width / 2, snakeGame.canvas.height / 2);
    snakeGame.ctx.fillText(`Punteggio: ${snakeGame.score}`, snakeGame.canvas.width / 2, snakeGame.canvas.height / 2 + 40);
}