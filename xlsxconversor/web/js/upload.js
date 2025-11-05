// ===== UPLOAD JAVASCRIPT COM ANIMAÇÕES E PROGRESS INDICATORS =====

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
    { selector: '.card', animation: 'fadeInUp', delay: 0.2 }
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

// Função para criar área de drop personalizada
function criarAreaDrop() {
  const fileInput = document.getElementById('arquivoBmp');
  const form = document.getElementById('uploadForm');
  
  if (!fileInput || !form) return;
  
  // Criar área de drop visual
  const dropArea = document.createElement('div');
  dropArea.className = 'drop-area';
  dropArea.style.cssText = `
    border: 2px dashed var(--primary);
    border-radius: var(--radius-xl);
    padding: 3rem 2rem;
    text-align: center;
    background: rgba(99, 102, 241, 0.05);
    transition: all var(--transition-normal);
    cursor: pointer;
    position: relative;
    margin-bottom: 2rem;
  `;
  
  dropArea.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary);">📤</div>
    <h3 style="margin: 0 0 0.5rem; color: var(--text-primary);">Arraste e solte seu arquivo aqui</h3>
    <p style="margin: 0 0 1rem; color: var(--text-secondary);">
      ou clique para selecionar um arquivo
    </p>
    <div style="
      background: var(--gradient-primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-lg);
      display: inline-block;
      font-weight: 500;
      font-size: 0.875rem;
    ">
      📄 Formatos aceitos: .xlsx, .xls
    </div>
  `;
  
  // Inserir antes do input
  const inputContainer = fileInput.closest('.form-group') || fileInput.parentNode;
  if (inputContainer) {
    inputContainer.parentNode.insertBefore(dropArea, inputContainer);
  }
  
  // Event listeners para drag and drop
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropArea.style.background = 'rgba(99, 102, 241, 0.1)';
    dropArea.style.borderColor = 'var(--primary-dark)';
    dropArea.style.transform = 'scale(1.02)';
  });
  
  dropArea.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropArea.style.background = 'rgba(99, 102, 241, 0.05)';
    dropArea.style.borderColor = 'var(--primary)';
    dropArea.style.transform = 'scale(1)';
  });
  
  dropArea.addEventListener('drop', (e) => {
    e.preventDefault();
    dropArea.style.background = 'rgba(99, 102, 241, 0.05)';
    dropArea.style.borderColor = 'var(--primary)';
    dropArea.style.transform = 'scale(1)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  });
  
  // Click para abrir file picker
  dropArea.addEventListener('click', () => {
    fileInput.click();
  });
  
  // Atualizar file input para estar oculto
  fileInput.style.position = 'absolute';
  fileInput.style.left = '-9999px';
}

// Função para validar arquivo
function validarArquivo(file) {
  const tiposAceitos = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  const extensoesAceitas = ['.xlsx', '.xls'];
  const tamanhoMaximo = 50 * 1024 * 1024; // 50MB
  
  const validacoes = {
    valido: true,
    erros: []
  };
  
  // Validar tipo
  if (!tiposAceitos.includes(file.type) && !extensoesAceitas.some(ext => file.name.toLowerCase().endsWith(ext))) {
    validacoes.valido = false;
    validacoes.erros.push('Tipo de arquivo não aceito. Use apenas arquivos Excel (.xlsx, .xls)');
  }
  
  // Validar tamanho
  if (file.size > tamanhoMaximo) {
    validacoes.valido = false;
    validacoes.erros.push(`Arquivo muito grande. Tamanho máximo: ${formatarTamanho(tamanhoMaximo)}`);
  }
  
  return validacoes;
}

// Função para formatar tamanho
function formatarTamanho(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para mostrar feedback visual do arquivo selecionado
function mostrarArquivoSelecionado(file) {
  const dropArea = document.querySelector('.drop-area');
  if (!dropArea) return;
  
  dropArea.style.background = 'rgba(16, 185, 129, 0.1)';
  dropArea.style.borderColor = 'var(--success)';
  
  dropArea.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--success);">✅</div>
    <h3 style="margin: 0 0 0.5rem; color: var(--success);">Arquivo selecionado!</h3>
    <div style="
      background: white;
      padding: 1rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--success);
      margin: 1rem 0;
      text-align: left;
      box-shadow: var(--shadow-sm);
    ">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <span style="font-size: 2rem;">📄</span>
        <div style="flex: 1;">
          <div style="font-weight: 500; color: var(--text-primary);">${file.name}</div>
          <div style="color: var(--text-secondary); font-size: 0.875rem;">
            ${formatarTamanho(file.size)}
          </div>
        </div>
        <button id="btnRemoverArquivo" style="
          background: var(--error);
          color: white;
          border: none;
          padding: 0.5rem;
          border-radius: 0.375rem;
          cursor: pointer;
          font-size: 0.875rem;
        ">Remover</button>
      </div>
    </div>
    <div style="
      background: var(--gradient-primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-lg);
      display: inline-block;
      font-weight: 500;
      font-size: 0.875rem;
    ">
      🚀 Pronto para enviar
    </div>
  `;
  
  // Event listener para remover arquivo
  const btnRemover = document.getElementById('btnRemoverArquivo');
  if (btnRemover) {
    btnRemover.addEventListener('click', () => {
      resetarAreaDrop();
    });
  }
}

// Função para resetar área de drop
function resetarAreaDrop() {
  const dropArea = document.querySelector('.drop-area');
  const fileInput = document.getElementById('arquivoBmp');
  
  if (!dropArea || !fileInput) return;
  
  dropArea.style.background = 'rgba(99, 102, 241, 0.05)';
  dropArea.style.borderColor = 'var(--primary)';
  
  dropArea.innerHTML = `
    <div style="font-size: 3rem; margin-bottom: 1rem; color: var(--primary);">📤</div>
    <h3 style="margin: 0 0 0.5rem; color: var(--text-primary);">Arraste e solte seu arquivo aqui</h3>
    <p style="margin: 0 0 1rem; color: var(--text-secondary);">
      ou clique para selecionar um arquivo
    </p>
    <div style="
      background: var(--gradient-primary);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: var(--radius-lg);
      display: inline-block;
      font-weight: 500;
      font-size: 0.875rem;
    ">
      📄 Formatos aceitos: .xlsx, .xls
    </div>
  `;
  
  fileInput.value = '';
}

// Função para handle seleção de arquivo
function handleFileSelect(file) {
  const validacao = validarArquivo(file);
  
  if (!validacao.valido) {
    mostrarErro(validacao.erros[0]);
    return;
  }
  
  mostrarArquivoSelecionado(file);
}

// Função para criar progresso de upload animado
function criarProgressoUpload() {
  const statusBox = document.getElementById('statusUpload');
  if (!statusBox) return;
  
  statusBox.innerHTML = `
    <div class="upload-progress" style="
      background: var(--bg-overlay);
      backdrop-filter: blur(15px);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
    ">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div class="upload-icon" style="
          font-size: 2rem;
          animation: pulse 2s infinite;
        ">📤</div>
        <div style="flex: 1;">
          <h4 style="margin: 0; color: var(--text-primary);">Enviando arquivo...</h4>
          <p style="margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.875rem;">
            Aguarde enquanto processamos seu arquivo
          </p>
        </div>
      </div>
      
      <div class="progress-container">
        <div class="progress-bar" style="
          width: 0%;
          height: 8px;
          background: var(--gradient-primary);
          border-radius: 4px;
          transition: width 0.3s ease-out;
          position: relative;
          overflow: hidden;
        ">
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            animation: shimmer 1.5s infinite;
          "></div>
        </div>
        <div class="progress-text" style="
          text-align: center;
          margin-top: 0.5rem;
          font-weight: 500;
          color: var(--text-primary);
        ">0%</div>
      </div>
    </div>
  `;
}

// Função para atualizar progresso de upload
function atualizarProgressoUpload(porcentagem) {
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.querySelector('.progress-text');
  const uploadIcon = document.querySelector('.upload-icon');
  
  if (progressBar) {
    progressBar.style.width = `${porcentagem}%`;
  }
  
  if (progressText) {
    progressText.textContent = `${porcentagem}%`;
  }
  
  // Mudar ícone baseado no progresso
  if (uploadIcon) {
    if (porcentagem < 50) {
      uploadIcon.textContent = '📤';
      uploadIcon.style.animation = 'pulse 2s infinite';
    } else if (porcentagem < 100) {
      uploadIcon.textContent = '📋';
      uploadIcon.style.animation = 'pulse 1.5s infinite';
    } else {
      uploadIcon.textContent = '✅';
      uploadIcon.style.animation = 'bounce 0.6s ease-out';
    }
  }
}

// Função para mostrar resultado do upload
function mostrarResultadoUpload(resultado) {
  const statusBox = document.getElementById('statusUpload');
  if (!statusBox) return;
  
  const sucesso = !resultado.error;
  const icone = sucesso ? '✅' : '❌';
  const cor = sucesso ? 'var(--success)' : 'var(--error)';
  const titulo = sucesso ? 'Upload concluído com sucesso!' : 'Erro no upload';
  
  statusBox.innerHTML = `
    <div class="upload-result" style="
      background: var(--bg-overlay);
      backdrop-filter: blur(15px);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
      animation: scaleIn 0.5s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div style="
          font-size: 3rem;
          animation: ${sucesso ? 'bounce 0.6s ease-out' : 'scaleIn 0.3s ease-out'};
        ">${icone}</div>
        <div style="flex: 1;">
          <h4 style="margin: 0; color: ${cor};">${titulo}</h4>
          <p style="margin: 0.25rem 0 0; color: var(--text-secondary);">
            ${sucesso ? 'Seu arquivo foi processado com sucesso' : resultado.error || 'Ocorreu um erro durante o processamento'}
          </p>
        </div>
      </div>
      
      ${sucesso ? `
      <div style="
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid rgba(16, 185, 129, 0.3);
        border-radius: 0.75rem;
        padding: 1rem;
        margin-top: 1rem;
      ">
        <div style="display: grid; gap: 0.75rem;">
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Status:</span>
            <span style="font-weight: 500; color: var(--success);">✅ Processado</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">Protocolo:</span>
            <code style="
              background: rgba(16, 185, 129, 0.1);
              color: var(--primary);
              padding: 0.25rem 0.5rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
            ">${resultado.protocol || 'N/A'}</code>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-secondary);">ID:</span>
            <span style="font-family: monospace; color: var(--text-primary);">${resultado.id || 'N/A'}</span>
          </div>
        </div>
      </div>
      ` : ''}
      
      <div style="margin-top: 1.5rem; display: flex; gap: 0.75rem;">
        <button id="btnNovoUpload" style="
          background: var(--gradient-primary);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease-out;
        ">
          📤 Novo Upload
        </button>
        <button id="btnVerDashboard" style="
          background: transparent;
          color: var(--primary);
          border: 2px solid var(--primary);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-lg);
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease-out;
        ">
          📊 Ver Dashboard
        </button>
      </div>
    </div>
  `;
  
  // Event listeners para os botões
  const btnNovoUpload = document.getElementById('btnNovoUpload');
  const btnVerDashboard = document.getElementById('btnVerDashboard');
  
  if (btnNovoUpload) {
    btnNovoUpload.addEventListener('click', () => {
      resetarAreaDrop();
      statusBox.innerHTML = '';
    });
  }
  
  if (btnVerDashboard) {
    btnVerDashboard.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  }
}

// Função para mostrar erro
function mostrarErro(mensagem) {
  const statusBox = document.getElementById('statusUpload');
  if (!statusBox) return;
  
  statusBox.innerHTML = `
    <div style="
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      animation: shake 0.5s ease-out;
    ">
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="font-size: 1.5rem;">❌</div>
        <div>
          <h4 style="margin: 0; color: var(--error);">Erro</h4>
          <p style="margin: 0.25rem 0 0; color: var(--text-secondary);">${mensagem}</p>
        </div>
      </div>
    </div>
  `;
  
  // Animar shake no erro
  const erroElement = statusBox.querySelector('div');
  if (erroElement) {
    erroElement.style.animation = 'shake 0.5s ease-out';
  }
}

// Função para processar upload com animação
async function processarUpload(event) {
  event.preventDefault();
  
  const fileInput = document.getElementById('arquivoBmp');
  const statusBox = document.getElementById('statusUpload');
  
  if (!fileInput || !statusBox) return;
  
  const file = fileInput.files[0];
  if (!file) {
    mostrarErro('Selecione um arquivo para enviar.');
    return;
  }
  
  const validacao = validarArquivo(file);
  if (!validacao.valido) {
    mostrarErro(validacao.erros[0]);
    return;
  }
  
  // Criar FormData
  const formData = new FormData();
  formData.append("file", file);
  
  // Mostrar progresso de upload
  criarProgressoUpload();
  
  try {
    // Simular upload com progresso
    const token = localStorage.getItem("token");
    
    // Progresso simulado
    for (let i = 0; i <= 100; i += 10) {
      atualizarProgressoUpload(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Simular resposta da API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular resultado
    const resultado = {
      protocol: `PROT${Date.now()}`,
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: 'sucesso'
    };
    
    // Animar conclusão
    setTimeout(() => {
      mostrarResultadoUpload(resultado);
    }, 300);
    
  } catch (error) {
    console.error('Erro no upload:', error);
    
    setTimeout(() => {
      mostrarErro('Erro de conexão. Tente novamente.');
    }, 300);
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  if (!verificarAuth()) return;
  
  // Adicionar estilos CSS adicionais
  const style = document.createElement('style');
  style.textContent = `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .drop-area:hover {
      background: rgba(99, 102, 241, 0.1) !important;
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
    
    .upload-progress,
    .upload-result {
      animation: fadeInUp 0.5s ease-out;
    }
  `;
  document.head.appendChild(style);
  
  // Configurar funcionalidades
  animarElementosEntrada();
  criarAreaDrop();
  
  // Event listeners
  const fileInput = document.getElementById('arquivoBmp');
  const form = document.getElementById('uploadForm');
  
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }
  
  if (form) {
    form.addEventListener('submit', processarUpload);
  }
});

// Exportar funções
window.uploadJS = {
  handleFileSelect,
  mostrarArquivoSelecionado,
  resetarAreaDrop,
  processarUpload
};