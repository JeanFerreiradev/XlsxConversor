// ===== DASHBOARD JAVASCRIPT COM ANIMAÇÕES E INTERAÇÕES =====

// Aguardar autenticação
const verificarAuth = () => {
  if (!localStorage.getItem("token")) {
    window.location = "index.html";
    return false;
  }
  return true;
};

// Função para animar números em incrementos suaves
function animarNumero(elemento, numeroFinal, duracao = 2000) {
  if (!elemento) return;
  
  const numeroInicial = 0;
  const incremento = Math.ceil(numeroFinal / (duracao / 50));
  let numeroAtual = numeroInicial;
  
  const timer = setInterval(() => {
    numeroAtual += incremento;
    if (numeroAtual >= numeroFinal) {
      numeroAtual = numeroFinal;
      clearInterval(timer);
    }
    elemento.textContent = numeroAtual.toLocaleString('pt-BR');
    elemento.style.animation = 'pulse 0.3s ease-out';
  }, 50);
}

// Função para criar cards animados
function criarCardsAnidados(dados) {
  const container = document.querySelector('.cards');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Definir dados dos cards com animações delayadas
  const cardsData = [
    {
      titulo: 'Total de Envios',
      valor: dados.totalEnvios || 0,
      icone: '📊',
      cor: 'primary',
      delay: 0.1
    },
    {
      titulo: 'Com Erro',
      valor: dados.totalErros || 0,
      icone: '❌',
      cor: 'error',
      delay: 0.2
    },
    {
      titulo: 'Último Protocolo',
      valor: dados.ultimoProtocolo || '-',
      icone: '📝',
      cor: 'secondary',
      delay: 0.3
    }
  ];
  
  cardsData.forEach((card, index) => {
    const cardElement = document.createElement('div');
    cardElement.className = `card-stat card-stat-${card.cor}`;
    cardElement.style.cssText = `
      opacity: 0;
      transform: translateY(30px) scale(0.9);
      transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    
    cardElement.innerHTML = `
      <div class="card-icon" style="font-size: 2rem; margin-bottom: 1rem;">${card.icone}</div>
      <div class="card-title">${card.titulo}</div>
      <div class="card-value">${card.valor}</div>
    `;
    
    container.appendChild(cardElement);
    
    // Animar entrada com delay
    setTimeout(() => {
      cardElement.style.opacity = '1';
      cardElement.style.transform = 'translateY(0) scale(1)';
      
      // Se for um número, animar a contagem
      if (typeof card.valor === 'number' && card.valor > 0) {
        const valorElement = cardElement.querySelector('.card-value');
        valorElement.textContent = '0';
        setTimeout(() => {
          animarNumero(valorElement, card.valor);
        }, 300);
      }
    }, card.delay * 1000);
  });
}

// Função para criar tabela animada
function criarTabelaAninada(envios) {
  const tabela = document.querySelector('#ultimosTable tbody');
  if (!tabela) return;
  
  tabela.innerHTML = '';
  
  if (!envios || envios.length === 0) {
    const linhaVazia = document.createElement('tr');
    linhaVazia.innerHTML = `
      <td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">
        Nenhum envio encontrado
      </td>
    `;
    tabela.appendChild(linhaVazia);
    return;
  }
  
  envios.forEach((envio, index) => {
    const linha = document.createElement('tr');
    linha.style.cssText = `
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.4s ease-out ${index * 0.1}s;
    `;
    
    // Determinar badge baseado no status
    let badgeClass = 'pending';
    let badgeText = 'Pendente';
    
    if (envio.status === 'sucesso' || envio.status === 'completed') {
      badgeClass = 'success';
      badgeText = 'Sucesso';
    } else if (envio.status === 'erro' || envio.status === 'error') {
      badgeClass = 'error';
      badgeText = 'Erro';
    } else if (envio.status === 'processando' || envio.status === 'processing') {
      badgeClass = 'warning';
      badgeText = 'Processando';
    }
    
    linha.innerHTML = `
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.2rem;">📄</span>
          <span style="font-weight: 500;">${envio.arquivo || 'Arquivo'}</span>
        </div>
      </td>
      <td>
        <span style="color: var(--text-secondary);">
          ${envio.data ? new Date(envio.data).toLocaleDateString('pt-BR') : '-'}
        </span>
      </td>
      <td>
        <code style="
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          font-weight: 500;
        ">${envio.protocolo || '-'}</code>
      </td>
      <td>
        <span class="badge ${badgeClass}">${badgeText}</span>
      </td>
    `;
    
    // Adicionar hover effect
    linha.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(99, 102, 241, 0.05)';
      this.style.transform = 'scale(1.02)';
    });
    
    linha.addEventListener('mouseleave', function() {
      this.style.background = '';
      this.style.transform = 'scale(1)';
    });
    
    tabela.appendChild(linha);
    
    // Animar entrada
    setTimeout(() => {
      linha.style.opacity = '1';
      linha.style.transform = 'translateX(0)';
    }, index * 100);
  });
}

// Função para carregar dados com loading
async function carregarDadosDashboard() {
  if (!verificarAuth()) return;
  
  const token = localStorage.getItem("token");
  
  try {
    // Mostrar loading nos cards
    const cards = document.querySelectorAll('.card-value');
    cards.forEach(card => {
      card.classList.add('loading');
      card.innerHTML = '<div class="spinner"></div>';
    });
    
    // Simular carregamento de dados
    const response = await fetch('/api/dashboard/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dados = await response.json();
    
    // Atualizar cards
    criarCardsAnidados(dados);
    
    // Atualizar tabela
    criarTabelaAninada(dados.ultimosEnvios || []);
    
    // Animar entrada da seção
    const secaoTabela = document.querySelector('section');
    if (secaoTabela) {
      secaoTabela.style.opacity = '0';
      secaoTabela.style.transform = 'translateY(20px)';
      setTimeout(() => {
        secaoTabela.style.opacity = '1';
        secaoTabela.style.transform = 'translateY(0)';
        secaoTabela.style.transition = 'all 0.6s ease-out';
      }, 1000);
    }
    
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    
    // Mostrar erro nos cards
    const cards = document.querySelectorAll('.card-value');
    cards.forEach(card => {
      card.classList.remove('loading');
      card.textContent = 'Erro';
      card.style.color = 'var(--error)';
    });
    
    // Mostrar toast de erro
    if (window.authJS && window.authJS.mostrarToast) {
      window.authJS.mostrarToast('Erro ao carregar dados do dashboard', 'error');
    }
  }
}

// Função para auto-refresh dos dados
function configurarAutoRefresh(intervalo = 30000) {
  setInterval(() => {
    // Apenas atualizar se a página ainda estiver ativa
    if (!document.hidden) {
      carregarDadosDashboard();
    }
  }, intervalo);
}

// Função para adicionar indicadores visuais de status
function adicionarIndicadoresStatus() {
  const statusElements = document.querySelectorAll('.badge');
  
  statusElements.forEach(element => {
    // Adicionar pulso para status pendente
    if (element.classList.contains('pending')) {
      element.style.animation = 'pulse 2s infinite';
    }
    
    // Adicionar rotação para processando
    if (element.classList.contains('warning')) {
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      
      const spinner = document.createElement('span');
      spinner.className = 'spinner';
      spinner.style.cssText = `
        width: 12px;
        height: 12px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        margin-right: 0.5rem;
      `;
      
      element.insertBefore(spinner, element.firstChild);
    }
  });
}

// Função para adicionar tooltips informativos
function adicionarTooltips() {
  const elementos = document.querySelectorAll('.card-stat, .card-value');
  
  elementos.forEach(elemento => {
    elemento.title = elemento.textContent;
  });
}

// Função para adicionar efeitos de hover aos cards
function adicionarEfeitosHoverCards() {
  const cards = document.querySelectorAll('.card-stat');
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      // Criar efeito de glow
      this.style.boxShadow = '0 8px 32px rgba(99, 102, 241, 0.3)';
      this.style.transform = 'translateY(-8px) scale(1.02)';
      
      // Animar ícone se existir
      const icone = this.querySelector('.card-icon');
      if (icone) {
        icone.style.animation = 'bounce 0.6s ease-out';
      }
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.boxShadow = '';
      this.style.transform = 'translateY(0) scale(1)';
      
      const icone = this.querySelector('.card-icon');
      if (icone) {
        icone.style.animation = '';
      }
    });
    
    // Adicionar click effect
    card.addEventListener('click', function() {
      this.style.animation = 'scaleIn 0.3s ease-out';
      setTimeout(() => {
        this.style.animation = '';
      }, 300);
    });
  });
}

// Função para adicionar notificações de sucesso/erro visuais
function adicionarNotificacoes() {
  // Interceptar fetch para mostrar loading
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    
    // Mostrar indicador de loading global
    mostrarLoadingGlobal(true);
    
    return originalFetch.apply(this, args)
      .then(response => {
        mostrarLoadingGlobal(false);
        return response;
      })
      .catch(error => {
        mostrarLoadingGlobal(false);
        throw error;
      });
  };
}

// Função para loading global
function mostrarLoadingGlobal(mostrar) {
  let loading = document.getElementById('loading-global');
  
  if (mostrar) {
    if (!loading) {
      loading = document.createElement('div');
      loading.id = 'loading-global';
      loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, var(--primary), var(--secondary));
        z-index: 9999;
        transform: translateX(-100%);
        transition: transform 0.3s ease-out;
      `;
      
      // Adicionar shimmer effect
      loading.innerHTML = `
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          animation: shimmer 1.5s infinite;
        "></div>
      `;
      
      document.body.appendChild(loading);
    }
    
    setTimeout(() => {
      loading.style.transform = 'translateX(0)';
    }, 10);
  } else {
    if (loading) {
      loading.style.transform = 'translateX(100%)';
      setTimeout(() => {
        loading.remove();
      }, 300);
    }
  }
}

// Inicialização do dashboard
document.addEventListener('DOMContentLoaded', function() {
  if (!verificarAuth()) return;
  
  // Adicionar classes de animação aos elementos
  document.body.classList.add('dashboard-loaded');
  
  // Configurar todas as funcionalidades
  adicionarNotificacoes();
  adicionarEfeitosHoverCards();
  adicionarIndicadoresStatus();
  adicionarTooltips();
  
  // Carregar dados iniciais
  carregarDadosDashboard();
  
  // Configurar auto-refresh
  configurarAutoRefresh();
  
  // Adicionar event listeners para interação
  const atualizarBtn = document.createElement('button');
  atualizarBtn.innerHTML = '🔄';
  atualizarBtn.style.cssText = `
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    font-size: 1.5rem;
    z-index: 1000;
    animation: fadeInRight 0.6s ease-out 1s both;
  `;
  
  atualizarBtn.addEventListener('click', () => {
    atualizarBtn.style.animation = 'bounce 0.6s ease-out';
    carregarDadosDashboard();
    setTimeout(() => {
      atualizarBtn.style.animation = '';
    }, 600);
  });
  
  document.body.appendChild(atualizarBtn);
});

// Exportar funções
window.dashboardJS = {
  carregarDadosDashboard,
  configurarAutoRefresh,
  animarNumero,
  mostrarToast: window.authJS?.mostrarToast
};