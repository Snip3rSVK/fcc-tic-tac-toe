{
	const hide = elem => elem.classList.add("hidden");
	const show = elem => elem.classList.remove("hidden");

	/* ======== CREATE BOARD ======== */
	const createGame = function(setupAI, player1Letter) {
		const boardElem = document.querySelector("#board");
		const SVG = document.querySelector("svg");
		const SVGRects = document.querySelectorAll(".rect");
		const SVGRectsIndexesFull = [...Array(9).keys()]; // [0, 1, 2, 3, 4, 5, 6, 7, 8]
		const winCombs = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
		const board = Array(9);
		const resetButton = document.querySelector("#reset-btn");
		const playerX = "X";
		const playerO = "O";
		const aiPlayer = playerX;
		const humanPlayer = playerO;
		let turn = humanPlayer;
		let starting = humanPlayer;

		show(boardElem);

		resetButton.addEventListener("click", function() {
			clearBoard();
			resetScore();
		});

		function onClick(evt) {
			const target = evt.target;
			if (turn === humanPlayer && emptySpots(board).length > 1) {
				pushMove(turn, Array.from(target.parentNode.children).indexOf(target));
				pushMove(turn, findBestMove(board));
			}
			else if (turn === humanPlayer)
				pushMove(turn, Array.from(target.parentNode.children).indexOf(target));
		}

		function removeListeners(indexes) {
			for (const currNum of indexes) {
				SVGRects[currNum].removeEventListener("click", onClick);
				SVGRects[currNum].style.cursor = "default";
			}
		}

		function addListeners(indexes) {
			for (const currNum of indexes) {
				SVGRects[currNum].addEventListener("click", onClick);
				SVGRects[currNum].style.cursor = "pointer";
			}
		}

		addListeners(SVGRectsIndexesFull);

		function pushMove(letter, index) {
			removeListeners(SVGRectsIndexesFull);
			if (letter === aiPlayer)
				turn = humanPlayer;
			else
				turn = aiPlayer;
			const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
			const x = Number(SVGRects[index].getAttribute("x").replace(/\%/, "")) + 9;
			const y = Number(SVGRects[index].getAttribute("y").replace(/\%/, "")) + 24;
			text.setAttribute("x", `${x}%`);
			text.setAttribute("y", `${y}%`);
			text.textContent = letter.toLowerCase();
			text.classList.add(letter.toLowerCase());
			SVG.append(text);
			board[index] = letter;
			if (over(board)) {
				const promiseClearBoard = (ms) => new Promise(() => setTimeout(clearBoard, ms));
				promiseClearBoard(500).then(() => clearBoard());
				if (isWinComb(board, humanPlayer))
					addToScore(humanPlayer);
				else if (isWinComb(board, aiPlayer))
					addToScore(aiPlayer);
			}
			else
				addListeners(emptySpots(board));
		}

		function clearBoard() {
			for (let i = 0; i < board.length; i++)
				board[i] = null;
			const xs = document.querySelectorAll(".x");
			const os = document.querySelectorAll(".o");
			for (let i = 0; i < xs.length; i++)
				xs[i].parentNode.removeChild(xs[i]);
			for (let i = 0; i < os.length; i++)
				os[i].parentNode.removeChild(os[i]);
			if (starting === aiPlayer) {
				starting = humanPlayer;
				turn = humanPlayer;
				addListeners(SVGRectsIndexesFull);
			}
			else {
				starting = aiPlayer;
				turn = aiPlayer;
				pushMove(turn, findBestMove(board));
			}
		}

		function addToScore(letter) {
			const scoreElem = document.querySelector(`.score-${letter.toLowerCase()}`);
			console.log(scoreElem);
			scoreElem.textContent = Number(scoreElem.textContent) + 1;
		}

		function resetScore() {
			const scoreX = document.querySelector(".score-x");
			const scoreO = document.querySelector(".score-o");
			scoreX.textContent = 0;
			scoreO.textContent = 0;
		}

		function isWinComb(board, letter) {
			for (let i = 0; i < winCombs.length; i++)
				if (winCombs[i].every(elem => board[elem] === letter))
					return true;
			return false;
		}

		function emptySpots(board) {
			const indexes = [];
			for (let i = 0; i < board.length; i++)
				if (!board[i])
					indexes.push(i);
			return indexes;
		}

		function over(board) {
			return isWinComb(board, humanPlayer) || isWinComb(board, aiPlayer) || !emptySpots(board).length;
		}

		function score(board, depth) {
			if (isWinComb(board, humanPlayer))
				return -10 + depth;
			else if (isWinComb(board, aiPlayer))
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
					board[freeSpots[i]] = aiPlayer;
					bestValue = Math.max(bestValue, minimax(board, depth + 1, false));
					board[freeSpots[i]] = null;
				}
				return bestValue;
			}

			else {
				let bestValue = Infinity;
				for (let i = 0; i < freeSpots.length; i++) {
					board[freeSpots[i]] = humanPlayer;
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

			for (let i = 0; i < freeSpots.length; i++) {
				board[freeSpots[i]] = aiPlayer;
				const moveValue = minimax(board, 0, false);
				board[freeSpots[i]] = null;
				if (moveValue > bestValue) {
					bestValue = moveValue;
					bestMoves = [freeSpots[i]];
				}
				if (moveValue === bestValue)
					bestMoves.push(freeSpots[i]);
			}

			const s = randNumBewteen(0, bestMoves.length - 1);
			console.log("best move: " + bestMoves[s]);
			return bestMoves[s];
		}

		if (turn === aiPlayer)
			pushMove(aiPlayer, findBestMove(board));
	};

	/* ======== SELECT LETTER ======== */
	const selectLetter = function(numOfPlayers) {
		const selectLetterElem = document.querySelector("#select-letter");
		const heading = document.querySelector("#select-letter .heading");
		const btns = document.querySelectorAll(".select-letter-btn");
		const setupAI = numOfPlayers === 1;

		btns[0].addEventListener("click", function() {
			hide(selectLetterElem);
			createGame(setupAI, "X");
		});

		btns[1].addEventListener("click", function() {
			hide(selectLetterElem);
			createGame(setupAI, "O");
		});

		heading.textContent = `${ setupAI ? "Player 1 would" : "Would" } you like to be X or O?`;
		show(selectLetterElem);
	};

	/* ======== HOMEPAGE ======== */
	const beginning = function() {
		const btns = document.querySelectorAll(".beginning-btn");
		const beginningElem = document.querySelector("#beginning");
		const hideElem = () => hide(beginningElem);

		btns[0].addEventListener("click", function() {
			hide(beginningElem);
			selectLetter(1);
		});
		btns[1].addEventListener("click", function() {
			hide(beginningElem);
			selectLetter(2);
		});

		return {
			hide: hideElem
		};
	};

	beginning();
}