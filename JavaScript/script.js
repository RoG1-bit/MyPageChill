// DATOS DE RADIOS
const radioStations = [
    { id: 1, name: "Lofi Hip Hop", genre: "Chill Beats", icon: "🎧", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { id: 2, name: "Jazz Suave", genre: "Jazz", icon: "🎷", url: "https://stream.zeno.fm/8m1kuevrf3quv" },
    { id: 3, name: "Ambient Chill", genre: "Ambient", icon: "🌊", url: "https://stream.zeno.fm/0r0xa792kwzuv" },
    { id: 4, name: "Bossa Nova", genre: "Brazilian", icon: "🌸", url: "https://stream.zeno.fm/ey679e8ypa0uv" },
    { id: 5, name: "Smooth Jazz", genre: "Jazz", icon: "🎺", url: "https://stream.zeno.fm/0fcao2magg0uv" },
    { id: 6, name: "Chillsynth", genre: "Synthwave", icon: "🌆", url: "https://stream.zeno.fm/x8penps1x18uv" }
];

// ESTADO DE LA APP
let currentMode = 'radio'; // 'radio' o 'youtube'
let isPlaying = false;
let currentRadio = null;
let currentYoutubeVideo = null;
let ytPlayer = null;

// ELEMENTOS DOM
const radioPlayer = document.getElementById('radioPlayer');
const playBtn = document.getElementById('playBtn');
const trackName = document.getElementById('trackName');
const trackArtist = document.getElementById('trackArtist');
const trackCover = document.getElementById('trackCover');
const searchInput = document.getElementById('searchInput');
const youtubeResults = document.getElementById('youtubeResults');

// CARGAR API DE YOUTUBE
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
    console.log('✅ YouTube API cargada');
    
    try {
        ytPlayer = new YT.Player('ytplayer', {
            height: '1',
            width: '1',
            playerVars: {
                'autoplay': 0,
                'controls': 0,
                'enablejsapi': 1,
                'origin': window.location.origin,
                'playsinline': 1,
                'rel': 0,
                'showinfo': 0
            },
            events: {
                'onReady': function(event) {
                    console.log('✅ YouTube Player completamente listo');
                    // Verificar que todas las funciones estén disponibles
                    if (ytPlayer.loadVideoById && ytPlayer.playVideo && ytPlayer.pauseVideo) {
                        console.log('✅ Todas las funciones del player disponibles');
                    } else {
                        console.warn('⚠️ Algunas funciones del player no están disponibles');
                    }
                },
                'onStateChange': onPlayerStateChange,
                'onError': function(event) {
                    console.error('❌ Error en YouTube Player:', event.data);
                    
                    let errorMsg = 'Error desconocido';
                    switch(event.data) {
                        case 2:
                            errorMsg = 'ID de video inválido';
                            break;
                        case 5:
                            errorMsg = 'Video no se puede reproducir en HTML5';
                            break;
                        case 100:
                            errorMsg = 'Video no encontrado o privado';
                            break;
                        case 101:
                        case 150:
                            errorMsg = 'Video no permite reproducción embebida';
                            break;
                    }
                    
                    trackName.textContent = '❌ ' + errorMsg;
                    trackArtist.textContent = 'Intenta con otro video';
                    isPlaying = false;
                    playBtn.textContent = '▶️';
                }
            }
        });
    } catch (error) {
        console.error('❌ Error al crear YouTube Player:', error);
        trackName.textContent = '❌ Error del reproductor YouTube';
        trackArtist.textContent = 'Verifica la conexión a internet';
    }
}

function onPlayerStateChange(event) {
    console.log('🎬 Estado de YouTube cambió:', event.data);
    
    switch(event.data) {
        case YT.PlayerState.ENDED: // 0
            console.log('✅ Video terminado');
            playBtn.textContent = '▶️';
            isPlaying = false;
            trackName.textContent = 'Video terminado';
            trackArtist.textContent = 'Selecciona otro';
            break;
            
        case YT.PlayerState.PLAYING: // 1
            console.log('▶️ YouTube reproduciendo');
            playBtn.textContent = '⏸️';
            isPlaying = true;
            break;
            
        case YT.PlayerState.PAUSED: // 2
            console.log('⏸️ YouTube pausado');
            playBtn.textContent = '▶️';
            isPlaying = false;
            break;
            
        case YT.PlayerState.BUFFERING: // 3
            console.log('⏳ YouTube cargando...');
            trackName.textContent = trackName.textContent + ' (cargando...)';
            break;
            
        case YT.PlayerState.CUED: // 5
            console.log('✅ Video listo para reproducir');
            break;
    }
}

// RENDERIZAR RADIOS
function renderRadios() {
    const grid = document.getElementById('radioGrid');
    grid.innerHTML = radioStations.map(radio => `
        <div class="radio-card" data-radio-id="${radio.id}">
            <div class="radio-icon">${radio.icon}</div>
            <div class="radio-name">${radio.name}</div>
            <div class="radio-genre">${radio.genre}</div>
        </div>
    `).join('');

    // Event listeners para radios
    document.querySelectorAll('.radio-card').forEach(card => {
        card.addEventListener('click', () => {
            const radioId = parseInt(card.dataset.radioId);
            playRadio(radioId);
        });
    });
}

// REPRODUCIR RADIO
function playRadio(radioId) {
    const radio = radioStations.find(r => r.id === radioId);
    if (!radio) return;

    // Cambiar modo a radio
    currentMode = 'radio';
    currentRadio = radio;
    
    // Detener YouTube si está sonando
    if (ytPlayer && ytPlayer.pauseVideo) {
        ytPlayer.pauseVideo();
    }

    // Cargar y reproducir radio
    radioPlayer.src = radio.url;
    radioPlayer.play();
    isPlaying = true;
    playBtn.textContent = '⏸️';

    // Actualizar UI
    trackName.textContent = radio.name;
    trackArtist.textContent = radio.genre;
    trackCover.textContent = radio.icon;

    // Marcar como activo
    document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('playing'));
    document.querySelector(`[data-radio-id="${radioId}"]`).classList.add('playing');
}

// BUSCAR EN YOUTUBE
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
        youtubeResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎵</div>
                <div class="empty-state-text">Busca tu música favorita</div>
                <div class="empty-state-subtext">Escribe el nombre de una canción o artista arriba</div>
            </div>
        `;
        return;
    }

    searchTimeout = setTimeout(() => {
        searchYoutube(query);
    }, 500);
});

// BÚSQUEDA DE YOUTUBE (DEMO - Reemplazar con API real)
// BÚSQUEDA DE YOUTUBE CON API MEJORADA
async function searchYoutube(query) {
    youtubeResults.innerHTML = '<div class="loading">🔍 Buscando...</div>';
    
    // GENERAR TU PROPIA API KEY EN: https://console.developers.google.com
    // 1. Crea un proyecto
    // 2. Habilita YouTube Data API v3
    // 3. Crea credenciales (API Key)
    // 4. Agrega tu dominio a las restricciones
    const API_KEY = 'AIzaSyCedakFt7SuYZHiOO2hLhEwMIWAlX16DCM'; // ✅ API KEY CONFIGURADA
    
    if (!API_KEY || API_KEY.trim() === '') {
        youtubeResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔑</div>
                <div class="empty-state-text">API Key requerida</div>
                <div class="empty-state-subtext">
                    Para usar YouTube, necesitas generar tu propia API Key en:<br>
                    <a href="https://console.developers.google.com" target="_blank" style="color: #ff6b6b;">
                        console.developers.google.com
                    </a><br>
                    Luego pégala en el archivo script.js línea 67
                </div>
            </div>
        `;
        return;
    }
    
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=15&key=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Verificar si hay error de la API
        if (data.error) {
            let errorMsg = data.error.message;
            if (data.error.code === 403) {
                errorMsg = `SOLUCIÓN 403: Ve a console.developers.google.com → Tu proyecto → Credenciales → Tu API Key → Restricciones HTTP → Agregar: ${window.location.origin}/* y localhost/*`;
            } else if (data.error.code === 400) {
                errorMsg = 'Solicitud inválida. Verifica tu API Key.';
            }
            
            youtubeResults.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">❌</div>
                    <div class="empty-state-text">Error de API</div>
                    <div class="empty-state-subtext">${errorMsg}</div>
                </div>
            `;
            console.error('Error de API:', data.error);
            return;
        }
        
        // Si no hay resultados
        if (!data.items || data.items.length === 0) {
            youtubeResults.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">😕</div>
                    <div class="empty-state-text">Sin resultados</div>
                    <div class="empty-state-subtext">Intenta con otras palabras clave</div>
                </div>
            `;
            return;
        }
        
        // Filtrar videos válidos
        const videos = data.items
            .filter(item => item.id && item.id.videoId)
            .map(item => ({
                id: item.id.videoId,
                title: item.snippet.title,
                channel: item.snippet.channelTitle,
                thumb: item.snippet.thumbnails.medium.url
            }));
        
        if (videos.length === 0) {
            youtubeResults.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">😕</div>
                    <div class="empty-state-text">Sin videos válidos</div>
                </div>
            `;
            return;
        }
        
        renderYoutubeResults(videos);
        
    } catch (error) {
        console.error('Error en búsqueda YouTube:', error);
        youtubeResults.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔌</div>
                <div class="empty-state-text">Error de conexión</div>
                <div class="empty-state-subtext">
                    Verifica tu internet y API Key.<br>
                    Error: ${error.message}
                </div>
            </div>
        `;
    }
}

// RENDERIZAR RESULTADOS YOUTUBE
function renderYoutubeResults(videos) {
    youtubeResults.innerHTML = `
        <div class="youtube-results">
            ${videos.map(video => `
                <div class="video-item" data-video-id="${video.id}">
                    <img src="${video.thumb}" class="video-thumbnail" alt="${video.title}">
                    <div class="video-info">
                        <div class="video-title">${video.title}</div>
                        <div class="video-channel">${video.channel}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Event listeners
    document.querySelectorAll('.video-item').forEach(item => {
        item.addEventListener('click', () => {
            const videoId = item.dataset.videoId;
            playYoutube(videoId, item);
        });
    });
}


// REPRODUCIR YOUTUBE (VERSIÓN MEJORADA)
function playYoutube(videoId, element) {
    console.log('🎬 Intentando reproducir video:', videoId);
    
    // Verificar si el player está listo
    if (!ytPlayer) {
        console.log('❌ ytPlayer no existe');
        trackName.textContent = '❌ Reproductor no iniciado';
        trackArtist.textContent = 'Recarga la página';
        return;
    }
    
    if (!ytPlayer.loadVideoById) {
        console.log('⏳ Player aún no está listo, reintentando en 2 segundos...');
        
        // Mostrar mensaje al usuario
        trackName.textContent = '⏳ Cargando reproductor YouTube...';
        trackArtist.textContent = 'Espera un momento';
        
        // Reintentar después de 2 segundos
        setTimeout(() => {
            playYoutube(videoId, element);
        }, 2000);
        return;
    }

    try {
        console.log('✅ Player listo, cargando video...');
        
        // Cambiar modo a YouTube
        currentMode = 'youtube';
        currentYoutubeVideo = videoId;
        
        // Detener radio
        if (radioPlayer) {
            radioPlayer.pause();
        }

        // Reproducir video
        ytPlayer.loadVideoById({
            videoId: videoId,
            startSeconds: 0,
            suggestedQuality: 'default'
        });
        
        // Esperar un poco antes de intentar reproducir
        setTimeout(() => {
            ytPlayer.playVideo();
        }, 500);
        
        isPlaying = true;
        playBtn.textContent = '⏸️';

        // Actualizar UI
        const title = element.querySelector('.video-title').textContent;
        const channel = element.querySelector('.video-channel').textContent;
        trackName.textContent = title.length > 50 ? title.substring(0, 50) + '...' : title;
        trackArtist.textContent = channel;
        trackCover.textContent = '🎬';

        // Marcar como activo
        document.querySelectorAll('.video-item').forEach(v => v.classList.remove('playing'));
        element.classList.add('playing');
        
        // Desmarcar radios
        document.querySelectorAll('.radio-card').forEach(c => c.classList.remove('playing'));
        
        console.log('✅ Video configurado:', title);
        
    } catch (error) {
        console.error('❌ Error al reproducir video:', error);
        trackName.textContent = '❌ Error al reproducir';
        trackArtist.textContent = 'Intenta con otro video';
        
        // Resetear estado
        isPlaying = false;
        playBtn.textContent = '▶️';
    }
}

// CONTROL PLAY/PAUSE MEJORADO
playBtn.addEventListener('click', () => {
    console.log('🎮 Play/Pause clickeado. Modo actual:', currentMode, 'isPlaying:', isPlaying);
    
    if (currentMode === 'radio') {
        if (isPlaying) {
            radioPlayer.pause();
            playBtn.textContent = '▶️';
            isPlaying = false;
            console.log('⏸️ Radio pausada');
        } else {
            if (!currentRadio) {
                console.log('📻 No hay radio seleccionada, cargando la primera');
                playRadio(1);
            } else {
                radioPlayer.play().then(() => {
                    playBtn.textContent = '⏸️';
                    isPlaying = true;
                    console.log('▶️ Radio reanudada');
                }).catch((error) => {
                    console.error('❌ Error al reanudar radio:', error);
                    playRadio(currentRadio.id);
                });
            }
        }
    } else if (currentMode === 'youtube') {
        if (!ytPlayer || !ytPlayer.getPlayerState) {
            console.log('❌ YouTube player no disponible');
            trackName.textContent = '❌ Reproductor YouTube no disponible';
            trackArtist.textContent = 'Recarga la página';
            return;
        }
        
        try {
            const playerState = ytPlayer.getPlayerState();
            console.log('🎬 Estado del player YouTube:', playerState);
            
            if (isPlaying || playerState === 1) { // 1 = playing
                ytPlayer.pauseVideo();
                playBtn.textContent = '▶️';
                isPlaying = false;
                console.log('⏸️ YouTube pausado');
            } else {
                ytPlayer.playVideo();
                playBtn.textContent = '⏸️';
                isPlaying = true;
                console.log('▶️ YouTube reproduciendo');
            }
        } catch (error) {
            console.error('❌ Error al controlar YouTube:', error);
            trackName.textContent = '❌ Error en YouTube';
            trackArtist.textContent = 'Intenta de nuevo';
        }
    } else {
        console.log('📻 Modo no definido, cargando primera radio');
        playRadio(1);
    }
});

// NAVEGACIÓN
document.querySelectorAll('.nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        
        // Actualizar nav activo
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Mostrar sección
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
    });
});

// VOLUMEN
const volumeBar = document.getElementById('volumeBar');
const volumeFill = document.getElementById('volumeFill');

volumeBar.addEventListener('click', (e) => {
    const rect = volumeBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    volumeFill.style.width = percentage + '%';
    
    const volume = percentage / 100;
    radioPlayer.volume = volume;
    if (ytPlayer && ytPlayer.setVolume) {
        ytPlayer.setVolume(percentage);
    }
});

// INICIALIZAR
renderRadios();