function shuffleArray(array) {
    // Taken off of Stack Overflow: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffleArray-a-javascript-array
    var currentIndex = array.length,
        temporaryValue,
        randomIndex;
    // While there remain elements to shuffleArray...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}
class CACell {
    //Object representing each cell in the grid
    constructor(
        floorFieldVal = 0,
        occupied = false,
        walkable = true,
        id = "",
        type = "floor",
        x,
        y,
        grid
    ) {
        this.floorFieldVal = floorFieldVal;
        this.occupied = occupied;
        this.walkable = walkable;
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.reserved = false;
        this.grid = grid;
        this.neighbours = [];
    }
    findNeighbours() {
        //Function to find neighbours, seperate from constructor as neighbouring cells might not be created yet during grid creation
        let x = this.x;
        let y = this.y;
        if (
            x > 0 &&
            x < this.grid[0].length - 1 &&
            y > 0 &&
            y < this.grid.length - 1
        ) {
            this.neighbours = [
                this.grid[y - 1][x - 1],
                this.grid[y - 1][x],
                this.grid[y - 1][x + 1],
                this.grid[y][x - 1],
                this.grid[y][x + 1],
                this.grid[y + 1][x - 1],
                this.grid[y + 1][x],
                this.grid[y + 1][x + 1],
            ];
        } else if (x > 0 && x < this.grid[0].length - 1 && y === 0) {
            this.neighbours = [
                this.grid[y][x - 1],
                this.grid[y][x + 1],
                this.grid[y + 1][x - 1],
                this.grid[y + 1][x],
                this.grid[y + 1][x + 1],
            ];
        } else if (
            x > 0 &&
            x < this.grid[0].length - 1 &&
            y === this.grid.length - 1
        ) {
            this.neighbours = [
                this.grid[y - 1][x - 1],
                this.grid[y - 1][x],
                this.grid[y - 1][x + 1],
                this.grid[y][x - 1],
                this.grid[y][x + 1],
            ];
        } else if (x === 0 && y > 0 && y < this.grid.length - 1) {
            this.neighbours = [
                this.grid[y - 1][x],
                this.grid[y - 1][x + 1],
                this.grid[y][x + 1],
                this.grid[y + 1][x],
                this.grid[y + 1][x + 1],
            ];
        } else if (
            x === this.grid[0].length - 1 &&
            y > 0 &&
            y < this.grid.length - 1
        ) {
            this.neighbours = [
                this.grid[y - 1][x - 1],
                this.grid[y - 1][x],
                this.grid[y][x - 1],
                this.grid[y + 1][x - 1],
                this.grid[y + 1][x],
            ];
        } else if (x === 0 && y === 0) {
            this.neighbours = [
                this.grid[y][x + 1],
                this.grid[y + 1][x],
                this.grid[y + 1][x + 1],
            ];
        } else if (x === 0 && y === this.grid.length - 1) {
            this.neighbours = [
                this.grid[y - 1][x],
                this.grid[y - 1][x + 1],
                this.grid[y][x + 1],
            ];
        } else if (x === this.grid[0].length - 1 && y === 0) {
            this.neighbours = [
                this.grid[y][x - 1],
                this.grid[y + 1][x - 1],
                this.grid[y + 1][x],
            ];
        } else if (
            x === this.grid[0].length - 1 &&
            y === this.grid.length - 1
        ) {
            this.neighbours = [
                this.grid[y - 1][x - 1],
                this.grid[y - 1][x],
                this.grid[y][x - 1],
            ];
        }
        let newNeighbours = [];
        for (let i = 0; i < this.neighbours.length; i++) {
            if (this.neighbours[i].walkable === true) {
                newNeighbours.push(this.neighbours[i]);
            }
        }
        this.neighbours = newNeighbours; //Removing obstacles from neighbours array
    }
}
class CARoom {
    //Object representing the entire model
    constructor(width = 5, height = 12, cellSize = 1) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize; // 1x1 metre? for each pedestrian (adjustable)
        this.grid = this.genGrid(
            this.width,
            this.height,
            this.cellSize,
            CACell
        ); //Grid of CACell objects
        this.occupiedCells = []; //Used to store cells which are occupied (array of CACell objects)
        this.targets = []; //Used to store target cells (also array of CACell objects)
        this.pedestrianHistory = [[]]; //2D array, first for time iteration (0th, 1st, etc), 2nd an array of pedestrian loacations at that timestep (x,y) e.g pedestrianHistory[0][0] gives first timestep, x coordinate. pedestrianHistory[10][1] gives 11th timestep, y coordinate
    }
    genGrid(
        width = this.width,
        height = this.height,
        cellSize = this.cellSize
    ) {
        //generates a 2d array, used to store CACell objects representing the room
        const gridWidth = width / cellSize;
        const gridHeight = height / cellSize;
        let tempArr; //Array used during the generation of each row of cells
        let grid = [];
        for (let h = 0; h < gridHeight; h++) {
            tempArr = [];
            for (let w = 0; w < gridWidth; w++) {
                tempArr.push(new CACell(0, false, true, "", "floor", w, h, grid));
            }
            grid.push(tempArr); //Adds new row to the room
        }
        return grid;
    }
    findAllNeighbours() {
        //assigns an array of WALKABLE neighbouring cells to each cell in the grid.
        const gridWidth = this.width / this.cellSize;
        const gridHeight = this.height / this.cellSize;
        for (let h = 0; h < gridHeight; h++) {
            //Loop to find neighbours of each cell and store that in an array in each CACell object
            for (let w = 0; w < gridWidth; w++) {
                this.grid[h][w].findNeighbours();
            }
        }
    }
    testCreate1Ped(x = 1, y = 1) {
        //Creates a single pedestrian at a particular location
        this.grid[y][x].occupied = true;
        this.occupiedCells.push(this.grid[y][x]);
        this.pedestrianHistory[0].push([x, y]);
    }
    testCreate1Target(x = this.grid[0].length - 1, y = this.grid.length - 2) {
        //Creates a single target cell at a particular location
        //console.log(this.grid[y][x])
        this.grid[y][x].type = "target";
        this.grid[y][x].floorFieldVal = 256;
        this.targets.push(this.grid[y][x]);
    }
    testCreateCrowd() {
        let endX = this.width / (3 * this.cellSize);
        let endY = this.height / (3 * this.cellSize);
        for (let i = 1; i < endX; i++) {
            for (let j = 1; j < endY; j++) {
                if (i % 3 !== j) {
                    this.testCreate1Ped(i, j);
                }
            }
        }
    }
    create1Obstacle(x, y) {
        //Sets a cell as an obstacle
        this.grid[y][x].walkable = false;
        this.grid[y][x].floorFieldVal = 0;
        this.grid[y][x].type = "obstacle";
    }
    generateWall() {
        //Generates wall around grid, except for target cells
        for (let i = 0; i < this.grid[0].length; i++) {
            //Top
            if (this.grid[0][i].type !== "target") {
                this.create1Obstacle(i, 0);
            }
        }
        for (let i = 0; i < this.grid[0].length; i++) {
            //Bottom
            if (this.grid[this.grid.length - 1][i].type !== "target") {
                this.create1Obstacle(i, this.grid.length - 1);
            }
        }
        for (let i = 1; i < this.grid.length; i++) {
            //Left
            if (this.grid[i][0].type !== "target") {
                this.create1Obstacle(0, i);
            }
        }
        for (let i = 1; i < this.grid.length; i++) {
            //Right
            if (this.grid[i][this.grid[0].length - 1].type !== "target") {
                this.create1Obstacle(this.grid[0].length - 1, i);
            }
        }
    }
    /*
  findTargets(){// Now redundant, initially used to locate in the grid, decided to just store in the targets array now
      let targets=[]
      for (let h = 0; h < this.grid.length; h++){
          for (let w = 0; w < this.grid[h].length; w++){
              if (this.grid[h][w].type==='target'){
                  targets.push(this.grid[h][w]);
              };
          };
      };
      this.targets = targets;
  };
  */
    calcFloorField() {
        //Needs to be updated to support multiple target cells (e.g larger exits, multiple exits)
        let bigDim = 999999999; //Largest distance from target, eg. furthest corner from an exit (Large value now, as all possible targets are looped through to find the target closest to its furthest point)
        let dist; //Distance from target from current cell
        //Target coordinates (currently only 1)
        let targX;
        let targY;
        let maxdim;
        for (let i = 0; i < this.targets.length; i++) {
            targX = this.targets[i].x;
            targY = this.targets[i].y;
            maxdim = Math.sqrt(
                Math.max(targX, this.width - targX - 2) ** 2 +
                Math.max(targY, this.height - targY - 2) ** 2
            ); //See declaration, line 95
            if (maxdim < bigDim) {
                //Smallest possible "furthest point from a target cell"
                bigDim = maxdim;
            }
        }
        for (let i = 0; i < this.targets.length; i++) {
            targX = this.targets[i].x;
            targY = this.targets[i].y;
            let res = 256 / bigDim; // Used in floor field calculation (furthest cells always have 1, 256 for target, between 1 - 256 based on distance)
            //Going through each cell
            for (let h = 0; h < this.grid.length; h++) {
                for (let w = 0; w < this.grid[h].length; w++) {
                    if (this.grid[h][w].walkable === false) {
                        this.grid[h][w].floorFieldVal = 0; //Non walkable, set to 0
                    } else if (this.grid[h][w].type === "floor") {
                        dist = Math.sqrt((targX - w) ** 2 + (targY - h) ** 2); //Calculate Euclidean Distance
                        if (-1 * res * dist + 257 > this.grid[h][w].floorFieldVal) {
                            //this.grid[h][w].floorFieldVal = (((bigDim/dist)-1)*res)+1;//Floor field calculation
                            this.grid[h][w].floorFieldVal = -1 * res * dist + 257; //Floor field calculation
                        }
                    }
                }
            }
        }
    }
    // The following two functions are only used to check code works, logging the floor field or occupied status onto the console
    logFloorField() {
        //It will show as an integer * 10 for ease of reading
        let tempArr;
        for (let y = 0; y < this.height; y++) {
            tempArr = [];
            for (let x = 0; x < this.width; x++) {
                tempArr.push(Math.round(this.grid[y][x].floorFieldVal * 10));
            }
            //console.log(tempArr);
        }
    }
    logOccupied() {
        let tempArr;
        for (let y = 0; y < this.height; y++) {
            tempArr = [];
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x].occupied) {
                    tempArr.push(1);
                } else {
                    tempArr.push(0);
                }
            }
            //console.log(tempArr);
        }
    }
    reserve() {
        this.pedestrianHistory.push([]);
        for (let i = 0; i < this.targets.length; i++) {
            //Starts off by removing pedestrian from target cells (They have exited the room)
            if (this.targets[i].occupied === true) {
                this.targets[i].occupied = false;
            }
        }
        let occupiedCells;
        let x; //x coordinate of occupied cell in current loop iteration
        let y; //y coordinate of occupied cell in current loop iteration
        let favouredCellOrder; //To store the possible movement cells
        let reservedCells = []; //To store cells that have been reserved by pedestrians
        occupiedCells = shuffleArray(this.occupiedCells); //Randomising order of pedestrians reserving cells
        occupiedCells = this.occupiedCells.sort(
            (a, b) => parseFloat(b.floorFieldVal) - parseFloat(a.floorFieldVal)
        );
        for (let i = 0; i < occupiedCells.length; i++) {
            //Loops through all occupied cells (pedestrians)
            x = occupiedCells[i].x;
            y = occupiedCells[i].y;
            favouredCellOrder = [...this.grid[y][x].neighbours]; //Gets neighbours
            favouredCellOrder.push(this.grid[y][x]); //Adds current cell as possible move
            favouredCellOrder = shuffleArray(favouredCellOrder);
            //Next line sorts the array of possible cell choices in descending order of highest floorfieldVal (closer cell to target at the beginning)
            favouredCellOrder = favouredCellOrder.sort(
                (a, b) => parseFloat(b.floorFieldVal) - parseFloat(a.floorFieldVal)
            );
            for (let j = 0; j < favouredCellOrder.length; j++) {
                //Loops through favouredCellOrder, reserves cell with highest floorfieldval that is not already reserved
                if (
                    favouredCellOrder[j].reserved === false &&
                    favouredCellOrder[j].walkable
                ) {
                    favouredCellOrder[j].reserved = true;
                    reservedCells.push(favouredCellOrder[j]);
                    break;
                }
            }
        }
        this.reservedCells = reservedCells;
    }
    move() {
        let len = this.occupiedCells.length;
        let reservedCells = this.reservedCells;
        //Next two loops 'moves' the pedestrians (Currently occupied cells become unoccupied, reserved cells become occupied)
        for (let i = 0; i < len; i++) {
            this.occupiedCells[0].occupied = false; //Removes occupied status of currently occupied cells
            this.occupiedCells.shift(); //Removal from this.occupiedCells
        }
        let iteration = this.pedestrianHistory.length - 1;
        for (let i = 0; i < reservedCells.length; i++) {
            if (reservedCells[i].type !== "target") {
                //If not target, added to this.occupiedCells
                this.occupiedCells.push(reservedCells[i]);
            }
            reservedCells[i].occupied = true; //Sets reserved cells to occupied (not included in if statement so it is shown that pedestrian is at the exit in this current iteration)
            this.pedestrianHistory[iteration].push([
                reservedCells[i].x,
                reservedCells[i].y,
            ]);
            reservedCells[i].reserved = false; //Removes reserved status
        }
    }
    update() {
        //Iterates the model to the next time step
        this.reserve();
        this.move();
    }
    setupRoom() {
        this.generateWall();
        this.findAllNeighbours();
        this.calcFloorField();
    }
}

//CANVAS CODE
let rows = 20;
let cols = 20;
let width = 500;
let height = 500;
let run = false;
let testroom = new CARoom(cols, rows);

testroom.generateWall();
testroom.findAllNeighbours(); //Is now seperate from genGrid() function as needs to accommodate for creation of obstacles/walls.


let reset;
let rectwidth = width / cols; //rectangle width
let rectheight = height / rows; //rectangle height


//creating target at mouse click location 
function mousePressed() {
    if (testroom.targets.length > 0) {
        testroom.targets.splice(0, testroom.targets.length);
    }
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let dis = dist(mouseX, mouseY, ((j + 1) * rectwidth) - (rectwidth / 2), ((i + 1) * rectheight) - (rectheight / 2));
            if (dis < rectwidth / 2 && testroom.grid[i][j].type === "obstacle" && run == false) {
                run = false;
                testroom = new CARoom(cols, rows);
                testroom.testCreate1Target(j, i);
                //testroom.generateWall();
                testroom.calcFloorField();
                showFloorFieldGrad(i, j);
                resetCanvas();
            }
        }
    }

}
function showFloorFieldGrad(i, j) {
    if (testroom.grid[i][j].type === "obstacle" && testroom.grid[i][j].type != "target") {
        fill(150);
        rect(j * rectwidth, i * rectheight, rectwidth, rectheight);
    }
    else {
        fill(255, 255 - (testroom.grid[i][j].floorFieldVal), 255 - (testroom.grid[i][j].floorFieldVal));//Red gradient
        //fill(255-(testroom.grid[i][j].floorFieldVal));//Black gradient
        rect(j * rectwidth, i * rectheight, rectwidth, rectheight);
        textSize(rectwidth / 2);
        fill(0);
        text(Math.round(testroom.grid[i][j].floorFieldVal), j * rectwidth + (rectwidth / 10), i * rectheight + (rectheight / 4), rectwidth, rectheight);
    }
}
function setup() {
    testroom.generateWall();
    let buttonWidth = 200;
    let buttonHeight = 50;
    //Sets up canvas, the static objects (e.g walls, targets), and initial pedestrian positions
    createCanvas(width + 300, height);
    frameRate(10); //code in draw gets run every 3 seconds
    background(255);
    textSize(28);
    reset = createButton("Reset");
    reset.mousePressed(resetClick);
    reset.style("background", "#0E406F");
    reset.style("color", "#FFFFFF");
    reset.style("font-size", "28px");
    reset.style("opacity", "0.9");
    reset.style("transition", "0.05s");
    reset.size(buttonWidth, buttonHeight);
    reset.position(600, 400 - buttonHeight);
    resetCanvas();
}
function resetCanvas() {
    testroom.generateWall();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            fill(255); //creating grid of white cells
            rect(j * rectwidth, i * rectheight, rectwidth, rectheight); //i is .y and j is .x (rows = y, cols = x, gives errors if wrong way round)

        }
    }
}

function resetClick() {
    run = false;
    testroom = new CARoom(cols, rows);
    resetCanvas();
}
function draw() {
    background(255);
    testroom.calcFloorField();
    testroom.generateWall();
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            fill(255); //creating grid of white cells
            rect(j * rectwidth, i * rectheight, rectwidth, rectheight); //i is .y and j is .x (rows = y, cols = x, gives errors if wrong way round)
            showFloorFieldGrad(i, j);
        }


    }
}


