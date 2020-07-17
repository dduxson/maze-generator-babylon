export class MazeCell {
    private has_top_wall: boolean;
    private has_bottom_wall: boolean;
    private has_left_wall: boolean;
    private has_right_wall: boolean;
	private is_end_cell: boolean;
    private is_start_cell: boolean;

    constructor() {
        this.has_top_wall = true;
        this.has_bottom_wall = true;
        this.has_left_wall = true;
        this.has_right_wall = true;
        
        this.is_end_cell = false;
        this.is_start_cell = false;
    }

    setBottomWall(has_wall: boolean) :void {
	    this.has_bottom_wall = has_wall;
    }

    setTopWall(has_wall: boolean) :void {
	    this.has_top_wall = has_wall;
    }

    setLeftWall(has_wall: boolean) :void {
	    this.has_left_wall = has_wall;
    }

    setRightWall(has_wall: boolean) :void {
	    this.has_right_wall = has_wall;
    }

    hasBottomWall() :boolean {
	    return this.has_bottom_wall;
    }

    hasTopWall() :boolean {
	    return this.has_top_wall;
    }

    hasLeftWall() :boolean {
	    return this.has_left_wall;
    }

    hasRightWall() :boolean {
	    return this.has_right_wall;
    }

    setAsEndCell(end_cell : boolean) : void {
	    this.is_end_cell = end_cell;
    }

    setAsStartCell(start_cell : boolean) : void {
	    this.is_start_cell = start_cell;
    }

    isEndCell() : boolean {
	    return this.is_end_cell
    }

    isStartCell() : boolean {
        return this.is_start_cell;
    }
}