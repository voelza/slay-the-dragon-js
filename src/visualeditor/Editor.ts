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
    openState: AddState;

    constructor(condition: UIStatement | undefined = undefined) {
        this.condition = condition;
        this.openState = { isOpen: false };
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
    openState: AddState;

    constructor(condition: NotStatement | IsNextToStatement | undefined = undefined, body: UIStatement[] = []) {
        this.condition = condition;
        this.body = body;
        this.openState = { isOpen: false };
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
    openState: AddState;

    constructor(condition: NotStatement | IsNextToStatement | undefined = undefined, body: UIStatement[] = []) {
        this.condition = condition;
        this.body = body;
        this.openState = { isOpen: false };
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

    moveDown(stmt: UIStatement): void {
        const currentIndex = this.ast.indexOf(stmt);
        if (currentIndex === this.ast.length - 1) {
            return;
        }

        if (currentIndex !== -1) {
            this.ast.splice(currentIndex, 1);
            this.ast.splice(currentIndex + 1, 0, stmt);
        }
        this.notify();
    }
    moveUp(stmt: UIStatement): void {
        const currentIndex = this.ast.indexOf(stmt);
        if (currentIndex === 0) {
            return;
        }

        if (currentIndex !== -1) {
            this.ast.splice(currentIndex, 1);
            this.ast.splice(currentIndex - 1, 0, stmt);
        }
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

    toAstFunctions(): ASTFunctions {
        return {
            pushStmt: this.push.bind(this),
            removeStmt: this.remove.bind(this),
            moveDown: this.moveDown.bind(this),
            moveUp: this.moveUp.bind(this),
            notify: this.notify.bind(this)
        }
    }
}

type ASTFunctions = {
    pushStmt?: (stmt: UIStatement) => void,
    removeStmt?: (stmt: UIStatement) => void,
    moveUp?: (stmt: UIStatement) => void,
    moveDown?: (stmt: UIStatement) => void,
    notify?: () => void
}

type ControlItem = {
    stmtDef: UIStatement,
    pushStmt: (stmt: UIStatement) => void,
    supplier: () => UIStatement
};

type RenderLevelDef = {
    exludedStatements: StatementExlude[],
    hasMage?: boolean
}

type ScrollObserver = (scrollTop: number) => void;

class ObservableScrollArea {
    element: Element;
    observer: ScrollObserver[];
    constructor(element: Element) {
        this.element = element;
        this.observer = [];

        this.element.addEventListener("scroll", () => {
            this.observer.forEach(o => o(this.element.scrollTop));
        });
    }

    addObserver(observer: ScrollObserver): void {
        this.observer.push(observer);
    }

    removeObserver(observer: ScrollObserver): void {
        this.observer.splice(this.observer.indexOf(observer), 1);
    }

}

let vsInputObserver: ObservableScrollArea | undefined;
export function createEditor(element: Element, levelDef: LevelDefinition, stateObserver: () => void): [CodeGetter, Resetter] {
    element.innerHTML = "";

    const ast = new AST();

    const vsEditor = document.createElement("div");
    vsEditor.setAttribute("style", `
        box-sizing: border-box;
        height: 100%;
        width: 100%;
    `);

    const tabs = createTabs(levelDef, ast);
    vsEditor.appendChild(tabs);

    const vsInput = createVSInput();
    vsInputObserver = new ObservableScrollArea(vsInput);
    vsEditor.appendChild(vsInput);
    renderProgram(vsInput, levelDef, ast);

    element.appendChild(vsEditor);

    ast.addObserver(() => renderProgram(vsInput, levelDef, ast));
    ast.addObserver(stateObserver);
    return [
        () => ast.toCode(),
        () => ast.reset()
    ];
}

function createVSInput(): Element {
    const vsInput = document.createElement("div");
    vsInput.setAttribute("style", `
    background-color: #3b3b3b;
    height: 93%;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 5px;
    box-sizing: border-box;
    padding-bottom: 25px;
    `);
    return vsInput;
}

type AddState = {
    isOpen: boolean;
}

const TOP_LEVEL_EXCLUDES: StatementExlude[] = [StatementExlude.IS_NEXT_TO, StatementExlude.NOT];
let topLevelAddState: AddState = { isOpen: false };
function renderProgram(element: Element, levelDef: LevelDefinition, ast: AST): void {
    element.innerHTML = "";
    for (const stmt of ast.ast) {
        element.appendChild(renderStmt(stmt, ast.toAstFunctions(), { exludedStatements: levelDef.exludedStatements ?? [], hasMage: levelDef.mage !== undefined }));
    }
    element.appendChild(
        createAddStmtButton(
            ast.push.bind(ast),
            { exludedStatements: [...levelDef.exludedStatements ?? [], ...TOP_LEVEL_EXCLUDES], hasMage: levelDef.mage !== undefined },
            topLevelAddState
        )
    );
}

function createAddStmtButton(pushStmt: (stmt: UIStatement) => void, levelDef: RenderLevelDef, state: AddState): Element {
    const addBtn = createBase();
    addStyle(addBtn, `
    text-align: center; 
    font-size: 1rem;
    color: #8f8282;
    background-color: #4c4a4a; 
    padding: 5px;
    `);

    const label = document.createElement("div");
    label.setAttribute("style", "cursor: pointer;");
    label.textContent = "+ add";
    addBtn.appendChild(label);

    const stms = createStmts(levelDef, pushStmt);
    if (state.isOpen) {
        addBtn.appendChild(stms);
    } else {
        stms.remove();
    }

    label.onclick = () => {
        state.isOpen = !state.isOpen;
        if (state.isOpen) {
            addBtn.appendChild(stms);
        } else {
            stms.remove();
        }
    }
    return addBtn;
}

let globalCharacter: Character = "knight";
let globalCurrentDirection: Direction = ALL_DIRECTIONS[0];
let globalInteractable: Interactable = ALL_INTERACTABLES[0];
function createStmts(levelDef: RenderLevelDef, pushStmt: (stmt: UIStatement) => void): Element {
    let character: Character = globalCharacter;
    let currentDirection: Direction = globalCurrentDirection;
    let currentInteractable: Interactable = globalInteractable;

    const stmts = document.createElement("div");
    stmts.setAttribute("style", "display: flex; flex-direction: column; gap: 5px; justify-content: center; align-items: center;");

    const options = document.createElement("div");
    options.setAttribute("style", "display: flex; gap: 5px; justify-content: center; align-items: center;");
    if (levelDef.hasMage) {
        options.appendChild(createCharacterSelector((c) => {
            character = c;
            fillControlItems();
        }));
    }
    options.appendChild(createDirectionSelector((direction) => {
        currentDirection = direction;
    }));
    if (!levelDef.exludedStatements.includes(StatementExlude.IS_NEXT_TO)) {
        options.appendChild(createInteractableSelector((inter) => {
            currentInteractable = inter;
        }));
    }
    stmts.appendChild(options);

    const stmtsContainer = document.createElement("div");
    stmtsContainer.setAttribute("style", "display: flex; gap: 5px; justify-content: center;");

    const stdControlItem = { pushStmt };

    const stmtExludes = levelDef.exludedStatements;
    const fillControlItems = () => {
        stmtsContainer.innerHTML = "";

        isNotExluded(
            stmtExludes,
            StatementExlude.MOVE,
            () => stmtsContainer.appendChild(createControlItem(
                { ...stdControlItem, stmtDef: MoveStatement.prototype, supplier: () => new MoveStatement(character, currentDirection) }
            )));

        if (character === "knight") {
            isNotExluded(
                stmtExludes,
                StatementExlude.ATTACK,
                () => stmtsContainer.appendChild(createControlItem(
                    { ...stdControlItem, stmtDef: AttackStatement.prototype, supplier: () => new AttackStatement(character, currentDirection) }
                )));
        }

        if (levelDef.hasMage && character === "mage") {
            isNotExluded(
                stmtExludes,
                StatementExlude.SUPPORT,
                () => stmtsContainer.appendChild(createControlItem(
                    { ...stdControlItem, stmtDef: SupportStatement.prototype, supplier: () => new SupportStatement(character, currentDirection) }
                )));
        }
        isNotExluded(
            stmtExludes,
            StatementExlude.IS_NEXT_TO,
            () => stmtsContainer.appendChild(createControlItem(
                { ...stdControlItem, stmtDef: IsNextToStatement.prototype, supplier: () => new IsNextToStatement(character, currentDirection, currentInteractable) }
            )));
        isNotExluded(stmtExludes, StatementExlude.IF, () => stmtsContainer.appendChild(createControlItem(
            { ...stdControlItem, stmtDef: IfStatement.prototype, supplier: () => new IfStatement() }
        )));
        isNotExluded(stmtExludes, StatementExlude.WHILE, () => stmtsContainer.appendChild(createControlItem(
            { ...stdControlItem, stmtDef: WhileStatement.prototype, supplier: () => new WhileStatement() }
        )));
        isNotExluded(stmtExludes, StatementExlude.NOT, () => stmtsContainer.appendChild(createControlItem(
            { ...stdControlItem, stmtDef: NotStatement.prototype, supplier: () => new NotStatement() }
        )));
    }

    fillControlItems();
    stmts.appendChild(stmtsContainer);
    return stmts;
}

function isNotExluded(excludes: StatementExlude[], expected: StatementExlude, callback: () => void) {
    if (!excludes.includes(expected)) {
        callback();
    }
}

function createControlItem(controlItem: ControlItem): Element {
    const { stmtDef, pushStmt, supplier } = controlItem;
    const item = createBase();
    addStyle(item, "cursor: pointer;");
    item.textContent = stmtDef.icon();
    item.onclick = () => pushStmt(supplier());
    return item;
}

function createDirectionSelector(callback: (direction: Direction) => void): Element {
    const btn = createBase();
    addStyle(btn, "width: fit-content; cursor: pointer;");
    const updateLabel = () => {
        btn.textContent = DIRECTION_ICONS.get(globalCurrentDirection)!;
        btn.setAttribute("title", `to the ${globalCurrentDirection} of your character`);
    }
    updateLabel();

    const directionSelector = document.createElement("div");
    directionSelector.setAttribute("style", `
    display: flex;
    flex-direction: column;    
    justify-content: center;
    width: fit-content;
    position: absolute;
    background-color: #383838;
    padding: 5px;
    border-radius: 0px 5px 0px 15px;
    margin-left: 25px;
    box-shadow: 2px 3px black;
    `);
    const createDirectionSelect = (direction: Direction) => {
        const select = document.createElement("div");
        select.textContent = DIRECTION_ICONS.get(direction)!;
        select.setAttribute("style", "cursor: pointer;");
        select.setAttribute("title", `to the ${direction} of your character`);
        select.addEventListener("click", () => {
            globalCurrentDirection = direction;
            updateLabel();
            callback(direction);
        });
        return select;
    }

    const north = createDirectionSelect("NORTH");
    addStyle(north, "margin: auto;");
    directionSelector.appendChild(north);

    const westEastSelector = document.createElement("div");
    westEastSelector.setAttribute("style", "display: flex; gap: 5px;");
    const west = createDirectionSelect("WEST");
    const east = createDirectionSelect("EAST");
    westEastSelector.appendChild(west);
    westEastSelector.appendChild(east);
    directionSelector.appendChild(westEastSelector);

    const south = createDirectionSelect("SOUTH");
    addStyle(south, "margin: auto;");
    directionSelector.appendChild(south);

    const orgStyling = directionSelector.getAttribute("style");
    const updatePosition = (scrollTop: number) => {
        directionSelector.setAttribute("style", `${orgStyling}top: ${directionSelector.parentElement!.offsetTop - scrollTop + 30}px;`);
    };

    let overlayVisible = false;
    btn.onclick = () => {
        overlayVisible = !overlayVisible;
        if (overlayVisible) {
            btn.appendChild(directionSelector);
            updatePosition(vsInputObserver!.element.scrollTop);
            vsInputObserver!.addObserver(updatePosition);
        } else {
            directionSelector.remove();
            vsInputObserver?.removeObserver(updatePosition);
        }
    }
    return btn;
}

function createInteractableSelector(callback: (interactable: Interactable) => void): Element {
    const btn = createBase();
    addStyle(btn, "width: fit-content;  cursor: pointer;");
    const updateLabel = () => {
        btn.textContent = INTERACTABLE_ICONS.get(globalInteractable)!;
        btn.setAttribute("title", globalInteractable);
    }
    updateLabel();

    const interactableSelector = document.createElement("div");
    interactableSelector.setAttribute("style", `
    display: flex;
    flex-direction: column;    
    justify-content: center;
    width: fit-content;
    position: absolute;
    background-color: #383838;
    padding: 5px;
    border-radius: 0px 5px 0px 15px;
    margin-left: 25px;
    box-shadow: 2px 3px black;
    `);
    const createInteractableSelect = (interactable: Interactable) => {
        const select = document.createElement("div");
        select.textContent = INTERACTABLE_ICONS.get(interactable)!;
        select.setAttribute("style", "cursor: pointer;");
        select.setAttribute("title", interactable);
        select.addEventListener("click", () => {
            globalInteractable = interactable;
            updateLabel();
            callback(interactable);
        });
        return select;
    }
    for (const inter of ALL_INTERACTABLES) {
        interactableSelector.appendChild(createInteractableSelect(inter));
    }
    const orgStyling = interactableSelector.getAttribute("style");
    const updatePosition = (scrollTop: number) => {
        interactableSelector.setAttribute("style", `${orgStyling}top: ${interactableSelector.parentElement!.offsetTop - scrollTop + 30}px;`);
    };

    let overlayVisible = false;
    btn.onclick = () => {
        overlayVisible = !overlayVisible;
        if (overlayVisible) {
            btn.appendChild(interactableSelector);
            updatePosition(vsInputObserver!.element.scrollTop);
            vsInputObserver!.addObserver(updatePosition);
        } else {
            interactableSelector.remove();
            vsInputObserver?.removeObserver(updatePosition);
        }
    }
    return btn;
}

function createCharacterSelector(callback: (character: Character) => void, withColon: boolean = false): HTMLElement {
    const btn = createBase();
    addStyle(btn, "width: fit-content;  cursor: pointer;");
    const updateLabel = () => {
        btn.innerHTML = "";
        btn.appendChild(createCharacterIcon(globalCharacter));
        if (withColon) {
            btn.appendChild(createLabelElement(": "));
        }
    }
    updateLabel();

    const characterSelector = document.createElement("div");
    characterSelector.setAttribute("style", `
    display: flex;
    flex-direction: column;    
    justify-content: center;
    width: fit-content;
    position: absolute;
    background-color: #383838;
    padding: 5px;
    border-radius: 0px 5px 0px 15px;
    margin-left: 25px;
    box-shadow: 2px 3px black;
    `);
    const createCharacterSelect = (character: Character) => {
        const select = document.createElement("div");
        select.appendChild(createCharacterIcon(character));
        select.setAttribute("style", "cursor: pointer;");
        select.addEventListener("click", () => {
            globalCharacter = character;
            updateLabel();
            callback(character);
        });
        return select;
    }
    characterSelector.appendChild(createCharacterSelect("knight"));
    characterSelector.appendChild(createCharacterSelect("mage"));

    const orgStyling = characterSelector.getAttribute("style");
    const updatePosition = (scrollTop: number) => {
        characterSelector.setAttribute("style", `${orgStyling}top: ${characterSelector.parentElement!.offsetTop - scrollTop + 30}px;`);
    };

    let overlayVisible = false;
    btn.onclick = () => {
        overlayVisible = !overlayVisible;
        if (overlayVisible) {
            btn.appendChild(characterSelector);
            updatePosition(vsInputObserver!.element.scrollTop);
            vsInputObserver!.addObserver(updatePosition);
        } else {
            characterSelector.remove();
            vsInputObserver?.removeObserver(updatePosition);
        }
    }
    return btn;
}

function renderStmt(stmt: UIStatement, astFunctions: ASTFunctions, levelDef: RenderLevelDef): HTMLElement {
    const element = createBase();
    addStyle(element, "display: flex; align-items: center; gap: 5px;");

    if (stmt instanceof MoveStatement) {
        addDirectionStmt(element, astFunctions, stmt);
    } else if (stmt instanceof AttackStatement) {
        addDirectionStmt(element, astFunctions, stmt);
    } else if (stmt instanceof SupportStatement) {
        addDirectionStmt(element, astFunctions, stmt);
    } else if (stmt instanceof IfStatement) {
        addControlFlowStmt(element, stmt, astFunctions, levelDef);
    } else if (stmt instanceof WhileStatement) {
        addControlFlowStmt(element, stmt, astFunctions, levelDef);
    }

    return element;
}

function addDirectionStmt(element: HTMLElement, astFunctions: ASTFunctions, stmt: MoveStatement | AttackStatement): void {
    const { character, direction } = stmt;
    element.appendChild(createCharacterIcon(character));
    element.appendChild(createLabelElement(`: ${stmt.icon()}${DIRECTION_ICONS.get(direction)}`));
    element.appendChild(createASTManipulationButtons(astFunctions, stmt));
}

function addControlFlowStmt(element: HTMLElement, stmt: IfStatement | WhileStatement, astFunctions: ASTFunctions, levelDef: RenderLevelDef): void {
    addStyle(element, "padding: 0;");

    const controlFlowStmt = createBase();
    addStyle(controlFlowStmt, `
    display: flex; 
    flex-direction: column; 
    gap: 5px;
    width: 100%;
    padding: 5px;
    `);

    const maniuplationArea = createASTManipulationButtons(astFunctions, stmt);
    controlFlowStmt.appendChild(maniuplationArea);

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
    background-color: rgba(255, 255, 255, .1); 
    border-radius: 5px;
    width: 100%;
    `);

    conditionContainer.appendChild(conditionArea);
    conditionArea.appendChild(renderCondition(levelDef, stmt));

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

        const bodyExludes = [...levelDef.exludedStatements ?? [], ...TOP_LEVEL_EXCLUDES];
        const bodyLevelDef = { exludedStatements: bodyExludes, hasMage: levelDef.hasMage };

        const addToBody = (s: UIStatement) => {
            stmt.body.push(s);
            renderBody();
        };
        const renderBody = () => {
            body.innerHTML = "";
            stmt.body.forEach(s => body.appendChild(renderStmt(s, {
                pushStmt: addToBody,
                removeStmt: (s2) => {
                    stmt.body.splice(stmt.body.indexOf(s2), 1);
                    renderBody();
                },
                moveDown: (s2) => {
                    const currentIndex = stmt.body.indexOf(s2);
                    if (currentIndex === stmt.body.length - 1) {
                        return;
                    }

                    if (currentIndex !== -1) {
                        stmt.body.splice(currentIndex, 1);
                        stmt.body.splice(currentIndex + 1, 0, s2);
                    }
                    renderBody();
                },
                moveUp: (s2) => {
                    const currentIndex = stmt.body.indexOf(s2);
                    if (currentIndex === 0) {
                        return;
                    }

                    if (currentIndex !== -1) {
                        stmt.body.splice(currentIndex, 1);
                        stmt.body.splice(currentIndex - 1, 0, s2);
                    }
                    renderBody();
                },
                notify: renderBody
            }, bodyLevelDef)));
            body.appendChild(createAddStmtButton(addToBody, bodyLevelDef, stmt.openState));
        }


        renderBody();

        controlFlowStmt.appendChild(body);
    }
    element.appendChild(controlFlowStmt);
}

function renderCondition(levelDef: RenderLevelDef, stmt: IfStatement | WhileStatement): Element {
    let isNot: boolean = stmt instanceof NotStatement;
    let character: Character = globalCharacter;
    let currentDirection: Direction = globalCurrentDirection;
    let currentInteractable: Interactable = globalInteractable;

    const updateCondition = () => {
        stmt.condition = new IsNextToStatement(character, currentDirection, currentInteractable);
        if (isNot) {
            stmt.condition = new NotStatement(stmt.condition);
        }
    };

    const element = document.createElement("div");
    element.setAttribute("style", `
        display: flex;
        flex-direction: row;
        justify-content: center;
        gap: 5px;
        align-items: center;
    `);

    const characterSelector = createCharacterSelector((c) => {
        character = c;
        updateCondition();
    }, true);
    if (!levelDef.hasMage) {
        characterSelector.onclick = () => { };
        addStyle(characterSelector, "cursor: default;");
    }
    element.appendChild(characterSelector);
    element.appendChild(createDirectionSelector((d) => {
        currentDirection = d;
        updateCondition();
    }));

    const isNotToggle = createBase();
    addStyle(isNotToggle, "cursor: pointer;");
    isNotToggle.textContent = isNot ? " is not next to " : " is next to ";
    if (!levelDef.exludedStatements.includes(StatementExlude.NOT)) {
        isNotToggle.setAttribute("title", "Click to negate statement");
        isNotToggle.onclick = () => {
            isNot = !isNot;
            if (isNot) {
                isNotToggle.textContent = " is not next to ";
            } else {
                isNotToggle.textContent = " is next to ";
            }
            updateCondition();
        }
    }
    element.appendChild(isNotToggle);

    element.appendChild(createInteractableSelector((i) => {
        currentInteractable = i;
        updateCondition();
    }));
    return element;
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

function createLabelElement(label: string): Element {
    const method = document.createElement("span");
    method.textContent = label;
    return method;
}

function createASTManipulationButtons(astFunctions: ASTFunctions, stmt: UIStatement): Element {
    const container = document.createElement("div");
    container.setAttribute("style", `
        display: flex;
        flex-direction: row;
        gap: 5px;
        margin-left: auto;
    `);
    if (astFunctions.moveUp) {
        container.appendChild(createUp(astFunctions.moveUp, stmt));
    }
    if (astFunctions.moveDown) {
        container.appendChild(createDown(astFunctions.moveDown, stmt));
    }
    if (astFunctions.removeStmt) {
        container.appendChild(createDelete(astFunctions.removeStmt, stmt));
    }
    return container;
}
function createDelete(removeStmt: (stmt: UIStatement) => void, stmt: UIStatement): any {
    return createASTManipulationButton("🗑️", () => removeStmt(stmt));
}
function createUp(moveUp: (stmt: UIStatement) => void, stmt: UIStatement): any {
    return createASTManipulationButton("🔼", () => moveUp(stmt));
}
function createDown(moveDown: (stmt: UIStatement) => void, stmt: UIStatement): any {
    return createASTManipulationButton("🔽", () => moveDown(stmt));
}
function createASTManipulationButton(label: string, onClick: () => void): any {
    const btn = createBase();
    btn.textContent = label;
    addStyle(btn, `
    cursor: pointer;
    background-color: #4c4a4a;
    padding: 5px;
    `)
    btn.classList.add("manipulation-btn");
    btn.onclick = onClick;
    return btn;
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

function addStyle(element: Element, style: string): void {
    element.setAttribute("style", element.getAttribute("style") + style);
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

// function createSwitch(onChange: (val: boolean) => void): HTMLElement {
//     const label = document.createElement("label");
//     label.classList.add("switch");

//     const input = document.createElement("input");
//     input.setAttribute("type", "checkbox");
//     let val = false;
//     input.addEventListener("input", () => { val = !val; onChange(val); });

//     const span = document.createElement("span");
//     span.classList.add("slider");
//     span.classList.add("round");

//     label.appendChild(input);
//     label.appendChild(span);
//     return label;
// }