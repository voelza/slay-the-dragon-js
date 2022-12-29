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
        exludedStatements: [StatementExlude.IS_NEXT_TO, StatementExlude.IF, StatementExlude.WHILE, StatementExlude.NOT],
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
            [Tile.HOLE, Tile.ROAD, Tile.HOLE,],
            [Tile.ROAD, Tile.ROAD, Tile.ROAD],
            [Tile.HOLE, Tile.ROAD, Tile.HOLE],

        ],
        knight: { position: { row: 1, column: 1 } },
        dragon: { position: [{ row: 1, column: 2 }, { row: 0, column: 1 }, { row: 2, column: 1 }, { row: 1, column: 0 }], hp: 1 },
        actions: 4,
        help: `
        Sometimes you won't know where the dragon is going to show up and it could be in multiple locations.

        Your Knight can do more things!
        
        You can also check certain conditions of the level by using the 'isNextTo' function on
        your characters. So if you want to check whether a knight is next to a certain TILE or character.

        E.g. knight.isNextTo(EAST, WALL) checks whether the knight is next to a WALL on the EAST.
        E.g. knight.isNextTo(SOUTH, dragon) checks whether the knigth is next to the dragon on the SOUTH.

        If you use this with the 'if' statement you can do certain actions depending on certain states on
        the level.
        if(<condition>) {
            <action>
        } else {
            <other action>
        }

        You don't have to use the 'else' part if you don't need it.
        So for example:
        if(knight.isNextTo(EAST, WALL)) {
            knight.move(NORTH);
        }

        You can also negate the conditon by using the 'not' keyword like this:
        if(not knight.isNextTo(EAST, WALL)) {
            knight.move(NORTH);   
        }
        `,
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
    },
    {
        level: [
            [Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.HOLE, Tile.HOLE],
            [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
            [Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.WALL, Tile.HOLE, Tile.HOLE],

        ],
        knight: { position: { row: 1, column: 0 } },
        dragon: { position: { row: 1, column: 7 }, hp: 1 },
        actions: 2,
        help: `
        Your Knight can do more things!
        
        There is a new statement for you to use 'while'.
        With 'while' you can repeat an action as long as a certain condition is 'true'.
        How to use: while(<condition>) {
            <actions>
        }
        `
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