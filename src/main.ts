import { determineActionCount, Game, GameState } from './game/Game';
import { clearRenderQueue, render } from './game/Renderer';
import './style.css';
import { LevelDefinition, LevelWorld, WORLDS } from './game/Levels';
import { createEditor as createButtonEditor } from './visualeditor/Editor';
import { createEditor as createDragDropEditor } from './visualeditor/DragDropEditor';

let createEditor = createButtonEditor;
const toggleEditor = () => {
  if (createEditor === createButtonEditor) {
    createEditor = createDragDropEditor;
  } else {
    createEditor = createButtonEditor;
  }
}

window.onkeydown = (e) => {
  if (e.key === "t") {
    toggleEditor();
    initGame();
  }
};

const levelContainer = document.getElementById("level")!;
const levelSelector = document.getElementById("levelSelector")!

let worldSelectorVisible = false;
const worldSelector = document.getElementById("worldSelector")!;
const toggleWorldSelect = () => {
  worldSelectorVisible = !worldSelectorVisible;
  if (worldSelectorVisible) {
    levelContainer.setAttribute("style", "display: none;");
    levelSelector.setAttribute("style", "display: flex;");
  } else {
    levelContainer.setAttribute("style", "display: unset;");
    levelSelector.setAttribute("style", "display: none;");
  }
};
worldSelector.onclick = toggleWorldSelect;

const levelLabel = document.getElementById("levelLabel")!;
const actionCounter = document.getElementById("actionCounter")!;
const playBtn = document.getElementById("playBtn")!;
const stopBtn = document.getElementById("stopBtn")!;

let currentWorld = 0;
let currentLevel = 0;
let currentWorldDef: LevelWorld | undefined;
let currentDef: LevelDefinition | undefined;
let game: Game | undefined;
function initGame() {
  currentWorldDef = WORLDS[currentWorld];
  currentDef = currentWorldDef.levels[currentLevel];

  worldSelector.textContent = currentWorldDef.name;
  levelLabel.textContent = `Level #${currentLevel + 1}`;

  game = new Game(currentDef);
  const updateActionsLabel = () => actionCounter.textContent = `${determineActionCount(codeGetter())}/${currentDef!.actions} Actions`;
  const [codeGetter, resetter] = createEditor(
    document.getElementById("visualInput")!,
    currentDef,
    updateActionsLabel
  );
  updateActionsLabel();

  playBtn.onclick = () => {
    const code = codeGetter();
    console.log(code);
    try {
      const state = game!.play(code);
      if (state === GameState.WON) {
        currentLevel++;
        if (currentLevel >= currentWorldDef!.levels.length) {
          currentLevel = 0;
          currentWorld++;

          if (currentWorld >= WORLDS.length) {
            currentWorld = 0;
          }
        }
        resetter();
        initGame();
      } else {
        game!.init();
      }
    } catch (e) {
      console.error(e);
    }
  };

  stopBtn.onclick = () => {
    clearRenderQueue();
    game?.init();
  };
}
initGame();
render(levelContainer);

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


for (let w = 0; w < WORLDS.length; w++) {
  const world = WORLDS[w];
  const worldContainer = document.createElement("div");
  worldContainer.setAttribute("style", `
      display: flex;
      flex-direction: column;
      gap: 5px;
    `);


  const worldLabel = document.createElement("div");
  worldLabel.textContent = world.name;
  worldLabel.setAttribute("style", `
    font-size: 1.25rem;
  `);

  const levelsContainer = document.createElement("div");
  levelsContainer.setAttribute("style", `
      display: flex;
      align-items: center;
      gap: 10px;
      width: fit-content;
      padding: 0 15px;
      background: linear-gradient(180deg,
        rgba(0,0,0,0) calc(50% - 1px), 
        ${world.color} calc(50%), 
        rgba(0,0,0,0) calc(50% + 1px)
    );
    `);
  for (let lv = 0; lv < world.levels.length; lv++) {
    const levelDot = document.createElement("div");
    levelDot.setAttribute("style", `
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background-color: ${world.color};
      cursor: pointer;
      text-align: center;
    `);
    levelDot.textContent = `${lv + 1}`;
    levelDot.onclick = () => {
      currentWorld = w;
      currentLevel = lv;
      initGame();
      toggleWorldSelect();
    }
    levelsContainer.appendChild(levelDot);
  }

  worldContainer.appendChild(worldLabel);
  worldContainer.appendChild(levelsContainer);

  levelSelector.appendChild(worldContainer);
}