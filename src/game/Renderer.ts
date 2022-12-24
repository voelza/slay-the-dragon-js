import { Dragon, Knight, Level, Position, Tile } from "./Game";
import dragonImg from "./dragon.svg";
import knightImg from "./knight.svg";

export type KnightRender = {
    position: Position;
}

export type DragonRender = {
    position: Position;
    hp: number;
}

export type RenderQueueEntry = {
    level: Level,
    knight: KnightRender,
    dragon: DragonRender
}

const renderQueue: RenderQueueEntry[] = [];

export function queueRender(entry: RenderQueueEntry): void {
    renderQueue.push(entry);
}

export function render(element: Element): void {
    let id: number | undefined = undefined;
    clearInterval(id);
    id = setInterval(async () => {
        if (renderQueue.length > 0) {
            console.log("Rendering UI");
            renderLevel(element, renderQueue.shift()!);
        }
    }, 1000);
}

function renderLevel(element: Element, entry: RenderQueueEntry): void {
    const { level, knight, dragon } = entry;
    element.innerHTML = "";
    for (let row = 0; row < level.tiles.length; row++) {
        const rowEle = document.createElement("div");
        rowEle.setAttribute("style", "display: flex;");
        for (let column = 0; column < level.tiles[row].length; column++) {
            const tile = renderTile(level.tiles[row][column]);
            if (dragon!.position.row === row && dragon!.position.column === column) {
                if (dragon!.hp > 0) {
                    addDragonToTile(tile);
                } else {
                    addDeadDragonToTile(tile);
                }
            }
            if (knight!.position.row === row && knight!.position.column === column) {
                addKnightToTile(tile);
            }
            rowEle.appendChild(tile);
        }
        element.appendChild(rowEle);
    }
}

function renderTile(tile: Tile): Element {
    const tileEle = document.createElement("div");
    let bgColor: string = "transparent";
    if (tile === Tile.ROAD) {
        bgColor = "white";
    }
    tileEle.setAttribute("style", `
    width: 50px;
    height: 50px; 
    border-radius: 5px; 
    background-color: ${bgColor};
    `);
    return tileEle;
}

function addDragonToTile(tile: Element) {
    const img = document.createElement("img");
    img.src = dragonImg;
    img.setAttribute("style", "width: 45px; height: 45px;");
    tile.appendChild(img);
}

function addDeadDragonToTile(tile: Element) {
    const img = document.createElement("img");
    img.src = dragonImg;
    img.setAttribute("style", "width: 45px; height: 45px; filter: grayscale(1);");
    tile.appendChild(img);
}

function addKnightToTile(tile: Element) {
    const img = document.createElement("img");
    img.src = knightImg;
    img.setAttribute("style", "width: 45px; height: 45px;");
    tile.appendChild(img);
}
