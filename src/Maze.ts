import { MazeCell } from './MazeCell';
import { DisjointSets } from './DisjointSets';

export class Wall {
	private cell_index : number;
	private is_top_wall : boolean; //Left wall otherwise
    
    constructor(cell_index : number, is_top_wall : boolean) {
        this.cell_index = cell_index;
        this.is_top_wall = is_top_wall;
    }

    getCellIndex() : number {
        return this.cell_index;
    }

    isTopWall() : boolean {
        return this.is_top_wall;
    }
}

export class Maze {
    private num_of_rows : number;
	private	num_of_cols : number;
    private cells : Array<MazeCell>;
    
    constructor(num_of_rows : number, num_of_cols : number) {
        this.num_of_rows = num_of_rows;
        this.num_of_cols = num_of_cols;
        this.cells = new Array<MazeCell>();

        this.generateMaze();
    }

    getNumOfCols() : number {
	    return this.num_of_cols;
    }

    getNumOfRows() : number {
	    return this.num_of_rows;
    }

    getMazeCell(row : number, col : number) : MazeCell | null {
        if (row >= this.num_of_rows || col >= this.num_of_cols) {
            return null;
        }

	    return this.cells[col + (row * this.num_of_cols)];
    }

    private getInnerWalls() : Array<Wall> {
        //Top and left walls needed only.
        let walls = Array<Wall>();
        
        for (let row = 0; row < this.num_of_rows; ++row){
            for (let col = 0; col < this.num_of_cols; ++col) {
                //Add top walls if not top row.
                if (row < this.num_of_rows - 1) {
                    walls.push(new Wall(row * this.num_of_cols + col, true));
                }
                //Add left walls if not left most wall
                if (col > 0) {
                    walls.push(new Wall(row * this.num_of_cols + col, false));
                }
            }
        }

	    return walls;
    }

    private generateMaze() : void {
        let maze_size = this.num_of_rows * this.num_of_cols;
        let diSets = new DisjointSets(maze_size);

        for(let i = 0; i < maze_size; ++i) {
            this.cells.push(new MazeCell());
        }

        //Generate list of all the walls that can be modified.
        let walls = this.getInnerWalls();

	    //While all cells not accessible from any cell.
	    while (diSets.getSize() > 1) {
		    //Find random wall between 2 cells.
		    let wallIndex = Math.floor(Math.random() * Math.floor(walls.length));
		    let cellIndex1 = walls[wallIndex].getCellIndex();
            let cellIndex2 = 0;

            if (walls[wallIndex].isTopWall()) {
                cellIndex2 = cellIndex1 + this.num_of_cols;
            }
		    else {
                cellIndex2 = cellIndex1 - 1;
            }

		    //If walls don't belong to same set - we can remove wall.
            if (diSets.find(cellIndex1) != diSets.find(cellIndex2)) {
                if (walls[wallIndex].isTopWall() && cellIndex1 < this.cells.length) {
                    this.cells[cellIndex1].setTopWall(false);
                    this.cells[cellIndex2].setBottomWall(false);
                }
                else{
                    this.cells[cellIndex1].setLeftWall(false);
                    this.cells[cellIndex2].setRightWall(false);
                }
                diSets.performUnion(cellIndex1, cellIndex2);
            }

            walls.splice(wallIndex, 1)
	    }

        //Set top right hand corner of maze as the end cell
        if (this.cells.length > 0){
            this.cells[this.cells.length - 1].setAsEndCell(true);
            this.cells[0].setAsStartCell(true);
        }
    }
}