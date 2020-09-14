
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
    createPeds(n) {
        let randX, randY;
        let placed;
        for (let i = 0; i < n; i++) {
            placed = false
            while (placed === false) {
                randX = Math.floor(Math.random() * this.grid[0].length);
                randY = Math.floor(Math.random() * this.grid.length);
                if (this.grid[randY][randX].type === 'floor' && this.grid[randY][randX].occupied === false) {
                    this.testCreate1Ped(randX, randY);
                    placed = true;
                }
            }

        }
    }
    testCreate1Target(x = this.grid[0].length - 1, y = this.grid.length - 2) {
        //Creates a single target cell at a particular location
        //console.log(this.grid[y][x])
        this.grid[y][x].type = "target";
        this.grid[y][x].walkable = true;
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
                Math.max(targX, this.width - targX - 1) ** 2 +
                Math.max(targY, this.height - targY - 1) ** 2
            ); //See declaration, line 95
            if (maxdim < bigDim) {
                //Smallest possible "furthest point from a target cell"
                bigDim = maxdim;
            }
        }
        if (this.targets.length > 1) {
            for (let h = 0; h < this.grid.length; h++) {//resetting floorfield val if multiple targets are created
                for (let w = 0; w < this.grid[h].length; w++) {
                    if (this.grid[h][w].type === "floor") {
                        this.grid[h][w].floorFieldVal = 0;
                    }
                }
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

//const room = new CARoom(3,3); //Create new room, 3 x 3 room so easy to display on console
//Creating pedestrians
///room.testCreate1Ped();
//room.testCreate1Ped(0,1);
//room.testCreate1Ped(1,0);
//room.testCreate1Ped(2,0);
//room.testCreate1Target();//Create target
//room.calcFloorField();//Calculate Floor Field
//room.logFloorField();//Logs floor field on console

/*for (let i = 0; i < 7; i++){//Logs Occupancy (0 for empty, 1 for occupied) for 7 time steps.
//console.log(i);
room.logOccupied();
room.update()
};*/

//CANVAS CODE

let rows = 20;
let cols = 20;
let width = 500;
let height = 500;
let testroom = new CARoom(cols, rows);
let run = false;
//add loop to generate specified number of pedestrians
//testroom.testCreate1Ped(5, 6);
//testroom.testCreate1Target();

testroom.generateWall();
testroom.findAllNeighbours(); //Is now seperate from genGrid() function as needs to accommodate for creation of obstacles/walls.
testroom.calcFloorField();
//testroom.logOccupied();

let frame = 0; //frame%3 gives remainder when divided by 3, so 0, 1 and 2. At 0, only occupied cells are shown. At 1, the neighbours are highlighted, and reserved() function executed. At 2, reserved cells are shown, and move() is executed.
let rectwidth = width / cols; //rectangle width
let rectheight = height / rows; //rectangle height
let reset;
let start;
let createExit;
let timeElem;
let exitMode = false;
let pedMode = false;
let pedInput;
let pedNoTitle;
//let timeSlider, timeSliderElem;
function setup() {
    //Sets up canvas, the static objects (e.g walls, targets), and initial pedestrian positions
    let buttonWidth = 200;
    let buttonHeight = 50;
    
    timeElem = createDiv("Timestep: 0");
    timeElem.position(600, 20);
    timeElem.id('timestep');
    timeElem.style('color', 'black');
    timeElem.style('font-size', '28px');
   
    createPed = createButton("Create Pedestrian");
    createPed.mousePressed(pedClick);
    createPed.style("background", "#0E406F");
    createPed.style("color", "#FFFFFF");
    createPed.style("font-size", "28px");
    createPed.style("opacity", "0.9");
    createPed.style("transition", "0.05s");
    createPed.size(buttonWidth, buttonHeight + 25);
    createPed.position(600, 175 - buttonHeight);
    
    createCanvas(width + 300, height);
    frameRate(10); //code in draw gets run once per sec
    background(255);
    textSize(28);
    createExit = createButton("Create Exit Cell");
    createExit.mousePressed(exitClick);
    createExit.style("background", "#0E406F");
    createExit.style("color", "#FFFFFF");
    createExit.style("font-size", "28px");
    createExit.style("opacity", "0.9");
    createExit.style("transition", "0.05s");
    createExit.size(buttonWidth, buttonHeight + 25);
    createExit.position(600, 275 - buttonHeight);
    reset = createButton("Reset");
    reset.mousePressed(resetClick);
    reset.style("background", "#0E406F");
    reset.style("color", "#FFFFFF");
    reset.style("font-size", "28px");
    reset.style("opacity", "0.9");
    reset.style("transition", "0.05s");
    reset.size(buttonWidth, buttonHeight);
    reset.position(600, 400 - buttonHeight);
    start = createButton("Start");
    start.mousePressed(startClick);
    start.style("background", "#0E406F");
    start.size(buttonWidth, buttonHeight);
    start.style("color", "#FFFFFF");
    start.style("font-size", "28px");
    start.style("opacity", "0.9");
    start.style("transition", "0.05s");
    start.position(600, 500 - buttonHeight);
    resetCanvas();
}
function exitClick(){
    if (run === false) {
        exitMode = true;
        pedMode = false;
    }

}
function pedClick(){
    if (run===false){
        pedMode = true;
        exitMode = false;
    }
}
function resetCanvas()  {

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            fill(255); //creating grid of white cells
            rect(j * rectwidth, i * rectheight, rectwidth, rectheight); //i is .y and j is .x (rows = y, cols = x, gives errors if wrong way round)
            //s.showFloorFieldVal(i,j);
            //showFloorFieldGrad(i,j);
            if (testroom.grid[i][j].type === "target") {
                fill(250, 0, 0); //fill cell red if it is a target
                rect(j * rectwidth, i * rectheight, rectwidth, rectheight);
            } else if (testroom.grid[i][j].walkable === false) {
                fill(150); //fill cell grey if it is an obstacle
                rect(j * rectwidth, i * rectheight, rectwidth, rectheight);
            } else if (testroom.grid[i][j].occupied === true) {
                fill(0); //fill black if occupied
                rect(j * rectwidth, i * rectheight, rectwidth, rectheight);
            }
        }
    }
    console.log(frame);
    frame = 1;
    renewTimeCounter();
    noLoop();
}
function resetClick ()  {
    exitMode = false;
    pedMode = false;
    run = false;
    testroom = new CARoom(cols, rows)
    //testroom.testCreate1Ped(Math.floor(s.mouseX/rectwidth),Math.floor(s.mouseY/rectheight));
    testroom.setupRoom();
    resetCanvas();
}
function startClick (){
    exitMode = false;
    pedMode = false;
    if (run === false) {

        frame = 1;
        run = true;
        loop();
    }
}
function mousePressed () {
    let x = Math.floor(mouseX / rectwidth);
    let y = Math.floor(mouseY / rectheight);
    /*
    if (testroom.grid[y][x].type === 'floor' && run==false){
      run=false;
      testroom = new CARoom(cols, rows)
      testroom.testCreate1Ped(Math.floor(s.mouseX/rectwidth),Math.floor(s.mouseY/rectheight));
      testroom.setupRoom();
      s.resetCanvas();
    }*/
    if (testroom.grid[y][x].type === 'obstacle' && exitMode === true) {
        run = false;
        testroom.testCreate1Target(x, y);
        testroom.setupRoom();
        resetCanvas();
    }
    else if(pedMode === true && testroom.grid[y][x].type === 'floor' && testroom.grid[y][x].occupied === false){
        run = false;
        testroom.testCreate1Ped(x, y);
        resetCanvas();
    }
}
function showFloorFieldVal (i, j) {
    textSize(rectwidth / 2);
    fill(0);
    text(Math.round(testroom.grid[i][j].floorFieldVal), j * rectwidth + (rectwidth / 10), i * rectheight + (rectheight / 4), rectwidth, rectheight);
};
function renewTimeCounter ()  {
    /*
      fill(255);
      s.stroke(255);
      rect(600,0,200,50);
      s.stroke(0);
      fill(0);
      s.text("Timestep: "+Math.floor(frame/3),600,0,200,50);  */
    let t = Math.floor(frame / 3);
    timeElem.html("Timestep: " + t);

}

function draw() {
    //frameCount variable increments each time code in draw is run, speed can be changed with frameRate
    //Draws the dynamic elements (cells with pedestrians, reserved cells and neighbours)
    if (testroom.occupiedCells.length === 0) {
        run = false;
        noLoop();
    }
    if (frame % 3 === 0) {
        //Removes previously highlighted neighbouring cells and reserved cells, draws new occupied cells
        renewTimeCounter();
        let len = testroom.pedestrianHistory.length;
        let previousLocs = testroom.pedestrianHistory[len - 2];
        let previousX;
        let previousY;
        for (let i = 0; i < previousLocs.length; i++) {
            //For previously occupied
            previousX = previousLocs[i][0];
            previousY = previousLocs[i][1];
            if (testroom.grid[previousY][previousX].type === "target") {
                fill(255, 0, 0); //Fill with red if target
            } else {
                fill(255); //Fill with white if floor
            }
            rect(
                previousX * rectwidth,
                previousY * rectheight,
                rectwidth,
                rectheight
            );
            let selectedNeighbours =
                testroom.grid[previousY][previousX].neighbours;
            for (let h = 0; h < selectedNeighbours.length; h++) {
                //For previous neighbouring cells
                if (selectedNeighbours[h].type === "target") {
                    fill(255, 0, 0); //Fill with red if target
                } else {
                    fill(255); //Fill with white if floor
                }
                rect(
                    selectedNeighbours[h].x * rectwidth,
                    selectedNeighbours[h].y * rectheight,
                    rectwidth,
                    rectheight
                );
            }
        }

        for (let h = 0; h < testroom.occupiedCells.length; h++) {
            //Adds occupied cells
            let i = testroom.occupiedCells[h].y;
            let j = testroom.occupiedCells[h].x;
            fill(0); //Fill with black
            rect(j * rectwidth, i * rectheight, rectwidth, rectheight); //i is .y and j is .x (rows = y, cols = x, gives errors if wrong way round)
        }
    } else if (frame % 3 === 1 && run === true) {

        testroom.reserve();
    } else if (frame % 3 === 2) {

        testroom.move();
    }
    frame++;
}
