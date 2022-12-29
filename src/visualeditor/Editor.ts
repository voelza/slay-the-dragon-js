import knightIcon from "../game/knight.svg";
import mageIcon from "../game/mage.svg";

type Character = "knight" | "mage";
type Direction = "NORTH" | "EAST" | "SOUTH" | "WEST";
const ALL_DIRECTIONS: Direction[] = ["NORTH", "EAST", "SOUTH", "WEST"];
const DIRECTION_ICONS: Map<Direction, string> = new Map();
DIRECTION_ICONS.set("NORTH", "⬆️");
DIRECTION_ICONS.set("EAST", "➡️");
DIRECTION_ICONS.set("SOUTH", "⬇️");
DIRECTION_ICONS.set("WEST", "⬅️");

type Interactable = "dragon" | "ROAD" | "WALL" | "HOLE";
const ALL_INTERACTABLES: Interactable[] = ["dragon", "ROAD", "WALL", "HOLE"];
const INTERACTABLE_ICONS: Map<Interactable, string> = new Map();
INTERACTABLE_ICONS.set("dragon", "🐲");
INTERACTABLE_ICONS.set("ROAD", "🛣️");
INTERACTABLE_ICONS.set("WALL", "🧱");
INTERACTABLE_ICONS.set("HOLE", "🕳️");

interface UIStatement {
    icon(): string;
    toCode(): string;
}

class MoveStatement implements UIStatement {
    character: Character;
    direction: Direction;

    constructor(character: Character, direction: Direction) {
        this.character = character;
        this.direction = direction;
    }
    toCode(): string {
        return `${this.character}.move(${this.direction});`;
    }
    icon(): string {
        return "🏃‍♂️";
    }
}

class AttackStatement implements UIStatement {
    character: Character;
    direction: Direction;

    constructor(character: Character, direction: Direction) {
        this.character = character;
        this.direction = direction;
    }
    toCode(): string {
        return `${this.character}.attack(${this.direction});`;
    }
    icon(): string {
        return "🤺"
    }
}

class IsNextToStatement implements UIStatement {
    character: Character;
    direction: Direction;
    interactable: Interactable;

    constructor(character: Character, direction: Direction, interactable: Interactable) {
        this.character = character;
        this.direction = direction;
        this.interactable = interactable;
    }
    toCode(): string {
        return `${this.character}.isNextTo(${this.direction}, ${this.interactable});`;
    }
    icon(): string {
        return "🔍";
    }
}

class NotStatement implements UIStatement {
    isNextToStatement: IsNextToStatement;

    constructor(isNextToStatement: IsNextToStatement) {
        this.isNextToStatement = isNextToStatement;
    }
    toCode(): string {
        return `not ${this.isNextToStatement.toCode()}`;
    }
    icon(): string {
        return "🙅‍♀️";
    }
}

class IfStatement implements UIStatement {
    condition: NotStatement | IsNextToStatement;
    body: UIStatement[];

    constructor(condition: NotStatement | IsNextToStatement, body: UIStatement[]) {
        this.condition = condition;
        this.body = body;
    }
    toCode(): string {
        throw new Error("Method not implemented.");
    }
    icon(): string {
        return "IF";
    }
}

class WhileStatement implements UIStatement {
    condition: NotStatement | IsNextToStatement;
    body: UIStatement[];

    constructor(condition: NotStatement | IsNextToStatement, body: UIStatement[]) {
        this.condition = condition;
        this.body = body;
    }
    toCode(): string {
        throw new Error("Method not implemented.");
    }
    icon(): string {
        return "♾️";
    }
}


export type CodeGetter = () => string;
export type Resetter = () => void;
type AstObserver = () => void;

function reactiveAST(): [
    () => UIStatement[],
    (stmt: UIStatement) => void,
    (stmt: UIStatement) => void,
    (observer: AstObserver) => void,
    Resetter
] {
    let ast: UIStatement[] = [];
    const observers: AstObserver[] = [];
    return [
        () => ast,
        (stmt: UIStatement) => {
            ast.push(stmt);
            observers.forEach(o => o());
        },
        (stmt: UIStatement) => {
            ast.splice(ast.indexOf(stmt), 1);
            observers.forEach(o => o());
        },
        (observer: AstObserver) => observers.push(observer),
        () => {
            ast = [];
            observers.forEach(o => o());
        }
    ];
}


let draggedStmt: UIStatement | undefined;
let targetGroup: string | undefined;
const groupDropAreas: Map<string, HTMLElement[]> = new Map();

function addStmtDrag(element: HTMLElement, supplier: () => UIStatement, group: string): void {
    element.draggable = true;
    element.ondragstart = () => {
        draggedStmt = supplier();
        targetGroup = group;
        for (const areas of (groupDropAreas.get(group) ?? [])) {
            areas.classList.toggle("drag-highlight");
        }
    };
    element.ondragend = () => {
        draggedStmt = undefined;
        targetGroup = undefined;
        for (const areas of (groupDropAreas.get(group) ?? [])) {
            areas.classList.toggle("drag-highlight");
        }
    }
}
function addStmtDrop(element: HTMLElement, group: string, target: ((stmt: UIStatement) => void) | undefined = undefined): void {
    element.ondragover = (e) => e.preventDefault();
    element.ondrop = () => {
        if (!draggedStmt || !target || group !== targetGroup) {
            return;
        }
        target(draggedStmt);
    };

    const dragAreaGroup = groupDropAreas.get(group) ?? [];
    dragAreaGroup.push(element);
    groupDropAreas.set(group, dragAreaGroup);
}


export function createEditor(element: Element): [CodeGetter, Resetter] {
    const [program, pushStmt, removeStmt, addObserver, resetter] = reactiveAST();

    const vsEditor = document.createElement("div");
    vsEditor.setAttribute("style", `
        box-sizing: border-box;
        height: 100%;
        width: 100%;
    `);

    const controls = createControls(removeStmt);
    vsEditor.appendChild(controls);

    const vsInput = createVSInput(pushStmt);
    vsEditor.appendChild(vsInput);

    element.appendChild(vsEditor)


    addObserver(() => renderProgram(vsInput, program()));
    return [
        () => program().map(stmt => stmt.toCode()).join("\n"),
        resetter
    ];
}

function createControls(removeStmt: (stmt: UIStatement) => void): Element {
    const controls = document.createElement("div");
    controls.setAttribute("style", `
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
        margin: 10px;
    `);

    controls.appendChild(createControlItem("🏃‍♂️", (dir, _) => new MoveStatement("knight", dir)));
    controls.appendChild(createControlItem("🤺", (dir, _) => new AttackStatement("knight", dir)));
    controls.appendChild(createControlItem("🔍", (dir, inter) => new IsNextToStatement("knight", dir, inter!), true));

    addStmtDrop(controls, "control", removeStmt);

    return controls;
}

function createControlItem(label: string, supplier: (direction: Direction, interactable: Interactable | undefined) => UIStatement, withInter: boolean = false): Element {
    const item = createBase();
    let currentDirection: Direction = ALL_DIRECTIONS[0];
    let currentInteractable: Interactable | undefined = withInter ? ALL_INTERACTABLES[0] : undefined;

    const updateLabel = () => {
        item.textContent = `${label}${DIRECTION_ICONS.get(currentDirection)}${currentInteractable ? INTERACTABLE_ICONS.get(currentInteractable) : ""}`;
    }
    updateLabel();

    const overlay = document.createElement("div");
    overlay.setAttribute("style", "position: absolute; display: flex; gap: 5px; background-color: #1a1a1a; padding: 5px;");

    for (const direction of ALL_DIRECTIONS) {
        const select = document.createElement("div");
        select.textContent = DIRECTION_ICONS.get(direction)!;
        select.setAttribute("style", "cursor: pointer;");
        select.setAttribute("title", `Change direction to ${direction}`);
        select.addEventListener("click", () => {
            currentDirection = direction;
            overlay.remove();
            updateLabel();
        });
        overlay.appendChild(select);
    }

    if (withInter) {
        for (const interactable of ALL_INTERACTABLES) {
            const select = document.createElement("div");
            select.textContent = INTERACTABLE_ICONS.get(interactable)!;
            select.setAttribute("style", "cursor: pointer;");
            select.setAttribute("title", `Change to ${interactable}`);
            select.addEventListener("click", () => {
                currentInteractable = interactable;
                overlay.remove();
                updateLabel();
            });
            overlay.appendChild(select);
        }
    }

    let overlayOpen = false;
    item.onclick = () => {
        if (overlayOpen) {
            overlayOpen = false;
            overlay.remove();
        } else {
            overlayOpen = true;
            item.appendChild(overlay);
        }
    };

    addStmtDrag(item, () => supplier(currentDirection, currentInteractable), "program");

    return item;
}

function createVSInput(pushStmt: (stmt: UIStatement) => void) {
    const vsInput = document.createElement("div");
    vsInput.setAttribute("style", `
        background-color: #3b3b3b;
        height: 80%;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 5px;
        box-sizing: border-box;
    `);

    addStmtDrop(vsInput, "program", pushStmt);
    return vsInput;
}

function renderProgram(element: Element, program: UIStatement[]): void {
    console.log(program);
    element.innerHTML = "";
    for (const stmt of program) {
        element.appendChild(renderStmt(stmt));
    }
}

function renderStmt(stmt: UIStatement): Element {
    const element = createBase();
    element.setAttribute("style", element.getAttribute("style")! + "display: flex; align-items: center; gap: 5px;");

    if (stmt instanceof MoveStatement) {
        addMoveStmt(element, stmt);
    } else if (stmt instanceof AttackStatement) {
        addAttackStmt(element, stmt);
    }

    addStmtDrag(element, () => stmt, "control");

    return element;
}

function addMoveStmt(element: HTMLElement, stmt: MoveStatement): void {
    const { character } = stmt;
    element.appendChild(createCharacterIcon(character));
    element.appendChild(createMethod(`: ${stmt.icon()}${DIRECTION_ICONS.get(stmt.direction)}`))
}

function addAttackStmt(element: HTMLElement, stmt: AttackStatement): void {
    const { character } = stmt;
    element.appendChild(createCharacterIcon(character));
    element.appendChild(createMethod(`: ${stmt.icon()}${DIRECTION_ICONS.get(stmt.direction)}`))
}

function createCharacterIcon(character: Character): Element {
    const charIcon = document.createElement("img");
    charIcon.setAttribute("style", "width: 25px; height: 25px; object-fit: cover;");
    if (character === "knight") {
        charIcon.src = knightIcon;
    } else if (character === "mage") {
        charIcon.src = mageIcon;
    }
    return charIcon;
}

function createMethod(label: string): Element {
    const method = document.createElement("span");
    method.textContent = label;
    return method;
}

function createBase(): HTMLElement {
    const input = document.createElement("div");
    input.setAttribute("style", `
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: #1a1a1a;
    cursor: move;
    transition: border-color 0.25s;
    `);
    return input;
}