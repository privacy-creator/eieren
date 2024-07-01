const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let eggsLeft = 20;
let lastEggThrownTime = 0; // Houd de tijd bij wanneer het laatste ei is gegooid
let isPlayingSound = false; // Variabele om bij te houden of er momenteel een geluidsfragment wordt afgespeeld

const crokyImage = document.getElementById('crokyImage');
const eggImage = document.getElementById('eggImage');

const gameOverScreen = document.getElementById('gameOverScreen');
const playAgainButton = document.getElementById('playAgainButton');

const audioClips = [
    'gooi maar.mp3',
    'hier komen de eireren.mp3',
    'Allermaal niet vegen dus het is helemaal niet leuk.mp3'
];

const playButton = document.getElementById('playButton');
playButton.addEventListener('click', startGame);

function startGame() {
    // Verberg het menu en toon het spel
    document.querySelector('.menu').style.display = 'none';
    canvas.style.display = 'block';
    document.getElementById('score').style.display = 'block';
    document.getElementById('eggsLeft').style.display = 'block';


    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('eggsLeft').innerText = `Eieren: ${eggsLeft}`;

    // Start het tekenen van het spel
    draw();
}

const ramona = {
    x: canvas.width / 2,
    y: canvas.height - 100,
    width: 50,
    height: 50,
    speed: 8,
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update(targetX) {
        const dx = targetX - this.x - this.width / 2;
        if (Math.abs(dx) > this.speed) {
            this.x += dx > 0 ? this.speed : -this.speed;
        } else {
            this.x += dx;
        }
    }
};

const croky = {
    x: canvas.width / 2,
    y: 50,
    width: 50,
    height: 50,
    speed: 2,
    direction: 1,
    draw() {
        ctx.drawImage(crokyImage, this.x, this.y, this.width, this.height);
    },
    update() {
        this.x += this.speed * this.direction;
        if (this.x + this.width > canvas.width || this.x < 0) {
            this.direction *= -1;
        }
    }
};

class Egg {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 25; // Breedte aanpassen voor het ei
        this.height = 25; // Hoogte aanpassen voor het ei
        this.speedY = -5;
    }
    draw() {
        ctx.drawImage(eggImage, this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
    }
    update() {
        this.y += this.speedY;
    }
}

const eggs = [];

function playRandomSound() {
    if (isPlayingSound) {
        return; // Als er al een geluidsfragment wordt afgespeeld, doe niets
    }

    const randomIndex = Math.floor(Math.random() * audioClips.length);
    const audio = new Audio(audioClips[randomIndex]);
    audio.play();

    isPlayingSound = true;

    // Reset de variabele `isPlayingSound` na het afspelen van het geluidsfragment
    audio.onended = function() {
        isPlayingSound = false;
    };
}

function draw() {
    if (eggsLeft <= 0) {
        gameOverScreen.style.display = 'flex';
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ramona.draw();
    croky.draw();
    croky.update();

    eggs.forEach((egg, index) => {
        egg.draw();
        egg.update();
        if (egg.y < 0) {
            eggs.splice(index, 1);
        } else if (egg.x < croky.x + croky.width &&
                   egg.x + egg.width > croky.x &&
                   egg.y < croky.y + croky.height &&
                   egg.y + egg.height > croky.y) {
            eggs.splice(index, 1);
            score++;
            eggsLeft += 2;
            document.getElementById('score').innerText = `Score: ${score}`;
            document.getElementById('eggsLeft').innerText = `Eieren: ${eggsLeft}`;
            hitSound.play();
        }
    });

    requestAnimationFrame(draw);
}

function restartGame() {
    score = 0;
    eggsLeft = 20;
    lastEggThrownTime = 0;
    document.getElementById('score').innerText = `Score: ${score}`;
    document.getElementById('eggsLeft').innerText = `Eieren: ${eggsLeft}`;
    gameOverScreen.style.display = 'none';
    eggs.length = 0; // Maak het array met eieren leeg
    draw(); // Start het spel opnieuw
}


let targetX = ramona.x;
canvas.addEventListener('click', (e) => {
    const currentTime = new Date().getTime();
    if (eggsLeft > 0 && (currentTime - lastEggThrownTime) > 1000) { // Controleer of er meer dan 1 seconde is verstreken en er geen geluidsfragment wordt afgespeeld
        const egg = new Egg(ramona.x + ramona.width / 2, ramona.y);
        eggs.push(egg);
        eggsLeft--; // Verminder het aantal eieren met 1
        document.getElementById('eggsLeft').innerText = `Eieren: ${eggsLeft}`;
        playRandomSound(); // Speel willekeurig geluidsfragment af
        lastEggThrownTime = currentTime; // Update de tijd van het laatste ei
    }
});

window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
});

playAgainButton.addEventListener('click', restartGame);


function updateRamona() {
    ramona.update(targetX);
}

setInterval(updateRamona, 20); // Pas interval aan voor snelheid van Ramona
