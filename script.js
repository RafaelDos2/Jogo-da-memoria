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

const iconeVitoria = document.getElementById("icone-vitoria");
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
valMusica.textContent = `${rangeMusica.value}%`;
const valSfx = document.getElementById("val-sfx");
valSfx.textContent = `${rangeSfx.value}%`;

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

// IA Memory Map
let memoriaIA = new Map();

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
        gainMusica.gain.value = (Number(rangeMusica.value) / 100) * 0.5;
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
        if (!audioCtx || audioCtx.state !== "running" || partidaEncerrada) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = "sine";
        const nota = trilhaJogo[passoRitmo % trilhaJogo.length];
        osc.frequency.setValueAtTime(nota, audioCtx.currentTime);

        const volAtual = (Number(rangeMusica.value) / 100) * 0.08;
        gain.gain.setValueAtTime(volAtual, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.18);

        osc.connect(gain);
        gain.connect(gainMusica);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
        passoRitmo++;
    }, 220);
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

function tocarSomVitoriaJogador() {
    inicializarAudio();
    if (!audioCtx) return;
    const volumeBase = Number(rangeSfx.value) / 100;
    const notas = [
        { freq: 523.25, tempo: 0.0, dur: 0.15 },
        { freq: 659.25, tempo: 0.15, dur: 0.15 },
        { freq: 783.99, tempo: 0.30, dur: 0.15 },
        { freq: 1046.50, tempo: 0.45, dur: 0.50 }
    ];

    notas.forEach(n => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.freq, audioCtx.currentTime + n.tempo);
        gain.gain.setValueAtTime(volumeBase * 0.3, audioCtx.currentTime + n.tempo);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + n.tempo + n.dur);
        osc.connect(gain);
        gain.connect(gainSfx);
        osc.start(audioCtx.currentTime + n.tempo);
        osc.stop(audioCtx.currentTime + n.tempo + n.dur);
    });
}

function tocarSomVitoriaIA() {
    inicializarAudio();
    if (!audioCtx) return;
    const volumeBase = Number(rangeSfx.value) / 100;
    const notas = [
        { freq: 392.00, tempo: 0.0, dur: 0.25 },
        { freq: 349.23, tempo: 0.25, dur: 0.25 },
        { freq: 329.63, tempo: 0.50, dur: 0.25 },
        { freq: 261.63, tempo: 0.75, dur: 0.60 }
    ];

    notas.forEach(n => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(n.freq, audioCtx.currentTime + n.tempo);
        gain.gain.setValueAtTime(volumeBase * 0.25, audioCtx.currentTime + n.tempo);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + n.tempo + n.dur);
        osc.connect(gain);
        gain.connect(gainSfx);
        osc.start(audioCtx.currentTime + n.tempo);
        osc.stop(audioCtx.currentTime + n.tempo + n.dur);
    });
}

function soltarConfetes() {
    if (typeof confetti !== "function") return;
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { y: 0.6 } }), 400);
}

// Botoes do menu
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
        gridTamanho = parseInt(btn.dataset.grid);
    });
});

rangeMusica.addEventListener("input", (e) => {
    valMusica.textContent = `${e.target.value}%`;
    if (gainMusica) gainMusica.gain.value = (Number(e.target.value) / 100) * 0.5;
});

rangeSfx.addEventListener("input", (e) => {
    valSfx.textContent = `${e.target.value}%`;
    if (gainSfx) gainSfx.gain.value = Number(e.target.value) / 100;
});

btnConfigPrincipal.addEventListener("click", () => { tocarSomClique(); modalConfig.classList.remove("escondido"); });
btnConfigJogo.addEventListener("click", () => { tocarSomClique(); modalConfig.classList.remove("escondido"); });
fecharConfig.addEventListener("click", () => { tocarSomClique(); modalConfig.classList.add("escondido"); });

botaoJogar.addEventListener("click", iniciarJogo);
botaoReiniciar.addEventListener("click", () => { tocarSomClique(); iniciarJogo(); });
botaoVoltar.addEventListener("click", () => { tocarSomClique(); voltarAoMenu(); });
botaoJogarNovamente.addEventListener("click", () => { tocarSomClique(); telaVitoria.classList.add("escondido"); iniciarJogo(); });
botaoIrParaMenu.addEventListener("click", () => { tocarSomClique(); telaVitoria.classList.add("escondido"); voltarAoMenu(); });

function voltarAoMenu() {
    telaJogo.classList.add("escondido");
    telaMenu.classList.remove("escondido");
    partidaEncerrada = true;
}

function iniciarJogo() {
    inicializarAudio();
    partidaEncerrada = false;
    cartasViradas = [];
    paresEncontrados = 0;
    pontosJogador = 0;
    pontosIA = 0;
    turno = "jogador";
    bloqueado = false;
    memoriaIA.clear();

    totalCelulasPartida = gridTamanho;
    totalParesDaPartida = totalCelulasPartida / 2;

    elementoPares.textContent = `0 / ${totalParesDaPartida}`;
    elementoPontosJogador.textContent = "0";
    elementoPontosIA.textContent = "0";

    let difTexto = dificuldadeEscolhida.charAt(0).toUpperCase() + dificuldadeEscolhida.slice(1);
    if (dificuldadeEscolhida === "aleatorio") {
        const niveis = ["facil", "normal", "dificil"];
        dificuldadeEscolhida = niveis[Math.floor(Math.random() * niveis.length)];
        difTexto = "Surpresa (" + dificuldadeEscolhida + ")";
    }

    elementoDificuldade.textContent = `${difTexto} • ${temaEscolhido.charAt(0).toUpperCase() + temaEscolhido.slice(1)}`;
    mensagemJogo.textContent = "Sua vez! Encontre um par.";
    mensagemJogo.className = "turno-jogador";

    configurarGradeEGerarCartas();

    telaMenu.classList.add("escondido");
    telaJogo.classList.remove("escondido");
}

function configurarGradeEGerarCartas() {
    tabuleiro.innerHTML = "";

    let colunas = 4;
    let linhas = 4;

    if (totalCelulasPartida === 4) { colunas = 2; linhas = 2; }
    else if (totalCelulasPartida === 12) { colunas = 4; linhas = 3; }
    else if (totalCelulasPartida === 16) { colunas = 4; linhas = 4; }
    else if (totalCelulasPartida === 20) { colunas = 5; linhas = 4; }
    else if (totalCelulasPartida === 36) { colunas = 6; linhas = 6; }

    document.documentElement.style.setProperty('--colunas', colunas);
    document.documentElement.style.setProperty('--linhas', linhas);

    const listaSimbolos = temasFiguras[temaEscolhido] || temasFiguras.emojis;
    let figurasSelecionadas = listaSimbolos.slice(0, totalParesDaPartida);
    let baralho = [...figurasSelecionadas, ...figurasSelecionadas];

    baralho.sort(() => Math.random() - 0.5);

    baralho.forEach((simbolo, i) => {
        const btnCarta = document.createElement("button");
        btnCarta.type = "button";
        btnCarta.classList.add("carta");
        btnCarta.dataset.index = i;
        btnCarta.dataset.valor = simbolo;

        btnCarta.innerHTML = `
            <div class="frente-carta">❓</div>
            <div class="verso-carta">${simbolo}</div>
        `;

        btnCarta.addEventListener("click", () => aoClicarNaCarta(btnCarta));
        tabuleiro.appendChild(btnCarta);
    });
}

function aoClicarNaCarta(carta) {
    if (bloqueado || turno !== "jogador") return;
    if (carta.classList.contains("virada") || carta.classList.contains("encontrada")) return;

    virarCarta(carta);

    if (cartasViradas.length === 2) {
        bloqueado = true;
        verificarPar();
    }
}

function virarCarta(carta) {
    tocarSomVirar();
    carta.classList.add("virada");
    cartasViradas.push(carta);

    const idx = carta.dataset.index;
    const val = carta.dataset.valor;
    memoriaIA.set(idx, val);
}

function verificarPar() {
    const [c1, c2] = cartasViradas;
    const v1 = c1.dataset.valor;
    const v2 = c2.dataset.valor;

    if (v1 === v2) {
        tocarSomAcerto();
        c1.classList.add(turno === "jogador" ? "encontrada" : "encontrada-ia");
        c2.classList.add(turno === "jogador" ? "encontrada" : "encontrada-ia");

        if (turno === "jogador") {
            pontosJogador += 10;
            elementoPontosJogador.textContent = pontosJogador;
        } else {
            pontosIA += 10;
            elementoPontosIA.textContent = pontosIA;
        }

        paresEncontrados++;
        elementoPares.textContent = `${paresEncontrados} / ${totalParesDaPartida}`;

        memoriaIA.delete(c1.dataset.index);
        memoriaIA.delete(c2.dataset.index);
        cartasViradas = [];

        if (paresEncontrados === totalParesDaPartida) {
            finalizarPartida();
        } else {
            bloqueado = false;
            if (turno === "ia") {
                setTimeout(jogadaIA, 800);
            }
        }
    } else {
        tocarSomErro();
        c1.classList.add("erro");
        c2.classList.add("erro");

        setTimeout(() => {
            c1.classList.remove("virada", "erro");
            c2.classList.remove("virada", "erro");
            cartasViradas = [];

            if (turno === "jogador") {
                turno = "ia";
                mensagemJogo.textContent = "Vez da Inteligência Artificial...";
                mensagemJogo.className = "turno-ia";
                bloqueado = true;
                setTimeout(jogadaIA, 1000);
            } else {
                turno = "jogador";
                mensagemJogo.textContent = "Sua vez! Encontre um par.";
                mensagemJogo.className = "turno-jogador";
                bloqueado = false;
            }
        }, 1000);
    }
}

function jogadaIA() {
    if (partidaEncerrada || turno !== "ia") return;

    const cartasDisponiveis = Array.from(document.querySelectorAll(".carta:not(.virada):not(.encontrada)"));
    if (cartasDisponiveis.length === 0) return;

    let c1, c2;

    let parEncontradoNaMemoria = false;
    const contagem = {};

    for (let [idx, val] of memoriaIA.entries()) {
        const elem = document.querySelector(`.carta[data-index="${idx}"]`);
        if (elem && !elem.classList.contains("encontrada")) {
            if (!contagem[val]) contagem[val] = [];
            contagem[val].push(elem);
            if (contagem[val].length === 2) {
                let taxaAcerto = 0.4;
                if (dificuldadeEscolhida === "normal") taxaAcerto = 0.7;
                if (dificuldadeEscolhida === "dificil") taxaAcerto = 0.95;

                if (Math.random() < taxaAcerto) {
                    [c1, c2] = contagem[val];
                    parEncontradoNaMemoria = true;
                    break;
                }
            }
        }
    }

    if (!parEncontradoNaMemoria) {
        c1 = cartasDisponiveis[Math.floor(Math.random() * cartasDisponiveis.length)];
        let cartasRestantes = cartasDisponiveis.filter(c => c !== c1);
        c2 = cartasRestantes[Math.floor(Math.random() * cartasRestantes.length)];
    }

    virarCarta(c1);

    setTimeout(() => {
        if (partidaEncerrada) return;
        virarCarta(c2);
        verificarPar();
    }, 700);
}

function finalizarPartida() {
    partidaEncerrada = true;
    statTotalCartas.textContent = totalCelulasPartida;
    statPares.textContent = `${paresEncontrados} / ${totalParesDaPartida}`;
    statPtsJogador.textContent = pontosJogador;
    statPtsIA.textContent = pontosIA;

    setTimeout(() => {
        if (pontosJogador > pontosIA) {
            iconeVitoria.textContent = "🏆";
            tituloVitoria.textContent = "Parabéns! Você Venceu!";
            subtituloVitoria.textContent = "Você superou a Inteligência Artificial!";
            tocarSomVitoriaJogador();
            soltarConfetes();
        } else if (pontosIA > pontosJogador) {
            iconeVitoria.textContent = "🤖";
            tituloVitoria.textContent = "A IA Venceu!";
            subtituloVitoria.textContent = "Não desista! Tente novamente.";
            tocarSomVitoriaIA();
        } else {
            iconeVitoria.textContent = "🤝";
            tituloVitoria.textContent = "Empate!";
            subtituloVitoria.textContent = "Foi uma disputa muito acirrada!";
            tocarSomVitoriaJogador();
        }
        telaVitoria.classList.remove("escondido");
    }, 600);
}
