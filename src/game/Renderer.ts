import { Level, Position, Tile } from "./Game";
import dragonImg from "./dragon.svg";
import knightImg from "./knight.svg";
import mageImg from "./mage.svg";

export type ChracterRender = {
    position: Position;
    attack?: number;
    hp?: number;
}

export enum RenderType {
    LEVEL,
    DIALOG
}

export type LevelRender = {
    type: RenderType,
    level: Level,
    knight: ChracterRender,
    dragon: ChracterRender,
    mage?: ChracterRender
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
    const { level, knight, dragon, mage } = entry;
    element.innerHTML = "";
    for (let row = 0; row < level.tiles.length; row++) {
        const rowEle = document.createElement("div");
        rowEle.setAttribute("style", "display: flex;");
        for (let column = 0; column < level.tiles[row].length; column++) {
            const tile = renderTile(level.tiles[row][column]);
            if (dragon!.position.row === row && dragon!.position.column === column) {
                if (dragon!.hp! > 0) {
                    addDragonToTile(tile, dragon!.hp!);
                } else {
                    addDeadDragonToTile(tile, dragon!.hp!);
                }
            }
            if (knight!.position.row === row && knight!.position.column === column) {
                addKnightToTile(tile, knight.attack!);
            }

            if (mage && mage.position.row === row && mage.position.column === column) {
                addMageTile(tile, mage.attack!);
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

function addDragonToTile(tile: Element, hp: number) {
    const img = document.createElement("img");
    img.src = dragonImg;
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px;");
    tile.appendChild(img);
    addIndicator(tile, `${hp}`, "green");
}

function addDeadDragonToTile(tile: Element, hp: number) {
    const img = document.createElement("img");
    img.src = dragonImg;
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px; filter: grayscale(1);");
    tile.appendChild(img);
    addIndicator(tile, `${hp}`, "gray");
}

function addKnightToTile(tile: Element, attack: number) {
    const img = document.createElement("img");
    img.src = knightImg;
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px;");
    tile.appendChild(img);
    addIndicator(tile, `${attack}`, "black");
}

function addMageTile(tile: Element, attack: number) {
    const img = document.createElement("img");
    img.src = mageImg;
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px;");
    tile.appendChild(img);
    addIndicator(tile, `${attack}`, "blue");
}

function addIndicator(tile: Element, label: string, color: string) {
    const indicator = document.createElement("div");
    indicator.setAttribute("style", `
    color: white; 
    width: 23px; 
    height: 23px; 
    border-radius: 50%; 
    background-color: ${color}; 
    display: flex; 
    justify-content: center; 
    align-items: center;
    position: relative;
    top: 35px;
    left: 20px;
    `)
    const innerInidicator = document.createElement("div");
    indicator.appendChild(innerInidicator);
    indicator.textContent = label;
    tile.appendChild(indicator);
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