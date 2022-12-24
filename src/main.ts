import { Dragon, Game, Knight, Level, Tile } from './game/Game';
import './style.css'
import typescriptLogo from './typescript.svg'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="counter" type="button">Play</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

const level = new Level([
  [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
  [Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE],
  [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE]
]);

const game = new Game(level);

function play() {
  console.log(
    game.play(`
  function moveAround(person, direction, otherDirection) {
      while(not person.isNextTo(direction, dragon)) {
          if(not person.isNextTo(direction, ROAD)) {
              person.move(otherDirection);
          } else {
              person.move(direction);
          }
      }
  }
  moveAround(knight, EAST, NORTH);
  knight.attack(EAST);
  `,
      new Knight(game, 2, 0, 1),
      new Dragon(0, 7, 1)
    )
  );
}

document.getElementById("counter")!.addEventListener("click", play);
play();