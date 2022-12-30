import { Position, Tile } from "./Game";

export type CharacterDefinition = {
    position: Position;
    hp?: number | undefined;
}

export type DragonDefinition = {
    position: Position | Position[],
    hp: number
}

export enum StatementExlude {
    MOVE,
    ATTACK,
    SUPPORT,
    IS_NEXT_TO,
    IF,
    WHILE,
    NOT
}
export type LevelDefinition = {
    level: Tile[][];
    knight: CharacterDefinition;
    dragon: DragonDefinition;
    mage?: CharacterDefinition;
    actions: number;
    exludedStatements?: StatementExlude[];
    extends?: string[],
    help?: string,
    solution?: string;
}

export type LevelWorld = {
    name: string;
    color: string;
    levels: LevelDefinition[];
}

export const WORLDS: LevelWorld[] = [

    {
        name: "World #1",
        color: "#3b3c3c",
        levels: [
            {
                level: [
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD],
                ],
                knight: { position: { row: 0, column: 0 } },
                dragon: { position: { row: 0, column: 2 }, hp: 1 },
                actions: 2,
                exludedStatements: [StatementExlude.IS_NEXT_TO, StatementExlude.IF, StatementExlude.WHILE, StatementExlude.NOT],
            },
            {
                level: [
                    [Tile.HOLE, Tile.ROAD, Tile.ROAD],
                    [Tile.ROAD, Tile.ROAD, Tile.HOLE],
                ],
                knight: { position: { row: 1, column: 0 } },
                dragon: { position: { row: 0, column: 2 }, hp: 1 },
                actions: 3,
                exludedStatements: [StatementExlude.IS_NEXT_TO, StatementExlude.IF, StatementExlude.WHILE, StatementExlude.NOT],
            },
            {
                level: [
                    [Tile.HOLE, Tile.ROAD, Tile.ROAD],
                    [Tile.HOLE, Tile.ROAD, Tile.HOLE],
                    [Tile.HOLE, Tile.ROAD, Tile.HOLE],
                    [Tile.ROAD, Tile.ROAD, Tile.HOLE],
                ],
                knight: { position: { row: 0, column: 2 } },
                dragon: { position: { row: 3, column: 0 }, hp: 1 },
                actions: 5,
                exludedStatements: [StatementExlude.IS_NEXT_TO, StatementExlude.IF, StatementExlude.WHILE, StatementExlude.NOT],
            },
            {
                level: [
                    [Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL],
                    [Tile.WALL, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.WALL],
                    [Tile.WALL, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.WALL],
                    [Tile.WALL, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.WALL],
                    [Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL],
                ],
                knight: { position: { row: 1, column: 3 } },
                dragon: { position: { row: 3, column: 3 }, hp: 1 },
                actions: 6,
                exludedStatements: [StatementExlude.IS_NEXT_TO, StatementExlude.IF, StatementExlude.WHILE, StatementExlude.NOT],
            },
            {
                level: [
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE]
                ],
                knight: { position: { row: 2, column: 0 } },
                dragon: { position: { row: 0, column: 7 }, hp: 1 },
                actions: 9,
                exludedStatements: [StatementExlude.IS_NEXT_TO, StatementExlude.IF, StatementExlude.WHILE, StatementExlude.NOT],
            },
        ]
    },
    {
        name: "World #2",
        color: "#3a3e3e",
        levels: [
            {
                level: [
                    [Tile.HOLE, Tile.ROAD, Tile.HOLE,],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD],
                    [Tile.HOLE, Tile.ROAD, Tile.HOLE],

                ],
                knight: { position: { row: 1, column: 1 } },
                dragon: { position: [{ row: 1, column: 2 }, { row: 0, column: 1 }, { row: 2, column: 1 }, { row: 1, column: 0 }], hp: 1 },
                actions: 4,
                solution: `
                    if(knight.isNextTo(WEST,dragon)) {
                        knight.attack(WEST);
                    }
                    if(knight.isNextTo(EAST,dragon)) {
                        knight.attack(EAST);
                    }
                    if(knight.isNextTo(NORTH,dragon)) {
                        knight.attack(NORTH);
                    }
                    if(knight.isNextTo(SOUTH,dragon)) {
                        knight.attack(SOUTH);
                    }`
            }
        ]
    },
    {
        name: "World #3",
        color: "#282828",
        levels: [
            {
                level: [
                    [Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.HOLE, Tile.HOLE],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
                    [Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.HOLE, Tile.HOLE],

                ],
                knight: { position: { row: 1, column: 0 } },
                dragon: { position: { row: 1, column: 7 }, hp: 1 },
                actions: 2,
            },
            {
                level: [
                    [Tile.HOLE, Tile.ROAD, Tile.HOLE,],
                    [Tile.ROAD, Tile.ROAD, Tile.HOLE],
                    [Tile.ROAD, Tile.HOLE, Tile.HOLE],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.ROAD],
                    [Tile.HOLE, Tile.ROAD, Tile.ROAD],
                    [Tile.HOLE, Tile.ROAD, Tile.HOLE],
                    [Tile.HOLE, Tile.ROAD, Tile.HOLE],

                ],
                knight: { position: { row: 0, column: 1 } },
                dragon: { position: { row: 7, column: 1 }, hp: 1 },
                actions: 5,
                solution: `
                while(not knight.isNextTo(SOUTH, dragon)) {
                    if(knight.isNextTo(SOUTH, ROAD)) {
                        knight.move(SOUTH);
                    }
                    if(knight.isNextTo(WEST, ROAD)) {
                        knight.move(WEST);
                        knight.move(SOUTH);
                    }
                    while(knight.isNextTo(EAST, ROAD)) {
                        knight.move(EAST);
                    }
                }
                knight.attack(SOUTH);`
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
            },
        ]
    }
]