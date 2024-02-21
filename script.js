/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const canvas_width = canvas.width;
const canvas_height = canvas.height;

if (window.devicePixelRatio > 1) {
	canvas.width = canvas_width * window.devicePixelRatio;
	canvas.height = canvas_height * window.devicePixelRatio;
	canvas.style.width = canvas_width + "px";
	canvas.style.height = canvas_height + "px";

	ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

/** @type {{
 * speed: number,
 * smooth: boolean
 * }} */
const config = {
	speed: document.getElementById("speed").value,
	smooth: document.getElementById("smooth").checked,
};

document.getElementById("speed").addEventListener("input", e => {
	config.speed = e.target.value;
});

document.getElementById("smooth").addEventListener("change", e => {
	config.smooth = e.target.checked;
});

let last_update = Date.now();

const grid_width = 25;
const grid_height = 25;

const x_scale = canvas_width / grid_width;
const y_scale = canvas_height / grid_height;

const starting_length = 3;

/** @typedef {Array<{ x: number, y: number }>} Snake */

/** @type {Snake} */
let snake = [];
/** @type {Snake} */
let last_snake = [];

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

const lerp = (a, b, t) => a + (b - a) * t;

const get_score = () => snake.length - starting_length;

/** 
 * @param {{ x: number, y: number }} a
 * @param {{ x: number, y: number }} b
 */
const compare_coords = (a, b) => a.x == b.x && a.y == b.y;

/** @typedef {"right" | "left" | "up" | "down"} Direction */

/** @type {Direction} */
let direction = "right";

/** @type {Direction | null} */
let last_used_direction = "right";

/** @type {Direction | null} */
let queued_direction = null;

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

	last_snake = snake.map(a => ({ x: a.x, y: a.y }));

	apple = find_new_apple_location();
}

const update = () => {
	const last = snake[snake.length - 1];

	last_snake = snake.map(a => ({ x: a.x, y: a.y }));

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

	if (queued_direction) {
		direction = queued_direction;
		queued_direction = null;
	}

	if (compare_coords(snake[0], apple)) {
		snake.push({ x: last.x, y: last.y });
		apple = find_new_apple_location();
	}

	if (snake[0].x < 0|| snake[0].y < 0 || snake[0].x >= grid_width || snake[0].y >= grid_height || snake.some((p, i) => i != 0 && p.x == snake[0].x && p.y == snake[0].y)) {
		restart();
	}

	last_update = Date.now();

	setTimeout(update, 1000 / config.speed);
};

document.addEventListener("keydown", e => {
	if (e.repeat) return;

	switch (e.key) {
		case "ArrowUp":
			if (last_used_direction) {
				if (["left", "right"].includes(last_used_direction)) {
					direction = "up";
					last_used_direction = null;
				}
			} else if (["left", "right"].includes(direction)) {
				queued_direction = "up";
			}
			break;
		case "ArrowDown":
			if (last_used_direction) {
				if (["left", "right"].includes(last_used_direction)) {
					direction = "down";
					last_used_direction = null;
				}
			} else if (["left", "right"].includes(direction)) {
				queued_direction = "down";
			}
			break;
		case "ArrowLeft":
			if (last_used_direction) {
				if (["up", "down"].includes(last_used_direction)) {
					direction = "left";
					last_used_direction = null;
				}
			} else if (["up", "down"].includes(direction)) {
				queued_direction = "left";
			}
			break;
		case "ArrowRight":
			if (last_used_direction) {
				if (["up", "down"].includes(last_used_direction)) {
					direction = "right";
					last_used_direction = null;
				}
			} else if (["up", "down"].includes(direction)) {
				queued_direction = "right";
			}
			break;
		case "r":
			restart();
			break;
	}
});

const render = () => {
	// from 0 to 1
	const delta = config.smooth ? (Date.now() - last_update) / (1000 / config.speed) : 1;

	ctx.clearRect(0, 0, canvas_width, canvas.height);
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas_width, canvas.height);
	
	ctx.fillStyle = "red";
	ctx.fillRect(apple.x * x_scale, apple.y * y_scale, x_scale, y_scale);

	ctx.fillStyle = "green";
	for (let i = 0; i < snake.length; i++) {
		if (last_snake[i]) {
			ctx.fillRect(lerp(last_snake[i].x, snake[i].x, delta) * x_scale, lerp(last_snake[i].y, snake[i].y, delta) * y_scale, x_scale, y_scale);
		}
		if (i != 0) {
			ctx.fillRect(snake[i].x * x_scale, snake[i].y * y_scale, x_scale, y_scale);
		};
	}

	requestAnimationFrame(render);
};

render();
update();