// ===== HISTÓRICO JAVASCRIPT COM ANIMAÇÕES E INTERAÇÕES =====

// Aguardar autenticação
const verificarAuth = () => {
  if (!localStorage.getItem("token")) {
    window.location = "index.html";
    return false;
  }
  return true;
};

// Função para animar elementos de entrada
function animarElementosEntrada() {
  const elementos = [
    { selector: 'h1', animation: 'fadeInDown', delay: 0 },
    { selector: '.cards', animation: 'fadeInUp', delay: 0.2 },
    { selector: '.table', animation: 'fadeInUp', delay: 0.4 }
  ];
  
  elementos.forEach(({ selector, animation, delay }) => {
    const elemento = document.querySelector(selector);
    if (elemento) {
      elemento.style.opacity = '0';
      elemento.style.transform = 'translateY(30px)';
      
      setTimeout(() => {
        elemento.style.animation = `${animation} 0.6s ease-out forwards`;
        elemento.style.opacity = '1';
        elemento.style.transform = 'translateY(0)';
      }, delay * 1000);
    }
  });
}

// Função para criar filtros animados
function criarFiltros() {
  const container = document.createElement('div');
  container.className = 'filtros-container';
  container.style.cssText = `
    background: var(--bg-overlay);
    backdrop-filter: blur(15px);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: var(--space-xl);
    margin-bottom: var(--space-xl);
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
  `;
  
  container.innerHTML = `
    <h3 style="margin-bottom: var(--space-lg); color: var(--text-primary);">
      🔍 Filtros de Busca
    </h3>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg);">
      <div class="filtro-group">
        <label for="filtroStatus">Status</label>
        <select id="filtroStatus" class="filtro-select">
          <option value="">Todos os Status</option>
          <option value="sucesso">✅ Sucesso</option>
          <option value="erro">❌ Erro</option>
          <option value="processando">⏳ Processando</option>
          <option value="pendente">📋 Pendente</option>
        </select>
      </div>
      
      <div class="filtro-group">
        <label for="filtroData">Data</label>
        <select id="filtroData" class="filtro-select">
          <option value="">Todas as Datas</option>
          <option value="hoje">📅 Hoje</option>
          <option value="semana">📅 Esta Semana</option>
          <option value="mes">📅 Este Mês</option>
          <option value="custom">📅 Personalizada</option>
        </select>
      </div>
      
      <div class="filtro-group">
        <label for="filtroArquivo">Nome do Arquivo</label>
        <input 
          type="text" 
          id="filtroArquivo" 
          class="filtro-input"
          placeholder="Buscar por nome do arquivo..."
        />
      </div>
      
      <div class="filtro-actions">
        <button id="btnLimparFiltros" class="btn-secondary" style="width: 100%;">
          🗑️ Limpar Filtros
        </button>
      </div>
    </div>
    
    <div id="filtroDataPersonalizada" class="filtro-datas" style="display: none; margin-top: var(--space-lg);">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md);">
        <div>
          <label for="dataInicio">Data Início</label>
          <input type="date" id="dataInicio" class="filtro-input" />
        </div>
        <div>
          <label for="dataFim">Data Fim</label>
          <input type="date" id="dataFim" class="filtro-input" />
        </div>
      </div>
    </div>
  `;
  
  // Inserir antes da tabela
  const table = document.querySelector('.table');
  if (table) {
    table.parentNode.insertBefore(container, table);
    
    // Animar entrada
    setTimeout(() => {
      container.style.opacity = '1';
      container.style.transform = 'translateY(0)';
    }, 200);
  }
  
  // Adicionar estilos dos filtros
  const style = document.createElement('style');
  style.textContent = `
    .filtro-group {
      display: flex;
      flex-direction: column;
    }
    
    .filtro-group label {
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: var(--space-sm);
      font-size: 0.875rem;
    }
    
    .filtro-select,
    .filtro-input {
      padding: var(--space-md);
      border: 2px solid transparent;
      border-radius: var(--radius-lg);
      background: var(--bg-secondary);
      color: var(--text-primary);
      transition: all var(--transition-normal);
      font-family: inherit;
    }
    
    .filtro-select:focus,
    .filtro-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
    
    .filtro-actions {
      display: flex;
      align-items: end;
    }
    
    .filtro-datas {
      padding-top: var(--space-lg);
      border-top: 1px solid var(--border-light);
      animation: fadeInUp 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// Função para criar tabela animada com paginação
function criarTabelaHistorico(dados) {
  const tableBody = document.querySelector('#historicoTable tbody');
  const tableContainer = document.querySelector('#historicoTable');
  
  if (!tableBody) return;
  
  // Limpar conteúdo anterior
  tableBody.innerHTML = '';
  tableContainer.parentElement.style.opacity = '0';
  
  if (!dados || dados.length === 0) {
    // Mostrar estado vazio
    const emptyState = document.createElement('tr');
    emptyState.innerHTML = `
      <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <div style="font-size: 3rem; margin-bottom: 1rem;">📂</div>
        <h3 style="margin: 0 0 0.5rem; color: var(--text-secondary);">Nenhum histórico encontrado</h3>
        <p style="margin: 0;">Tente ajustar os filtros ou fazer um novo envio.</p>
      </td>
    `;
    tableBody.appendChild(emptyState);
    
    setTimeout(() => {
      tableContainer.parentElement.style.opacity = '1';
    }, 300);
    return;
  }
  
  // Criar linhas com animação
  dados.forEach((item, index) => {
    const row = document.createElement('tr');
    row.style.cssText = `
      opacity: 0;
      transform: translateX(-20px);
      transition: all 0.4s ease-out ${index * 0.05}s;
    `;
    
    // Determinar status e badge
    let statusClass = 'pending';
    let statusIcon = '📋';
    let statusText = 'Pendente';
    
    if (item.status === 'sucesso' || item.status === 'completed') {
      statusClass = 'success';
      statusIcon = '✅';
      statusText = 'Sucesso';
    } else if (item.status === 'erro' || item.status === 'error') {
      statusClass = 'error';
      statusIcon = '❌';
      statusText = 'Erro';
    } else if (item.status === 'processando' || item.status === 'processing') {
      statusClass = 'warning';
      statusIcon = '⏳';
      statusText = 'Processando';
    }
    
    // Criar ações baseadas no status
    let acoes = '';
    if (item.status === 'sucesso' || item.status === 'completed') {
      acoes = `
        <button class="btn-download" data-protocolo="${item.protocolo}" title="Download">
          📥
        </button>
      `;
    }
    
    row.innerHTML = `
      <td>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.2rem;">📄</span>
          <span style="font-weight: 500; color: var(--text-primary);">${item.arquivo || 'Arquivo'}</span>
        </div>
      </td>
      <td>
        <span style="color: var(--text-secondary); font-size: 0.875rem;">
          ${item.data ? new Date(item.data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : '-'}
        </span>
      </td>
      <td>
        <code style="
          background: rgba(99, 102, 241, 0.1);
          color: var(--primary);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          font-weight: 600;
        ">${item.protocolo || '-'}</code>
      </td>
      <td>
        <span class="badge ${statusClass}" style="display: inline-flex; align-items: center; gap: 0.25rem;">
          <span>${statusIcon}</span>
          <span>${statusText}</span>
        </span>
      </td>
      <td>
        <div style="display: flex; gap: 0.25rem; align-items: center;">
          <button class="btn-acao" data-protocolo="${item.protocolo}" title="Ver detalhes">
            👁️
          </button>
          ${acoes}
        </div>
      </td>
    `;
    
    // Adicionar event listeners para as ações
    const btnAcao = row.querySelector('.btn-acao');
    const btnDownload = row.querySelector('.btn-download');
    
    if (btnAcao) {
      btnAcao.addEventListener('click', () => mostrarDetalhes(item));
    }
    
    if (btnDownload) {
      btnDownload.addEventListener('click', () => downloadArquivo(item.protocolo));
    }
    
    // Adicionar hover effects
    row.addEventListener('mouseenter', function() {
      this.style.background = 'rgba(99, 102, 241, 0.05)';
      this.style.transform = 'scale(1.01)';
    });
    
    row.addEventListener('mouseleave', function() {
      this.style.background = '';
      this.style.transform = 'scale(1)';
    });
    
    tableBody.appendChild(row);
    
    // Animar entrada
    setTimeout(() => {
      row.style.opacity = '1';
      row.style.transform = 'translateX(0)';
    }, 100 + (index * 50));
  });
  
  // Animar container da tabela
  setTimeout(() => {
    tableContainer.parentElement.style.opacity = '1';
    tableContainer.parentElement.style.transform = 'translateY(0)';
  }, 300);
}

// Função para mostrar detalhes em modal
function mostrarDetalhes(dados) {
  const modal = document.createElement('div');
  modal.className = 'modal-detalhes';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  `;
  
  const modalContent = document.createElement('div');
  modalContent.className = 'modal-content';
  modalContent.style.cssText = `
    background: var(--bg-overlay);
    backdrop-filter: blur(20px);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-xl);
    padding: var(--space-2xl);
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    animation: scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: var(--shadow-xl);
  `;
  
  modalContent.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-xl);">
      <h3 style="margin: 0; color: var(--text-primary);">📋 Detalhes do Envio</h3>
      <button class="btn-fechar" style="
        background: none;
        border: none;
        font-size: 1.5rem;
        color: var(--text-muted);
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 0.25rem;
        transition: all 0.2s ease-out;
      ">&times;</button>
    </div>
    
    <div style="display: grid; gap: 1rem;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <strong style="color: var(--text-secondary);">Arquivo:</strong>
          <p style="margin: 0.25rem 0 0; font-weight: 500;">${dados.arquivo || 'Não informado'}</p>
        </div>
        <div>
          <strong style="color: var(--text-secondary);">Protocolo:</strong>
          <p style="margin: 0.25rem 0 0; font-family: monospace; color: var(--primary);">${dados.protocolo}</p>
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <strong style="color: var(--text-secondary);">Status:</strong>
          <p style="margin: 0.25rem 0 0;">
            <span class="badge ${dados.status === 'sucesso' ? 'success' : dados.status === 'erro' ? 'error' : 'warning'}">
              ${dados.status === 'sucesso' ? '✅ Sucesso' : dados.status === 'erro' ? '❌ Erro' : '⏳ Processando'}
            </span>
          </p>
        </div>
        <div>
          <strong style="color: var(--text-secondary);">Data de Envio:</strong>
          <p style="margin: 0.25rem 0 0; font-weight: 500;">
            ${dados.data ? new Date(dados.data).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Não informado'}
          </p>
        </div>
      </div>
      
      ${dados.mensagem ? `
      <div>
        <strong style="color: var(--text-secondary);">Mensagem:</strong>
        <div style="
          margin: 0.5rem 0 0;
          padding: 1rem;
          background: rgba(99, 102, 241, 0.05);
          border-radius: 0.5rem;
          border-left: 3px solid var(--primary);
          font-size: 0.875rem;
          line-height: 1.5;
        ">
          ${dados.mensagem}
        </div>
      </div>
      ` : ''}
      
      ${dados.tamanho ? `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <div>
          <strong style="color: var(--text-secondary);">Tamanho:</strong>
          <p style="margin: 0.25rem 0 0; font-weight: 500;">
            ${formatarTamanho(dados.tamanho)}
          </p>
        </div>
        <div>
          <strong style="color: var(--text-secondary);">Tipo:</strong>
          <p style="margin: 0.25rem 0 0; font-weight: 500;">
            ${dados.tipo || 'xlsx'}
          </p>
        </div>
      </div>
      ` : ''}
    </div>
  `;
  
  // Adicionar event listeners
  modal.querySelector('.btn-fechar').addEventListener('click', () => {
    modal.style.animation = 'fadeIn 0.3s ease-out reverse';
    modalContent.style.animation = 'scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) reverse';
    setTimeout(() => modal.remove(), 300);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.querySelector('.btn-fechar').click();
    }
  });
  
  document.body.appendChild(modal);
}

// Função para formatar tamanho de arquivo
function formatarTamanho(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para download de arquivo
function downloadArquivo(protocolo) {
  // Mostrar loading
  const btn = document.querySelector(`[data-protocolo="${protocolo}"].btn-download`);
  if (btn) {
    btn.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;
  }
  
  // Simular download
  setTimeout(() => {
    // Criar link de download simulado
    const link = document.createElement('a');
    link.href = `#download-${protocolo}`;
    link.download = `arquivo-${protocolo}.xlsx`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Mostrar sucesso
    if (btn) {
      btn.innerHTML = '✅';
      setTimeout(() => {
        btn.innerHTML = '📥';
        btn.disabled = false;
      }, 2000);
    }
    
    // Toast de sucesso
    if (window.authJS && window.authJS.mostrarToast) {
      window.authJS.mostrarToast('Download iniciado com sucesso!', 'success');
    }
  }, 1000);
}

// Função para aplicar filtros
function aplicarFiltros() {
  const filtros = {
    status: document.getElementById('filtroStatus')?.value || '',
    data: document.getElementById('filtroData')?.value || '',
    arquivo: document.getElementById('filtroArquivo')?.value.toLowerCase() || '',
    dataInicio: document.getElementById('dataInicio')?.value || '',
    dataFim: document.getElementById('dataFim')?.value || ''
  };
  
  // Simular filtragem
  carregarHistorico(filtros);
}

// Função para carregar dados do histórico
async function carregarHistorico(filtros = {}) {
  if (!verificarAuth()) return;
  
  const token = localStorage.getItem("token");
  
  try {
    // Mostrar loading na tabela
    const tbody = document.querySelector('#historicoTable tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem;">
            <div class="spinner" style="margin: 0 auto 1rem;"></div>
            <p style="color: var(--text-secondary);">Carregando histórico...</p>
          </td>
        </tr>
      `;
    }
    
    // Simular dados do histórico (em produção, viria da API)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const dadosSimulados = [
      {
        arquivo: 'planilha_vendas_janeiro.xlsx',
        data: new Date('2024-01-15'),
        protocolo: 'ABC123',
        status: 'sucesso',
        mensagem: 'Processamento concluído com sucesso',
        tamanho: 2048576,
        tipo: 'xlsx'
      },
      {
        arquivo: 'relatorio_financeiro.xlsx',
        data: new Date('2024-01-14'),
        protocolo: 'DEF456',
        status: 'erro',
        mensagem: 'Erro na validação dos dados',
        tamanho: 1536000,
        tipo: 'xlsx'
      },
      {
        arquivo: 'dados_colaboradores.xlsx',
        data: new Date('2024-01-13'),
        protocolo: 'GHI789',
        status: 'processando',
        mensagem: 'Processando arquivo...',
        tamanho: 3072000,
        tipo: 'xlsx'
      }
    ];
    
    // Aplicar filtros
    let dadosFiltrados = dadosSimulados;
    
    if (filtros.status) {
      dadosFiltrados = dadosFiltrados.filter(item => item.status === filtros.status);
    }
    
    if (filtros.arquivo) {
      dadosFiltrados = dadosFiltrados.filter(item => 
        item.arquivo.toLowerCase().includes(filtros.arquivo)
      );
    }
    
    if (filtros.dataInicio && filtros.dataFim) {
      const dataInicio = new Date(filtros.dataInicio);
      const dataFim = new Date(filtros.dataFim);
      dadosFiltrados = dadosFiltrados.filter(item => {
        const dataItem = new Date(item.data);
        return dataItem >= dataInicio && dataItem <= dataFim;
      });
    }
    
    criarTabelaHistorico(dadosFiltrados);
    
  } catch (error) {
    console.error('Erro ao carregar histórico:', error);
    
    const tbody = document.querySelector('#historicoTable tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--error);">
            ❌ Erro ao carregar histórico
          </td>
        </tr>
      `;
    }
    
    if (window.authJS && window.authJS.mostrarToast) {
      window.authJS.mostrarToast('Erro ao carregar histórico', 'error');
    }
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  if (!verificarAuth()) return;
  
  // Adicionar estilos CSS adicionais
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    .btn-acao {
      background: var(--gradient-primary);
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease-out;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-acao:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-md);
    }
    
    .btn-download {
      background: var(--gradient-secondary);
      color: white;
      border: none;
      padding: 0.5rem;
      border-radius: 0.375rem;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s ease-out;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-download:hover {
      transform: scale(1.1);
      box-shadow: var(--shadow-md);
    }
    
    .modal-content {
      max-width: none;
      margin: 2rem;
    }
  `;
  document.head.appendChild(style);
  
  // Configurar funcionalidades
  animarElementosEntrada();
  criarFiltros();
  carregarHistorico();
  
  // Event listeners para filtros
  const filtroStatus = document.getElementById('filtroStatus');
  const filtroData = document.getElementById('filtroData');
  const filtroArquivo = document.getElementById('filtroArquivo');
  const dataInicio = document.getElementById('dataInicio');
  const dataFim = document.getElementById('dataFim');
  const btnLimpar = document.getElementById('btnLimparFiltros');
  
  [filtroStatus, filtroData, filtroArquivo].forEach(elemento => {
    if (elemento) {
      elemento.addEventListener('input', aplicarFiltros);
      elemento.addEventListener('change', aplicarFiltros);
    }
  });
  
  if (filtroData) {
    filtroData.addEventListener('change', function() {
      const containerData = document.getElementById('filtroDataPersonalizada');
      if (containerData) {
        containerData.style.display = this.value === 'custom' ? 'block' : 'none';
      }
    });
  }
  
  [dataInicio, dataFim].forEach(elemento => {
    if (elemento) {
      elemento.addEventListener('change', aplicarFiltros);
    }
  });
  
  if (btnLimpar) {
    btnLimpar.addEventListener('click', function() {
      document.getElementById('filtroStatus').value = '';
      document.getElementById('filtroData').value = '';
      document.getElementById('filtroArquivo').value = '';
      document.getElementById('dataInicio').value = '';
      document.getElementById('dataFim').value = '';
      document.getElementById('filtroDataPersonalizada').style.display = 'none';
      
      aplicarFiltros();
      
      this.style.animation = 'bounce 0.6s ease-out';
      setTimeout(() => {
        this.style.animation = '';
      }, 600);
    });
  }
});

// Exportar funções
window.historicoJS = {
  carregarHistorico,
  mostrarDetalhes,
  downloadArquivo,
  aplicarFiltros
};