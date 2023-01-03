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
        name: "#1: Walk in the park...",
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
                help: `Your task is to slay the dragon!
To do so use the 'attack' action. But first you have to get the knight next to it
by using the 'move' action.

Beware: You only have a certain amount of actions before the dragon wakes up and
burns you. Each 'attack' and 'move' count as 1 actions. 

In this level you have 2 actions to spend.
                `
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
                    [Tile.HOLE, Tile.HOLE, Tile.WALL, Tile.WALL, Tile.ROAD, Tile.ROAD],
                    [Tile.WALL, Tile.WALL, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE]
                ],
                knight: { position: { row: 2, column: 0 } },
                dragon: { position: { row: 0, column: 5 }, hp: 1 },
                actions: 7,
                exludedStatements: [StatementExlude.IS_NEXT_TO, StatementExlude.IF, StatementExlude.WHILE, StatementExlude.NOT],
            },
        ]
    },
    {
        name: "#2: While we are at it...",
        color: "#3a3e3e",
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
                exludedStatements: [StatementExlude.IF, StatementExlude.NOT],
                help: `Use: 'WHILE' to repeat a certain set of actions.
The actions are repeated as long as the condition 
of 'WHILE' is considered to be true.

For example:
'⬆️ is next to 🐉' will be true as long as to the NORTH of the knight there is the dragon.`
            },
            {
                level: [
                    [Tile.HOLE, Tile.HOLE, Tile.WALL, Tile.WALL, Tile.ROAD, Tile.ROAD],
                    [Tile.WALL, Tile.WALL, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE]

                ],
                knight: { position: { row: 2, column: 0 } },
                dragon: { position: { row: 0, column: 5 }, hp: 1 },
                actions: 4,
                exludedStatements: [StatementExlude.IF, StatementExlude.NOT],
            },
            {
                level: [
                    [Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.ROAD],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
                ],
                knight: { position: { row: 1, column: 0 } },
                dragon: { position: { row: 8, column: 0 }, hp: 1 },
                actions: 5,
                exludedStatements: [StatementExlude.IF, StatementExlude.NOT],
            }
        ]
    },
    {
        name: "#3: Don't be so negative...",
        color: "#3a3e3e",
        levels: [
            {
                level: [
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],

                ],
                knight: { position: { row: 0, column: 0 } },
                dragon: { position: { row: 0, column: 7 }, hp: 1 },
                actions: 2,
                exludedStatements: [StatementExlude.IF],
                help: `Sometimes you will need to be more negative and 
check a condition that is not 'true' but 'false'.

In this case you can change 'is next to' to 
'is not next to' by clicking on the 'is next to' button.
                `
            }
        ]
    },
    {
        name: "#4: It's dangerous to go alone...",
        color: "#3a3e3e",
        levels: [
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
                exludedStatements: [StatementExlude.IF],
                help: `It's dangerous to go alone. Take this... support from
your new friend: THE MAGE.

Just as the knight, the mage can use the 'move' action,
but he cannot attack! All he can do is  use a spell to
'support' the knight to give him one more attack point.

To do so position the mage next to the knight and use
his 'support' spell!

To change which characters the actions belong to,
click on the knight/mage character icons.
                `
            },
            {
                level: [
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE],
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD],
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE],
                ],
                knight: { position: { row: 2, column: 0 } },
                mage: { position: { row: 0, column: 0 } },
                dragon: { position: { row: 1, column: 7 }, hp: 2 },
                actions: 5,
                exludedStatements: [StatementExlude.IF],
            },
            {
                level: [
                    [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
                    [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE],
                ],
                knight: { position: { row: 0, column: 8 } },
                mage: { position: { row: 0, column: 0 } },
                dragon: { position: { row: 1, column: 4 }, hp: 2 },
                actions: 5,
                exludedStatements: [StatementExlude.IF],
            }
        ]
    },
    {
        name: "??: More ideas...",
        color: "#282828",
        levels: [
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
    }
]