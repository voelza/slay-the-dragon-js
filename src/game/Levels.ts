import { Position, Tile } from "./Game";

export type CharacterDefinition = {
    position: Position;
    hp?: number | undefined;
}

export type LevelDefinition = {
    level: Tile[][];
    knight: CharacterDefinition;
    dragon: CharacterDefinition;
    actions: number;
    solution?: string;
}

export const levels: LevelDefinition[] = [
    {
        level: [
            [Tile.ROAD, Tile.ROAD, Tile.ROAD],
        ],
        knight: { position: { row: 0, column: 0 } },
        dragon: { position: { row: 0, column: 2 }, hp: 1 },
        actions: 2
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
]