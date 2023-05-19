// Kaboom server

const fs = require("fs");
const esbuild = require("esbuild");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

let err = null;

// Compile game

const privateData = {};

privateData["NGID"] = JSON.stringify(process.env["NGID"]);
privateData["NGKEY"] = JSON.stringify(process.env["NGKEY"]);

function buildGame() {
	const template = fs.readFileSync("code/template.html", "utf-8");
	const code = `<script src="game.js"></script>`;

	try {
		esbuild.buildSync({
			bundle: true,
			sourcemap: false,
			target: "es6",
			keepNames: true,
			logLevel: "silent",
			entryPoints: ["code/main.js"],
			outfile: "game.js",
			define: privateData,
		});
	}

	catch (e) {
		const loc = e.errors[0].location;

		err = {
			msg: e.errors[0].text,
			stack: [
				{
					line: loc.line,
					col: loc.column,
					file: loc.file,
				},
			],
		};

		let msg = "";

		msg += "<pre>";
		msg += `ERROR: ${err.msg}\n`;

		if (err.stack) {
			err.stack.forEach((trace) => {
				msg += `    -> ${trace.file}:${trace.line}:${trace.col}\n`;
			});
		}

		msg += "</pre>";

		fs.writeFileSync("index.html", msg);

		return;
	}

	fs.writeFileSync("index.html", template.replace("{{kaboom}}", code));
};

// Server

app.get("/", (req, res) => {
	err = null;
	buildGame();
	res.sendFile(__dirname + "/index.html");
});

app.post("/error", (req, res) => {
	err = req.body;
});

app.use(express.static(__dirname));
app.use(express.json({ strict: false }));

app.listen(8000);
