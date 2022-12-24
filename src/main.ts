import { Dragon, Game, Knight, Level, Tile } from './game/Game';
import { render } from './game/Renderer';
import './style.css'

document.querySelector<HTMLDivElement>('#app')!;

const level = new Level([
  [Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.ROAD],
  [Tile.HOLE, Tile.HOLE, Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE],
  [Tile.ROAD, Tile.ROAD, Tile.ROAD, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE, Tile.HOLE]
]);

const game = new Game(level);
game.setGameState(new Knight(game, 2, 0, 1), new Dragon(0, 7, 1));
render(document.getElementById("level")!);

const defaultInput = `function moveAround(person, direction, otherDirection) {
  while(not person.isNextTo(direction, dragon)) {
    if(not person.isNextTo(direction, ROAD)) {
      person.move(otherDirection);
    } else {
      person.move(direction);
    }
  }
}
moveAround(knight, EAST, NORTH);
knight.attack(EAST)`;

const input = document.getElementById("input")! as HTMLTextAreaElement;
input.value = defaultInput;

const playBtn = document.getElementById("playBtn")! as HTMLButtonElement;
playBtn.addEventListener("click", () => {
  const code = input.value;
  game.play(code);
});