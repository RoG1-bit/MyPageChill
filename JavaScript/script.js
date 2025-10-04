// Configuración de Spotify
const CLIENT_ID = 'f5f5cb557b984669984c4b62e32e2257'; // Tu Client ID de Spotify
const REDIRECT_URI = 'https://rog1-bit.github.io/MyPageChill/'; // Tu URL de GitHub Pages

// Playlists de Spotify (usando URIs públicas)
const stations = [
    { 
        name: "Lofi Hip Hop", 
        playlistId: "37i9dQZF1DX0XUsuxWHRQd", // Playlist pública de Spotify
        info: "Beats para estudiar y relajarse",
        image: "IMG/lofi.jpg"
    },
    { 
        name: "Reggaeton Hits", 
        playlistId: "37i9dQZF1DX0XUfTFmNBRM", // Playlist de reggaeton de Spotify
        info: "Los mejores hits de reggaeton",
        image: "IMG/reggaeton.jpg"
    },
    { 
        name: "Pop Latino", 
        playlistId: "37i9dQZF1DX2wsgTao2vPF", // Playlist de pop latino
        info: "Pop latino y hits actuales",
        image: "IMG/pop.jpg"
    },
    { 
        name: "Salsa Clásica", 
        playlistId: "37i9dQZF1DX8EsKyPFhvVz", // Playlist de salsa
        info: "Los clásicos de la salsa",
        image: "IMG/salsa.jpg"
    }
];

let currentStation = 0;
let isPlaying = false;
let spotifyPlayer = null;
let spotifyToken = null;

// Función para obtener token de Spotify
function getSpotifyToken() {
    console.log('Iniciando autenticación con Spotify...');
    console.log('Client ID:', CLIENT_ID);
    console.log('Redirect URI:', REDIRECT_URI);
    
    const scopes = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`;
    
    console.log('URL de autenticación:', authUrl);
    alert('Te redirigiremos a Spotify para autorizar la app');
    window.location.href = authUrl;
}

// Extraer token de la URL después del redirect
function extractTokenFromURL() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

// Inicializar Spotify Player
function initSpotifyPlayer() {
    const token = extractTokenFromURL() || localStorage.getItem('spotify_token');
    if (!token) {
        console.log('No hay token, necesitas autenticarte');
        return;
    }
    
    console.log('Token encontrado, inicializando player...');
    spotifyToken = token;
    localStorage.setItem('spotify_token', token);
    
    // Limpiar URL
    if (window.location.hash) {
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('SDK de Spotify cargado');
        spotifyPlayer = new Spotify.Player({
            name: 'Chill Player',
            getOAuthToken: cb => { cb(token); },
            volume: 0.5
        });

        spotifyPlayer.addListener('ready', ({ device_id }) => {
            console.log('✅ Spotify Player listo con Device ID:', device_id);
            document.getElementById('spotify-login').style.display = 'none';
            alert('¡Conectado a Spotify! Ya puedes reproducir música.');
        });

        spotifyPlayer.addListener('not_ready', ({ device_id }) => {
            console.log('Device ID has gone offline', device_id);
        });

        spotifyPlayer.connect().then(success => {
            if (success) {
                console.log('¡Conectado exitosamente a Spotify!');
            }
        });
    };
    
    // Si el SDK ya está cargado
    if (window.Spotify) {
        window.onSpotifyWebPlaybackSDKReady();
    }
}

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const stationName = document.getElementById('station-name');
const songInfo = document.getElementById('song-info');
const stationBtns = document.querySelectorAll('.station-btn');

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

    // Intentar reproducir después de un pequeño delay para asegurar que el stream esté listo
    setTimeout(() => {
        audio.play().then(() => {
            isPlaying = true;
            playBtn.textContent = '⏸️';
            setStationStatus('playing');
        }).catch((error) => {
            console.log('Error al reproducir:', error);
            setStationStatus('');
            isPlaying = false;
            playBtn.textContent = '▶️';
            // Mostrar mensaje al usuario
            alert('No se pudo reproducir esta estación. Intenta con otra o verifica tu conexión.');
        });
    }, 100);
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

// Función para reproducir playlist de Spotify
function playSpotifyPlaylist(playlistId) {
    if (!spotifyPlayer || !spotifyToken) {
        alert('Por favor conecta con Spotify primero');
        return;
    }
    
    fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
        headers: { 'Authorization': `Bearer ${spotifyToken}` }
    })
    .then(response => response.json())
    .then(data => {
        console.log('Playlist cargada:', data);
        setStationStatus('playing');
    })
    .catch(error => {
        console.error('Error cargando playlist:', error);
        setStationStatus('');
    });
}

// Modificar loadStation para usar Spotify
function loadStation(index) {
    currentStation = index;
    setStationStatus('loading');
    
    const stationNameText = document.getElementById('station-name-text');
    if (stationNameText) {
        stationNameText.textContent = stations[index].name;
    }
    songInfo.textContent = stations[index].info;

    // Cambiar imagen
    const stationImage = document.getElementById('station-image');
    if (stationImage) {
        stationImage.src = stations[index].image;
        stationImage.alt = stations[index].name;
    }

    // Actualizar botones activos
    stationBtns.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    // Reproducir playlist de Spotify
    playSpotifyPlaylist(stations[index].playlistId);
}

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Página cargada, inicializando...');
    
    // Configurar botón de login
    const loginBtn = document.getElementById('loginBtn');
    const spotifyLogin = document.getElementById('spotify-login');
    
    console.log('Botón encontrado:', loginBtn ? 'SÍ' : 'NO');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            console.log('🎵 Botón clickeado!');
            getSpotifyToken();
        });
        
        // Test simple para ver si el botón funciona
        loginBtn.addEventListener('click', function() {
            alert('¡Botón de Spotify clickeado!');
        });
    } else {
        console.error('❌ No se encontró el botón loginBtn');
    }
    
    // Verificar si ya hay token
    const token = extractTokenFromURL() || localStorage.getItem('spotify_token');
    if (token) {
        console.log('Token encontrado, ocultando login');
        if (spotifyLogin) spotifyLogin.style.display = 'none';
        initSpotifyPlayer();
    }
    
    // Cargar estación inicial
    const stationNameText = document.getElementById('station-name-text');
    if (stationNameText) {
        stationNameText.textContent = stations[0].name;
    }
    const songInfo = document.getElementById('song-info');
    if (songInfo) {
        songInfo.textContent = stations[0].info;
    }
    
    const stationImage = document.getElementById('station-image');
    if (stationImage) {
        stationImage.src = stations[0].image;
        stationImage.alt = stations[0].name;
    }
    
    const stationBtns = document.querySelectorAll('.station-btn');
    if (stationBtns.length > 0) {
        stationBtns[0].classList.add('active');
    }
    
    console.log('✅ Inicialización completada');
});