const sprites = new Image() ;
sprites.src = './sprites.png' ;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

//som de colisão
const som_HIT = new Audio ();
som_HIT.src = './sound/hit.wav';

//som de quando pular
const som_Jump = new Audio();
som_Jump.src = './sound/pulo.wav';

//som de quadando é pontuado
const som_pontos = new Audio ();
som_pontos.src = './sound/ponto.wav';

//globais será a variavel para armazenar as demais variaveis quando precisar trazê-las para o scopo global do codigo
const globais = {};

let frames = 0;

//canos
function criaCanos () {
    const canos = {
        largura: 52,
        altura: 400,
        // canos da parte de baixo (chão)
        chao: {
            spriteX: 0,
            spriteY: 169,
        },
        //canos da parte de cima (céu)
        ceu: {
            spriteX: 52,
            spriteY: 169,
        },
        // a variavel espaço determina a distancia entre o cano de cima e o de baixo
        espaco: 80,
        desenha() {
            
            canos.pares.forEach(function(par) {
                const randomY = par.y;
                const espacamentoEntreCanos = 90;

                //cano do ceu
                const canoCeuX = par.x;
                const canoCeuY = randomY;
                ctx.drawImage(
                    sprites,
                    canos.ceu.spriteX, canos.ceu.spriteY,
                    canos.largura, canos.altura,
                    canoCeuX, canoCeuY,
                    canos.largura, canos.altura,
                )

                //cano do chão
                const canoChaoX = par.x;
                const canoChaoY = canos.altura + espacamentoEntreCanos + randomY;
                ctx.drawImage(
                    sprites,
                    canos.chao.spriteX, canos.chao.spriteY,
                    canos.largura, canos.altura,
                    canoChaoX, canoChaoY,
                    canos.largura, canos.altura,
                )

                // pares
                par.canoCeu = {
                    x: canoCeuX,
                    y: canos.altura + canoCeuY,
                };
                par.canoChao = {
                    x: canoChaoX,
                    y: canoChaoY,
                }; 
            })

            
        },

        colisaoCanosFlappyBird(par) {
            const upFlappyBird = globais.flappyBird.y ;
            const downFlappyBird = globais.flappyBird.y + globais.flappyBird.altura ;

            if((globais.flappyBird.x + globais.flappyBird.largura - 5) >= par.x) {
                if (upFlappyBird <= par.canoCeu.y) {
                    return true;
                };
                
                if (downFlappyBird >= par.canoChao.y ) {
                    return true;
                };
            }

            return false;
        },

        pares: [],

        atualiza() {
            //se o resto da divisão de frames por 100 fo 100 a zero, logo se passaram 100 frames, então deve-se criar um novo cano com um y aleatório.
            const passou100Frames = frames % 100 === 0;
            if (passou100Frames) {
                canos.pares.push({
                    x: canvas.width,
                    y: -145 * (Math.random() + 1),
                },);
            }

            canos.pares.forEach(function(par) {
                par.x = par.x - 2 ;

                if (canos.colisaoCanosFlappyBird(par)) {
                    som_HIT.play();
                    mudarTela(Telas.GameOver);
                }


                if(par.x + canos.largura <= 0) {
                    canos.pares.shift();
                }
            });
        },
    }
    return canos;
};

//plano de fundo
const backGround = {
    spriteX: 390,
    spriteY: 0, 
    largura: 275,
    altura: 204,
    x: 0,
    y: canvas.height -204,

    desenha() {

        ctx.fillStyle = '#70c5ce'
        ctx.fillRect(0,0, canvas.width, canvas.height)
        
        ctx.drawImage(
            sprites,
            backGround.spriteX, backGround.spriteY,
            backGround.largura, backGround.altura,
            backGround.x, backGround.y,
            backGround.largura, backGround.altura,
        );

        ctx.drawImage(
            sprites,
            backGround.spriteX, backGround.spriteY,
            backGround.largura, backGround.altura,
            (backGround.x + backGround.largura), backGround.y,
            backGround.largura, backGround.altura,
        );
    },
};

//chão
function criaground () {
    const ground = {
        spriteX: 0,
        spriteY: 610, 
        largura: 224,
        altura: 112,
        x: 0,
        y: canvas.height -112,

        atualiza() {
            const movimentoDoChao = 1;
            const movimentacao = ground.x - movimentoDoChao;
            const repeteEm = ground.largura/2;

            ground.x = movimentacao % repeteEm;
        },

        desenha () {
            ctx.drawImage(
                sprites,
                ground.spriteX, ground.spriteY,
                ground.largura, ground.altura,
                ground.x, ground.y,
                ground.largura, ground.altura,
            );

            ctx.drawImage(
                sprites,
                ground.spriteX, ground.spriteY,
                ground.largura, ground.altura,
                (ground.x + ground.largura), ground.y,
                ground.largura, ground.altura,
            );
        },
    };
    return ground;
};

//Flappy Bird
function criaFlappyBird () {
    const flappyBird = {
        spriteX: 0,
        spriteY: 0, 
        largura: 33,
        altura: 24,
        x: 10,
        y: 50,
        gravidade: 0.2,
        velocidade: 0,
        pulo: 4.5,

        pula() {
            flappyBird.velocidade = - flappyBird.pulo;
        },

        atualiza() {
            if(fazColisao(flappyBird, globais.ground)) {
                
                som_HIT.play();
                
                setTimeout(() => {
                    mudarTela(Telas.GameOver);
                }, 600);
                return;
            }

            flappyBird.velocidade = flappyBird.velocidade + flappyBird.gravidade;
            flappyBird.y = flappyBird.y + flappyBird.velocidade;
        },

        movimentos: [
            {spriteX: 0, spriteY: 0,}, // asas pra cima
            {spriteX: 0, spriteY: 26,}, //meio
            {spriteX: 0, spriteY: 52,}, //asas pra baixo
            {spriteX: 0, spriteY: 26,}, //meio
        ],

        frameAtual: 0,
        atualizaFrameAtual() {
            const intervaloDeFrames = 10;
            const passouIntervalo = frames % intervaloDeFrames === 0;

            if (passouIntervalo) {
                const baseDoIncremento = 1;
                const incremento = baseDoIncremento + flappyBird.frameAtual;
                const baseRepeticao = flappyBird.movimentos.length;
                flappyBird. frameAtual = incremento % baseRepeticao;
            }
            
        },

        desenha () {
            flappyBird.atualizaFrameAtual();
            const { spriteX, spriteY } = flappyBird.movimentos[flappyBird.frameAtual];

            ctx.drawImage (
            sprites,
            spriteX, spriteY,  // sprite x, sprite y
            flappyBird.largura, flappyBird.altura, // tamanho do recorte na sprite
            flappyBird.x, flappyBird.y, //posição no canva
            flappyBird.largura, flappyBird.altura, // tamanho no canva
            );
        },  
    };

    return flappyBird;
};

// função dpara indentificaar a colisão entre o Flappy Bird e o chão
function fazColisao (flappyBird, ground) {
    const flappyBirdY = flappyBird.y + flappyBird.altura;
    const groundY = ground.y;

    if (flappyBirdY >= groundY) {
        return true;
    } else {
        return false;
    }
};

//placar 'Score'
function criaPlacar() {
    const placar = {
        pontuacao : 0,

        desenha() {
            ctx.font = '25px "VT323"';
            ctx.textAlign = 'right'
            ctx.fillStyle = 'white';
            ctx.fillText(`Score: ${placar.pontuacao}`, canvas.width - 10, 35);
        },
        
        atualiza() {
            const intervaloDeFrames = 10;
            const passouIntervalo = frames % intervaloDeFrames === 0;

            if ( passouIntervalo){
                placar.pontuacao = placar.pontuacao + 1;
            }
            
        },
    };

    return placar;
}

//armazenar a melhor pontuação
let best_Score = {};

// mensagem na tela de início.
const mensageGetReady = {
    sX: 134,
    sY: 0,
    w: 174,
    h: 152,
    x: (canvas.width / 2) - 174 /2,
    y: 50,

    desenha() {
        ctx.drawImage (
            sprites,
            mensageGetReady.sX, mensageGetReady.sY,
            mensageGetReady.w, mensageGetReady.h,
            mensageGetReady.x, mensageGetReady.y,
            mensageGetReady.w, mensageGetReady.h,
        );
    },
};

//tela de game over
const mensagemGameOver = {
    sX: 134,
    sY: 153,
    w: 226,
    h: 200,
    x: (canvas.width / 2) - 226 /2,
    y: 50,

    desenha() {
        ctx.drawImage (
            sprites,
            mensagemGameOver.sX, mensagemGameOver.sY,
            mensagemGameOver.w, mensagemGameOver.h,
            mensagemGameOver.x, mensagemGameOver.y,
            mensagemGameOver.w, mensagemGameOver.h,
        );
    },
};

// telas
let telaAtiva = {};
function mudarTela(novaTela) {
    telaAtiva = novaTela;

    if (telaAtiva.inicializa){
        telaAtiva.inicializa();
    }
};

const Telas = {
    //tela de início.
    Inicio: {
        inicializa() {
            globais.flappyBird = criaFlappyBird();
            globais.ground = criaground();
            globais.canos = criaCanos();
            globais.placar = criaPlacar();
        },

        desenha() {
            backGround.desenha();
            globais.ground.desenha(); 
            globais.flappyBird.desenha();
            
            mensageGetReady.desenha();

            globais.placar.desenha();
        },

        click() {
            mudarTela(Telas.Jogo);
        },

        atualiza() {
            globais.ground.atualiza();
        },
    },

    //tela de quando o jogo está rodando de fato.
    Jogo: {

        inicializa() {
            globais.placar = criaPlacar();
        },

        desenha () {
            backGround.desenha();
            globais.canos.desenha();
            globais.ground.desenha();
            globais.flappyBird.desenha();
            globais.placar.desenha();
        },

        click() {
            globais.flappyBird.pula();
            som_Jump.play();
        },

        atualiza() {
            globais.flappyBird.atualiza();
            globais.ground.atualiza();
            globais.canos.atualiza(); 
            globais.placar.atualiza();
        },
    },
    // tela de fim de jogo.
    GameOver: {
        desenha() {
            mensagemGameOver. desenha();
        },

        atualiza() {

        },

        click() {
            mudarTela(Telas.Inicio);
        },
    },
};

//função de loop para atualizar o jogo
function loop () {

    telaAtiva.desenha();
    telaAtiva.atualiza();
    
    frames = frames + 1;
    requestAnimationFrame(loop);

};

//Evento de click
window.addEventListener('click', function() {
    if(telaAtiva.click) {
        telaAtiva.click();
    }
});

mudarTela(Telas.Inicio);
loop ();