import knightIcon from "../game/knight.svg";
import { LevelDefinition, StatementExlude } from "../game/Levels";
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
INTERACTABLE_ICONS.set("dragon", "🐉");
INTERACTABLE_ICONS.set("ROAD", "👞");
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

class SupportStatement implements UIStatement {
    character: Character;
    direction: Direction;

    constructor(character: Character, direction: Direction) {
        this.character = character;
        this.direction = direction;
    }
    toCode(): string {
        return `${this.character}.support(${this.direction});`;
    }
    icon(): string {
        return "✨";
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
        return "NOT";
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
        return "WHILE";
    }
}


export type CodeGetter = () => string;
export type Resetter = () => void;
type AstObserver = () => void;

class AST {
    ast: UIStatement[];
    observers: AstObserver[];
    tabASTMap: Map<string, UIStatement[]>;
    constructor() {
        this.ast = [];
        this.observers = [];

        this.tabASTMap = new Map();
        this.tabASTMap.set("main", this.ast);
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

    changeTab(tab: string) {
        let tabAst = this.tabASTMap.get(tab);
        if (!tabAst) {
            tabAst = [];
            this.tabASTMap.set(tab, tabAst);
        }
        this.ast = tabAst;
        this.notify();
    }

    addObserver(observer: AstObserver) {
        this.observers.push(observer);
    }

    notify() {
        this.observers.forEach(o => o());
    }

    toCode(): string {
        let code = "";
        for (const [tab, ast] of this.tabASTMap.entries()) {
            if (tab === "main") {
                continue;
            }
            code += `extend ${tab} {${ast.map(stmt => stmt.toCode()).join("\n")}}`;
        }

        code += "\n";

        const mainProgram = this.tabASTMap.get("main")!.map(stmt => stmt.toCode()).join("\n");
        return code + mainProgram;
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

export function createEditor(element: Element, levelDef: LevelDefinition, stateObserver: () => void): [CodeGetter, Resetter] {
    element.innerHTML = "";

    const ast = new AST();

    const vsEditor = document.createElement("div");
    vsEditor.setAttribute("style", `
        box-sizing: border-box;
        height: 100%;
        width: 100%;
    `);

    const controls = createControls(levelDef, ast);
    vsEditor.appendChild(controls);

    const tabs = createTabs(levelDef, ast);
    vsEditor.appendChild(tabs);

    const vsInput = createVSInput(ast);
    vsEditor.appendChild(vsInput);

    element.appendChild(vsEditor);

    ast.addObserver(() => renderProgram(vsInput, ast));
    ast.addObserver(stateObserver);
    return [
        () => ast.toCode(),
        () => ast.reset()
    ];
}

function createControls(levelDef: LevelDefinition, ast: AST): Element {
    const controls = document.createElement("div");
    controls.setAttribute("style", `
        display:flex;
        flex-direction: column;
        gap: 5px;
        margin-top: -40px;
        margin-bottom: 5px;
    `);

    const trash = document.createElement("button");
    trash.setAttribute("style", `
        width: 55px;
        padding: 10px;
    `);
    trash.setAttribute("title", "Click to delete your whole program.");
    trash.textContent = "🗑️";
    trash.onclick = () => ast.reset();
    addStmtDrop(trash, "control", ast.remove.bind(ast));
    controls.appendChild(trash);


    const controlsContainer = document.createElement("div");
    controlsContainer.setAttribute("style", `
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 5px;
    `);


    const stmtExludes = levelDef.exludedStatements ?? [];
    isNotExluded(stmtExludes, StatementExlude.MOVE, () => controlsContainer.appendChild(createControlItem(MoveStatement.prototype, levelDef, (char, dir) => new MoveStatement(char, dir))));
    isNotExluded(stmtExludes, StatementExlude.ATTACK, () => controlsContainer.appendChild(createControlItem(AttackStatement.prototype, levelDef, (char, dir) => new AttackStatement(char, dir))));
    if (levelDef.mage) {
        isNotExluded(stmtExludes, StatementExlude.SUPPORT, () => controlsContainer.appendChild(createControlItem(SupportStatement.prototype, levelDef, (char, dir) => new SupportStatement(char, dir))));
    }
    isNotExluded(stmtExludes, StatementExlude.IS_NEXT_TO, () => controlsContainer.appendChild(createControlItem(IsNextToStatement.prototype, levelDef, (char, dir, inter) => new IsNextToStatement(char, dir, inter!), true)));
    isNotExluded(stmtExludes, StatementExlude.IF, () => controlsContainer.appendChild(createControlFlowItem(IfStatement.prototype, () => new IfStatement())));
    isNotExluded(stmtExludes, StatementExlude.WHILE, () => controlsContainer.appendChild(createControlFlowItem(WhileStatement.prototype, () => new WhileStatement())));
    isNotExluded(stmtExludes, StatementExlude.NOT, () => controlsContainer.appendChild(createControlFlowItem(NotStatement.prototype, () => new NotStatement())));

    controls.appendChild(controlsContainer);
    return controls;
}

function isNotExluded(excludes: StatementExlude[], expected: StatementExlude, callback: () => void) {
    if (!excludes.includes(expected)) {
        callback();
    }
}

function createControlFlowItem(label: UIStatement, supplier: () => UIStatement): Element {
    const item = createBase();
    item.textContent = label.icon();
    addStmtDrag(item, () => supplier(), "program");
    return item;
}

function createControlItem(label: UIStatement, levelDef: LevelDefinition, supplier: (character: Character, direction: Direction, interactable: Interactable | undefined) => UIStatement, withInter: boolean = false): Element {
    const levelHasMultipleCharacters = levelDef.mage !== undefined;

    const item = createBase();
    let character: Character = "knight";
    let currentDirection: Direction = ALL_DIRECTIONS[0];
    let currentInteractable: Interactable | undefined = withInter ? ALL_INTERACTABLES[0] : undefined;

    const updateLabel = () => {
        item.innerHTML = "";
        if (levelHasMultipleCharacters) {
            item.appendChild(createCharacterIcon(character));
        }
        const txt = document.createElement("span");
        txt.textContent = `${levelHasMultipleCharacters ? ": " : ""} ${label.icon()}${DIRECTION_ICONS.get(currentDirection)}${currentInteractable ? INTERACTABLE_ICONS.get(currentInteractable) : ""}`;
        item.appendChild(txt);
    }
    updateLabel();

    const overlay = document.createElement("div");
    overlay.setAttribute("style", "position: absolute; display: flex; gap: 5px; background-color: #1a1a1a; padding: 5px;");

    if (levelHasMultipleCharacters) {
        const charContainer = document.createElement("div");
        charContainer.setAttribute("style", `
            display: flex;
            flex-direction: column;
            gap: 20px;
        `);

        const knight = createCharacterIcon("knight");
        knight.setAttribute("style", knight.getAttribute("style")! + "cursor: pointer;");
        knight.onclick = () => {
            character = "knight";
            updateLabel();
        };

        const mage = createCharacterIcon("mage");
        mage.setAttribute("style", mage.getAttribute("style")! + "cursor: pointer;");
        mage.onclick = () => {
            character = "mage";
            updateLabel();
        };

        charContainer.appendChild(knight);
        charContainer.appendChild(mage);
        overlay.appendChild(charContainer);
    }

    const directionSelector = document.createElement("div");
    const createDirectionSelect = (direction: Direction) => {
        const directionSelect = document.createElement("div");
        directionSelect.textContent = DIRECTION_ICONS.get(direction)!;
        directionSelect.setAttribute("style", "cursor: pointer;");
        directionSelect.setAttribute("title", `Change direction to ${direction}`);
        directionSelect.addEventListener("click", () => {
            currentDirection = direction;
            updateLabel();
        });
        return directionSelect;
    }

    const north = createDirectionSelect("NORTH");
    north.setAttribute("style", north.getAttribute("style") + "margin-left: 14px; margin-bottom: -7px;");
    directionSelector.appendChild(north);

    const westEastSelector = document.createElement("div");
    westEastSelector.setAttribute("style", "display: flex; gap: 5px;");
    const west = createDirectionSelect("WEST");
    const east = createDirectionSelect("EAST");
    westEastSelector.appendChild(west);
    westEastSelector.appendChild(east);
    directionSelector.appendChild(westEastSelector);

    const south = createDirectionSelect("SOUTH");
    south.setAttribute("style", south.getAttribute("style") + "margin-left: 14px; margin-top: -7px;");
    directionSelector.appendChild(south);

    overlay.appendChild(directionSelector);

    if (withInter) {
        const interSelector = document.createElement("div");
        for (const interactable of ALL_INTERACTABLES) {
            const interSelect = document.createElement("div");
            interSelect.textContent = INTERACTABLE_ICONS.get(interactable)!;
            interSelect.setAttribute("style", "cursor: pointer;");
            interSelect.setAttribute("title", `Change to ${interactable}`);
            interSelect.addEventListener("click", () => {
                currentInteractable = interactable;
                updateLabel();
            });
            interSelector.appendChild(interSelect);
        }
        overlay.appendChild(interSelector);
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

    addStmtDrag(item, () => supplier(character, currentDirection, currentInteractable), "program");

    return item;
}

function createVSInput(ast: AST) {
    const vsInput = document.createElement("div");
    vsInput.setAttribute("style", `
        background-color: #3b3b3b;
        height: 78%;
        overflow: auto;
        display: flex;
        flex-direction: column;
        gap: 5px;
        padding: 5px;
        box-sizing: border-box;
        padding-bottom: 25px;
    `);

    addStmtDrop(vsInput, "program", ast.push.bind(ast));
    return vsInput;
}

function renderProgram(element: Element, ast: AST): void {
    element.innerHTML = "";
    for (const stmt of ast.ast) {
        element.appendChild(renderTopLevelStmt(stmt, ast));
    }
}

function renderTopLevelStmt(stmt: UIStatement, ast: AST): Element {
    const element = renderStmt(stmt, ast);
    addStmtDrag(element, () => stmt, "control");
    return element;
}

function renderInnerLevelStmt(stmt: UIStatement, remover: () => void, ast: AST): Element {
    const element = renderStmt(stmt, ast);
    addStmtDrag(element, () => { remover(); return undefined; }, "control");
    return element;
}

function renderStmt(stmt: UIStatement, ast: AST): HTMLElement {
    const element = createBase();
    element.setAttribute("style", element.getAttribute("style")! + "display: flex; align-items: center; gap: 5px;");

    if (stmt instanceof MoveStatement) {
        addDirectionStmt(element, stmt);
    } else if (stmt instanceof AttackStatement) {
        addDirectionStmt(element, stmt);
    } else if (stmt instanceof SupportStatement) {
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

function addControlFlowStmt(element: HTMLElement, stmt: IfStatement | WhileStatement | NotStatement, ast: AST): void {
    element.setAttribute("style", element.getAttribute("style")! + "padding: 0;");

    const controlFlowStmt = createBase();
    controlFlowStmt.setAttribute("style", controlFlowStmt.getAttribute("style") + `
    display: flex; 
    flex-direction: column; 
    gap: 5px;
    width: 100%;
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
            padding-bottom: 15px;
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

function createCharacterIcon(character: Character): HTMLElement {
    const charIcon = document.createElement("img");
    charIcon.setAttribute("style", "width: 1rem; height: 1rem; object-fit: cover;");
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

let activeTab: Element | undefined;
function createTabs(levelDef: LevelDefinition, ast: AST): Element {
    const tabs = document.createElement("div");
    tabs.classList.add("tabs");

    tabs.appendChild(createTab(ast, "main", true));
    for (const extend of levelDef.extends ?? []) {
        tabs.appendChild(createTab(ast, extend));
    }
    return tabs;
}

function createTab(ast: AST, label: string, active: boolean = false): Element {
    const tab = document.createElement("div");
    tab.textContent = label;

    tab.classList.add("tab");
    if (active) {
        activeTab = tab;
        tab.classList.add("active");
    }

    tab.onclick = () => {
        activeTab?.classList.remove("active");
        activeTab = tab;
        activeTab.classList.add("active");
        ast.changeTab(label);
    }
    return tab;
}