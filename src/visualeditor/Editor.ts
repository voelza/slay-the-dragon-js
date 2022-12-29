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
    condition: UIStatement | undefined;

    constructor(condition: UIStatement | undefined = undefined) {
        this.condition = condition;
    }
    toCode(): string {
        return `not ${this.condition?.toCode()}`;
    }
    icon(): string {
        return "🙅‍♀️";
    }
}

class IfStatement implements UIStatement {
    condition: UIStatement | undefined;
    body: UIStatement[];

    constructor(condition: NotStatement | IsNextToStatement | undefined = undefined, body: UIStatement[] = []) {
        this.condition = condition;
        this.body = body;
    }
    toCode(): string {
        return `if(${this.condition?.toCode().replaceAll(";", "")}){${this.body.map(s => s.toCode()).join("")}}`
    }
    icon(): string {
        return "IF";
    }
}

class WhileStatement implements UIStatement {
    condition: UIStatement | undefined;
    body: UIStatement[];

    constructor(condition: NotStatement | IsNextToStatement | undefined = undefined, body: UIStatement[] = []) {
        this.condition = condition;
        this.body = body;
    }
    toCode(): string {
        return `while(${this.condition?.toCode().replaceAll(";", "")}){${this.body.map(s => s.toCode()).join("")}}`
    }

    icon(): string {
        return "♾️";
    }
}


export type CodeGetter = () => string;
export type Resetter = () => void;
type AstObserver = () => void;

class ReactiveAST {
    ast: UIStatement[];
    observers: AstObserver[];
    constructor() {
        this.ast = [];
        this.observers = [];
    }

    push(stmt: UIStatement) {
        this.ast.push(stmt);
        this.notify();
    }

    remove(stmt: UIStatement) {
        this.ast.splice(this.ast.indexOf(stmt), 1);
        this.notify();
    }

    reset() {
        this.ast = [];
        this.notify();
    }

    addObserver(observer: AstObserver) {
        this.observers.push(observer);
    }

    notify() {
        this.observers.forEach(o => o());
    }
}

let dragItemSupplier: (() => UIStatement | undefined) | undefined;
let targetGroup: string | undefined;
const groupDropAreas: Map<string, HTMLElement[]> = new Map();
let dragOverAreaId: number | undefined;
let idCounter: number = 0;

function addStmtDrag(element: HTMLElement, supplier: () => UIStatement | undefined, group: string): void {
    element.draggable = true;
    element.ondragstart = () => {
        if (dragItemSupplier !== undefined) {
            return;
        }

        dragItemSupplier = supplier;
        targetGroup = group;
        for (const areas of (groupDropAreas.get(group) ?? [])) {
            areas.classList.add("drag-highlight");
        }
    };
    element.ondragend = () => {
        dragItemSupplier = undefined;
        targetGroup = undefined;
        for (const areas of (groupDropAreas.get(group) ?? [])) {
            areas.classList.remove("drag-highlight");
        }
    }
}

function addStmtDrop(element: HTMLElement, group: string, target: ((stmt: UIStatement) => void) | undefined = undefined): void {
    const id = ++idCounter;
    element.ondragover = (e) => {
        e.preventDefault();
        if (dragOverAreaId === undefined) {
            dragOverAreaId = id;
        }
    };
    element.ondragleave = () => {
        if (dragOverAreaId === id) {
            dragOverAreaId = undefined;
        }
    }

    element.ondrop = () => {
        if (!dragItemSupplier || !target || group !== targetGroup) {
            return;
        }
        if (id !== dragOverAreaId) {
            return;
        }
        dragOverAreaId = undefined;
        const dragItem = dragItemSupplier();
        if (dragItem) {
            target(dragItem);
        }
    };

    const dragAreaGroup = groupDropAreas.get(group) ?? [];
    dragAreaGroup.push(element);
    groupDropAreas.set(group, dragAreaGroup);
}

export function createEditor(element: Element): [CodeGetter, Resetter] {
    const ast = new ReactiveAST();

    const vsEditor = document.createElement("div");
    vsEditor.setAttribute("style", `
        box-sizing: border-box;
        height: 100%;
        width: 100%;
    `);

    const controls = createControls(ast);
    vsEditor.appendChild(controls);

    const vsInput = createVSInput(ast);
    vsEditor.appendChild(vsInput);

    element.appendChild(vsEditor);

    ast.addObserver(() => renderProgram(vsInput, ast));
    return [
        () => ast.ast.map(stmt => stmt.toCode()).join("\n"),
        () => ast.reset()
    ];
}

function createControls(ast: ReactiveAST): Element {
    const controls = document.createElement("div");
    controls.setAttribute("style", `
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
        margin: 10px;
    `);

    controls.appendChild(createControlItemWithOverlay(MoveStatement.prototype.icon(), (dir) => new MoveStatement("knight", dir)));
    controls.appendChild(createControlItemWithOverlay(AttackStatement.prototype.icon(), (dir) => new AttackStatement("knight", dir)));
    controls.appendChild(createControlItemWithOverlay(IsNextToStatement.prototype.icon(), (dir, inter) => new IsNextToStatement("knight", dir, inter!), true));
    controls.appendChild(createControlFlowItem(IfStatement.prototype.icon(), () => new IfStatement()));
    controls.appendChild(createControlFlowItem(WhileStatement.prototype.icon(), () => new WhileStatement()));
    controls.appendChild(createControlFlowItem(NotStatement.prototype.icon(), () => new NotStatement()));

    addStmtDrop(controls, "control", ast.remove.bind(ast));
    return controls;
}

function createControlFlowItem(label: string, supplier: () => UIStatement): Element {
    const item = createBase();
    item.textContent = label;
    addStmtDrag(item, () => supplier(), "program");
    return item;
}

function createControlItemWithOverlay(label: string, supplier: (direction: Direction, interactable: Interactable | undefined) => UIStatement, withInter: boolean = false): Element {
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

function createVSInput(ast: ReactiveAST) {
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

    addStmtDrop(vsInput, "program", ast.push.bind(ast));
    return vsInput;
}

function renderProgram(element: Element, ast: ReactiveAST): void {
    element.innerHTML = "";
    for (const stmt of ast.ast) {
        element.appendChild(renderTopLevelStmt(stmt, ast));
    }
}

function renderTopLevelStmt(stmt: UIStatement, ast: ReactiveAST): Element {
    const element = renderStmt(stmt, ast);
    addStmtDrag(element, () => stmt, "control");
    return element;
}

function renderInnerLevelStmt(stmt: UIStatement, remover: () => void, ast: ReactiveAST): Element {
    const element = renderStmt(stmt, ast);
    addStmtDrag(element, () => { remover(); return undefined; }, "control");
    return element;
}

function renderStmt(stmt: UIStatement, ast: ReactiveAST): HTMLElement {
    const element = createBase();
    element.setAttribute("style", element.getAttribute("style")! + "display: flex; align-items: center; gap: 5px;");

    if (stmt instanceof MoveStatement) {
        addDirectionStmt(element, stmt);
    } else if (stmt instanceof AttackStatement) {
        addDirectionStmt(element, stmt);
    } else if (stmt instanceof IsNextToStatement) {
        addIsNextToStmt(element, stmt);
    } else if (stmt instanceof IfStatement) {
        addControlFlowStmt(element, stmt, ast);
    } else if (stmt instanceof WhileStatement) {
        addControlFlowStmt(element, stmt, ast);
    } else if (stmt instanceof NotStatement) {
        addControlFlowStmt(element, stmt, ast);
    }

    return element;
}

function addDirectionStmt(element: HTMLElement, stmt: MoveStatement | AttackStatement): void {
    const { character, direction } = stmt;
    element.appendChild(createCharacterIcon(character));
    element.appendChild(createMethod(`: ${stmt.icon()}${DIRECTION_ICONS.get(direction)}`));
}

function addIsNextToStmt(element: HTMLElement, stmt: IsNextToStatement): void {
    const { character, direction, interactable } = stmt;
    element.appendChild(createCharacterIcon(character));
    element.appendChild(createMethod(`: ${stmt.icon()}${DIRECTION_ICONS.get(direction)}${INTERACTABLE_ICONS.get(interactable)}`));
}

function addControlFlowStmt(element: HTMLElement, stmt: IfStatement | WhileStatement | NotStatement, ast: ReactiveAST): void {
    const controlFlowStmt = createBase();
    controlFlowStmt.setAttribute("style", controlFlowStmt.getAttribute("style") + `
    display: flex; 
    flex-direction: column; 
    gap: 5px;
    width: 100%;
    padding: 0;
    `);

    const conditionContainer = document.createElement("div");
    conditionContainer.setAttribute("style", `
    display: flex; 
    align-items: center; 
    gap: 15px;
    width: 100%;
    `);

    const icon = document.createElement("span");
    icon.textContent = stmt.icon();
    conditionContainer.appendChild(icon);

    const conditionArea = document.createElement("div");
    conditionArea.setAttribute("style", `
    padding: 5px; 
    min-height: 50px; 
    background-color: rgba(255, 255, 255, .1); 
    border-radius: 5px;
    width: 100%;
    `);

    if (stmt.condition) {
        conditionArea.appendChild(
            renderInnerLevelStmt(
                stmt.condition,
                () => {
                    stmt.condition = undefined;
                    ast.notify();
                },
                ast
            )
        );
    }
    addStmtDrop(conditionArea, "program", (condition) => {
        stmt.condition = condition;
        ast.notify();
    });

    conditionContainer.appendChild(conditionArea);
    controlFlowStmt.appendChild(conditionContainer);

    if (!(stmt instanceof NotStatement)) {
        const body = document.createElement("div");
        body.setAttribute("style", `
            padding: 5px; 
            min-height: 50px; 
            background-color: rgba(255, 255, 255, .1); 
            border-radius: 5px; 
            display: flex; 
            flex-direction: column; 
            gap: 5px;
    `);
        stmt.body.forEach(s => body.appendChild(
            renderInnerLevelStmt(
                s,
                () => {
                    stmt.body.splice(stmt.body.indexOf(s), 1);
                    ast.notify();
                },
                ast
            )
        )
        );
        addStmtDrop(body, "program", (bodyStmt) => {
            stmt.body.push(bodyStmt);
            ast.notify();
        });

        controlFlowStmt.appendChild(body);
    }
    element.appendChild(controlFlowStmt);
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
