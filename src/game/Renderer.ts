import { Level, Position, Tile } from "./Game";
import dragonImg from "./dragon.svg";
import knightImg from "./knight.svg";
import mageImg from "./mage.svg";

export type ChracterRender = {
    position: Position;
    attack: number;
}

export type DragonRender = {
    position: Position | Position[];
    hp: number;
}

export enum RenderType {
    LEVEL,
    DIALOG,
    ATTACK
}

export type LevelRender = {
    type: RenderType,
    level: Level,
    knight: ChracterRender,
    dragon: DragonRender,
    mage?: ChracterRender,
    attackPosition?: Position,
    isNextToPosition?: Position,
    supportPosition?: Position
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

function isOnTile(row: number, column: number, position: Position): boolean {
    return position.column === column && position.row === row;
}

function renderLevel(element: Element, entry: LevelRender): void {
    const { level, knight, dragon, mage, attackPosition, isNextToPosition, supportPosition } = entry;
    element.innerHTML = "";
    for (let row = 0; row < level.tiles.length; row++) {
        const rowEle = document.createElement("div");
        rowEle.setAttribute("style", "display: flex;");
        for (let column = 0; column < level.tiles[row].length; column++) {
            const tile = renderTile(level.tiles[row][column]);

            if (attackPosition && isOnTile(row, column, attackPosition)) {
                addAttack(tile);
            }

            if (isNextToPosition && isOnTile(row, column, isNextToPosition)) {
                addIsNextTo(tile);
            }

            if (supportPosition && isOnTile(row, column, supportPosition)) {
                addSupportPosition(tile);
            }

            if (!Array.isArray(dragon.position) && isOnTile(row, column, dragon!.position)) {
                if (dragon!.hp > 0) {
                    addDragonToTile(tile, dragon!.hp!);
                } else {
                    addDeadDragonToTile(tile, dragon!.hp!);
                }
            } else if (Array.isArray(dragon.position) && dragon.position.some(p => isOnTile(row, column, p))) {
                addRandomDragonToTile(tile);
            }
            if (isOnTile(row, column, knight!.position)) {
                addKnightToTile(tile, knight.attack!);
            }

            if (mage && isOnTile(row, column, mage.position)) {
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
    let additional: string = "";
    if (tile === Tile.ROAD) {
        bgColor = "#c9c9c9";
        additional = "outline: 1px solid gray;";
    } else if (tile === Tile.WALL) {
        bgColor = "linear-gradient(black, #606060)";
    }
    tileEle.setAttribute("style", `
    width: 50px;
    height: 50px; 
    background: ${bgColor};
    ${additional}
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

function addRandomDragonToTile(tile: Element) {
    const img = document.createElement("img");
    img.src = dragonImg;
    img.setAttribute("style", "position: absolute; width: 45px; height: 45px; filter: sepia(1);");
    tile.appendChild(img);
    addIndicator(tile, "?", "gray");
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

function addAttack(tile: Element) {
    const ele = document.createElement("div");
    ele.setAttribute("style", `
        position: absolute;
        width: 5px;
        height: 25px;
        margin-top: 5px;
        background-color: transparent;
        animation-name: swing;
        animation-duration: 1s;
    `);
    tile.appendChild(ele);
}

function addIsNextTo(tile: Element) {
    const ele = document.createElement("div");
    ele.textContent = "🔍";
    ele.setAttribute("style", `
        position: absolute;
        width: 5px;
        height: 25px;
        margin-top: 5px;
        opacity: 0;
        animation-name: blink;
        animation-duration: 1s;
    `);
    tile.appendChild(ele);
}

function addSupportPosition(tile: Element) {
    const ele = document.createElement("div");
    ele.textContent = "✨";
    ele.setAttribute("style", `
        position: absolute;
        width: 5px;
        height: 25px;
        margin-top: 5px;
        opacity: 0;
        animation-name: blink;
        animation-duration: 1s;
    `);
    tile.appendChild(ele);
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