{
	//nevie to prehravat ale nevie to ani vyhravat - opravit -> 4, 5, 0, 3, 1?(8 vyhrava)
	const SVG = document.querySelector("svg");
	const SVGRects = document.querySelectorAll("svg rect");
	const winCombs = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
	const board = Array(9);
	/*board[4] = "O";
	board[8] = "X";
	board[2] = "O";
	board[6] = "X";
	board[0] = "O";*/
	const playerA = "X";
	const playerB = "O";
	const aiPlayer = playerA;
	const humanPlayer = playerB;
		let scores = [];
let turn = aiPlayer;
	//pushMove(turn, findBestMove(board));


	SVG.addEventListener("click", onClick, false);

	function onClick(evt) {
		const target = evt.target;
		console.log(target);
		if (turn === humanPlayer) {
			console.log("parent: " + target.parentNode);
			pushMove(turn, Array.from(target.parentNode.children).indexOf(target));
			pushMove(turn, findBestMove(board));
		}
	}

	function pushMove(letter, index) {
		if (letter === aiPlayer)
			turn = humanPlayer;
		else
			turn = aiPlayer;
		const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		const x = Number(SVGRects[index].getAttribute("x").replace(/\%/, "")) + 11;
		const y = Number(SVGRects[index].getAttribute("y").replace(/\%/, "")) + 22;
		text.setAttribute("x", `${x}%`);
		text.setAttribute("y", `${y}%`);
		text.textContent = letter;
		SVG.append(text);
		board[index] = letter;
		if (over(board)) {
			console.log("trueečko");
			SVG.removeEventListener("click", onClick, false);
		}

	}

	function isWinComb(board, letter) {
		for (let i = 0; i < winCombs.length; i++)
			if (winCombs[i].every(elem => board[elem] === letter))
				return true;
		return false;
	}

	function avaibleSpots(board) {
		const indexes = [];
		for (let i = 0; i < board.length; i++)
			if (!board[i])
				indexes.push(i);
		return indexes;
	}

	function over(board) {
		return isWinComb(board, humanPlayer) || isWinComb(board, aiPlayer) || !avaibleSpots(board).length;
	}

	function score(board, depth) {
		if (isWinComb(board, humanPlayer))
			return -10 + depth;
		else if (isWinComb(board, aiPlayer))
			return 10 - depth;
		if (!avaibleSpots(board).length)
			return 0;
	}

	function minimax(board, depth, maximizing) {
		if (over(board))
			return score(board, depth);

		const freeSpots = avaibleSpots(board);

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
		let bestMove = null;
		const freeSpots = avaibleSpots(board);

		for (let i = 0; i < freeSpots.length; i++) {
			board[freeSpots[i]] = aiPlayer;
			const moveValue = minimax(board, 0, false);
			scores.push(moveValue);
			board[freeSpots[i]] = null;
			if (moveValue > bestValue || (moveValue === bestValue && Math.random() <= 0.5)) {
				bestMove = freeSpots[i];
				bestValue = moveValue;
			}
		}

		console.log("best move: " + bestMove);
		return bestMove;
	}

	if (turn === aiPlayer)
		pushMove(aiPlayer, findBestMove(board));
	//pushMove("X", findBestMove(board));
}