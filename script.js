/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

if (window.devicePixelRatio > 1) {
	const canvasWidth = canvas.width;
	const canvasHeight = canvas.height;

	canvas.width = canvasWidth * window.devicePixelRatio;
	canvas.height = canvasHeight * window.devicePixelRatio;
	canvas.style.width = canvasWidth + "px";
	canvas.style.height = canvasHeight + "px";

	ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

const grid_width = 40;
const grid_height = 40;

const x_scale = canvas.width / grid_width;
const y_scale = canvas.height/ grid_height;

const starting_length = 3;

/** @type {Array<{ x: number, y: number }>} */
let snake = [];

for (let i = 0; i < starting_length; i++) {
	snake.push({
		x: Math.floor(grid_width / 2) - i,
		y: Math.floor(grid_height / 2),
	});
}

const find_new_apple_location = () => {
	let result = {
		x: Math.floor(Math.random() * grid_width),
		y: Math.floor(Math.random() * grid_height),
	};

	while (snake.some(a => a.x == result.x && a.y == result.y)) {
		result = {
			x: Math.floor(Math.random() * grid_width),
			y: Math.floor(Math.random() * grid_height),
		}
	}

	return result;
};

const get_score = () => snake.length - starting_length;

/** 
 * @param {{ x: number, y: number }} a
 * @param {{ x: number, y: number }} b
 */
const compare_coords = (a, b) => a.x == b.x && a.y == b.y;

/** @typedef {"right" | "left" | "up" | "down"} Direction */

/** @type {Direction} */
let direction = "right";

/** @type {Direction} */
let last_used_direction = "right";

let apple = find_new_apple_location();

const restart = () => {
	snake = [];
	direction = "right";

	for (let i = 0; i < starting_length; i++) {
		snake.push({
			x: Math.floor(grid_width / 2) - i,
			y: Math.floor(grid_height / 2),
		});
	}

	apple = find_new_apple_location();
}

const update = () => {
	const last = snake[snake.length - 1];

	for (let i = snake.length - 1; i > 0; i--) {
		snake[i].x = snake[i - 1].x;
		snake[i].y = snake[i - 1].y;
	}

	switch(direction) {
		case "right":
			snake[0].x++;
			break;
		case "left":
			snake[0].x--;
			break;
		case "up":
			snake[0].y--;
			break;
		case "down":
			snake[0].y++;
			break;
	}

	last_used_direction = direction;

	if (compare_coords(snake[0], apple)) {
		snake.push({ x: last.x, y: last.y });
		apple = find_new_apple_location();
	}
};

setInterval(update, 1000 / 5);

document.addEventListener("keydown", e => {
	if (e.repeat) return;

	switch (e.key) {
		case "ArrowUp":
			if (["left", "right"].includes(last_used_direction)) direction = "up";
			break;
		case "ArrowDown":
			if (["left", "right"].includes(last_used_direction)) direction = "down";
			break;
		case "ArrowLeft":
			if (["up", "down"].includes(last_used_direction)) direction = "left";
			break;
		case "ArrowRight":
			if (["up", "down"].includes(last_used_direction)) direction = "right";
			break;
		case "r":
			restart();
			break;
	}
});

const render = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	
	ctx.fillStyle = "red";
	ctx.fillRect(apple.x * x_scale, apple.y * y_scale, x_scale, y_scale);

	ctx.fillStyle = "green";
	for (let i = 0; i < snake.length; i++) {
		ctx.fillRect(snake[i].x * x_scale, snake[i].y * y_scale, x_scale, y_scale);
	}

	requestAnimationFrame(render);
};

render();