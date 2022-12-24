import { determineActionCount, Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { LevelDefinition, levels } from './game/Levels';


let currentLevel = 0;
let currentDef: LevelDefinition | undefined;
let game: Game | undefined;

const levelLabel = document.getElementById("levelLabel")!;
const actionCounter = document.getElementById("actionCounter")!;
const input = document.getElementById("input")! as HTMLTextAreaElement;

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
    } else {
      game!.init();
    }
  } catch (e) {
    alert(e);
  }
});