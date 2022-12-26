import { Level, Position, Tile } from "./Game";
import dragonImg from "./dragon.svg";
import knightImg from "./knight.svg";

export type KnightRender = {
    position: Position;
}

export type DragonRender = {
    position: Position;
    hp: number;
}

export enum RenderType {
    LEVEL,
    DIALOG
}

export type LevelRender = {
    type: RenderType,
    level: Level,
    knight: KnightRender,
    dragon: DragonRender
}

export type DialogRender = {
    type: RenderType,
    body: Element
}

const renderQueue: any[] = [];

export function queueRender(entry: any): void {
    renderQueue.push(entry);
}

export function render(element: Element): void {
    let id: number | undefined = undefined;
    clearInterval(id);
    id = setInterval(async () => {
        if (renderQueue.length > 0) {
            console.log("Rendering UI");
            const render = renderQueue.shift()!;
            if (render.type === RenderType.LEVEL) {
                renderLevel(element, render);
            } else if (render.type == RenderType.DIALOG) {
                renderDialog(render);
            }
        }
    }, 1000);
}

function renderLevel(element: Element, entry: LevelRender): void {
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
        bgColor = "#c9c9c9";
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
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px;");
    tile.appendChild(img);
}

function addDeadDragonToTile(tile: Element) {
    const img = document.createElement("img");
    img.src = dragonImg;
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px; filter: grayscale(1);");
    tile.appendChild(img);
}

function addKnightToTile(tile: Element) {
    const img = document.createElement("img");
    img.src = knightImg;
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px;");
    tile.appendChild(img);
}


function renderDialog(render: DialogRender) {
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");

    const form = document.createElement("form");
    form.setAttribute("method", "dialog");
    const tryAgain = document.createElement("button");
    tryAgain.textContent = "Try again";

    form.appendChild(tryAgain);
    dialog.appendChild(render.body);
    dialog.appendChild(form);
    document.body.appendChild(dialog);

    dialog.addEventListener('close', () => dialog.remove());
}