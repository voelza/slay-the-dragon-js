import { determineActionCount, Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { LevelDefinition, levels } from './game/Levels';
import death from "./game/death.gif";


let currentLevel = 0;
let currentDef: LevelDefinition | undefined;
let game: Game | undefined;

const levelLabel = document.getElementById("levelLabel")!;
const actionCounter = document.getElementById("actionCounter")!;
const input = document.getElementById("input")! as HTMLTextAreaElement;
input.addEventListener('keydown', function (e) {
  if (e.key == 'Tab') {
    e.preventDefault();
    const start = this.selectionStart;
    const end = this.selectionEnd;

    // set textarea value to: text before caret + tab + text after caret
    this.value = this.value.substring(0, start) +
      "\t" + this.value.substring(end);

    // put caret at right position again
    this.selectionStart =
      this.selectionEnd = start + 1;
  }
});

function initActionCounter() {
  actionCounter.textContent = `${determineActionCount(input.value)}/${currentDef!.actions} Actions`
}
input.addEventListener("input", initActionCounter);

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
  const code = input.value;
  try {
    const state = game!.play(code);
    if (state === GameState.WON) {
      currentLevel++;
      initGame();
      input.value = "";
    } else if (state === GameState.TOO_MANY_ACTIONS) {
      const dialog = document.createElement("dialog");
      dialog.setAttribute("open", "");

      const txt = document.createElement("div");
      txt.textContent = "You used to many actions! The dragon woke up and burned you!";

      const img = document.createElement("img");
      img.src = death;

      const form = document.createElement("form");
      form.setAttribute("method", "dialog");
      const tryAgain = document.createElement("button");
      tryAgain.textContent = "Try again";

      form.appendChild(tryAgain);
      dialog.appendChild(txt);
      dialog.appendChild(img);
      dialog.appendChild(form);
      document.body.appendChild(dialog);

      dialog.addEventListener('close', () => dialog.remove());


      game!.init();
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