

class Rect {
	constructor(left, top, right, bottom) {
		this.left = left;
		this.top = top;
		this.right = right;
		this.bottom = bottom;
	}

	intersects$(left, top, right, bottom) {
        return this.left < right && left < this.right && this.top < bottom && top < this.bottom;
    }

	intersects(rect) {
		return this.intersects$(rect.left, rect.top, rect.right, rect.bottom);
	}
}

class GameObject {
	constructor(img, scale) {
		this.img = img;
		this.width = img.width * scale;
		this.height = img.height * scale;
		this.scale = scale;
		this.pos = {x: 0, y: 0};
	}

	getCollisionShape() {
		// let rect = {
		// 	left: this.pos.x,
		// 	top: this.pos.y,
		// 	right: this.pos.x + this.width,
		// 	bottom: this.pos.y + this.height
		// }
		// return rect;
		return new Rect(this.pos.x, this.pos.y, this.pos.x + this.width, this.pos.y + this.height);
	}

	setTexture(img) {
		this.img = img;
		this.width = img.width * this.scale;
		this.height = img.height * this.scale;
	}
}

class MovableGameObject extends GameObject {
	constructor(img, scale, speed, minSpeed = speed, maxSpeed = speed) {
		super(img, scale);
		this.speed = speed;
		this.minSpeed = minSpeed;
		this.maxSpeed = maxSpeed;
	}

	updateSpeed() {
		let speed = Math.random() * this.maxSpeed;
		if (speed < this.minSpeed)
			speed = this.minSpeed;
		this.speed = speed;
	}
}

class Background extends MovableGameObject {
	constructor(img) {
		super(img, 1, 5);
	}
}

class Player extends GameObject {
	constructor() {
		let mouseClose = document.getElementById("shark");
		let date = new Date();
		let month = date.getMonth() + 1;
		let day = date.getDate();
		if ((month == 12 && day == 24) || (month == 12 && day == 25))
			mouseClose = document.getElementById("shark-christmas");
		super(mouseClose, 0.3);
		this.mouseClose = mouseClose;
		this.mouseOpen = document.getElementById("shark1");
		this.isGoingUp = false;
		this.isLocked = false;
	}
}

class Coin extends MovableGameObject {
	constructor() {
		super(document.getElementById("coin100"), 0.25, 9, 5, 13);
		let date = new Date();
		let month = date.getMonth() + 1;
		let day = date.getDate();
		if ((month == 12 && day == 24) || (month == 12 && day == 25)) {
			this.scores = [[100, document.getElementById("coin-christmas")]];
			this.lockScore = true;
		} else if (month == 11 && day == 26) {
			this.scores = [[100, document.getElementById("coin-special")]];
			this.lockScore = true;
		} else {
			this.scores = [
				[5, document.getElementById("coin5")],
				[10, document.getElementById("coin10")],
				[20, document.getElementById("coin20")],
				[50, document.getElementById("coin50")],
				[100, document.getElementById("coin100")],
				[200, document.getElementById("coin-unknown")],
				[500, document.getElementById("coin-unknown")],
				[1000, document.getElementById("coin-unknown")]
			];
			this.lockScore = false;
		}
		this.updateScore();
		
	}

	randomScore() {
		if (this.lockScore)
			return this.scores[0];
		else {
			let r = Math.random();
			if (r < 0.5) return this.scores[0];
			else if (r < 0.8) return this.scores[1];
			else if (r < 0.9) return this.scores[2];
			else if (r < 0.93) return this.scores[3];
			else if (r < 0.96) return this.scores[4];
			else if (r < 0.98) return this.scores[5];
			else if (r < 0.99) return this.scores[6];
			else return this.scores[7];
		}
	}

	updateScore() {
		let score = this.randomScore();
		this.score = score[0];
		this.setTexture(score[1]);
	}
}

class Spider extends MovableGameObject {
	constructor() {
		super(document.getElementById("spider"), 0.2, 8, 5, 11);
	}
}

class Treasure extends MovableGameObject {
	constructor() {
		super(document.getElementById("treasure"), 0.2, 5);
		this.isVisible = false;
		this.updateScore();
	}

	updateScore() {
		this.score = Math.random() > 0.8 ? 2000 : 1000;
	}
}

class GreedyShark {
	constructor(canvas, scoreDisplay, coinCount, spiderCount) {
		this.canvas = canvas;
		this.context = canvas.getContext("2d");
		this.isPaused = false;
		this.isGameOver = false;
		this.score = 0;
		this.speedMultiple = 1;
		this.siScore = 0;
		this.scoreDisplay = scoreDisplay;
		this.gameOverCallback = null;
		this.width = this.canvas.width;
		this.height = this.canvas.height;
		let that = this;
		let bg = Math.random() < 0.5 ? document.getElementById("game-bg1") : document.getElementById("game-bg2");
		this.background = new Background(bg);
		this.background1 = new Background(bg);
		this.background1.pos.x = this.width;
		this.player = new Player();
		this.player.pos.y = this.height / 2;
		this.player.pos.x = this.width / 10;
		this.treasure = new Treasure();
		this.treasure.pos.x = this.width;
		this.treasure.pos.y = Math.random() * this.height;
		this.spiderCount = spiderCount;
		this.spiders = [];
		this.spiders.push(new Spider());
		this.coins = [];
		for (let i = 0; i < coinCount; i++)
			this.coins[i] = new Coin();
		let eventListener = function(e) {
			switch(e.type) {
				case "mousedown":
				case "touchstart":
					that.player.isLocked = false;
					that.player.isGoingUp = true;
					break;
				case "touchend":
				case "mouseup":
					that.player.isGoingUp = false;
					break;
				case "keydown":
					switch(e.keyCode) {
						case 32:
						case 38:
							that.player.isLocked = false;
							that.player.isGoingUp = true;
							break;
						case 16:
						case 17:
							that.player.isLocked = true;
							break;
					}
					break;
				case "keyup":
					switch(e.keyCode) {
						case 32:
						case 38:
							that.player.isGoingUp = false;
							break;
						case 16:
						case 17:
							that.player.isLocked = false;
							break;
					}
					break;
			}
		}
		canvas.addEventListener("mousedown", eventListener);
		canvas.addEventListener("mouseup",  eventListener);
		canvas.addEventListener("touchstart", eventListener);
		canvas.addEventListener("touchend", eventListener);
		document.addEventListener("keydown", eventListener);
		document.addEventListener("keyup", eventListener);
		this.eventListener = eventListener;
	}

	loop() {
		if (this.isGameOver) {
			this.stop();
			this.draw();
			if (this.gameOverCallback != null)
				this.gameOverCallback();
		} else {
			if (!this.isPaused) {
				this.context.clearRect(0, 0, this.width, this.height);
				this.update();
				this.draw();
			}
			this.af = requestAnimationFrame(() => this.loop());
		}
	}

	stop() {
		this.context.clearRect(0, 0, this.width, this.height);
		this.scoreDisplay.innerHTML = "";
		cancelAnimationFrame(this.af);
		this.canvas.removeEventListener("mousedown", this.eventListener);
		this.canvas.removeEventListener("mouseup", this.eventListener);
		document.removeEventListener("keydown", this.eventListener);
		document.removeEventListener("keyup", this.eventListener);
	}

	update() {
		this.background.pos.x -= this.background.speed * this.speedMultiple;
		this.background1.pos.x -= this.background1.speed * this.speedMultiple;
		if (this.background.pos.x + this.background.width < 0)
			this.background.pos.x = this.width;
		if (this.background1.pos.x + this.background1.width < 0)
			this.background1.pos.x = this.width;
		if (!this.player.isLocked) {
			if (this.player.isGoingUp)
				this.player.pos.y -= 10;
			else this.player.pos.y += 10;
			if (this.player.pos.y < 0)
				this.player.pos.y = 0;
			else {
				let yMax = this.height - this.player.height;
				if (this.player.pos.y > yMax)
					this.player.pos.y = yMax;
			}
		}
		if (this.treasure.isVisible) {
			this.treasure.pos.x -= this.treasure.speed * this.speedMultiple;
			if (this.treasure.pos.x + this.treasure.width < 0) {
				this.treasure.pos.x = this.width;
				this.treasure.pos.y = Math.random() * this.height;
				this.treasure.updateScore();
				this.treasure.isVisible = false;
			} else if (this.treasure.getCollisionShape().intersects(this.player.getCollisionShape())) {
				this.treasure.pos.x = this.width;
				this.treasure.pos.y = Math.random() * this.height;
				this.updateScore(this.treasure.score);
				this.treasure.updateScore();
				this.treasure.isVisible = false;
			}
		}
		this.coins.forEach((coin, i) => {
			coin.pos.x -= coin.speed * this.speedMultiple;
			if (coin.pos.x + coin.width < 0) {
				coin.pos.x = this.width;
				coin.pos.y = Math.random() * this.height;
				coin.updateSpeed();
				coin.updateScore();
				if (!this.treasure.isVisible && this.speedMultiple > 1)
					this.treasure.isVisible = Math.random() > 0.96;
			} else if (coin.getCollisionShape().intersects(this.player.getCollisionShape())) {
				coin.pos.x = this.width;
				coin.pos.y = Math.random() * this.height;
				this.updateScore(coin.score);
				coin.updateSpeed();
				coin.updateScore();
				this.player.setTexture(this.player.mouseOpen);
				setTimeout(()=> this.player.setTexture(this.player.mouseClose), 500);
			}
		});
		this.spiders.forEach((spider, i) => {
			spider.pos.x -= spider.speed * this.speedMultiple;
			if (spider.pos.x + spider.width < 0) {
				spider.pos.x = this.width;
				spider.pos.y = Math.random() * this.height;
				spider.updateSpeed();
			} else if (spider.getCollisionShape().intersects(this.player.getCollisionShape())) {
				this.isGameOver = true;
			}
		});
	}

	updateScore(score) {
		this.score += score;
		this.siScore += score;
		this.scoreDisplay.innerHTML = "Score: " + this.score;
		if (this.siScore >= 200) {
			this.siScore = 0;
			if (this.spiders.length < this.spiderCount)
				this.spiders.push(new Spider());
			else this.speedMultiple += 0.1;
		}
		if (this.score >= 5000) {
			this.spiders.forEach((spider, i) => {
				spider.setTexture(document.getElementById("spider-inverted"));
			});
		}
	}

	draw() {
		if (this.score >= 5000) {
			this.context.fillStyle = "#000000";
			this.context.fillRect(0, 0, this.width, this.height);
		} else {
			this.drawBackground(this.background);
			this.drawBackground(this.background1);
		}
		this.drawGameObject(this.player);
		this.drawGameObject(this.treasure);
		this.coins.forEach((coin, i) => {
			this.drawGameObject(coin);
		});
		this.spiders.forEach((spider, i) => {
			this.drawGameObject(spider);
		});
	}

	drawBackground(obj) {
		this.context.drawImage(obj.img, obj.pos.x, obj.pos.y, this.width, this.height);
	}

	drawGameObject(obj) {
		this.context.drawImage(obj.img, obj.pos.x, obj.pos.y, obj.width, obj.height);
	}
}