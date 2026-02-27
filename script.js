// Função para extrair o ID do vídeo a partir da URL do YouTube
function obterIdYouTube(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Função principal que carrega os dados e monta a página
async function carregarCatalogo() {
    try {
        // Pede para o navegador ler o nosso arquivo data.json
        const resposta = await fetch('data.json');
        const dados = await resposta.json();
        
        const catalogo = document.getElementById('catalogo');

        // Para cada categoria no nosso arquivo JSON...
        dados.forEach(categoria => {
            // Cria a seção da categoria
            const secaoCategoria = document.createElement('div');
            secaoCategoria.className = 'categoria';
            
            const titulo = document.createElement('h2');
            titulo.textContent = categoria.categoria;
            secaoCategoria.appendChild(titulo);

            // Cria o carrossel (lista horizontal)
            const listaVideos = document.createElement('div');
            listaVideos.className = 'lista-videos';

            // Para cada vídeo dentro desta categoria...
            categoria.videos.forEach(video => {
                const videoId = obterIdYouTube(video.url);
                if (!videoId) return; // Se a URL for inválida, ignora

                // Gera a URL da miniatura do próprio YouTube
                const miniaturaUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

                // Cria o "card" (cartão) do vídeo
                const card = document.createElement('div');
                card.className = 'card-video';
                
                const img = document.createElement('img');
                img.src = miniaturaUrl;
                img.alt = video.titulo;

                card.appendChild(img);
                
                // Quando clicar no card, abre a ficha técnica
                card.addEventListener('click', () => abrirFichaTecnica(video, videoId, miniaturaUrl));

                listaVideos.appendChild(card);
            });

            secaoCategoria.appendChild(listaVideos);
            catalogo.appendChild(secaoCategoria);
        });
    } catch (erro) {
        console.error("Erro ao carregar os dados:", erro);
    }
}

// --- Lógica da Ficha Técnica (Modal) ---
const modal = document.getElementById('modal-ficha');
const modalTitulo = document.getElementById('modal-titulo');
const modalDescricao = document.getElementById('modal-descricao');
const modalImagem = document.getElementById('modal-imagem');
const modalIframe = document.getElementById('modal-iframe');
const btnFechar = document.getElementById('fechar-modal');
const btnPlay = document.getElementById('btn-play');

let videoIdAtual = "";

function abrirFichaTecnica(video, videoId, miniaturaUrl) {
    videoIdAtual = videoId;
    
    // Preenche as informações
    modalTitulo.textContent = video.titulo;
    modalDescricao.textContent = video.descricao;
    modalImagem.src = miniaturaUrl;
    
    // Mostra a imagem de capa e esconde o player de vídeo por enquanto
    modalImagem.style.display = 'block';
    modalIframe.style.display = 'none';
    modalIframe.src = ''; // Limpa o iframe
    
    // Exibe o modal mudando o display (que estava none) para flex
    modal.style.display = 'flex';
}

// Botão Fechar
btnFechar.addEventListener('click', () => {
    modal.style.display = 'none';
    modalIframe.src = ''; // Para o vídeo quando fechar
});

// Botão Assistir Agora (Play)
btnPlay.addEventListener('click', () => {
    // Esconde a imagem de capa e mostra o iframe do YouTube tocando o vídeo
    modalImagem.style.display = 'none';
    modalIframe.style.display = 'block';
    // O parâmetro ?autoplay=1 faz o vídeo começar sozinho
    modalIframe.src = `https://www.youtube.com/embed/${videoIdAtual}?autoplay=1`;
});

// Inicializa a aplicação
// Só vai esconder o modal no início via JS por segurança (já tá no CSS também)
modal.style.display = 'none';
carregarCatalogo();
