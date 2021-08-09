let clickedBefore = false;
let grid = new Array();
let uncoveredCells;
let unusedFlags;

function showModal() {
    $('#gameOptions').modal();
}

function startGame() {
    let gameInfo = [[9, 9, 10], [16, 16, 40], [16, 30, 99]];
    $('#gameOptions').modal('hide');
    generateGrid(gameInfo[$("input:radio[name=gameMode]:checked").val()]);
}

function generateGrid(info) {
    uncoveredCells = info[0] * info[1];
    unusedFlags = info[2];
    $('#flagsInfo').html(decodeURI('&#128681'));
    $('#flagsInfo').append(' ' + unusedFlags);
    for (let i = 0; i < info[0]; i++) {
        grid.push(new Array(info[1]).fill(0));
        let rowContent = '<div class="row d-flex justify-content-center">';
        for (let j = 0; j < info[1]; j++)
            rowContent += '<button type="button" id="' + i + '-' + j + '" class="cellButton" onclick="leftClick(id, ' + info[2] + ');" oncontextmenu="rightClick(id, event)"></button>';
        rowContent += '</div>';
        $('#gameGrid').append(rowContent);
    }
}

// take every adjacent cell to a mine and increase it's value
function updateNextCells(line, column) {
    for (let i = -1; i < 2; i++)
        for (let j = -1; line + i >= 0 && line + i < grid.length && j < 2; j++)
            if (column + j >= 0 && column + j < grid[0].length && grid[line + i][column + j] !== -1)
                grid[line + i][column + j]++;
}

// generete a mine in a random positions
function generateMines(startLine, startColumn, nrMines) {
    while (nrMines-- !== 0) {
        let line = Math.floor(Math.random() * grid.length);
        let column = Math.floor(Math.random() * grid[0].length);
        // i want to keep the first clicked cell empty, to have number 0 in it
        while (grid[line][column] === -1 || (line >= startLine - 1 && line <= startLine + 1 && column >= startColumn - 1 && column <= startColumn + 1)) {
            line = Math.floor(Math.random() * grid.length);
            column = Math.floor(Math.random() * grid[0].length);
        }
        grid[line][column] = -1;
        updateNextCells(line, column);
    }
}

// return the position (line or column) from id buttons
function getPosition(currentId, startPoint, endPoint) {
    let pos = "";
    for (let i = startPoint; i < endPoint; i++)
        pos += currentId[i];
    return parseInt(pos);
}

// when a cell is clicked, this function will show to the user every empty cell that is adjacent to the clicked one
function showCells(line, column) {
    uncoveredCells--;
    $('#' + line + '-' + column).addClass('bg-light border border-dark fs-6');
    $('#' + line + '-' + column).prop('disabled', true);
    if (grid[line][column] != 0) { // the current cell is a wall, so i don't have to go further form here
        $('#' + line + '-' + column).text(grid[line][column]);
        grid[line][column] = -2;
        return;
    }
    grid[line][column] = -2; // -2 means i already was here

    for (let i = -1; i < 2; i++)
        for (let j = -1; line + i >= 0 && line + i < grid.length && j < 2; j++)
            if (column + j >= 0 && column + j < grid[0].length && grid[line + i][column + j] > -1)
                showCells(line + i, column + j);
}

// uncover the cell chosen by the user
function leftClick(clickedId, nrMines, maxLimit) {
    let startLine = getPosition(clickedId, 0, clickedId.indexOf('-'));
    let startColumn = getPosition(clickedId, clickedId.indexOf('-') + 1, clickedId.length);
    if (!clickedBefore) { // check if it is the first cell that the user will uncover
        generateMines(startLine, startColumn, nrMines);
        clickedBefore = true;
    }
    if (grid[startLine][startColumn] === -1) { // check if the user chosen to uncover a mine cell
        gameOver();
        document.getElementById(clickedId).innerHTML = decodeURI('&#128163');
    }
    else
        showCells(startLine, startColumn);
    if (uncoveredCells == nrMines) // if the user uncoverd all cells, except that cells that contains a mine, wins
        gameWon();
}

// mark or unmark a cell with flag
function rightClick(buttonClicked, event) {
    event.preventDefault();
    let buttonText = $('#' + buttonClicked).text();
    if (buttonText === '') { // mark a cell
        $('#' + buttonClicked).addClass('fs-6');
        $('#' + buttonClicked).removeAttr('onclick');
        $('#' + buttonClicked).html(decodeURI('&#128681'));
        unusedFlags--;
    }
    else { // unmark a cell
        $('#' + buttonClicked).html('');
        $('#' + buttonClicked).attr('onclick', 'leftClick(id);');
        unusedFlags++;
    }

    // updat the number of unused flags
    $('#flagsInfo').html(decodeURI('&#128681'));
    $('#flagsInfo').append(' ' + unusedFlags);
}

function gameOver() {
    // show to the user where was all mines
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[i].length; j++) {
            if (grid[i][j] === -1) {
                $('#' + i + '-' + j).html(decodeURI('&#128163'));
                $('#' + i + '-' + j).addClass('bg-light border border-dark fs-6');
                $('#' + i + '-' + j).prop('disabled', true);
            }
        }
    }
    $('#information').text('Game Over! You clicke a mine.')
    $('#finishGame').modal();
}

function gameWon() {
    $('#information').text('Congratulations! You won the game.')
    $('#finishGame').modal();
}
