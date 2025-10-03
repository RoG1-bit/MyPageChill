// Aquí irían las URLs reales de streams de radio
const stations = [
    { 
        name: "Lofi Hip Hop Radio", 
        url: "https://stream.zeno.fm/f3wvbbqmdg8uv", 
        info: "Beats para estudiar y relajarse",
        image: "../IMG/lofi.jpg"
    },
    { 
        name: "Jazz Suave", 
        url: "https://stream.zeno.fm/n95whvdrf3quv", // Jazz 24/7
        info: "Jazz instrumental relajante",
        image: "../IMG/jazz.jpg"
    },
    { 
        name: "Ambient Chill", 
        url: "https://stream.zeno.fm/0r0xa792kwzuv",
        info: "Sonidos atmosféricos",
        image: "../IMG/ambient.jpg"
    },
    { 
        name: "Bossa Nova", 
        url: "https://stream.zeno.fm/kbzr8vqrf3quv", // Bossa Nova Radio
        info: "Ritmos brasileños suaves",
        image: "../IMG/bossa.jpg"
    }
];

let currentStation = 0;
let isPlaying = false;

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const stationName = document.getElementById('stationName');
const songInfo = document.getElementById('songInfo');
const stationBtns = document.querySelectorAll('.station-btn');
const bars = document.querySelectorAll('.bar');

// Configurar volumen inicial
audio.volume = 0.7;



// Función para establecer el estado de la estación
function setStationStatus(status) {
    const statusEl = document.getElementById('station-status');
    if (!statusEl) return;
    if (status === 'loading') {
        statusEl.textContent = '⏳'; // Icono de cargando
    } else if (status === 'playing') {
        statusEl.textContent = '🔊'; // Icono de reproduciendo
    } else {
        statusEl.textContent = '';
    }
}

// Función para cargar estación
function loadStation(index) {
    currentStation = index;
    audio.pause();
    setStationStatus('loading');
    audio.src = stations[index].url;
    audio.load();
    // Actualiza el texto del nombre y deja el span del estado intacto
    const stationNameText = document.getElementById('station-name-text');
    if (stationNameText) {
        stationNameText.textContent = stations[index].name;
    }
    songInfo.textContent = stations[index].info;

    // Cambiar imagen de la estación
    const stationImage = document.getElementById('station-image');
    const imgError = document.getElementById('img-error');
    if (stationImage) {
        stationImage.style.display = 'block';
        stationImage.src = stations[index].image;
        stationImage.alt = stations[index].name;
    }
    if (imgError) {
        imgError.style.display = 'none';
    }

    // Actualizar botones activos
    stationBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    audio.play().then(() => {
        isPlaying = true;
        playBtn.textContent = '⏸️';
        setStationStatus('playing');
    }).catch((error) => {
        console.log('Error al reproducir:', error);
        setStationStatus('');
        isPlaying = false;
        playBtn.textContent = '▶️';
    });
}

// Eventos de audio para cambiar estado de la estación
audio.addEventListener('playing', () => setStationStatus('playing'));
audio.addEventListener('waiting', () => setStationStatus('loading'));
audio.addEventListener('stalled', () => setStationStatus('loading'));
audio.addEventListener('pause', () => setStationStatus(''));

// Play/Pause
playBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
        playBtn.textContent = '▶️';
        isPlaying = false;
    } else {
        if (!audio.src) {
            loadStation(0);
        }
        audio.play().then(() => {
            playBtn.textContent = '⏸️';
            isPlaying = true;
            setStationStatus('playing');
        }).catch((error) => {
            console.log('Error al reproducir:', error);
            setStationStatus('');
        });
    }
});

// Estación anterior
prevBtn.addEventListener('click', () => {
    currentStation = (currentStation - 1 + stations.length) % stations.length;
    loadStation(currentStation);
});

// Estación siguiente
nextBtn.addEventListener('click', () => {
    currentStation = (currentStation + 1) % stations.length;
    loadStation(currentStation);
});

// Control de volumen
volumeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    audio.volume = value / 100;
    volumeValue.textContent = value + '%';
});

// Botones de estaciones
stationBtns.forEach((btn, index) => {
    btn.addEventListener('click', () => {
        loadStation(index);
    });
});

// Animación del visualizador
function animateVisualizer() {
    bars.forEach(bar => {
        const height = Math.random() * 50 + 10;
        bar.style.height = isPlaying ? height + 'px' : '10px';
    });
}

setInterval(animateVisualizer, 200);