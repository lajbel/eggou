Newgrounds.Init("sss", "sss");

function health(hp) {
	return {
		hurt(n) {
			hp -= (n === undefined ? 1 : n);
			this.trigger("hurt");
			if (hp <= 0) {
				this.trigger("death");
			}
		},
		heal(n) {
			hp += (n === undefined ? 1 : n);
			this.trigger("heal");
		},
		hp() {
			return hp;
		},
	};
}

function removeItemFromArr ( arr, item ) {
    var i = arr.indexOf( item );
 
    if ( i !== -1 ) {
        arr.splice( i, 1 );
    }
};

// Kaboom Context ///////////////////

const k = kaboom({
	global: true,
	width: 680,
	height: 500,
	canvas: document.getElementById("game"),
	debug: true,
	fullscreen: false,
	clearColor: [0, 0, 0, 1],
});

// Load sprites and audios ///////////////////

loadSound("spooky_beat", "./sounds/spooky_beat.ogg");
loadSound("start", "./sounds/start.wav");
loadSound("shoot", "./sounds/shoot.wav");
loadSound("boom", "./sounds/boom.wav");
loadSprite("margin", "./sprites/margin.png");
loadSprite("loose", "./sprites/loose.png");
loadSprite("win", "./sprites/win.png");
loadSprite("target", "./sprites/target.png");
loadSprite("clock", "./sprites/clock.png");
loadSprite("evil", "./sprites/evil.png");
loadSprite("heart", "./sprites/heart.png");
loadSprite("background", "./sprites/background.png");
loadSprite("logo", "./sprites/logo.png");
loadSprite("jam_logo", "./sprites/jam_logo.png");
loadSprite("newgrounds", "./sprites/newgrounds.png");
loadSprite("egg", "./sprites/egg.png", {
	sliceX: 8,
	sliceY: 1,
	anims: {
		main: {
			from: 0,
			to: 7
		}
	}
});
loadSprite("roboegg", "./sprites/roboegg.png", {
	sliceX: 10,
	sliceY: 1,
	anims: {
		main: {
			from: 0,
			to: 9
		}
	}
});
loadSprite("chiken", "./sprites/chiken.png", {
	animSpeed: 1,
	sliceX: 5,
	sliceY: 1,
	anims: {
		fly: {
			from: 0,
			to: 4
		}
	}
});
loadSprite("robochiken", "./sprites/robo_chiken.png", {
	animSpeed: 1,
	sliceX: 6,
	sliceY: 1,
	anims: {
		fly: {
			from: 0,
			to: 5
		}
	}
});
loadSprite("chikenboom", "./sprites/chikenboom.png", {
	animSpeed: 1.5,
	sliceX: 5,
	sliceY: 1,
	anims: {
		main: {
			from: 0,
			to: 4
		}
	}
});
loadSprite("robodead", "./sprites/robodead.png", {
	animSpeed: 2,
	sliceX: 12,
	sliceY: 1,
	anims: {
		dead: {
			from: 0,
			to: 11
		},
		f: {
			from: 6,
			to: 6
		}
	}
});

// Scenes ///////////////////

scene("splash", () => {
	var show = false; 

	const ng = add([
		sprite("newgrounds"),
		origin("center"),
		color(1, 1, 1, 0),
		scale(0.3),
		pos(width() / 2, height() / 2)
	]);

	loop(0.01, () => {
		if(show) return;

		if(ng.color.a >= 1) wait(1, () => show = true)
		else ng.color.a += 0.01;
	});

	loop(0.01, () => {
		if(!show) return;

		ng.color.a -= 0.01;

		if(ng.color.a <= 0) wait(0.1, () => go("start"));
	});

	action(() => {
		if(ng.isClicked()) {
			window.open("https://www.newgrounds.com/", "_blank");
		};

		if(ng.isHovered()) {
			document.getElementById("game").style.cursor = "pointer";
		} else {
			document.getElementById("game").style.cursor = "default";
		};
	});
});

scene("start", () => {
	let isStart = false;

	// Gui of Start ////////////////

	add([
		sprite("logo"),
		pos(width() / 2, height() / 2.5),
		origin("center"),
		scale(1.2)
	]);

	const jamLogo = add([
		sprite("jam_logo"),
		scale(0.3),
		pos(0, -30)
	]);

	const startText = add([
		text("Space or enter for play", 15),
		pos(width() / 2, height() - 60),
		origin("center"),
	]);

	loop(0.3, () => {
		if(isStart) return;

		startText.hidden = !startText.hidden;
	});


	action(() => {
		if ((keyIsPressed("space") || keyIsPressed("enter")) && !isStart) {
			isStart = true;
			play("start");
			
			loop(0.1, () => startText.hidden = !startText.hidden);
			wait(2, () => go("game"));
		};

		if(jamLogo.isClicked()) {
			window.open("https://www.newgrounds.com/collection/julyjam2021", "_blank");
		};

		if(jamLogo.isHovered()) {
			document.getElementById("game").style.cursor = "pointer";
		} else {
			document.getElementById("game").style.cursor = "default";
		};
	});
});

scene("game", () => {
	let BOSS_HEALTH = 300;
	let PLAYER_HEALTH = 100;

	let win = false;
	let worldW = 500;
	let backgroundSpeed = 100;
	let lastShoot = 0;
	let isPosted = false;

	let backgroundMusic = play("spooky_beat");
	backgroundMusic.loop();

	layers(["background", "game", "ui"]);

	/// Game UI 
	
	const margin = add([
		sprite("margin"),
		pos(worldW, 0),
		layer("ui"),
	]);
	
	add([
		sprite("background"),
		layer("bg"),
		pos(0, 0),
		scale(1),
		"bg"
	]);

	add([
		sprite("background"),
		layer("bg"),
		pos(0, -height()),
		scale(1),
		"bg"
	]);

	const heart = add([
		sprite("heart"),
		layer("ui"),
		pos(margin.pos.x + 20, 30),
	]);

	const evil = add([
		sprite("evil"),
		layer("ui"),
		pos(heart.pos.x, heart.pos.y + 60)
	]);

	const clock = add([
		sprite("clock"),
		layer("ui"),
		origin("center"),
		scale(1.3),
		pos(worldW + 180 / 2, evil.pos.y + 140)
	]);

	const playerLife = add([
		text(":" + PLAYER_HEALTH, 25),
		pos(heart.pos.x + 40, heart.pos.y + 15),
		layer("ui")
	]);

	const bossLife = add([
		text(":" + BOSS_HEALTH, 25),
		pos(evil.pos.x + 40, evil.pos.y + 15),
		layer("ui")
	]);

	const timer = add([
		text(":" + 0, 20, {width: 135}),
		pos(worldW + 180 / 2, clock.pos.y + 50),
		origin("center"),
		layer("ui"),
		{
			time: 0,
		},
	]);

	action("bg", (b) => {
		b.move(0, backgroundSpeed);

		if (b.pos.y >= height()) {
			b.pos.y -= height() * 2;
		};
	});

	const player = add([
		sprite("chiken"),
		layer("game"),
		pos(worldW / 2, height() - 40),
		scale(1.5),
		origin("center"),
		area(vec2(15, 20), vec2(-15, -20)),
		health(100),
		{
			speed: 300,
			shoot: () => {
				const egg = add([
					sprite("egg"),
					layer("game"),
					pos(player.pos.x, player.pos.y - 30),
					origin("center"),
					scale(1.2),
					"egg",
					{
						speed: 500
					}
				]);
				
				play("shoot", {volume: 0.6});
				egg.play("main");
			},
		}
	]);
	
	const boss = add([
		sprite("robochiken"),
		layer("game"),
		pos(worldW / 2, -40),
		scale(1.4),
		rotate(0),
		origin("center"),
		area(vec2(13, 13), vec2(-15, -15)),
		health(BOSS_HEALTH),
		"boss",
		"enemy",
		{
			speed: 20,
			dir: choose([-1, 1]),
			ydir: 1,
			lastShoot,
			shoot: (s, dir, t) => {
				if(!s) s = 400;
				if(!dir) dir = -boss.angle;
				if(!t) t = 0.8;

				const egg = add([
					sprite("roboegg"),
					layer("game"),
					pos(boss.pos),
					origin("center"),
					area(vec2(7, 7), vec2(-7, -7)),
					scale(t),
					rotate(0),
					"enemyEgg",
					{
						speed: s
					}
				]);

				readd(boss);
				egg.play("main");
				egg.angle = dir;
			},
		}
	]);

	player.play("fly");
	boss.play("fly");
	boss.flipY(-1);
	boss.trigger("toMap")

	var attacks = [3];
	var attack = -1;
	var attackTime = 0;

	boss.action(() => {
		if(boss.pos.y < 40 && !boss.is("inMap")) boss.trigger("toMap");

		else if(!boss.is("inMap")) {
			boss.use("inMap");
			boss.speed = 200;	
		};

		removeItemFromArr(attacks, attack);

		if(attacks.length == 0) {
			attacks = [3];
		};

		if(attack < 0) {
			attack = attacks[Math.floor(Math.random() * attacks.length)];
			attackTime = time();
		};

		if(attack == 0 && boss.is("inMap")) boss.trigger("attackOne");
		if(attack == 1 && boss.is("inMap")) boss.trigger("attackTwo");
		if(attack == 2 && boss.is("inMap")) boss.trigger("attackThree");
		if(attack == 3 && boss.is("inMap")) boss.trigger("attackFour");
	});

	// Input ////////////////////////// 
	
	action(() => {
		if((keyIsDown("right") || keyIsDown("d")) && player.pos.x < worldW - 30) {
			player.move(player.speed, 0);
		};

		if((keyIsDown("left") || keyIsDown("a")) && player.pos.x > 35) {
			player.move(-player.speed, 0);
		};

		if((keyIsDown("down") || keyIsDown("s")) && player.pos.y <= height() - 30) {
			player.move(0, player.speed);
		};

		if((keyIsDown("up") || keyIsDown("w")) && player.pos.y >= 0) {
			player.move(0, -player.speed);
		};

		if((keyIsPressed("space") || keyIsPressed("enter")) && time() > lastShoot + 0.2 && player.exists()) {
			player.shoot();
			readd(player);
			lastShoot = time();
		};

		if(keyIsPressed("escape")) {
			backgroundMusic.stop();
			go("start");
		};

	});

	// Collisions and actions ////////////////////////// 

	player.on("hurt", () => {
		if(player.hp() < 0) player.text = ":0";
		else playerLife.text = ":" + player.hp();
		
		player.color = rgb(1, 0, 0);
		wait(0.050, () => player.color = rgb(1, 1, 1))
	});

	player.on("death", () => {
		backgroundMusic.stop();
		Newgrounds.UnlockMedal(0);
		playerLife.text = ":0";

		const boom = add([
			sprite("chikenboom"),
			scale(1.5),
			origin("center"),
			pos(player.pos),
			"boom"
		]);

		destroy(player);
		boom.play("main");

		wait(2, () => go("loose"))
	});

	// BOSS

	boss.on("death", () => {
		Newgrounds.UnlockMedal(1);
		var newScore = Number(timer.time.toFixed(2).toString().replace(".", ""));
		bossLife.text = ":0";

		if(!isPosted) {
			isPosted = true;

			Newgrounds.PostScore(0, newScore);
		};

		if(player.hp() == 100) {
			Newgrounds.UnlockMedal(2);
		}

		if(timer.time < 100) {
			Newgrounds.UnlockMedal(3);
		};

		attackTime = 0.0;
		win = true;
		var toDead = false
		var anim;

		backgroundMusic.stop();

		action(() => {
			if(boss.pos.x.toFixed() != worldW / 2 && !toDead) {
				if(boss.pos.x > worldW / 2) {
					boss.move(-120, 0)
				}
				else {
					boss.move(120, 0)
				}
			}

			if(boss.pos.y.toFixed() != 40 && !toDead) {
				boss.move(120, 0)
			}

			if(boss.pos.x.toFixed() == worldW / 2 && boss.pos.y.toFixed() == 40 && !toDead) {
				toDead = true;

				anim = add([
					sprite("robodead"),
					pos(boss.pos),
					layer("game"),
					scale(1.4),
					origin("center")
				]);

				destroy(boss);

				anim.flipY(-1);
				anim.play("dead");
			};

			if(toDead) {
				anim.move(0, -15);

				if(anim.frame == 0) {
					play("boom", {volume: 0.06});
				};

				wait(5, () => go("win")); 
			}
		})
		
	});

	boss.on("hurt", () => {
		if(boss.hp() < 0) bossLife.text = ":0";
		else bossLife.text = ":" + boss.hp();

		boss.color = rgb(1, 3, 1);
		wait(0.050, () => boss.color = rgb(1, 1, 1))
	});

	boss.on("toMap", () => {
		boss.move(0, boss.speed);
	});

	boss.on("attackOne", () => {
		if(time() < attackTime + 8) {
			boss.move(boss.speed * boss.dir, 0);
		}

		if(time() > boss.lastShoot + 0.12 && time() < attackTime + 8) {
			boss.shoot(540);
			play("shoot", {volume: 0.7});
			boss.lastShoot = time();
		};

		if (boss.dir == 1 && boss.pos.x >= worldW - 30) {
			boss.dir = -1;
		}
		else if (boss.dir == -1 && boss.pos.x <= 20) {
			boss.dir = 1;
		};

		if(time() > attackTime + 8) {
			if(boss.pos.x.toFixed() == worldW / 2) {
				attack = -1;
			} else {
				if(boss.pos.x.toFixed() > worldW / 2) {
					boss.move(-boss.speed, 0);
				}
				else if(boss.pos.x.toFixed() < worldW / 2) {
					boss.move(boss.speed, 0);
				};
			}
		};
	});

	boss.on("attackTwo", () => {
		if(boss.pos.y <= height() / 2 && time() < attackTime + 8) {
			boss.move(0, boss.speed);
		} 
		
		else {
			boss.angle += 0.5;

			if(time() > boss.lastShoot + 0.05 && time() < attackTime + 8) {
				boss.shoot();
				play("shoot", {volume: 0.7});
				boss.lastShoot = time();
			};
		};

		if(time() > attackTime + 8) {
			boss.angle = 0;

			if(boss.pos.y.toFixed() <= 40) {
					attack = -1;
			}
			else {
				boss.move(0, -boss.speed);
			};
		};
	});

	boss.on("attackThree", () => {
		if(time() > boss.lastShoot + 0.1 && time() < attackTime + 4) {
			boss.shoot(null, 0);
			boss.shoot(null, 5.26);
			boss.shoot(null, 1.06);
			play("shoot", {volume: 0.7});

			boss.lastShoot = time();
		};

		if(boss.pos.y < 380 && time() < attackTime + 4) {
			boss.move(0, boss.speed)
		}

		else {
			if(time() > attackTime + 4) {
				if(boss.pos.y <= 40) {
					attack = -1;
				}
				else if(boss.pos.y > 40) {
					boss.move(0, -boss.speed)
				};
			};
		};
	});

	boss.on("attackFour", () => {
		let angleInit = 0.523;

		if(boss.pos.y <= height() / 2 && time() < attackTime + 5) {
			boss.move(0, boss.speed);
		}

		if(time() > boss.lastShoot + 0.8 && time() < attackTime + 5) {
			boss.shoot(null, 0, 1);
			boss.shoot(null, angleInit, 1);
			boss.shoot(null, angleInit * 2, 1);
			boss.shoot(null, angleInit * 3, 1);
			boss.shoot(null, angleInit * 4, 1);
			boss.shoot(null, angleInit * 5, 1);
			boss.shoot(null, angleInit * 6, 1);
			boss.shoot(null, angleInit * 7, 1);
			boss.shoot(null, angleInit * 8, 1);
			boss.shoot(null, angleInit * 9, 1);
			boss.shoot(null, angleInit * 10, 1);
			boss.shoot(null, angleInit * 11, 1);
			boss.shoot(null, angleInit * 12, 1);

			play("shoot", {volume: 0.7});
			boss.lastShoot = time();
		};
		
		if(time() > attackTime + 5) {
			if(boss.pos.y.toFixed() <= 40) {
					attack = -1;
			}
			else {
				boss.move(0, -boss.speed);
			};
		};
	});
 
	action("egg", (e) => {
		e.move(0, -e.speed);

		if (e.pos.y < 0) destroy(e);
		if (e.frame == 6) wait(0.1, () => destroy(e));
	});

	action("enemyEgg", (e) => {
		var currentAngle = e.angle;
		
		var dy = Math.cos(e.angle) * e.speed;
		var dx = Math.sin(e.angle) * e.speed;
		
		if (currentAngle > previousAngle) {       
			if(e.angle >= 0 && e.angle <= 90) dy = -dy, dx + dx;
			if(e.angle > 90 && e.angle <= 180) dy = +dy, dx = -dx;

			if(e.angle > 180 && e.angle <= 270) dy = -dy, dx = +dx;
			if(e.angle > 270 && e.angle <= 360) dy = +dy, dx = -dx;
		}
		else {
			if(e.angle >= 0 && e.angle <= 90) dy = +dy, dx - dx;
			if(e.angle > 90 && e.angle <= 180) dy = -dy, dx = +dx;

			if(e.angle > 180 && e.angle <= 270) dy = +dy, dx = -dx;
			if(e.angle > 270 && e.angle <= 360) dy = -dy, dx = +dx;
		};

		e.move(dx, dy);

		if (e.pos.y > height() + 25) destroy(e);
		if (e.frame == 6) wait(0.1, () => destroy(e));

		var previousAngle = currentAngle; 
	});

	action("boom", (boom) => {
		if(boom.frame == 4) {
			destroy(boom);
		};
	});

	timer.action(() => {
		if(win == true) return;

		timer.time += dt();
		timer.text = timer.time.toFixed(2);
	});

	collides("enemy", "egg", (en, e) => {
		destroy(e);

		en.hurt(2);
		camShake(1);
	});

	player.collides("enemy", () => {
		player.hurt(8);
		camShake(4);
	})

	player.collides("enemyEgg", (e) => {
		destroy(e);
		player.hurt(4);
		camShake(2);
	});
});

scene("loose", () => {
	add([
		sprite("loose"),
		pos(0, 0)
	])

	add([
		text("Cooked!", 35),
		pos(width() / 2, height() / 4),
		color("#ffffff"),
		origin("center")
	]);

	add([
		text("space for main menu", 25),
		pos(width() / 2, height() - 80),
		origin("center")
	]);

	keyPress("escape", () => {
		go("start");
	});

	keyPress("space", () => {
		go("start");
	});
});

scene("win", () => {
	add([
		sprite("win"),
		pos(0, 0)
	]);

	add([
		text("Congrats", 30),
		pos(width() / 2, height() / 4),
		origin("center")
	]);

	add([
		text("space for main menu", 25),
		pos(width() / 2, height() - 80),
		origin("center")
	])

	keyPress("escape", () => {
		go("start");
	});

	keyPress("space", () => {
		go("start");
	});
});

start("splash");
