import { Environment } from "../lang/Environment";
import { evaluate, nativeBoolean, NULL } from "../lang/Evaluator";
import { Lexer } from "../lang/Lexer";
import { ErrorObject, GameObject, Instance, LangObject, ObjectType } from "../lang/Object";
import { Parser } from "../lang/Parser";
import { DragonDefinition, LevelDefinition } from "./Levels";
import { queueRender, RenderType } from "./Renderer";
import death from "./death.gif";

export type Position = {
    row: number,
    column: number
}

enum Direction {
    NORTH,
    EAST,
    SOUTH,
    WEST
}

export enum Tile {
    ROAD,
    WALL,
    HOLE
}

enum Interactable {
    DRAGON,
    ROAD,
    WALL,
    HOLE
}

function fromInteractable(interactable: Interactable): Tile | null {
    if (Interactable.ROAD === interactable) {
        return Tile.ROAD;
    } else if (Interactable.WALL === interactable) {
        return Tile.WALL;
    } else if (Interactable.HOLE === interactable) {
        return Tile.HOLE;
    }
    return null;
}

export class Level {
    tiles: Tile[][];

    constructor(tiles: Tile[][]) {
        this.tiles = tiles;
    }

    canStepOn(position: Position): boolean {
        const tile = this.getTile(position);
        if (tile === undefined) {
            return false;
        }
        return tile != Tile.HOLE;
    }

    isTileOnPosition(position: Position, tile: Tile): boolean {
        return this.getTile(position) == tile;
    }

    getTile(position: Position): Tile | undefined {
        const row = position.row;
        const column = position.column;

        if (this.tiles.length == 0) {
            return;
        }
        if (row < 0 || row > this.tiles.length - 1) {
            return;
        }
        if (column < 0 || column > this.tiles[row].length - 1) {
            return;
        }

        return this.tiles[row][column];
    }
}

export class Character {
    position: Position;
    attack: number;

    constructor(row: number, column: number, attack: number) {
        this.position = { row, column };
        this.attack = attack;
    }

    move(nextPosition: Position): void {
        this.position = nextPosition;
        console.log("Position is ", this.position);
    }


    nextPosition(direction: Direction): Position {
        let row = this.position.row;
        let column = this.position.column;
        switch (direction) {
            case Direction.NORTH:
                row -= 1;
                break;
            case Direction.SOUTH:
                row += 1;
                break;
            case Direction.EAST:
                column += 1;
                break;
            case Direction.WEST: column -= 1;
                break;
        }
        return { row, column };
    }

    isOnPosition(otherPosition: Position): boolean {
        return this.position.row === otherPosition.row && this.position.column === otherPosition.column;
    }

}

export class ActionCharacter extends Character {
    game: Game;

    constructor(game: Game, row: number, column: number, attack: number) {
        super(row, column, attack);
        this.game = game;
    }

    nativeMove(args: LangObject[]): LangObject {
        const [ok, result] = this.getGameObject(args);
        if (!ok) {
            return result;
        }
        const gameObject = result as GameObject;
        if (gameObject.content in Direction) {
            this.game.move(this, gameObject.content);
        }

        return NULL;
    }

    nativeIsNextTo(args: LangObject[]): LangObject {
        const [ok, result] = this.getGameObjects(2, args);
        if (!ok) {
            return this.unwrap([ok, result])[1];
        }

        const directionObj: GameObject = result[0] as GameObject;
        const targetObj: GameObject = result[1] as GameObject;
        if (directionObj.content in Direction && targetObj.content in Interactable) {
            return nativeBoolean(this.game.isNextTo(this, directionObj.content, targetObj.content));
        }
        return NULL;
    }

    getGameObject(args: LangObject[]): [boolean, LangObject] {
        return this.unwrap(this.getGameObjects(1, args));
    }

    unwrap(objects: [boolean, LangObject[]]): [boolean, LangObject] {
        return [objects[0], objects[1][0]];
    }

    getGameObjects(argSize: number, args: LangObject[]): [boolean, LangObject[]] {
        if (args.length != argSize) {
            return [false, [new ErrorObject(`Expected ${argSize} arg, got ${args.length}`)]];
        }

        const gameObjects: LangObject[] = [];
        for (let i = 0; i < argSize; i++) {
            const arg: LangObject = args[i];
            if (ObjectType.GAME_OBJECT !== arg.type) {
                return [false, [new ErrorObject(`Arg[${i}] must be of type GAME_OBJECT.`)]];
            }
            gameObjects.push(arg);
        }
        return [true, gameObjects];
    }
}

export class Dragon extends Character {
    hp: number;
    positions: Position | Position[]

    constructor(dragon: DragonDefinition, hp: number) {
        super(-1, -1, 9999);
        this.hp = hp;
        this.positions = dragon.position;
        if (!Array.isArray(this.positions)) {
            this.position = this.positions;
        }
    }

    determinePosition() {
        if (Array.isArray(this.positions)) {
            this.position = this.positions[Math.floor(Math.random() * this.positions.length)];
        } else {
            this.position = this.positions;
        }
        console.log(this.position);
    }

    takeDamage(damage: number): void {
        this.hp -= damage;
    }
}

export class Knight extends ActionCharacter {
    constructor(game: Game, row: number, column: number, attack: number) {
        super(game, row, column, attack);
    }

    nativeAttack(args: LangObject[]): LangObject {
        const [ok, result] = this.getGameObject(args);
        if (!ok) {
            return result;
        }
        const gameObject = result as GameObject;
        if (gameObject.content in Direction) {
            this.game.attack(this, gameObject.content);
        }
        return NULL;
    }
}

export class Mage extends ActionCharacter {
    constructor(game: Game, row: number, column: number,) {
        super(game, row, column, 1);
    }

    nativeSupport(args: LangObject[]): LangObject {
        const [ok, result] = this.getGameObject(args);
        if (!ok) {
            return result;
        }
        const gameObject = result as GameObject;
        if (gameObject.content in Direction) {
            this.game.support(this, gameObject.content);
        }
        return NULL;
    }
}

export function createStandardEnv(): Environment {
    const env = new Environment();
    env.set("NORTH", new GameObject(Direction.NORTH));
    env.set("SOUTH", new GameObject(Direction.SOUTH));
    env.set("EAST", new GameObject(Direction.EAST));
    env.set("WEST", new GameObject(Direction.WEST));
    env.set("dragon", new GameObject(Interactable.DRAGON));
    env.set("ROAD", new GameObject(Interactable.ROAD));
    env.set("WALL", new GameObject(Interactable.WALL));
    env.set("HOLE", new GameObject(Interactable.HOLE));
    return env;
}


export enum GameState {
    WON,
    TOO_MANY_ACTIONS,
    LOST,
    ERROR
}

export function determineActionCount(code: string): number {
    return (code.match(/move\(/g) || []).length
        + (code.match(/attack\(/g) || []).length
        + (code.match(/support\(/g) || []).length;
}

export class Game {
    level!: Level;
    dragon!: Dragon;
    knight!: Knight;
    mage?: Mage;
    levelDef: LevelDefinition;

    constructor(levelDef: LevelDefinition) {
        this.levelDef = levelDef;
        this.init();
    }

    init() {
        const { level, dragon, knight, mage } = this.levelDef;
        this.level = new Level(level);
        this.dragon = new Dragon(dragon, dragon.hp!);
        this.knight = new Knight(this, knight.position.row, knight.position.column, 1);
        this.mage = mage ? new Mage(this, mage?.position.row, mage?.position.column) : undefined;

        if (Array.isArray(this.dragon.positions)) {
            this.queueRandomLevelRender();
        } else {
            this.queueLevelRender();
        }
    }

    queueRandomLevelRender() {
        queueRender({
            type: RenderType.LEVEL,
            level: this.level,
            knight: { position: this.knight!.position, attack: this.knight!.attack },
            dragon: { position: this.dragon!.positions, hp: this.dragon!.hp },
            mage: this.mage ? { position: this.mage?.position, attack: this.mage!.attack } : undefined
        });
    }

    queueLevelRender(attackPosition: Position | undefined = undefined, isNextToPosition: Position | undefined = undefined) {
        queueRender({
            type: RenderType.LEVEL,
            level: this.level,
            knight: { position: this.knight!.position, attack: this.knight!.attack },
            dragon: { position: this.dragon!.position, hp: this.dragon!.hp },
            mage: this.mage ? { position: this.mage?.position, attack: this.mage!.attack } : undefined,
            attackPosition,
            isNextToPosition
        });
    }

    queueDeath(reason: string) {
        const div = document.createElement("div");

        const txt = document.createElement("pre");
        txt.textContent = `${reason}\n\nThe dragon woke up and burned you!`;

        const img = document.createElement("img");
        img.src = death;

        div.appendChild(txt);
        div.appendChild(img);
        queueRender({
            type: RenderType.DIALOG,
            body: div
        });
    }

    play(script: string): GameState {
        if (determineActionCount(script) > this.levelDef.actions) {
            this.queueDeath("You used to many actions!");
            return GameState.TOO_MANY_ACTIONS;
        }

        this.dragon.determinePosition();

        const lexer = new Lexer(script);
        const parser = new Parser(lexer);
        const program = parser.parseProgram();
        if (parser.errors.length > 0) {
            this.queueDeath(parser.errors.join("\n"));
            return GameState.ERROR;
        }

        const env = new Environment(createStandardEnv());
        env.set("knight", new Instance(this.knight!));
        if (this.mage) {
            env.set("mage", new Instance(this.mage));
        }
        const langObject = evaluate(program, env);
        if (langObject instanceof ErrorObject) {
            this.queueDeath(`Your battle plan is errornous!\n\nERROR: ${langObject.error}`);
            return GameState.ERROR;
        }
        const endState = this.resolveGameState();
        if (endState === GameState.LOST) {
            this.queueDeath("You didn't slay the dragon!");
        }
        return endState;
    }

    move(character: Character, direction: Direction) {
        const desiredPosition = character.nextPosition(direction);
        if (this.level.canStepOn(desiredPosition)) {
            character.move(desiredPosition);
        }
        this.queueLevelRender();
    }

    attack(character: Character, direction: Direction) {
        const attackPosition = character.nextPosition(direction);
        if (this.dragon!.isOnPosition(attackPosition)) {
            this.dragon!.takeDamage(character.attack);
        }
        character.attack -= character.attack;
        this.queueLevelRender(attackPosition);
    }

    isNextTo(character: Character, direction: Direction, target: Interactable): boolean {
        const isNextToPosition = character.nextPosition(direction);
        this.queueLevelRender(undefined, isNextToPosition);
        if (Interactable.DRAGON === target) {
            return this.dragon!.isOnPosition(isNextToPosition);
        }
        return this.level.isTileOnPosition(isNextToPosition, fromInteractable(target)!);
    }

    support(mage: Mage, direction: Direction) {
        if (this.knight!.isOnPosition(mage.nextPosition(direction))) {
            this.knight.attack += mage.attack;
            mage.attack -= mage.attack;
        }
        this.queueLevelRender();
    }

    resolveGameState(): GameState {
        return this.dragon!.hp == 0 ? GameState.WON : GameState.LOST;
    }
}