import { determineActionCount, Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { LevelDefinition, levels } from './game/Levels';
import { createEditor } from './visualeditor/Editor';

const [codeGetter, resetter] = createEditor(document.getElementById("visualInput")!);

const levelLabel = document.getElementById("levelLabel")!;

const actionCounter = document.getElementById("actionCounter")!;
function initActionCounter() {
  actionCounter.textContent = `${determineActionCount(codeGetter())}/${currentDef!.actions} Actions`
}

let currentLevel = 0;
let currentDef: LevelDefinition | undefined;
let game: Game | undefined;
function initGame() {
  currentDef = levels[currentLevel];
  game = new Game(currentDef);
  levelLabel.textContent = `Level #${currentLevel + 1}`;
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
      resetter();
      initGame();
    } else {
      game!.init();
    }
  } catch (e) {
    alert(e);
  }
});

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
