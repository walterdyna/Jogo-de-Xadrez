document.addEventListener("DOMContentLoaded", () => {
    if (typeof Chess === "undefined") {
        console.error("Chess.js não foi carregado corretamente!");
        return;
    }

    const chess = new Chess();
    const board = Chessboard("board", {
        draggable: true,
        dropOffBoard: 'trash',
        sparePieces: true,
        position: 'start',
        onDrop: onDrop,
        pieceTheme: '../images/{pawn-white.png}.png' // Atualize o caminho para suas imagens
    });

    const stockfish = Stockfish();
    const statusEl = document.getElementById("status");

    function updateStatus() {
        if (chess.isGameOver()) {
            if (chess.inCheckmate()) {
                statusEl.textContent = "Xeque-mate! " + (chess.turn() === "b" ? "Você venceu!" : "A máquina venceu!");
            } else if (chess.inDraw()) {
                statusEl.textContent = "Empate!";
            } else {
                statusEl.textContent = "Fim do jogo!";
            }
        } else {
            statusEl.textContent = "É a vez das " + (chess.turn() === "w" ? "brancas (você)." : "pretas (máquina).");
        }
    }

    function onDrop(source, target) {
        const move = chess.move({ from: source, to: target, promotion: "q" });
        if (move === null) return "snapback";

        board.position(chess.fen());
        updateStatus();

        if (!chess.isGameOver()) {
            setTimeout(() => machineMove(), 500);
        }
    }

    function machineMove() {
        stockfish.postMessage("position fen " + chess.fen());
        stockfish.postMessage("go movetime 1000");

        stockfish.onmessage = function(event) {
            const move = event.data;
            if (move && move.includes("bestmove")) {
                const bestMove = move.split(" ")[1];
                chess.move(bestMove);
                board.position(chess.fen());
                updateStatus();
            }
        };
    }
});