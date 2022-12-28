import { determineActionCount, Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { LevelDefinition, levels } from './game/Levels';
import { Lexer } from './lang/Lexer';
import { Parser } from './lang/Parser';
import { CallExpression, ExpressionStatement, Program, Node, DotExpression, Identifier, IfStatement } from './lang/Ast';
import knightIcon from "./game/knight.svg";
import mageIcon from "./game/mage.svg";

const inputMap: Map<Element, string> = new Map();

const levelLabel = document.getElementById("levelLabel")!;
const input = document.getElementById("input")! as HTMLTextAreaElement;
input.addEventListener('keydown', function (e) {
  if (e.key == 'Tab') {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    this.value = this.value.substring(0, start) + "\t" + this.value.substring(end);

    // put caret at right position again
    this.selectionStart = this.selectionEnd = start + 1;
  }
});

function createInput() {
  let main: string = "";
  const inputs: string[] = [];
  for (const [key, value] of inputMap.entries()) {
    if (key === mainTab) {
      main = value;
    } else {
      inputs.push(`
        extend ${key.textContent?.toLocaleLowerCase()} {
          ${value}
        }
      `);
    }
  }
  return inputs.join("\n") + main;
}
const actionCounter = document.getElementById("actionCounter")!;
function initActionCounter() {
  actionCounter.textContent = `${determineActionCount(createInput())}/${currentDef!.actions} Actions`
}

input.addEventListener("input", initActionCounter);

const helpBtn = document.getElementById("helpBtn")!;
helpBtn.addEventListener("click", () => {
  const dialog = document.createElement("dialog");
  dialog.setAttribute("open", "");

  const txt = document.createElement("pre");
  txt.textContent = currentDef?.help ?? "You are on your own, buddy. Sorry.";

  const form = document.createElement("form");
  form.setAttribute("method", "dialog");
  const tryAgain = document.createElement("button");
  tryAgain.textContent = "OK";

  form.appendChild(tryAgain);
  dialog.appendChild(txt);
  dialog.appendChild(form);
  document.body.appendChild(dialog);

  dialog.addEventListener('close', () => dialog.remove());
});

function createTab(label: string, active: boolean = false) {
  const tab = document.createElement("button");
  tab.classList.add("tab");
  if (active) {
    tab.classList.add("active");
  }
  tab.textContent = label;
  tab.addEventListener("click", () => {
    activeTab.classList.toggle("active");
    tab.classList.toggle("active");
    activeTab = tab;

    tabChange = true;
    input.value = inputMap.get(activeTab) ?? "";
    tabChange = false;

    initActionCounter();
    input.focus();
  });
  return tab;
}

const tabs = document.querySelector(".tabs")!;
const mainTab = createTab("Main", true);
tabs.appendChild(mainTab);
const additonalTabs: Element[] = [];

let activeTab = document.querySelector(".tab.active")!;
let tabChange = false;

input.addEventListener("input", () => {
  if (!tabChange) {
    inputMap.set(activeTab, input.value);
  }
});

function createVisualInput(body: string | HTMLElement): HTMLElement {
  const btn = document.createElement("div");
  btn.setAttribute("style", `
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
  if (typeof body === "string") {
    btn.textContent = body;
  } else {
    btn.appendChild(body);
  }
  return btn;
}



const controlIcons: Map<string, string> = new Map();
controlIcons.set("moveNORTH", "🏃‍♂️⬆️");
controlIcons.set("moveEAST", "🏃‍♂️➡️");
controlIcons.set("moveWEST", "🏃‍♂️⬅️");
controlIcons.set("moveSOUTH", "🏃‍♂️⬇️");
controlIcons.set("attackNORTH", "🤺⬆️");
controlIcons.set("attackSOUTH", "🤺⬇️");
controlIcons.set("attackWEST", "🤺⬅️");
controlIcons.set("attackEAST", "🤺➡️");

controlIcons.set("isNextToNORTH", "🔍⬆️");
controlIcons.set("isNextToEAST", "🔍➡️");
controlIcons.set("isNextToSOUTH", "🔍⬇️");
controlIcons.set("isNextToWEST", "🔍⬅️");

const interactableIcons: Map<string, string> = new Map();
interactableIcons.set("dragon", "🐲");
interactableIcons.set("ROAD", "🛣️");
interactableIcons.set("WALL", "🧱");
interactableIcons.set("HOLE", "🕳️");

const dirIcons: Map<string, string> = new Map();
dirIcons.set("NORTH", "⬆️");
dirIcons.set("EAST", "➡️");
dirIcons.set("SOUTH", "⬇️");
dirIcons.set("WEST", "⬅️");

const dirs: ("NORTH" | "EAST" | "SOUTH" | "WEST")[] = ["NORTH", "EAST", "SOUTH", "WEST"];
const inters: ("dragon" | "ROAD" | "WALL" | "HOLE")[] = ["dragon", "ROAD", "WALL", "HOLE"];
function createVisualInputStatement(func: string, statement: string) {
  let dirIndex = 0;
  let dir: "NORTH" | "EAST" | "SOUTH" | "WEST" = dirs[dirIndex];
  let interIndex = 1;
  let inter: "dragon" | "ROAD" | "WALL" | "HOLE" | "" = inters[interIndex];

  const getLabel = () => {
    const interLabel: string = statement.includes("<INTER>") ? interactableIcons.get(inter) ?? "" : "";
    return controlIcons.get(`${func}${dir}`)! + interLabel;
  }

  const btn = createVisualInput(getLabel());
  btn.setAttribute("title", "Click to change direction.");

  let overlayOpen = false;
  const overlay = document.createElement("div");
  overlay.setAttribute("style", "position: absolute; display: flex; gap: 5px; background-color: #1a1a1a; padding: 5px;");

  if (statement.includes("<DIR>")) {
    for (let i = 0; i < dirs.length; i++) {
      const d = dirs[i];
      const select = document.createElement("div");
      select.textContent = dirIcons.get(d)!;
      select.setAttribute("style", "cursor: pointer;");
      select.setAttribute("title", `Change direction to ${d}`);
      select.addEventListener("click", () => {
        dirIndex = i;
        dir = dirs[dirIndex];
        overlay.remove();
        btn.textContent = getLabel();
      });
      overlay.appendChild(select);
    }
  }

  if (statement.includes("<INTER>")) {
    for (let i = 0; i < inters.length; i++) {
      const d = inters[i];
      const select = document.createElement("div");
      select.textContent = interactableIcons.get(d)!;
      select.setAttribute("style", "cursor: pointer;");
      select.setAttribute("title", `Change to ${d}`);
      select.addEventListener("click", () => {
        interIndex = i;
        inter = inters[interIndex];
        overlay.remove();
        btn.textContent = getLabel();
      });
      overlay.appendChild(select);
    }
  }

  btn.addEventListener("click", () => {
    if (overlayOpen) {
      overlayOpen = false;
      overlay.remove();
    } else {
      btn.appendChild(overlay);
      overlayOpen = true;
    }
  });

  btn.draggable = true;
  btn.ondragstart = (ev) => {
    ev.dataTransfer?.setData("statement", JSON.stringify({ text: func, statement: statement.replace("<DIR>", dir).replace("<INTER>", inter) }));
    visualInputContent.classList.add("drag-highlight");
  };
  btn.ondragend = () => visualInputContent.classList.remove("drag-highlight");
  return btn;
}

function createVisualControlFlowStatement(func: string) {
  const btn = createVisualInput(func);
  btn.draggable = true;
  btn.ondragstart = (ev) => {
    ev.dataTransfer?.setData("statement", JSON.stringify({ text: func, type: "IF" }));
    visualInputContent.classList.add("drag-highlight");
  };
  btn.ondragend = () => visualInputContent.classList.remove("drag-highlight");
  return btn;
}

const visualInput = document.getElementById("visualInput")!;
const visualInputControls = document.getElementById("visualInputControls")!;
const visualInputContent = document.getElementById("visualInputContent")!;


let droppingWithin = false;
function createVisualInputFromASTStatement(stmt: Node): HTMLElement {
  const container = document.createElement("div");

  let character: "KNIGHT" | "MAGE" | "UNDEF" = "UNDEF";
  let func: string | undefined;
  let direction: "NORTH" | "EAST" | "SOUTH" | "WEST" | "UNDEF" = "UNDEF";
  let interactable: "dragon" | "ROAD" | "WALL" | "WAY" | "" = "";
  if (stmt instanceof ExpressionStatement) {
    stmt = stmt.expression as Node;
  }

  const btnBody = document.createElement("div");
  if (stmt instanceof CallExpression) {
    if (stmt.func instanceof DotExpression) {
      if (stmt.func.left instanceof Identifier) {
        if (stmt.func.left.value === "knight") {
          character = "KNIGHT";
        } else if (stmt.func.left.value === "mage") {
          character = "MAGE";
        }

        if (stmt.func.right instanceof Identifier) {
          func = stmt.func.right.value;
          if (func === "move" || func === "attack" || func === "isNextTo") {
            // @ts-ignore
            direction = stmt.args[0].string();
            if (func === "isNextTo") {
              // @ts-ignore
              interactable = stmt.args[1].string();
            }
          }
        }
      }
    }

    btnBody.setAttribute("style", "display: flex; align-items: center; gap: 5px;");

    const charIcon = document.createElement("img");
    charIcon.setAttribute("style", "width: 25px; height: 25px; object-fit: cover;");
    if (character === "KNIGHT") {
      charIcon.src = knightIcon;
    } else if (character === "MAGE") {
      charIcon.src = mageIcon;
    }
    btnBody.appendChild(charIcon);

    if (func) {
      const funcEle = document.createElement("span");
      funcEle.textContent = `: ${controlIcons.get(func + direction) ?? "UNDEF"} ${interactableIcons.get(interactable) ?? ""}`;
      btnBody.appendChild(funcEle);
    }
  } else if (stmt instanceof IfStatement) {
    btnBody.setAttribute("style", "display: flex; flex-direction: column; gap: 5px;");


    let currentCondition: string = stmt.condition.string();
    const bodyStr = stmt.consequences.string();
    let currentBody: string = bodyStr.substring(1, bodyStr.length - 1).replaceAll("\n", "");
    const currentIfStmt = () => `if(${currentCondition}) {${currentBody}}`


    const ifIcon = document.createElement("span");
    ifIcon.textContent = "IF";
    btnBody.appendChild(ifIcon);

    const conditionContainer = document.createElement("div");
    conditionContainer.setAttribute("style", "padding: 5px; min-height: 50px; background-color: rgba(255, 255, 255, .1); border-radius: 5px;");

    if (stmt.condition instanceof CallExpression) {
      conditionContainer.appendChild(createVisualInputFromASTStatement(stmt.condition));
    }

    conditionContainer.addEventListener("drop", (ev: DragEvent) => {
      droppingWithin = true;

      const prevStmt = currentIfStmt();

      const data = JSON.parse(ev.dataTransfer!.getData("statement"));
      currentCondition = data.statement;
      const newStmt = currentIfStmt();

      const currentCode = inputMap.get(activeTab) ?? "";
      inputMap.set(activeTab, currentCode.replace(prevStmt, newStmt));

      initActionCounter();
      renderVisualProgram();
    });
    conditionContainer.addEventListener("dragover", (e: DragEvent) => {
      e.preventDefault();
    });
    btnBody.appendChild(conditionContainer);

    const bodyContainer = document.createElement("div");
    bodyContainer.setAttribute("style", "padding: 5px; min-height: 50px; background-color: rgba(255, 255, 255, .1); border-radius: 5px; display: flex; flex-direction: column; gap: 5px;");
    bodyContainer.addEventListener("drop", (ev: DragEvent) => {
      droppingWithin = true;

      const prevStmt = currentIfStmt();

      const data = JSON.parse(ev.dataTransfer!.getData("statement"));
      currentBody += data.statement;
      currentBody = currentBody.replaceAll("\n", "");
      const newStmt = currentIfStmt();

      const currentCode = inputMap.get(activeTab) ?? "";
      inputMap.set(activeTab, currentCode.replace(prevStmt, newStmt));

      initActionCounter();
      renderVisualProgram();
    });
    bodyContainer.addEventListener("dragover", (e: DragEvent) => {
      e.preventDefault();
    });
    stmt.consequences.statements.forEach(s => bodyContainer.appendChild(createVisualInputFromASTStatement(s)));
    btnBody.appendChild(bodyContainer);
  }

  container.appendChild(createVisualInput(btnBody));
  container.draggable = true;
  container.ondragstart = (ev) => {
    ev.dataTransfer?.setData("statement", stmt.string());
    visualInputControls.classList.add("drag-highlight");
  };
  container.ondragend = () => visualInputControls.classList.remove("drag-highlight");
  return container;
}

function renderVisualProgram() {
  visualInputContent.innerHTML = "";
  const code = inputMap.get(activeTab) ?? "";
  const lexer = new Lexer(code);
  const parser = new Parser(lexer);
  const program = parser.parseProgram() as Program;
  program.statements.forEach(stmt => {
    visualInputContent.appendChild(createVisualInputFromASTStatement(stmt));
  });
}

visualInputContent.addEventListener("drop", (ev: DragEvent) => {
  if (droppingWithin) {
    droppingWithin = false;
    return;
  }

  const data = JSON.parse(ev.dataTransfer!.getData("statement"));
  const currentCode = inputMap.get(activeTab) ?? "";

  let stmt = data.statement;
  if (data.type === "IF") {
    stmt = `if(null) {}`;
  }

  inputMap.set(activeTab, currentCode + "\n" + stmt);
  initActionCounter();
  renderVisualProgram();
});
visualInputContent.addEventListener("dragover", (e: DragEvent) => {
  e.preventDefault();
});

visualInputControls.appendChild(createVisualInputStatement("move", "knight.move(<DIR>);"));
visualInputControls.appendChild(createVisualInputStatement("attack", "knight.attack(<DIR>);"));
visualInputControls.appendChild(createVisualControlFlowStatement("IF"));
visualInputControls.appendChild(createVisualInputStatement("isNextTo", "knight.isNextTo(<DIR>, <INTER>)"));


visualInputControls.addEventListener("drop", (ev: DragEvent) => {
  const data = ev.dataTransfer!.getData("statement");
  const currentCode = inputMap.get(activeTab) ?? "";

  inputMap.set(activeTab, currentCode.replace(data, ""));
  initActionCounter();
  renderVisualProgram();
});
visualInputControls.addEventListener("dragover", (e: DragEvent) => {
  e.preventDefault();
});

let currentMode: "VIS" | "TXT" = "VIS";
const toggleModeBtn = document.getElementById("toggleModeBtn")!;
toggleModeBtn.textContent = currentMode;
toggleModeBtn.addEventListener("click", () => {
  if (currentMode === "VIS") {
    currentMode = "TXT";
    input.setAttribute("style", "display: unset;");
    visualInput.setAttribute("style", "display: none;");
    input.value = inputMap.get(mainTab) ?? "";
  } else {
    currentMode = "VIS";
    input.setAttribute("style", "display: none;");
    visualInput.setAttribute("style", "display: unset;");
  }
  toggleModeBtn.textContent = currentMode;
  renderVisualProgram();
});


let currentLevel = 0;
let currentDef: LevelDefinition | undefined;
let game: Game | undefined;
function initGame() {
  currentDef = levels[currentLevel];
  game = new Game(currentDef);
  levelLabel.textContent = `Level #${currentLevel + 1}`;
  currentDef.extends?.forEach(c => {
    const tab = createTab(c);
    additonalTabs.push(tab);
    tabs.appendChild(tab);
  });
  initActionCounter();
}
initGame();
render(document.getElementById("level")!);
const playBtn = document.getElementById("playBtn")! as HTMLButtonElement;
playBtn.addEventListener("click", () => {
  const code = createInput();
  try {
    const state = game!.play(code);
    if (state === GameState.WON) {
      currentLevel++;
      initGame();
      input.value = "";
      inputMap.forEach((_, key) => {
        inputMap.set(key, "");
      });
      renderVisualProgram();
    } else {
      game!.init();
    }
  } catch (e) {
    alert(e);
  }
});