import { Maze } from './Maze';
import { MazeMeshBuilder } from './MazeMeshBuilder';
import * as BABYLON from 'babylonjs';
import * as GUI from 'babylonjs-gui';

export class Game {

    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _maze : Maze;

    private _scene: BABYLON.Scene;
    private _camera: BABYLON.UniversalCamera;
    private _light: BABYLON.Light;
    private _maze_floor: BABYLON.Mesh;
    private _maze_walls: BABYLON.Mesh;

    private _pointer_locked: boolean;

    constructor(canvasElement: string) {
        this._canvas = <HTMLCanvasElement>document.getElementById(canvasElement);
        this._engine = new BABYLON.Engine(this._canvas, true);
        this._maze = new Maze(10, 10);
        this._pointer_locked = false;
    }

    createScene(): void {
        this._scene = new BABYLON.Scene(this._engine);
        this._scene.gravity = new BABYLON.Vector3(0, -0.1, 0); 
        this._scene.collisionsEnabled = true;

        this.createCamera();
        this._light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), this._scene);
        this.createMazeMesh();
    }

    createCamera() : void {
        this._camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(-2.25, 2.0, 2.25), this._scene);
        this._camera.attachControl(this._canvas, true);
        this._camera.setTarget(new BABYLON.Vector3(-100, 2.0, 0));
        
        this._camera.keysUp = [87]; // W
        this._camera.keysDown = [83]; // S
        this._camera.keysLeft = [65]; // A
        this._camera.keysRight = [68]; // D
        
        this._camera.ellipsoid = new BABYLON.Vector3(1.3,1,1.3);
        this._camera.speed = 2;
        this._camera.inertia = 0;
        this._camera.applyGravity = true;
        this._camera.checkCollisions = true;

        this.createPointerLock();
    }

    createMazeMesh() : void {
        let maze_mesh_builder = new MazeMeshBuilder();
        this._maze_floor = maze_mesh_builder.generateFloor(this._maze, this._scene);
        this._maze_floor.rotate(new BABYLON.Vector3(0,1,1), 3.14);
        this._maze_floor.checkCollisions = true;
        this._maze_walls = maze_mesh_builder.generateWalls(this._maze, this._scene);
        this._maze_walls.rotate(new BABYLON.Vector3(0,1,1), 3.14);
        this._maze_walls.checkCollisions = true;
    }

    createPointerLock() : void {
        this._canvas.addEventListener("click", event => {
            this._canvas.requestPointerLock = this._canvas.requestPointerLock || 
                                              this._canvas.msRequestPointerLock || 
                                              this._canvas.mozRequestPointerLock || 
                                              this._canvas.webkitRequestPointerLock;
            if(this._canvas.requestPointerLock) {
                this._canvas.requestPointerLock();
            }
          }, false);
    }

    animate(): void {
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });

        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }
}