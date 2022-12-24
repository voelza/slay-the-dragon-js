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
    }
]