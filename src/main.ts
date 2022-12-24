import { Game, GameState } from './game/Game';
import { render } from './game/Renderer';
import './style.css';
import { levels } from './game/Levels';


const levelLabel = document.getElementById("levelLabel")!;
let currentLevel = 0;
let game: Game | undefined;
function initGame() {
  game = new Game(levels[currentLevel]);
  levelLabel.textContent = `Level #${currentLevel + 1}`;
}
initGame();
render(document.getElementById("level")!);

const input = document.getElementById("input")! as HTMLTextAreaElement;
const playBtn = document.getElementById("playBtn")! as HTMLButtonElement;
playBtn.addEventListener("click", () => {
  const code = input.value;
  const state = game!.play(code);
  if (state === GameState.WON) {
    currentLevel++;
    initGame();
    input.value = "";
  } else {
    game!.init();
  }
});