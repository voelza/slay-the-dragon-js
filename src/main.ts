import { determineActionCount, Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { LevelDefinition, levels } from './game/Levels';
import { createEditor } from './visualeditor/Editor';

const levelLabel = document.getElementById("levelLabel")!;
const actionCounter = document.getElementById("actionCounter")!;
const playBtn = document.getElementById("playBtn")!;

let currentLevel = 0;
let currentDef: LevelDefinition | undefined;
let game: Game | undefined;
function initGame() {
  currentDef = levels[currentLevel];
  game = new Game(currentDef);
  levelLabel.textContent = `Level #${currentLevel + 1}`;
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
        resetter();
        initGame();
      } else {
        game!.init();
      }
    } catch (e) {
      alert(e);
      game!.init();
    }
  };

  document.onkeydown = e => {
    let nextLevel = currentLevel;
    if (e.key === "ArrowRight") {
      nextLevel++;
      if (nextLevel > levels.length - 1) {
        nextLevel = levels.length - 1;
      }
    } else if (e.key === "ArrowLeft") {
      nextLevel--;
      if (nextLevel < 0) {
        nextLevel = 0;
      }
    }

    currentLevel = nextLevel;

    resetter();
    initGame();
  };
}
initGame();
render(document.getElementById("level")!);

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

