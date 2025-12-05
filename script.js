// --- НАЛАШТУВАННЯ ---
let score = 0;
const maxScore = 100;
const clickValue = 15;
const decayRate = 1.5;
let gameActive = true;
let gameStarted = false;

// Елементи
const gameArea = document.getElementById('game-area');
const winArea = document.getElementById('win-area');
const dogImg = document.getElementById('dog');
const progressBar = document.getElementById('progress');
const titleText = document.getElementById('title-text');
const btn = document.getElementById('feed-btn');

const preGiftContent = document.getElementById('pre-gift-content');
const getGiftBtn = document.getElementById('get-gift-btn');
const giftBox = document.getElementById('gift-box');
const finalReveal = document.getElementById('final-reveal');

const envelopeWrapper = document.getElementById('envelope-wrapper');
const openLetterBtn = document.getElementById('open-letter-btn');
const letterForm = document.getElementById('letter-form');
const sendLetterBtn = document.getElementById('send-letter-btn');
const letterText = document.getElementById('letter-text');

// --- ЦИКЛ ГРИ ---
const gameLoop = setInterval(() => {
    if (!gameActive) return;
    if (!gameStarted) return;

    if (score > 0) {
        score -= decayRate;
        if (score < 0) score = 0;
    }
    updateUI();
}, 50);

// --- ОБРОБКА КЛІКУ ---
btn.addEventListener('mousedown', handleInteraction);
btn.addEventListener('touchstart', (e) => {
    if (e.cancelable) e.preventDefault(); 
    handleInteraction(e);
}, { passive: false });

function handleInteraction(e) {
    if (!gameActive) return;
    if (e.type === 'mousedown' && e.cancelable) e.preventDefault();

    // ПЕРШИЙ КЛІК
    if (!gameStarted) {
        gameStarted = true;
        // Стартуємо з 40%. Оскільки поріг плачу тепер 50%,
        // він може майже одразу заплакати, якщо не клікати швидко.
        score = 40; 
    }

    score += clickValue;
    
    dogImg.classList.add('scale-click');
    setTimeout(() => dogImg.classList.remove('scale-click'), 100);
    
    let clientX, clientY;
    if (e.type === 'touchstart') {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    spawnFlyingItem(clientX, clientY);
    
    if (score >= maxScore) {
        score = maxScore;
        winGame();
    }
    updateUI();
}

// --- ГОЛОВНА ЛОГІКА КАРТИНОК ---
function updateUI() {
    progressBar.style.width = score + '%';

    // 1. ДО СТАРТУ
    if (!gameStarted) {
        changeDogImage("Dog_1.gif");
        return;
    }

    // 2. ГРА ПОЧАЛАСЯ:
    // !!! ЗМІНА ТУТ: Поріг піднято з 25 до 50 !!!
    if (score < 50) {
        // Якщо шкала нижче половини -> ПЛАЧЕ (Dog_6)
        changeDogImage("Dog_6.gif");
        titleText.innerText = "Швидше! Він плаче! 😭";
        progressBar.style.background = "linear-gradient(90deg, #ff416c, #ff4b2b)";
    } else {
        // Якщо вище половини -> ЇДЕ (Dog_3)
        changeDogImage("Dog_3.gif");
        
        if (score < 75) {
            titleText.innerText = "Газуй! Йому подобається! 🏎️";
            progressBar.style.background = "linear-gradient(90deg, #f12711, #f5af19)";
        } else {
            titleText.innerText = "ЩЕ ТРОХИ! ТУРБО РЕЖИМ! 🔥";
            progressBar.style.background = "linear-gradient(90deg, #11998e, #38ef7d)";
        }
    }
}

// Допоміжна функція
function changeDogImage(imageName) {
    if (!dogImg.src.includes(imageName)) {
        dogImg.src = imageName;
    }
}

function spawnFlyingItem(x, y) {
    const emojis = ['🍪', '🔥', '⚡', '❤️', '🦴']; 
    const item = document.createElement('div');
    item.innerText = emojis[Math.floor(Math.random() * emojis.length)];
    item.classList.add('flying-item');
    const randomX = (Math.random() - 0.5) * 100 + 'px';
    item.style.setProperty('--rx', randomX);
    item.style.left = x + 'px';
    item.style.top = y + 'px';
    document.body.appendChild(item);
    setTimeout(() => item.remove(), 800);
}

function winGame() {
    gameActive = false;
    clearInterval(gameLoop);
    gameArea.style.display = 'none';
    winArea.style.display = 'block';
    launchBallConfetti();
}

// --- ПОДАРУНКИ ТА ЛИСТ ---
getGiftBtn.addEventListener('click', () => {
    preGiftContent.style.display = 'none';
    giftBox.style.display = 'inline-block';
});

giftBox.addEventListener('click', () => {
    giftBox.style.display = 'none';
    finalReveal.style.display = 'block';
    launchBallConfetti();
});

openLetterBtn.addEventListener('click', () => {
    envelopeWrapper.style.display = 'none';
    letterForm.style.display = 'block';
});

sendLetterBtn.addEventListener('click', () => {
    const text = letterText.value;
    if (text.trim() === "") {
        alert("Напиши хоч щось! 😊");
        return;
    }

    sendLetterBtn.innerText = "Відправка...";
    sendLetterBtn.style.background = "#bdc3c7";

    // Твої ID
    const serviceID = "service_jjysm7r";
    const templateID = "template_cnx29ub";

    const templateParams = {
        message: text,
    };

    emailjs.send(serviceID, templateID, templateParams)
        .then(() => {
            sendLetterBtn.innerText = "Відправлено! ✅";
            sendLetterBtn.style.background = "#2ecc71";
            letterText.value = "";
            launchBallConfetti();
            alert("Лист успішно полетів до Миколая! 🎅");
        }, (err) => {
            sendLetterBtn.innerText = "Помилка 😔";
            sendLetterBtn.style.background = "red";
            console.log(err);
            alert("Помилка відправки. Перевір консоль.");
        });
});

function launchBallConfetti() {
    const duration = 2000;
    const end = Date.now() + duration;
    (function frame() {
        confetti({
            particleCount: 5, spread: 60, origin: { x: 0.5, y: 0.6 },
            shapes: ['circle'], 
            colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
            scalar: 1.2 
        });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

function createSnow() {
    for (let i = 0; i < 50; i++) {
        let snowflake = document.createElement('div');
        snowflake.innerHTML = '❄';
        snowflake.classList.add('snowflake');
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = Math.random() * 3 + 2 + 's';
        snowflake.style.opacity = Math.random();
        document.body.appendChild(snowflake);
    }
}
createSnow();