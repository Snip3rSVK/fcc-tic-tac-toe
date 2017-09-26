{
	const hide = elem => elem.classList.add("hidden");
	const show = elem => elem.classList.remove("hidden");

	const switcher = {
		beginning: beginning(),
		selectLetter: null,
		createGame: null
	};

	/* ======== CREATE BOARD ======== */
	function createGame(setupAI, player1Letter) {
		const boardElem = document.querySelector("#board");

		const gameInfo = {
			againstComputer: setupAI,
			board: Array(9),
			numOfGames: 0,
			onTurn: "X", // X always beginns
			onClickFunc: null,
			player1: player1Letter,
			player2: player1Letter === "X" ? "O" : "X",
			winCombs: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
		};

		const elements = {
			svg: document.querySelector("svg"),
			svgRects: document.querySelectorAll(".rect"),
		};

		const onePlayer = function() {
			console.log("onePlayer");
		};

		const twoPlayers = function() {
			addListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], onClick);

			function onClick(evt) {
				const index = Array.from(evt.target.parentNode.children).indexOf(evt.target);
				pushMove(gameInfo.onTurn, index);
			}
			gameInfo.onClickFunc = onClick;

			function pushMove(letter, index) { // letter is unnecessary gameInfo.onTurn could be instad of letter
				gameInfo.board[index] = letter;
				removeListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], onClick);
				gameInfo.onTurn = gameInfo.onTurn === "X" ? "O" : "X";

				const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
				const x = Number(elements.svgRects[index].getAttribute("x").replace(/\%/, "")) + 9;
				const y = Number(elements.svgRects[index].getAttribute("y").replace(/\%/, "")) + 24;
				text.setAttribute("x", `${x}%`);
				text.setAttribute("y", `${y}%`);
				text.textContent = letter.toLowerCase();
				text.classList.add(letter.toLowerCase());

				elements.svg.append(text);

				if (over(gameInfo.board)) {
					gameInfo.numOfGames++;
					const promise = new Promise(() => {
						setTimeout(function() {
							if (whoWon(gameInfo.board))
								addScoreTo(whoWon(gameInfo.board));
							clearBoard();
						}, 500);
					});

					promise.then(() => {
						addListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], onClick);
					});
				}
				else {
					addListeners(emptySpots(gameInfo.board), onClick);
				}
			}
		};

		function call() {
			gameInfo.againstComputer ? onePlayer() : twoPlayers();
			show(boardElem);
		}

		function terminate() {
			clearScore();
			clearBoard();
			removeListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], gameInfo.onClickFunc);
			hide(boardElem);
		}

		function emptySpots(board) {
			const indexes = [];
			for (let i = 0; i < board.length; i++)
				if (!board[i])
					indexes.push(i);
			return indexes;
		}

		function winning(letter, board) {
			for (let i = 0; i < gameInfo.winCombs.length; i++)
				if (gameInfo.winCombs[i].every(num => board[num] === letter))
					return true;
			return false;
		}

		function over(board) {
			return winning("X", board) || winning("O", board) || !emptySpots(board).length;
		}

		function whoWon(board) {
			if (winning("X", board))
				return "X";
			else if (winning("O", board))
				return "O";
		}

		function clearBoard() {
			gameInfo.board = Array(9);

			const texts = document.querySelectorAll(".x, .o");
			for (let i = 0; i < texts.length; i++)
				texts[i].parentNode.removeChild(texts[i]);
		}

		function addScoreTo(letter) {
			const scoreElem = document.querySelector(`.score-${letter.toLowerCase()}`);
			const newScore = Number(scoreElem.textContent) + 1;
			scoreElem.textContent = newScore;
		}

		function clearScore() {
			const scoreX = document.querySelector(".score-x");
			const scoreO = document.querySelector(".score-o");
			scoreX.textContent = 0;
			scoreO.textContent = 0;
		}

		function removeListeners(indexes, func) {
			for (const num of indexes) {
				elements.svgRects[num].removeEventListener("click", func);
				elements.svgRects[num].style.cursor = "default";
			}
		}

		function addListeners(indexes, func) {
			for (const num of indexes) {
				elements.svgRects[num].addEventListener("click", func);
				elements.svgRects[num].style.cursor = "pointer";
			}
		}

		return {
			call: call,
			terminate: terminate
		};
	}

	/* ======== SELECT LETTER ======== */
	function selectLetter(numOfPlayers) {
		const selectLetterElem = document.querySelector("#select-letter");
		const heading = document.querySelector("#select-letter .heading");
		const btns = document.querySelectorAll(".select-letter-btn");
		const setupAI = numOfPlayers === 1;

		function call() {
			btns[0].addEventListener("click", chooseX);
			btns[1].addEventListener("click", chooseO);
			heading.textContent = `${ setupAI ? "Player 1 would" : "Would" } you like to be X or O?`;
			show(selectLetterElem);
		}

		function terminate() {
			btns[0].removeEventListener("click", chooseX);
			btns[1].removeEventListener("click", chooseO);
			hide(selectLetterElem);
		}

		function chooseX() {
			switcher.selectLetter.terminate();
			switcher.createGame = createGame(setupAI, "X");
			switcher.createGame.call();
		}

		function chooseO() {
			switcher.selectLetter.terminate();
			switcher.createGame = createGame(setupAI, "O");
			switcher.createGame.call();
		}

		return {
			call: call,
			terminate: terminate
		};
	}

	/* ======== HOMEPAGE ======== */
	function beginning() {
		const btns = document.querySelectorAll(".beginning-btn");
		const beginningElem = document.querySelector("#beginning");

		function call() {
			btns[0].addEventListener("click", onePlayer);
			btns[1].addEventListener("click", twoPlayers);
			show(beginningElem);
		}

		function terminate() {
			btns[0].removeEventListener("click", onePlayer);
			btns[1].removeEventListener("click", twoPlayers);
			hide(beginningElem);
		}

		function onePlayer() {
			switcher.beginning.terminate();
			switcher.selectLetter = selectLetter(1);
			switcher.selectLetter.call();
		}

		function twoPlayers() {
			switcher.beginning.terminate();
			switcher.selectLetter = selectLetter(2);
			switcher.selectLetter.call();
		}

		return {
			call: call,
			terminate: terminate,
		};
	}

	switcher.beginning.call();

	const homeBtn = document.querySelector("#home-btn");
	homeBtn.addEventListener("click", function() {
		switcher.createGame.terminate();
		switcher.beginning.call();
	});
}