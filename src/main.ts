import { determineActionCount, Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { LevelDefinition, levels } from './game/Levels';
import { createEditor } from './visualeditor/Editor';

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

const [codeGetter, resetter] = createEditor(document.getElementById("visualInput")!);

let currentMode: "VIS" | "TXT" = "VIS";
const toggleModeBtn = document.getElementById("toggleModeBtn")!;
toggleModeBtn.textContent = currentMode;
toggleModeBtn.addEventListener("click", () => {
  if (currentMode === "VIS") {
    currentMode = "TXT";
    input.setAttribute("style", "display: unset;");
    // visualInput.setAttribute("style", "display: none;");
    input.value = inputMap.get(mainTab) ?? "";
  } else {
    currentMode = "VIS";
    input.setAttribute("style", "display: none;");
    // visualInput.setAttribute("style", "display: unset;");
  }
  toggleModeBtn.textContent = currentMode;
  // renderVisualProgram();
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
  const code = codeGetter();
  console.log(code);
  try {
    const state = game!.play(code);
    if (state === GameState.WON) {
      currentLevel++;
      initGame();
      input.value = "";
      inputMap.forEach((_, key) => {
        inputMap.set(key, "");
      });
      // renderVisualProgram();
      resetter();
    } else {
      game!.init();
    }
  } catch (e) {
    alert(e);
  }
});