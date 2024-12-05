document.addEventListener("DOMContentLoaded", () => {
  // Verificar se a biblioteca Chess.js foi carregada corretamente
  if (typeof Chess === "undefined") {
      console.error("Chess.js não foi carregado corretamente!");
      return;
  }

  const chess = new Chess(); // Inicializa a lógica do jogo
  const board = Chessboard("board", {
      draggable: true,
      dropOffBoard: 'trash',  // Adiciona opção para jogar peças fora do tabuleiro
      sparePieces: true,
      position: 'start', // Configura o tabuleiro no início
      onDrop: onDrop
  });

  // Inicializa o Stockfish após a verificação de Chess.js
  const stockfish = Stockfish();  // Inicializa o motor Stockfish
  const statusEl = document.getElementById("status");

  // Atualiza o status do jogo
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

  // Manipula o movimento do jogador
  function onDrop(source, target) {
      const move = chess.move({ from: source, to: target, promotion: "q" }); // Sempre promove para rainha
      if (move === null) return "snapback"; // Movimento inválido

      // Atualiza o tabuleiro e verifica o status
      board.position(chess.fen());
      updateStatus();

      // Se o jogo ainda não acabou, a máquina joga
      if (!chess.isGameOver()) {
          setTimeout(() => machineMove(), 500);
      }
  }

  // Movimento da máquina usando Stockfish
  function machineMove() {
      stockfish.postMessage("position fen " + chess.fen());
      stockfish.postMessage("go depth 15");

      stockfish.onmessage = (event) => {
          const message = event.data;
          if (message.startsWith("bestmove")) {
              const move = message.split(" ")[1];
              chess.move({ from: move.substring(0, 2), to: move.substring(2, 4), promotion: "q" });
              board.position(chess.fen());
              updateStatus();
          }
      };
  }

  // Atualiza o status inicial
  updateStatus();
});
