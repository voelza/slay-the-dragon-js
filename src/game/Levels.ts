import { Position, Tile } from "./Game";

export type CharacterDefinition = {
    position: Position;
    hp?: number | undefined;
}

export type LevelDefinition = {
    level: Tile[][];
    knight: CharacterDefinition;
    dragon: CharacterDefinition;
    mage?: CharacterDefinition;
    actions: number;
    extends?: string[],
    solution?: string;
    help?: string,
}

export const levels: LevelDefinition[] = [
    {
        level: [
            [Tile.ROAD, Tile.ROAD, Tile.ROAD],
        ],
        knight: { position: { row: 0, column: 0 } },
        dragon: { position: { row: 0, column: 2 }, hp: 1 },
        actions: 2,
        help: `
        To attack the dragon you have to move your knight next to it and swing
        your sword in it's direction like this: "knight.attack(<DIRECTION>);".
        If you want to attack a dragon to the east, you can use "knight.attack(EAST);".
        If you want to attack a dragon to the north, you can use "knight.attack(NORTH);".

        To move the knight use "knight.move(<DIRECTION>);".
        If you want to move your knight to the west, you can use "knight.move(WEST);".
        If you want to move your knight to the south, you can use "knight.move(SOUTH);".
        
        There are 4 directions available:
        NORTH
        EAST
        WEST
        SOUTH

        You only have a certain amount of actions to slay the dragon. If you use more actions or
        you don't slay it at all, you will be burned by the dragon.

        Every 'move' and 'attack' statement will be counted as one action.
        `
    },
    {
        level: [
            [Tile.HOLE, Tile.ROAD, Tile.ROAD],
            [Tile.ROAD, Tile.ROAD, Tile.HOLE],
        ],
        knight: { position: { row: 1, column: 0 } },
        dragon: { position: { row: 0, column: 2 }, hp: 1 },
        actions: 3
    },
    {
        level: [
            [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
            [Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE],
            [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE]
        ],
        knight: { position: { row: 2, column: 0 } },
        dragon: { position: { row: 0, column: 7 }, hp: 1 },
        actions: 9
    },
    {
        level: [
            [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
            [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD],
            [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.ROAD],
            [Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.HOLE, Tile.ROAD],
            [Tile.ROAD, Tile.HOLE, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.HOLE, Tile.ROAD],
            [Tile.ROAD, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.ROAD],
            [Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD],
            [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
        ],
        knight: { position: { row: 0, column: 0 } },
        dragon: { position: { row: 4, column: 2 }, hp: 1 },
        actions: 9,
        solution: `
        function win() {
            while(knight.isNextTo(SOUTH,HOLE)) {
                knight.move(EAST);
            }
            knight.move(SOUTH);
            while(knight.isNextTo(WEST,HOLE)) {
                knight.move(SOUTH);
            }
            knight.move(WEST);
            while(knight.isNextTo(NORTH, HOLE)) {
                knight.move(WEST);
            }
            if(not knight.isNextTo(NORTH, dragon)) {
                knight.move(NORTH);
                while(knight.isNextTo(EAST, HOLE)) {
                    knight.move(NORTH);
                }
                knight.move(EAST);
                win();
            } else {
                knight.attack(NORTH);
            }
        }
        win();
        `
    },
    {
        level: [
            [Tile.HOLE, Tile.ROAD, Tile.HOLE],
            [Tile.HOLE, Tile.ROAD, Tile.HOLE],
            [Tile.ROAD, Tile.ROAD, Tile.ROAD],
        ],
        knight: { position: { row: 2, column: 0 } },
        mage: { position: { row: 0, column: 1 } },
        dragon: { position: { row: 2, column: 2 }, hp: 2 },
        actions: 4,
        help: `
        The Mage entered the game!
        He can move around just like the Knight can, but he cannot attack.
        Instead he can support the Knight by using his 'support' move like this:
        'mage.support(<Direction>);'
        e.g.
        mage.support(SOUTH);
        `
    },
]