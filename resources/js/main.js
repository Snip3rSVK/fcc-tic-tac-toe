{
	const hide = elem => elem.classList.add("hidden");
	const show = elem => elem.classList.remove("hidden");

	const switcher = {
		beginning: beginning(),
		selectLetter: null,
		createGame: null
	};

	//Velocity(document.querySelector("body"), { opacity: 0.5 }, 1000);

	/* ======== CREATE BOARD ======== */
	function createGame(setupAI, player1Letter) {
		const boardElem = document.querySelector("#board");

		const gameInfo = {
			againstComputer: setupAI,
			board: Array(9),
			delay: 600,
			numOfGames: 0,
			onTurn: "X", // X always beginns
			startedLastGame: "X",
			onClickFunc: null,
			timeouts: [],
			player1: player1Letter,
			player2: player1Letter === "X" ? "O" : "X",
			winCombs: [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]
		};

		const elements = {
			body: document.querySelector("body"),
			svg: document.querySelector("svg"),
			svgRects: document.querySelectorAll(".rect"),
		};

		const onePlayer = function() {
			/* gameInfo.player1 -> human
			*  gameInfo.player2 -> computer */

			if (gameInfo.onTurn === gameInfo.player2)
				aiMove();
			else
				addListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], onClick);

			function onClick(evt) {
				const index = Array.from(evt.target.parentNode.children).indexOf(evt.target); // Array.from not working on Edge and IE
				const pushMovePromise = pushMove(gameInfo.player1, index);
				if (!over(gameInfo.board))
					aiMove();
				decideWhoStarts(pushMovePromise);
			}
			gameInfo.onClickFunc = onClick;

			function aiMove() {
				const index = findBestMove(gameInfo.board);
				const pushMovePromise = pushMove(gameInfo.player2, index); // pushMove adds listeners
				decideWhoStarts(pushMovePromise);
			}

			function decideWhoStarts(promise) {
				removeListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], onClick);
				if (promise && gameInfo.onTurn === gameInfo.player2) {
					promise.then(() => {
						addListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], onClick);
						aiMove();
					});
				}
				else if (!over(gameInfo.board))
					addListeners(emptySpots(gameInfo.board), onClick);
			}

			function score(board, depth) {
				if (winning(gameInfo.player1, board))
					return -10 + depth;
				else if (winning(gameInfo.player2, board))
					return 10 - depth;
				if (!emptySpots(board).length)
					return 0;
			}

			function minimax(board, depth, maximizing) {
				if (over(board))
					return score(board, depth);

				const freeSpots = emptySpots(board);

				if (maximizing) {
					let bestValue = -Infinity;
					for (let i = 0; i < freeSpots.length; i++) {
						board[freeSpots[i]] = gameInfo.player2;
						bestValue = Math.max(bestValue, minimax(board, depth + 1, false));
						board[freeSpots[i]] = null;
					}
					return bestValue;
				}

				else {
					let bestValue = Infinity;
					for (let i = 0; i < freeSpots.length; i++) {
						board[freeSpots[i]] = gameInfo.player1;
						bestValue = Math.min(bestValue, minimax(board, depth + 1, true));
						board[freeSpots[i]] = null;
					}
					return bestValue;
				}
			}


			function findBestMove(board) {
				let bestValue = -Infinity;
				let bestMoves = [];
				let randNumBewteen = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
				const freeSpots = emptySpots(board);

				if (emptySpots(board).length === 9)
					return randNumBewteen(0, 8);

				for (let i = 0; i < freeSpots.length; i++) {
					board[freeSpots[i]] = gameInfo.player2;
					const moveValue = minimax(board, 0, false);
					board[freeSpots[i]] = null;
					if (moveValue > bestValue) {
						bestValue = moveValue;
						bestMoves = [freeSpots[i]];
					}
					else if (moveValue === bestValue)
						bestMoves.push(freeSpots[i]);
				}

				const randNum = randNumBewteen(0, bestMoves.length - 1);
				return bestMoves[randNum];
			}
			/* ========================================= */
		};

		const twoPlayers = function() {
			addListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], onClick);

			function onClick(evt) {
				const index = Array.from(evt.target.parentNode.children).indexOf(evt.target);  // Array.from not working on Edge and IE
				pushMove(gameInfo.onTurn, index);
			}
			gameInfo.onClickFunc = onClick;
		};

		function call() {
			gameInfo.againstComputer ? onePlayer() : twoPlayers();
			show(boardElem);
		}

		function terminate() {
			clearScore();
			clearBoard();
			clearTimeouts();
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

		function pushMove(letter, index) { // letter is unnecessary gameInfo.onTurn could be instad of letter
			gameInfo.board[index] = letter;
			removeListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], gameInfo.onClickFunc);
			gameInfo.onTurn = gameInfo.onTurn === "X" ? "O" : "X";

			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			const x = Number(elements.svgRects[index].getAttribute("x").replace(/\%/, "")) + 9;
			const y = Number(elements.svgRects[index].getAttribute("y").replace(/\%/, "")) + 24;
			text.setAttribute("data-index", index);
			text.setAttribute("x", `${x}%`);
			text.setAttribute("y", `${y}%`);
			text.textContent = letter.toLowerCase();
			text.classList.add(letter.toLowerCase());
			//text.style.fontSize = elements.svg.getBoundingClientRect().width / 3 * 86 / 100;
			elements.svg.append(text);

			if (over(gameInfo.board)) {
				gameInfo.numOfGames++;
				gameInfo.startedLastGame = gameInfo.startedLastGame === "X" ? "O" : "X";
				gameInfo.onTurn = gameInfo.startedLastGame;
				if (whoWon(gameInfo.board))
					showWinComb();
				const promise = new Promise((resolve) => {
					gameInfo.timeouts.push(setTimeout(function() {
						if (whoWon(gameInfo.board))
							addScoreTo(whoWon(gameInfo.board));
						clearBoard();
						addListeners([0, 1, 2, 3, 4, 5, 6, 7, 8], gameInfo.onClickFunc);
						resolve("success");
					}, gameInfo.delay));
				});
				return promise;
			}
			else
				addListeners(emptySpots(gameInfo.board), gameInfo.onClickFunc);
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

		function showWinComb() {
			const winning = whoWon(gameInfo.board);
			let winComb;
			for (let i = 0; i < gameInfo.winCombs.length; i++)
				if (gameInfo.winCombs[i].every(num => gameInfo.board[num] === winning))
					winComb = gameInfo.winCombs[i];
			for (const num of winComb)
				highlightLetter(num);
		}

		function highlightLetter(index) {
			const letterElem = document.querySelector(`text[data-index="${index}"]`);
			letterElem.classList.add("highlightLetter");
		}

		function clearBoard() {
			gameInfo.board = Array(9);

			const texts = document.querySelectorAll(".x, .o");
			for (let i = 0; i < texts.length; i++)
				texts[i].parentNode.removeChild(texts[i]);
		}

		function clearTimeouts() {
			for (let i = 0; i < gameInfo.timeouts.length; i++)
				clearTimeout(gameInfo.timeouts[i]);
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
		const backBtn = document.querySelector("#back-btn");
		const setupAI = numOfPlayers === 1;

		function call() {
			btns[0].addEventListener("click", chooseX);
			btns[1].addEventListener("click", chooseO);
			backBtn.addEventListener("click", back);
			heading.innerHTML = `${ !setupAI ? "Player 1 would" : "Would" } you like ${ !setupAI ? "" : "<br>" } to be X or O?`;
			show(selectLetterElem);
		}

		function terminate() {
			btns[0].removeEventListener("click", chooseX);
			btns[1].removeEventListener("click", chooseO);
			backBtn.removeEventListener("click", back);
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

		function back() {
			switcher.selectLetter.terminate();
			switcher.beginning.call();
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