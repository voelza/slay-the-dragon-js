import { determineActionCount, Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { LevelDefinition, levels } from './game/Levels';
import { Lexer } from './lang/Lexer';
import { Parser } from './lang/Parser';
import { CallExpression, ExpressionStatement, Program, Node, DotExpression, Identifier } from './lang/Ast';
import knightIcon from "./game/knight.svg";

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

function createVisualInputStatement(text: string, statement: string) {
  const btn = createVisualInput(text);
  btn.draggable = true;
  btn.ondragstart = (ev) => {
    ev.dataTransfer?.setData("statement", JSON.stringify({ text, statement }));
    visualInputContent.classList.add("drag-highlight");
  };
  btn.ondragend = () => visualInputContent.classList.remove("drag-highlight");
  return btn;
}

const visualInput = document.getElementById("visualInput")!;
const visualInputControls = document.getElementById("visualInputControls")!;
const visualInputContent = document.getElementById("visualInputContent")!;


const controlIcons: Map<string, string> = new Map();
controlIcons.set("moveNORTH", "🏃‍♂️⬆️");
controlIcons.set("moveEAST", "🏃‍♂️➡️");
controlIcons.set("moveWEST", "🏃‍♂️⬅️");
controlIcons.set("moveSOUTH", "🏃‍♂️⬇️");
controlIcons.set("attackNORTH", "🤺⬆️");
controlIcons.set("attackSOUTH", "🤺⬇️");
controlIcons.set("attackWEST", "🤺⬅️");
controlIcons.set("attackEAST", "🤺➡️");

function createVisualInputFromASTStatement(stmt: Node): HTMLElement {
  const container = document.createElement("div");

  let character: "KNIGHT" | "MAGE" | "UNDEF" = "UNDEF";
  let func: string | undefined;
  let direction: "NORTH" | "EAST" | "SOUTH" | "WEST" | "UNDEF" = "UNDEF";
  if (stmt instanceof ExpressionStatement) {
    stmt = stmt.expression as Node;
  }

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
          if (func === "move" || func === "attack") {
            // @ts-ignore
            direction = stmt.args[0].string();
          }
        }
      }
    }
  }

  const btnBody = document.createElement("div");
  btnBody.setAttribute("style", "display: flex; align-items: center; gap: 5px;");

  const charIcon = document.createElement("img");
  charIcon.setAttribute("style", "width: 25px; height: 25px; object-fit: cover;");
  if (character === "KNIGHT") {
    charIcon.src = knightIcon;
  }
  btnBody.appendChild(charIcon);

  if (func) {
    const funcEle = document.createElement("span");
    funcEle.textContent = `: ${controlIcons.get(func + direction) ?? "UNDEF"}`;
    btnBody.appendChild(funcEle);
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
  const data = JSON.parse(ev.dataTransfer!.getData("statement"));
  const currentCode = inputMap.get(activeTab) ?? "";
  inputMap.set(activeTab, currentCode + "\n" + data.statement);
  initActionCounter();
  renderVisualProgram();
});
visualInputContent.addEventListener("dragover", (e: DragEvent) => {
  e.preventDefault();
});

visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("moveNORTH")!, "knight.move(NORTH);"));
visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("moveEAST")!, "knight.move(EAST);"));
visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("moveWEST")!, "knight.move(WEST);"));
visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("moveSOUTH")!, "knight.move(SOUTH);"));
visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("attackNORTH")!, "knight.attack(NORTH);"));
visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("attackSOUTH")!, "knight.attack(SOUTH);"));
visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("attackWEST")!, "knight.attack(WEST);"));
visualInputControls.appendChild(createVisualInputStatement(controlIcons.get("attackEAST")!, "knight.attack(EAST);"));


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