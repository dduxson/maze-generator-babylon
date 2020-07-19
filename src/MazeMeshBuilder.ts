import { Maze } from './Maze';
import { MazeCell } from './MazeCell';
import * as BABYLON from 'babylonjs';

export class MazeMeshBuilder {
    private maze_cell_length : number;
    private maze_wall_thickness : number;
    private maze_wall_height : number;
    private num_of_floor_quads_along_length : number;
    private num_of_wall_quads_along_length : number;
    
    constructor() {
        this.maze_cell_length = 4.0;
        this.maze_wall_thickness = 0.5;
        this.maze_wall_height = 4.0;
        this.num_of_floor_quads_along_length = 4.0;
        this.num_of_wall_quads_along_length = 4.0;
    }

    generateFloor(maze : Maze, scene: BABYLON.Scene) : BABYLON.Mesh {
        let verts = [];
        let uvs = [];
        let indices = [];
        var normals = [];

        let total_length = this.getTotalWallAndCellLength();
        for (let col = 0; col < maze.getNumOfCols(); col++) {
            for (let row = 0; row < maze.getNumOfRows(); row++) {
                let top_left_x = col * total_length;
                let top_left_y = row * total_length;
                this.generateFloorTriSubMesh(top_left_x, top_left_y, verts, uvs, indices);
            }
        }

        BABYLON.VertexData.ComputeNormals(verts, indices, normals);

        var vertexData = new BABYLON.VertexData();
        vertexData.positions = verts;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;

        var floor_mesh = new BABYLON.Mesh("maze_floor", scene);
        vertexData.applyToMesh(floor_mesh);
        
        var floor_material = new BABYLON.StandardMaterial("maze_floor_material", scene);
        floor_material.diffuseTexture = new BABYLON.Texture("./assets/texture/ground.bmp", scene);
        floor_mesh.material = floor_material;

        return floor_mesh;
    }

    generateWalls(maze : Maze, scene: BABYLON.Scene) : BABYLON.Mesh {
        let verts = [];
        let uvs = [];
        let indices = [];
        var normals = [];

        let total_length = this.getTotalWallAndCellLength();
	    let halfWallThickness = this.maze_wall_thickness * 0.5;

        for (let col = 0; col < maze.getNumOfCols(); col++) {
		    for (let row = 0; row < maze.getNumOfRows(); row++) {
			    let cell = maze.getMazeCell(row, col);
                let cellToLeft = maze.getMazeCell(row, col - 1);
                let cellAbove = maze.getMazeCell(row + 1, col);

                if (cell === null) {
                    continue;
                }

                //Always put up the top walls.
                if (cell.hasTopWall()) {
                    let end_loc_x =((col + 1) * total_length) + halfWallThickness;
                    let end_loc_y = (row + 1) * total_length;
                    let start_loc_x = (col * total_length);
                    let start_loc_y = (row + 1) * total_length;;

                     //Make sure walls don't overlap others.
                    if (cellToLeft && cellToLeft.hasTopWall()) {
                        start_loc_x += halfWallThickness;
                    }
                    else {
                        start_loc_x -= halfWallThickness; 
                    }

                    this.generateTopWallTriSubMesh(start_loc_x, start_loc_y, end_loc_x, end_loc_y, verts, uvs, indices);
			    }

                //Put up down walls around perimeter only. Reason is that the down wall will be in the exact same place as the up otherwise.
                if ((row == 0) && cell.hasBottomWall()) {
                    let end_loc_x = ((col + 1) * total_length) + halfWallThickness;
                    let end_loc_y = (row)* total_length;
                    let start_loc_x = (col * total_length);
                    let start_loc_y = (row)* total_length;

                    //Make sure walls don't overlap others.
                    if (cellToLeft && cellToLeft.hasBottomWall()) {
                        start_loc_x += halfWallThickness;
                    }
                    else{
                        start_loc_x -= halfWallThickness;
                    }

                    this.generateTopWallTriSubMesh(start_loc_x, start_loc_y, end_loc_x, end_loc_y, verts, uvs, indices);
                }

                //Always put up the left walls.
                if (cell.hasLeftWall()) {
                    let end_loc_x = col * total_length;
                    let end_loc_y = (row + 1) * total_length;
                    let start_loc_x = col * total_length;
                    let start_loc_y = (row)* total_length;
                    
                    //Make sure walls don't overlap others.
                    if (cell.hasBottomWall() || (cellToLeft && cellToLeft.hasBottomWall())) {
                        start_loc_y += halfWallThickness;
                    }
                    else {
                        start_loc_y -= halfWallThickness;
                    }
                    if (cell.hasTopWall() || (cellToLeft && cellToLeft.hasTopWall())) {
                        end_loc_y -= halfWallThickness;
                    }
                    else {
                        end_loc_y += halfWallThickness;
                    }

				    this.generateLeftWallSubMesh(start_loc_x, start_loc_y, end_loc_x, end_loc_y, verts, uvs, indices);
                }

                //Put up right walls around perimeter only. Reason is that the right wall will be in the exact same place as the left otherwise.
                if ((col == maze.getNumOfCols() - 1) && cell.hasRightWall()) {
                    let end_loc_x = (col + 1) * total_length;
                    let end_loc_y = ((row + 1) * total_length) - halfWallThickness;
                    let start_loc_x = (col + 1) * total_length;
                    let start_loc_y = (row)* total_length;

                    //Make sure walls don't overlap others.
                    if (cell.hasBottomWall()) {
                        start_loc_y += halfWallThickness;
                    }
                    else{
                        start_loc_y -= halfWallThickness;
                    }

                    this.generateLeftWallSubMesh(start_loc_x, start_loc_y, end_loc_x, end_loc_y, verts, uvs, indices);
                }
            }
		}

	    BABYLON.VertexData.ComputeNormals(verts, indices, normals);

        var vertexData = new BABYLON.VertexData();
        vertexData.positions = verts;
        vertexData.indices = indices;
        vertexData.normals = normals;
        vertexData.uvs = uvs;    

        var top_walls_mesh = new BABYLON.Mesh("maze_walls", scene);
        vertexData.applyToMesh(top_walls_mesh);

        var wall_mat = new BABYLON.StandardMaterial("maze_walls_material", scene);
        wall_mat.diffuseTexture = new BABYLON.Texture("./assets/texture/Wall1.bmp", scene);
        top_walls_mesh.material = wall_mat;

        return top_walls_mesh;
    }

    private getTotalWallAndCellLength() : number {
        return this.maze_cell_length + this.maze_wall_thickness;
    }

    private generateFloorTriSubMesh(top_left_x : number, 
                                    top_left_y : number, 
                                    verts : Array<Number>,
                                    uvs : Array<Number>, 
                                    indicies : Array<Number>) : void {
        let lengthPerQuadInCell = this.getTotalWallAndCellLength() / this.num_of_floor_quads_along_length;
        let reciprocalLengthPerQuadInCell = 1.0 / this.num_of_floor_quads_along_length;

        //Get what number the verts we are about to add will be in the verts array.
        let startVertIndex = verts.length / 3;

        //Generate verts and uvs for this cell's floor at the given resolution.
        for (let x = 0; x <= this.num_of_floor_quads_along_length; x++) {
            for (let y = 0; y <= this.num_of_floor_quads_along_length; y++) {
                verts.push(top_left_x + (x * lengthPerQuadInCell));
                verts.push(top_left_y + (y * lengthPerQuadInCell));
                verts.push(0.0);
                uvs.push(x * reciprocalLengthPerQuadInCell);
                uvs.push(1 - (y * reciprocalLengthPerQuadInCell));
            }
        }

        //Generate indicies to draw this (2 triangles per quad)
        for (let i = 0; i < this.num_of_floor_quads_along_length; i++) {
            let offset = startVertIndex + (this.num_of_floor_quads_along_length + 1) * i; //+1 as 1 more vertex than number of quads along the length.
            for (let j = 0; j < this.num_of_floor_quads_along_length; j++) {
                indicies.push(j + offset);
                indicies.push(j + 1 + offset);
                indicies.push(j + (this.num_of_floor_quads_along_length + 2) + offset);
                indicies.push(j + (this.num_of_floor_quads_along_length + 2) + offset);
                indicies.push(j + (this.num_of_floor_quads_along_length + 1) + offset);
                indicies.push(j + offset);
            }
        }
    }

    private generateTopWallTriSubMesh(start_loc_x : number, 
                                      start_loc_y : number, 
                                      end_loc_x : number, 
                                      end_loc_y : number,
                                      verts : Array<Number>,
                                      uvs: Array<Number>, 
                                      indicies : Array<Number>) : void
    {
        let startToEndLength = (end_loc_x - start_loc_x);
        let lengthPerQuadInCell = startToEndLength / this.num_of_wall_quads_along_length;
        let heightPerQuadInCell = this.maze_wall_height / this.num_of_wall_quads_along_length;
        let reciprocalLengthPerQuadInCell = 1.0 / this.num_of_wall_quads_along_length;
        let halfWallThickness = this.maze_wall_thickness * 0.5;
    
        //Calculate what number the verts we are about to add will be in the verts array.
        let startVertIndex = verts.length / 3;
    
        //Generate larger sides verts for this cell.
        for (let x = 0; x <= this.num_of_wall_quads_along_length; x++) {
            for (let z = 0; z <= this.num_of_wall_quads_along_length; z++) {
                //There are 2 sides of the wall as it has a thickness.
                for(let side = 0; side < 2; side++) {
                    verts.push(start_loc_x + (x * lengthPerQuadInCell));
                    
                    if(side % 2 == 0) {
                        verts.push(start_loc_y - halfWallThickness);
                    }
                    else {
                        verts.push(start_loc_y + halfWallThickness);
                    }

                    verts.push(z * heightPerQuadInCell);

                    uvs.push(x * reciprocalLengthPerQuadInCell);
                    uvs.push(1 - (z * reciprocalLengthPerQuadInCell));
                }
            }
        }
    
        //Shorter sides verts
        //Top
        let indexOfShorterHorizSides = verts.length / 3;
        for (let x = 0; x <= this.num_of_wall_quads_along_length; x++) {

            for(let side = 0; side < 2; side++) {
                verts.push(start_loc_x + (x * lengthPerQuadInCell));
                uvs.push(x * reciprocalLengthPerQuadInCell);

                if(side % 2 == 0) {
                    verts.push(start_loc_y - halfWallThickness);
                    uvs.push(0.25);
                }
                else {
                    verts.push(start_loc_y + halfWallThickness);
                    uvs.push(0.0);
                }
                
                verts.push(this.maze_wall_height);
            }
        }
    
        //Vertical sides
        let indexOfShorterVerticalSides = verts.length / 3;
        for (let z = 0; z <= this.num_of_wall_quads_along_length; z++) {
            for(let side = 0; side < 4; side++) {
                if(side === 0 || side === 1) {
                    verts.push(start_loc_x);
                }
                else {
                    verts.push(start_loc_x + startToEndLength);
                }
                if(side === 0 || side === 2) {
                    verts.push(start_loc_y - halfWallThickness);
                    uvs.push(0.25);
                }
                else {
                    verts.push(start_loc_y + halfWallThickness);
                    uvs.push(0.0);
                }

                verts.push(z * heightPerQuadInCell);
                uvs.push(1 - (z * reciprocalLengthPerQuadInCell));
            }
        }
    
        //Generate indicies to draw this.
        let numOfwalls = 2; //2 as there are 2 walls per cell as wall has thickness.
        for (let i = 0; i < this.num_of_wall_quads_along_length; i++) {
            let offset = startVertIndex + ((this.num_of_wall_quads_along_length + 1) * i * numOfwalls);
            for (let j = 0; j < this.num_of_wall_quads_along_length * numOfwalls; j++) {
                if(j % 2 == 0) {
                    indicies.push(j + offset);
                    indicies.push(j + 2 + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 1)*numOfwalls) + offset);
                    indicies.push(j + offset);
                }
                else {
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                    indicies.push(j + 2 + offset);
                    indicies.push(j + offset);
                    indicies.push(j + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 1)*numOfwalls) + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                }
            }
        }
    
        //Shorter sides indicies.
        for (let i = 0; i < this.num_of_wall_quads_along_length; i++) {
            let twoI = i * 2;
            indicies.push(indexOfShorterHorizSides + twoI);
            indicies.push(indexOfShorterHorizSides + 1 + twoI);
            indicies.push(indexOfShorterHorizSides + 2 + twoI);
            indicies.push(indexOfShorterHorizSides + 1 + twoI);
            indicies.push(indexOfShorterHorizSides + 3 + twoI);
            indicies.push(indexOfShorterHorizSides + 2 + twoI);
        }
        for (let j = 0; j < this.num_of_wall_quads_along_length * numOfwalls; j++) {
            if(j % 2 == 0){
                let twoJ = j * 2;
                indicies.push(indexOfShorterVerticalSides + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 5 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
            }
            else {
                let twoJ = j * 2;
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
                indicies.push(indexOfShorterVerticalSides + twoJ);
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 5 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
            }
        }
    }

    private generateLeftWallSubMesh(start_loc_x : number, 
                                    start_loc_y : number, 
                                    end_loc_x : number, 
                                    end_loc_y : number,
                                    verts : Array<Number>, 
                                    uvs: Array<Number>,
                                    indicies : Array<Number>) : void {
        let startToEndLength = (end_loc_y - start_loc_y);
        let lengthPerQuadInCell = startToEndLength / this.num_of_wall_quads_along_length;
        let heightPerQuadInCell = this.maze_wall_height / this.num_of_wall_quads_along_length;
        let reciprocalLengthPerQuadInCell = 1.0 / this.num_of_wall_quads_along_length;
        let halfWallThickness = this.maze_wall_thickness * 0.5;

        //Calculate what number the verts we are about to add will be in the verts array.
        let startVertIndex = verts.length / 3;

        //Generate larger sides verts for this cell.
        for (let y = 0; y <= this.num_of_wall_quads_along_length; y++) {
            for (let z = 0; z <= this.num_of_wall_quads_along_length; z++) {
                //There are 2 sides of the wall as it has a thickness.
                for(let side = 0; side < 2; side++) {
                    if(side % 2 == 0) {
                        verts.push(start_loc_x - halfWallThickness);
                    }
                    else {
                        verts.push(start_loc_x + halfWallThickness);
                    }

                    verts.push(start_loc_y + (y * lengthPerQuadInCell));
                    verts.push(z * heightPerQuadInCell);

                    uvs.push(y * reciprocalLengthPerQuadInCell);
                    uvs.push(1 - (z * reciprocalLengthPerQuadInCell));
                }
            }
        }

        //Shorter sides verts
        let indexOfShorterHorizSides = verts.length / 3;
        for (let  y = 0; y <= this.num_of_wall_quads_along_length; y++) {
            for(let side = 0; side < 2; side++) {
                uvs.push(y * reciprocalLengthPerQuadInCell);
                
                if(side % 2 == 0) {
                    verts.push(start_loc_x - halfWallThickness);
                    uvs.push(0.25);
                }
                else {
                    verts.push(start_loc_x + halfWallThickness);
                    uvs.push(0.0);
                }

                verts.push(start_loc_y + (y * lengthPerQuadInCell));
                verts.push(this.maze_wall_height);
            }
        }

        let indexOfShorterVerticalSides = verts.length / 3;
        for (let z = 0; z <= this.num_of_wall_quads_along_length; z++) {
            for(let side = 0; side < 4; side++) {
                if(side === 0 || side === 2) {
                    verts.push(start_loc_x - halfWallThickness);
                    uvs.push(0.25);
                }
                else {
                    verts.push(start_loc_x + halfWallThickness);
                    uvs.push(0.0);
                }
                if(side === 0 || side === 1) {
                    verts.push(start_loc_y);
                }
                else {
                    verts.push(start_loc_y + startToEndLength);
                }

                verts.push(z * heightPerQuadInCell);
                uvs.push(1 - (z * reciprocalLengthPerQuadInCell));
            }
        }

        //Generate indicies to draw this.
        let numOfwalls = 2; //2 as there are 2 walls per cell as wall has thickness.
        for (let i = 0; i < this.num_of_wall_quads_along_length; i++) {
            let offset = startVertIndex + ((this.num_of_wall_quads_along_length + 1) * i * numOfwalls);
            for (let j = 0; j < this.num_of_wall_quads_along_length * numOfwalls; j++) {
                if(j % 2 != 0) {
                    indicies.push(j + offset);
                    indicies.push(j + 2 + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 1)*numOfwalls) + offset);
                    indicies.push(j + offset);
                }
                else {
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                    indicies.push(j + 2 + offset);
                    indicies.push(j + offset);
                    indicies.push(j + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 1)*numOfwalls) + offset);
                    indicies.push(j + ((this.num_of_wall_quads_along_length + 2)*numOfwalls) + offset);
                }
            }
        }

        //Shorter sides indicies.
        for (let i = 0; i < this.num_of_wall_quads_along_length; i++) {
            let twoI = i * 2;
            indicies.push(indexOfShorterHorizSides + 2 + twoI);
            indicies.push(indexOfShorterHorizSides + 1 + twoI);
            indicies.push(indexOfShorterHorizSides + twoI);
            indicies.push(indexOfShorterHorizSides + 2 + twoI);
            indicies.push(indexOfShorterHorizSides + 3 + twoI);
            indicies.push(indexOfShorterHorizSides + 1 + twoI);
        }
        for (let j = 0; j < this.num_of_wall_quads_along_length * numOfwalls; j++) {
            if(j % 2 != 0){
                let twoJ = j * 2;
                indicies.push(indexOfShorterVerticalSides + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 5 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
            }
            else {
                let twoJ = j * 2;
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
                indicies.push(indexOfShorterVerticalSides + twoJ);
                indicies.push(indexOfShorterVerticalSides + 4 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 5 + twoJ);
                indicies.push(indexOfShorterVerticalSides + 1 + twoJ);
            }
        }
    }
}