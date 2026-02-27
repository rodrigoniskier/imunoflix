document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const splashLogoView = document.getElementById('splash-logo-view');
    const splashTudumView = document.getElementById('splash-tudum-view');
    const appContainer = document.getElementById('app-container');
    const browseView = document.getElementById('browse-view');
    const detailView = document.getElementById('detail-view');
    const catalogContainer = document.getElementById('catalogo');
    
    // Elementos do Player e Detalhes
    const videoTitle = document.getElementById('video-title');
    const videoDesc = document.getElementById('video-description');
    const youtubePlayer = document.getElementById('youtube-player');
    const backBtn = document.getElementById('back-to-browse-btn');
    const startJourneyBtn = document.getElementById('start-journey-btn');
    const mainHeader = document.getElementById('main-header');
    const episodeMenu = document.getElementById('episode-menu');
    const menuToggleBtn = document.getElementById('menu-toggle');

    // --- VARIÁVEL PARA GUARDAR OS DADOS DO JSON ---
    let bancoDeDados = [];

    // --- LÓGICA DA TELA DE SPLASH (MANTIDA INTACTA) ---
    const synth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
    }).toDestination();

    function playTudumSound() {
        const now = Tone.now();
        synth.triggerAttackRelease("G2", "8n", now);
        synth.triggerAttackRelease("D3", "8n", now + 0.2);
    }

    function startTudum() {
        splashLogoView.style.opacity = '0';
        splashTudumView.style.display = 'flex';
        setTimeout(() => {
            splashLogoView.style.display = 'none';
            const mImg = document.querySelector('.splash-m-img');
            mImg.classList.add('animate');
            Tone.start().then(playTudumSound);
            setTimeout(showApp, 1500);
        }, 500);
    }
    
    function showApp() {
        splashTudumView.style.opacity = '0';
        setTimeout(() => {
            splashTudumView.style.display = 'none';
            document.body.style.overflowY = 'auto';
            appContainer.style.display = 'block';
            browseView.classList.add('active');
        }, 500);
    }
    
    splashLogoView.addEventListener('click', startTudum);

    // --- FUNÇÕES DE LÓGICA DO IMUNOFLIX ---
    
    // Função para extrair o ID do vídeo da URL
    function obterIdYouTube(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // Busca os dados do arquivo JSON
    async function carregarDadosJson() {
        try {
            const resposta = await fetch('data.json');
            bancoDeDados = await resposta.json();
            renderCatalog();
        } catch (erro) {
            console.error("Erro ao carregar os vídeos:", erro);
            catalogContainer.innerHTML = "<h2 style='padding: 20px;'>Erro ao carregar o catálogo. Verifique o data.json.</h2>";
        }
    }

    // Constrói as fileiras do catálogo na tela
    function renderCatalog() {
        catalogContainer.innerHTML = '';
        
        bancoDeDados.forEach((categoriaObj, catIndex) => {
            const row = document.createElement('div');
            row.className = 'topic-row';
            
            const rowTitle = document.createElement('h2');
            rowTitle.className = 'row-title';
            rowTitle.textContent = categoriaObj.categoria;
            row.appendChild(rowTitle);
            
            const rowContent = document.createElement('div');
            rowContent.className = 'row-content';
            
            categoriaObj.videos.forEach((video, vidIndex) => {
                const videoId = obterIdYouTube(video.url);
                if (!videoId) return;

                // Tenta pegar a capa em alta resolução do YouTube
                const imgCapa = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

                const card = document.createElement('div');
                card.className = 'topic-card';
                card.style.backgroundImage = `url('${imgCapa}')`;
                card.innerHTML = `<div class="card-overlay"><h3 class="card-title">${video.titulo}</h3></div>`;
                
                // Evento de clique no cartão
                card.addEventListener('click', () => showVideoDetails(video, videoId, categoriaObj));
                rowContent.appendChild(card);
            });
            
            row.appendChild(rowContent);
            catalogContainer.appendChild(row);
        });
    }

    // Renderiza a barra lateral (Episódios/Vídeos Relacionados)
    function renderEpisodeMenu(categoriaObj, videoIdAtual) {
        let menuHTML = `<h3>${categoriaObj.categoria}</h3><ul>`;
        
        categoriaObj.videos.forEach(video => {
            const vidId = obterIdYouTube(video.url);
            const isActive = vidId === videoIdAtual ? 'active' : '';
            // Passamos o índice como data-attribute para facilitar o clique
            menuHTML += `<li data-url="${video.url}" class="${isActive}">${video.titulo}</li>`;
        });
        
        menuHTML += `</ul>`;
        episodeMenu.innerHTML = menuHTML;

        // Adiciona evento de clique aos itens do menu
        const itemsMenu = episodeMenu.querySelectorAll('li');
        itemsMenu.forEach(item => {
            item.addEventListener('click', () => {
                const urlAlvo = item.getAttribute('data-url');
                const videoEncontrado = categoriaObj.videos.find(v => v.url === urlAlvo);
                if(videoEncontrado) {
                    showVideoDetails(videoEncontrado, obterIdYouTube(urlAlvo), categoriaObj);
                }
            });
        });
    }

    // Abre a tela de detalhes e toca o vídeo
    function showVideoDetails(video, videoId, categoriaObj) {
        // Atualiza os textos
        videoTitle.textContent = video.titulo;
        videoDesc.textContent = video.descricao;
        
        // Coloca o iframe do YouTube (autoplay=1 faz tocar sozinho)
        youtubePlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
        
        // Atualiza a barra lateral
        renderEpisodeMenu(categoriaObj, videoId);
        
        // Transição de tela
        browseView.classList.remove('active');
        detailView.classList.add('active');
        window.scrollTo(0, 0);

        // Fecha o menu lateral no celular após clicar
        if (window.innerWidth <= 1200) {
            episodeMenu.classList.remove('open');
        }
    }

    // Volta pro catálogo e pausa o vídeo
    function backToBrowse() {
        detailView.classList.remove('active');
        browseView.classList.add('active');
        youtubePlayer.src = ''; // Limpa o iframe para parar o som
        episodeMenu.classList.remove('open');
    }

    function handleHeaderScroll() {
        if (browseView.classList.contains('active')) {
            mainHeader.classList.toggle('scrolled', window.scrollY > 50);
        }
    }

    // --- EVENT LISTENERS ---
    backBtn.addEventListener('click', backToBrowse);
    window.addEventListener('scroll', handleHeaderScroll);

    // O botão principal do Hero pode tocar o primeiro vídeo do JSON
    startJourneyBtn.addEventListener('click', () => {
        if (bancoDeDados.length > 0 && bancoDeDados[0].videos.length > 0) {
            const primVideo = bancoDeDados[0].videos[0];
            showVideoDetails(primVideo, obterIdYouTube(primVideo.url), bancoDeDados[0]);
        }
    });

    menuToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        episodeMenu.classList.toggle('open');
    });
    
    document.body.addEventListener('click', (e) => {
        if (window.innerWidth <= 1200 && episodeMenu.classList.contains('open')) {
            if (!episodeMenu.contains(e.target) && e.target !== menuToggleBtn) {
                episodeMenu.classList.remove('open');
            }
        }
    });

    // --- INICIALIZAÇÃO ---
    carregarDadosJson();
});
