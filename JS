const telaMenu = document.getElementById("tela-menu");
const telaJogo = document.getElementById("tela-jogo");
const tabuleiro = document.getElementById("tabuleiro");
const telaVitoria = document.getElementById("tela-vitoria");
const modalConfig = document.getElementById("modal-config");

const elementoPares = document.getElementById("pares-encontrados");
const elementoDificuldade = document.getElementById("dificuldade-atual");
const elementoPontosJogador = document.getElementById("pontos-jogador");
const elementoPontosIA = document.getElementById("pontos-ia");
const mensagemJogo = document.getElementById("mensagem-jogo");

const tituloVitoria = document.getElementById("titulo-vitoria");
const subtituloVitoria = document.getElementById("subtitulo-vitoria");
const statTotalCartas = document.getElementById("stat-total-cartas");
const statPares = document.getElementById("stat-pares");
const statPtsJogador = document.getElementById("stat-pts-jogador");
const statPtsIA = document.getElementById("stat-pts-ia");

const botaoJogar = document.getElementById("jogar");
const botaoVoltar = document.getElementById("voltar-menu");
const botaoReiniciar = document.getElementById("reiniciar");
const botaoJogarNovamente = document.getElementById("jogar-novamente");
const botaoIrParaMenu = document.getElementById("ir-para-menu");

const btnConfigPrincipal = document.getElementById("btn-config-principal");
const btnConfigJogo = document.getElementById("btn-config-jogo");
const fecharConfig = document.getElementById("fechar-config");
const rangeMusica = document.getElementById("volume-musica");
const rangeSfx = document.getElementById("volume-sfx");
const valMusica = document.getElementById("val-musica");
const valSfx = document.getElementById("val-sfx");

const botoesDificuldade = document.querySelectorAll(".opcao-dificuldade");
const botoesTema = document.querySelectorAll(".opcao-tema");
const botoesGrid = document.querySelectorAll(".opcao-cartas");

let dificuldadeEscolhida = "facil";
let temaEscolhido = "emojis";
let gridTamanho = 4;

let cartasViradas = [];
let paresEncontrados = 0;
let totalParesDaPartida = 2;
let totalCelulasPartida = 4;
let pontosJogador = 0;
let pontosIA = 0;

let turno = "jogador";
let bloqueado = false;
let partidaEncerrada = false;
let tempoDeEspera = null;

// IA Memory Mapping
let memoriaIA = new Map();
let cartasConhecidasIA = new Set();

// Áudio Web Audio API
let audioCtx = null;
let gainMusica = null;
let gainSfx = null;
let timerMusica = null;
let passoRitmo = 0;

const temasFiguras = {
    emojis: ["😀", "🚀", "🍕", "🐱", "🎸", "⚡", "🌟", "🔥", "🎨", "⚽", "🧸", "💡", "🍀", "💎", "🍩", "🎁", "🌴", "🤖"],
    animais: ["🐶", "🐱", "🦁", "🐯", "🦊", "🐼", "🐨", "🐰", "🐵", "🐧", "🦄", "🐢", "🐸", "🐙", "🦋", "🐬", "🦓", "🦒"],
    espaco: ["🌍", "🌙", "🛸", "⭐", "🚀", "🪐", "👽", "☄️", "🛰️", "👨‍🚀", "🔭", "🌌", "☀️", "⚡", "🔮", "🔥", "🌀", "💫"],
    comidas: ["🍎", "🍌", "🍔", "🍕", "🍣", "🍦", "🍩", "🍪", "🍉", "🍓", "🍇", "🍍", "🥑", "🧀", "🍫", "🍿", "🥞", "🍯"]
};

function inicializarAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        gainMusica = audioCtx.createGain();
        gainMusica.gain.value = Number(rangeMusica.value) / 100 * 0.7;
        gainMusica.connect(audioCtx.destination);

        gainSfx = audioCtx.createGain();
        gainSfx.gain.value = Number(rangeSfx.value) / 100;
        gainSfx.connect(audioCtx.destination);

        iniciarTrilhaSonora();
    }
    if (audioCtx.state === "suspended") {
        audioCtx.resume();
    }
}

["click", "touchstart", "keydown"].forEach(evento => {
    window.addEventListener(evento, () => {
        if (!audioCtx || audioCtx.state !== "running") {
            inicializarAudio();
        }
    }, { once: true });
});

function iniciarTrilhaSonora() {
    if (timerMusica) return;
    const trilhaJogo = [
        261.63, 329.63, 392.00, 523.25, 392.00, 329.63,
        220.00, 261.63, 329.63, 440.00, 329.63, 261.63,
        246.94, 293.66, 369.99, 493.88, 369.99, 293.66,
        220.00, 246.94, 329.63, 440.00, 392.00, 329.63
    ];

    timerMusica = setInterval(() => {
        if (!audioCtx || audioCtx.state !== "running") return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "square";
        const nota = trilhaJogo[passoRitmo % trilhaJogo.length];
        osc.frequency.setValueAtTime(nota, audioCtx.currentTime);

        const volAtual = (Number(rangeMusica.value) / 100) * 0.1;
        gain.gain.setValueAtTime(volAtual, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(gainMusica);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
        passoRitmo++;
    }, 180);
}

function tocarSomClique() {
    inicializarAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(580, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime((Number(rangeSfx.value) / 100) * 0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    osc.connect(gain);
    gain.connect(gainSfx);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
}

function tocarSomVirar() {
    inicializarAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(350, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(650, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime((Number(rangeSfx.value) / 100) * 0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(gainSfx);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function tocarSomAcerto() {
    inicializarAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime((Number(rangeSfx.value) / 100) * 0.15, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.15);
        osc.connect(gain);
        gain.connect(gainSfx);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.15);
    });
}

function tocarSomErro() {
    inicializarAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, audioCtx.currentTime);
    osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.2);
    gain.gain.setValueAtTime((Number(rangeSfx.value) / 100) * 0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(gainSfx);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
}

// Configuração de Event Listeners de Menu e Jogo
botoesDificuldade.forEach(btn => {
    btn.addEventListener("click", () => {
        tocarSomClique();
        botoesDificuldade.forEach(b => b.classList.remove("selecionada"));
        btn.classList.add("selecionada");
        dificuldadeEscolhida = btn.dataset.dificuldade;
    });
});

botoesTema.forEach(btn => {
    btn.addEventListener("click", () => {
        tocarSomClique();
        botoesTema.forEach(b => b.classList.remove("selecionado"));
        btn.classList.add("selecionado");
        temaEscolhido = btn.dataset.tema;
    });
});

botoesGrid.forEach(btn => {
    btn.addEventListener("click", () => {
        tocarSomClique();
        botoesGrid.forEach(b => b.classList.remove("selecionada"));
        btn.classList.add("selecionada");
        gridTamanho = Number(btn.dataset.grid);
    });
});

rangeMusica.addEventListener("input", (e) => {
    valMusica.innerText = `${e.target.value}%`;
    if (gainMusica && audioCtx) {
        gainMusica.gain.value = (Number(e.target.value) / 100) * 0.7;
    }
});

rangeSfx.addEventListener("input", (e) => {
    valSfx.innerText = `${e.target.value}%`;
    if (gainSfx && audioCtx) {
        gainSfx.gain.value = Number(e.target.value) / 100;
    }
});

btnConfigPrincipal.addEventListener("click", () => {
    tocarSomClique();
    modalConfig.classList.remove("escondido");
});

btnConfigJogo.addEventListener("click", () => {
    tocarSomClique();
    modalConfig.classList.remove("escondido");
});

fecharConfig.addEventListener("click", () => {
    tocarSomClique();
    modalConfig.classList.add("escondido");
});

botaoVoltar.addEventListener("click", () => {
    tocarSomClique();
    telaJogo.classList.add("escondido");
    telaMenu.classList.remove("escondido");
});

botaoIrParaMenu.addEventListener("click", () => {
    tocarSomClique();
    telaVitoria.classList.add("escondido");
    telaJogo.classList.add("escondido");
    telaMenu.classList.remove("escondido");
});

botaoJogar.addEventListener("click", () => {
    tocarSomClique();
    iniciarJogo();
});

botaoReiniciar.addEventListener("click", () => {
    tocarSomClique();
    iniciarJogo();
});

botaoJogarNovamente.addEventListener("click", () => {
    tocarSomClique();
    telaVitoria.classList.add("escondido");
    iniciarJogo();
});

function iniciarJogo() {
    telaMenu.classList.add("escondido");
    telaJogo.classList.remove("escondido");

    cartasViradas = [];
    paresEncontrados = 0;
    pontosJogador = 0;
    pontosIA = 0;
    turno = "jogador";
    bloqueado = false;
    partidaEncerrada = false;
    memoriaIA.clear();
    cartasConhecidasIA.clear();

    if (tempoDeEspera) clearTimeout(tempoDeEspera);

    totalCelulasPartida = gridTamanho;
    totalParesDaPartida = totalCelulasPartida / 2;

    elementoPares.innerText = `0 / ${totalParesDaPartida}`;
    elementoPontosJogador.innerText = "0";
    elementoPontosIA.innerText = "0";
    
    let nomeDif = dificuldadeEscolhida.toUpperCase();
    let nomeTema = temaEscolhido.toUpperCase();
    elementoDificuldade.innerText = `${nomeDif} • ${nomeTema}`;

    montarTabuleiro();
}

function montarTabuleiro() {
    tabuleiro.innerHTML = "";
    
    let colunas = 2;
    if (gridTamanho === 12) colunas = 4;
    else if (gridTamanho === 16) colunas = 4;
    else if (gridTamanho === 20) colunas = 5;
    else if (gridTamanho === 36) colunas = 6;
    else if (gridTamanho === 4) colunas = 2;

    tabuleiro.style.gridTemplateColumns = `repeat(${colunas}, minmax(0, 1fr))`;

    let figurasPool = [...temasFiguras[temaEscolhido]];
    figurasPool.sort(() => Math.random() - 0.5);
    let figurasSelecionadas = figurasPool.slice(0, totalParesDaPartida);
    let cartasEmbaralhadas = [...figurasSelecionadas, ...figurasSelecionadas];
    cartasEmbaralhadas.sort(() => Math.random() - 0.5);

    cartasEmbaralhadas.forEach((figura, indice) => {
        const btnCarta = document.createElement("button");
        btnCarta.classList.add("carta");
        btnCarta.type = "button";
        btnCarta.dataset.figura = figura;
        btnCarta.dataset.indice = indice;

        const frente = document.createElement("div");
        frente.classList.add("frente-carta");
        frente.innerHTML = "❓";

        const verso = document.createElement("div");
        verso.classList.add("verso-carta");
        verso.innerHTML = figura;

        btnCarta.appendChild(frente);
        btnCarta.appendChild(verso);

        btnCarta.addEventListener("click", () => {
            if (turno === "jogador") {
                virarCarta(btnCarta);
            }
        });

        tabuleiro.appendChild(btnCarta);
    });

    atualizarMensagem();
}

function virarCarta(carta) {
    if (bloqueado || partidaEncerrada) return;
    if (carta.classList.contains("virada") || carta.classList.contains("encontrada")) return;
    if (cartasViradas.includes(carta)) return;

    tocarSomVirar();
    carta.classList.add("virada");
    cartasViradas.push(carta);

    let indice = carta.dataset.indice;
    let figura = carta.dataset.figura;
    memoriaIA.set(indice, figura);
    cartasConhecidasIA.add(indice);

    if (cartasViradas.length === 2) {
        verificarPar();
    }
}

function verificarPar() {
    bloqueado = true;
    const [carta1, carta2] = cartasViradas;
    const fig1 = carta1.dataset.figura;
    const fig2 = carta2.dataset.figura;

    if (fig1 === fig2) {
        tocarSomAcerto();
        carta1.classList.add(turno === "jogador" ? "encontrada" : "encontrada-ia");
        carta2.classList.add(turno === "jogador" ? "encontrada" : "encontrada-ia");
        
        paresEncontrados++;
        elementoPares.innerText = `${paresEncontrados} / ${totalParesDaPartida}`;

        if (turno === "jogador") {
            pontosJogador += 10;
            elementoPontosJogador.innerText = pontosJogador;
        } else {
            pontosIA += 10;
            elementoPontosIA.innerText = pontosIA;
        }

        cartasViradas = [];
        bloqueado = false;

        if (paresEncontrados === totalParesDaPartida) {
            finalizarPartida();
        } else if (turno === "ia") {
            tempoDeEspera = setTimeout(executarTurnoIA, 800);
        }
    } else {
        tocarSomErro();
        carta1.classList.add("erro");
        carta2.classList.add("erro");

        tempoDeEspera = setTimeout(() => {
            carta1.classList.remove("virada", "erro");
            carta2.classList.remove("virada", "erro");
            cartasViradas = [];
            bloqueado = false;

            turno = turno === "jogador" ? "ia" : "jogador";
            atualizarMensagem();

            if (turno === "ia") {
                tempoDeEspera = setTimeout(executarTurnoIA, 1000);
            }
        }, 900);
    }
}

function atualizarMensagem() {
    if (turno === "jogador") {
        mensagemJogo.innerText = "Sua vez! Encontre um par.";
        mensagemJogo.className = "turno-jogador";
    } else {
        mensagemJogo.innerText = "Vez da IA pensando...";
        mensagemJogo.className = "turno-ia";
    }
}

function executarTurnoIA() {
    if (partidaEncerrada) return;

    let cartasDisponiveis = Array.from(document.querySelectorAll(".carta:not(.virada):not(.encontrada):not(.encontrada-ia)"));
    if (cartasDisponiveis.length === 0) return;

    let cartaEscolhida1 = null;
    let cartaEscolhida2 = null;

    // Lógica da IA baseada na dificuldade
    if (dificuldadeEscolhida !== "facil") {
        // Tenta achar par na memória conhecida
        let mapaInverso = new Map();
        for (let [idx, fig] of memoriaIA.entries()) {
            let el = document.querySelector(`.carta[data-indice='${idx}']`);
            if (el && !el.classList.contains("encontrada") && !el.classList.contains("encontrada-ia") && !el.classList.contains("virada")) {
                if (!mapaInverso.has(fig)) mapaInverso.set(fig, []);
                mapaInverso.get(fig).push(el);
            }
        }

        for (let [fig, lista] of mapaInverso.entries()) {
            if (lista.length >= 2) {
                if (dificuldadeEscolhida === "dificil" || (dificuldadeEscolhida === "aleatorio" && Math.random() < 0.8) || (dificuldadeEscolhida === "normal" && Math.random() < 0.5)) {
                    cartaEscolhida1 = lista[0];
                    cartaEscolhida2 = lista[1];
                    break;
                }
            }
        }
    }

    if (!cartaEscolhida1) {
        cartaEscolhida1 = cartasDisponiveis[Math.floor(Math.random() * cartasDisponiveis.length)];
    }

    virarCartaIA(cartaEscolhida1, () => {
        if (partidaEncerrada) return;

        // Se encontrou a primeira, checa se tem par na memória para a segunda
        if (!cartaEscolhida2) {
            let fig1 = cartaEscolhida1.dataset.figura;
            let idx1 = cartaEscolhida1.dataset.indice;

            for (let [idx, fig] of memoriaIA.entries()) {
                if (idx !== idx1 && fig === fig1) {
                    let el = document.querySelector(`.carta[data-indice='${idx}']`);
                    if (el && !el.classList.contains("encontrada") && !el.classList.contains("encontrada-ia") && !el.classList.contains("virada")) {
                        if (dificuldadeEscolhida === "dificil" || (dificuldadeEscolhida === "aleatorio" && Math.random() < 0.8) || (dificuldadeEscolhida === "normal" && Math.random() < 0.5)) {
                            cartaEscolhida2 = el;
                            break;
                        }
                    }
                }
            }
        }

        if (!cartaEscolhida2) {
            let restantes = cartasDisponiveis.filter(c => c !== cartaEscolhida1);
            cartaEscolhida2 = restantes[Math.floor(Math.random() * restantes.length)];
        }

        setTimeout(() => {
            virarCartaIA(cartaEscolhida2, () => {});
        }, 700);
    });
}

function virarCartaIA(carta, callback) {
    if (partidaEncerrada) return;
    tocarSomVirar();
    carta.classList.add("virada");
    cartasViradas.push(carta);

    let indice = carta.dataset.indice;
    let figura = carta.dataset.figura;
    memoriaIA.set(indice, figura);
    cartasConhecidasIA.add(indice);

    if (cartasViradas.length === 2) {
        verificarPar();
    }
    if (callback) callback();
}

function finalizarPartida() {
    partidaEncerrada = true;
    if (timerMusica) {
        clearInterval(timerMusica);
        timerMusica = null;
    }

    statTotalCartas.innerText = totalCelulasPartida;
    statPares.innerText = `${paresEncontrados} / ${totalParesDaPartida}`;
    statPtsJogador.innerText = pontosJogador;
    statPtsIA.innerText = pontosIA;

    if (pontosJogador > pontosIA) {
        tituloVitoria.innerText = "Parabéns! Você Venceu!";
        subtituloVitoria.innerText = "Sua memória superou a inteligência artificial.";
    } else if (pontosJogador < pontosIA) {
        tituloVitoria.innerText = "A IA Venceu!";
        subtituloVitoria.innerText = "Não desanime, tente novamente!";
    } else {
        tituloVitoria.innerText = "Empate!";
        subtituloVitoria.innerText = "Foi uma disputa acirrada!";
    }

    telaVitoria.classList.remove("escondido");

    if (window.confetti) {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 }
        });
    }
}
