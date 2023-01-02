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

const TOP_LEVEL_EXCLUDES: StatementExlude[] = [StatementExlude.IS_NEXT_TO, StatementExlude.NOT];
function renderProgram(element: Element, levelDef: LevelDefinition, ast: AST): void {
    element.innerHTML = "";
    for (const stmt of ast.ast) {
        element.appendChild(renderStmt(stmt, ast.toAstFunctions(), { exludedStatements: levelDef.exludedStatements ?? [], hasMage: levelDef.mage !== undefined }));
    }
    element.appendChild(
        createAddStmtButton(
            ast.push.bind(ast),
            { exludedStatements: [...levelDef.exludedStatements ?? [], ...TOP_LEVEL_EXCLUDES], hasMage: levelDef.mage !== undefined },
            false
        )
    );
}

function createAddStmtButton(pushStmt: (stmt: UIStatement) => void, levelDef: RenderLevelDef, stmtsVisible: boolean, labelStr: string = "+ add"): Element {
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
    label.textContent = labelStr;
    addBtn.appendChild(label);

    const stms = createStmts(levelDef, pushStmt);
    if (stmtsVisible) {
        addBtn.appendChild(stms);
    } else {
        stms.remove();
    }

    label.onclick = () => {
        stmtsVisible = !stmtsVisible;
        if (stmtsVisible) {
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
        const directionSelect = document.createElement("div");
        directionSelect.textContent = DIRECTION_ICONS.get(direction)!;
        directionSelect.setAttribute("style", "cursor: pointer;");
        directionSelect.addEventListener("click", () => {
            globalCurrentDirection = direction;
            updateLabel();
            callback(direction);
        });
        return directionSelect;
    }

    const north = createDirectionSelect("NORTH");
    directionSelector.appendChild(north);

    const westEastSelector = document.createElement("div");
    westEastSelector.setAttribute("style", "display: flex; gap: 5px;");
    const west = createDirectionSelect("WEST");
    const east = createDirectionSelect("EAST");
    westEastSelector.appendChild(west);
    westEastSelector.appendChild(east);
    directionSelector.appendChild(westEastSelector);

    const south = createDirectionSelect("SOUTH");
    directionSelector.appendChild(south);

    let overlayVisible = false;
    btn.onclick = () => {
        overlayVisible = !overlayVisible;
        if (overlayVisible) {
            btn.appendChild(directionSelector);
        } else {
            directionSelector.remove();
        }
    }
    return btn;
}

function createInteractableSelector(callback: (interactable: Interactable) => void): Element {
    const btn = createBase();
    addStyle(btn, "width: fit-content;  cursor: pointer;");
    const updateLabel = () => {
        btn.textContent = INTERACTABLE_ICONS.get(globalInteractable)!;
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
        const directionSelect = document.createElement("div");
        directionSelect.textContent = INTERACTABLE_ICONS.get(interactable)!;
        directionSelect.setAttribute("style", "cursor: pointer;");
        directionSelect.addEventListener("click", () => {
            globalInteractable = interactable;
            updateLabel();
            callback(interactable);
        });
        return directionSelect;
    }
    for (const inter of ALL_INTERACTABLES) {
        interactableSelector.appendChild(createInteractableSelect(inter));
    }

    let overlayVisible = false;
    btn.onclick = () => {
        overlayVisible = !overlayVisible;
        if (overlayVisible) {
            btn.appendChild(interactableSelector);
        } else {
            interactableSelector.remove();
        }
    }
    return btn;
}

function createCharacterSelector(callback: (character: Character) => void): Element {
    const btn = createBase();
    addStyle(btn, "width: fit-content;  cursor: pointer;");
    const updateLabel = () => {
        btn.innerHTML = "";
        btn.appendChild(createCharacterIcon(globalCharacter));
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
        const directionSelect = document.createElement("div");
        directionSelect.appendChild(createCharacterIcon(character));
        directionSelect.setAttribute("style", "cursor: pointer;");
        directionSelect.addEventListener("click", () => {
            globalCharacter = character;
            updateLabel();
            callback(character);
        });
        return directionSelect;
    }
    characterSelector.appendChild(createCharacterSelect("knight"));
    characterSelector.appendChild(createCharacterSelect("mage"));

    let overlayVisible = false;
    btn.onclick = () => {
        overlayVisible = !overlayVisible;
        if (overlayVisible) {
            btn.appendChild(characterSelector);
        } else {
            characterSelector.remove();
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
    } else if (stmt instanceof IsNextToStatement) {
        addIsNextToStmt(element, astFunctions, stmt);
    } else if (stmt instanceof IfStatement) {
        addControlFlowStmt(element, stmt, astFunctions, levelDef);
    } else if (stmt instanceof WhileStatement) {
        addControlFlowStmt(element, stmt, astFunctions, levelDef);
    } else if (stmt instanceof NotStatement) {
        addControlFlowStmt(element, stmt, astFunctions, levelDef);
    }

    return element;
}

function addDirectionStmt(element: HTMLElement, astFunctions: ASTFunctions, stmt: MoveStatement | AttackStatement): void {
    const { character, direction } = stmt;
    element.appendChild(createCharacterIcon(character));
    element.appendChild(createMethod(`: ${stmt.icon()}${DIRECTION_ICONS.get(direction)}`));
    element.appendChild(createASTManipulationButtons(astFunctions, stmt));
}

function addIsNextToStmt(element: HTMLElement, astFunctions: ASTFunctions, stmt: IsNextToStatement): void {
    const { character, direction, interactable } = stmt;
    element.appendChild(createCharacterIcon(character));
    element.appendChild(createMethod(`: ${stmt.icon()}${DIRECTION_ICONS.get(direction)}${INTERACTABLE_ICONS.get(interactable)}`));
    element.appendChild(createASTManipulationButtons(astFunctions, stmt));
}

const CONDITION_EXLUDES = [StatementExlude.MOVE, StatementExlude.ATTACK, StatementExlude.SUPPORT, StatementExlude.IF, StatementExlude.WHILE];
function addControlFlowStmt(element: HTMLElement, stmt: IfStatement | WhileStatement | NotStatement, astFunctions: ASTFunctions, levelDef: RenderLevelDef): void {
    addStyle(element, "padding: 0;");
    const { notify } = astFunctions;

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

    const setCondition = (s: UIStatement) => { stmt.condition = s; notify!(); };
    if (stmt.condition) {
        conditionArea.appendChild(renderStmt(stmt.condition, { pushStmt: setCondition, removeStmt: () => { stmt.condition = undefined; notify!(); }, notify }, levelDef));
    }

    conditionContainer.appendChild(conditionArea);

    const conditionExludes = [...CONDITION_EXLUDES, ...levelDef.exludedStatements];
    conditionArea.appendChild(createAddStmtButton(setCondition, { exludedStatements: conditionExludes, hasMage: levelDef.hasMage }, !stmt.condition, !stmt.condition ? "~ change" : "+add"));

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
        const addToBody = (s: UIStatement) => {
            stmt.body.push(s);
            notify!();
        };
        const bodyExludes = [...levelDef.exludedStatements ?? [], ...TOP_LEVEL_EXCLUDES];
        const bodyLevelDef = { exludedStatements: bodyExludes, hasMage: levelDef.hasMage };

        stmt.body.forEach(s => body.appendChild(renderStmt(s, {
            pushStmt: addToBody,
            removeStmt: (s2) => {
                stmt.body.splice(stmt.body.indexOf(s2), 1);
                notify!();
            },
            notify: astFunctions.notify
        }, bodyLevelDef)));
        body.appendChild(createAddStmtButton(addToBody, bodyLevelDef, stmt.body.length === 0));

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

