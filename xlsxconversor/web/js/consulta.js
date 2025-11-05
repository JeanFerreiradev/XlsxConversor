// ===== CONSULTA JAVASCRIPT COM ANIMAÇÕES E INTERAÇÕES =====

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
    { selector: 'form', animation: 'fadeInLeft', delay: 0.2 },
    { selector: '#resultadoConsulta', animation: 'fadeInUp', delay: 0.4 }
  ];
  
  elementos.forEach(({ selector, animation, delay }) => {
    const elemento = document.querySelector(selector);
    if (elemento) {
      elemento.style.opacity = '0';
      elemento.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        elemento.style.animation = `${animation} 0.6s ease-out forwards`;
        elemento.style.opacity = '1';
        elemento.style.transform = 'translateY(0)';
      }, delay * 1000);
    }
  });
}

// Função para adicionar validação visual em tempo real
function adicionarValidacaoTempoReal() {
  const inputProtocolo = document.getElementById('protocolo');
  const form = document.getElementById('consultaForm');
  
  if (!inputProtocolo || !form) return;
  
  inputProtocolo.addEventListener('input', function() {
    const valor = this.value.trim();
    
    // Remover classes anteriores
    this.classList.remove('valid', 'invalid');
    
    if (valor.length === 0) {
      return; // Não validar campo vazio
    }
    
    // Validação básica: pelo menos 6 caracteres alfanuméricos
    const protocoloRegex = /^[A-Za-z0-9]{6,}$/;
    
    if (protocoloRegex.test(valor)) {
      this.classList.add('valid');
      this.style.borderColor = 'var(--success)';
    } else {
      this.classList.add('invalid');
      this.style.borderColor = 'var(--error)';
    }
  });
  
  // Validação no blur
  inputProtocolo.addEventListener('blur', function() {
    const valor = this.value.trim();
    
    if (valor.length === 0) {
      this.style.borderColor = '';
      this.classList.remove('valid', 'invalid');
      return;
    }
    
    const protocoloRegex = /^[A-Za-z0-9]{6,}$/;
    
    if (!protocoloRegex.test(valor)) {
      this.style.animation = 'shake 0.5s ease-out';
      this.style.borderColor = 'var(--error)';
      
      // Mostrar tooltip de erro
      mostrarTooltip(this, 'Formato inválido. Use apenas letras e números (mínimo 6 caracteres)');
      
      setTimeout(() => {
        this.style.animation = '';
      }, 500);
    }
  });
}

// Função para mostrar tooltip
function mostrarTooltip(elemento, texto) {
  // Remover tooltip anterior se existir
  const tooltipExistente = document.querySelector('.tooltip');
  if (tooltipExistente) {
    tooltipExistente.remove();
  }
  
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';
  tooltip.textContent = texto;
  tooltip.style.cssText = `
    position: absolute;
    background: rgba(239, 68, 68, 0.9);
    color: white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    white-space: nowrap;
    z-index: 1000;
    animation: fadeInUp 0.3s ease-out;
    backdrop-filter: blur(10px);
  `;
  
  const rect = elemento.getBoundingClientRect();
  tooltip.style.left = rect.left + 'px';
  tooltip.style.top = (rect.bottom + 5) + 'px';
  
  document.body.appendChild(tooltip);
  
  // Remover após 3 segundos
  setTimeout(() => {
    tooltip.style.animation = 'fadeInUp 0.3s ease-out reverse';
    setTimeout(() => {
      tooltip.remove();
    }, 300);
  }, 3000);
}

// Função para animar formulário
function animarFormulario() {
  const form = document.querySelector('form');
  const inputs = document.querySelectorAll('input, button');
  
  if (form) {
    // Animar container do form
    form.style.opacity = '0';
    form.style.transform = 'translateX(-30px)';
    
    setTimeout(() => {
      form.style.opacity = '1';
      form.style.transform = 'translateX(0)';
      form.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 200);
  }
  
  // Animar inputs sequencialmente
  inputs.forEach((input, index) => {
    input.style.opacity = '0';
    input.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      input.style.opacity = '1';
      input.style.transform = 'translateY(0)';
      input.style.transition = 'all 0.4s ease-out';
    }, 300 + (index * 100));
  });
}

// Função para processar consulta com animação
async function processarConsulta(event) {
  event.preventDefault();
  
  const inputProtocolo = document.getElementById('protocolo');
  const resultadoConsulta = document.getElementById('resultadoConsulta');
  const form = document.getElementById('consultaForm');
  
  if (!inputProtocolo || !resultadoConsulta) return;
  
  const protocolo = inputProtocolo.value.trim();
  
  if (!protocolo) {
    mostrarErro('Por favor, insira um número de protocolo');
    return;
  }
  
  // Feedback visual de loading
  form.classList.add('loading');
  inputProtocolo.disabled = true;
  
  // Animar loading no resultado
  resultadoConsulta.innerHTML = `
    <div class="status-box loading">
      <div style="text-align: center; padding: 2rem;">
        <div class="spinner" style="width: 40px; height: 40px; margin: 0 auto 1rem;"></div>
        <p style="color: var(--text-secondary);">Consultando protocolo...</p>
      </div>
    </div>
  `;
  
  resultadoConsulta.style.opacity = '0';
  resultadoConsulta.style.transform = 'translateY(20px)';
  
  // Animar entrada do loading
  setTimeout(() => {
    resultadoConsulta.style.opacity = '1';
    resultadoConsulta.style.transform = 'translateY(0)';
    resultadoConsulta.style.transition = 'all 0.4s ease-out';
  }, 100);
  
  try {
    const token = localStorage.getItem("token");
    
    // Simular delay de consulta
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = await fetch(`/api/consulta/${protocolo}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dados = await response.json();
    
    // Animar remoção do loading
    resultadoConsulta.style.opacity = '0';
    resultadoConsulta.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
      if (response.ok && dados) {
        mostrarResultadoSucesso(dados, protocolo);
      } else {
        mostrarResultadoErro(protocolo);
      }
      
      // Animar entrada do resultado
      resultadoConsulta.style.opacity = '1';
      resultadoConsulta.style.transform = 'translateY(0)';
      resultadoConsulta.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    }, 300);
    
  } catch (error) {
    console.error('Erro na consulta:', error);
    
    setTimeout(() => {
      resultadoConsulta.style.opacity = '0';
      resultadoConsulta.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        mostrarResultadoErro(protocolo, 'Erro de conexão. Tente novamente.');
        resultadoConsulta.style.opacity = '1';
        resultadoConsulta.style.transform = 'translateY(0)';
      }, 300);
    }, 300);
  } finally {
    // Remover loading
    form.classList.remove('loading');
    inputProtocolo.disabled = false;
  }
}

// Função para mostrar resultado de sucesso
function mostrarResultadoSucesso(dados, protocolo) {
  const resultadoConsulta = document.getElementById('resultadoConsulta');
  
  const statusClass = dados.status === 'sucesso' ? 'success' : 
                     dados.status === 'erro' ? 'error' : 'warning';
  
  const statusIcon = dados.status === 'sucesso' ? '✅' :
                    dados.status === 'erro' ? '❌' : '⏳';
  
  const statusText = dados.status === 'sucesso' ? 'Processado com Sucesso' :
                    dados.status === 'erro' ? 'Erro no Processamento' : 'Em Processamento';
  
  resultadoConsulta.innerHTML = `
    <div class="status-box ${statusClass}" style="animation: scaleIn 0.5s ease-out;">
      <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
        <div style="font-size: 2rem;">${statusIcon}</div>
        <div>
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600;">
            Protocolo ${protocolo}
          </h3>
          <p style="margin: 0.25rem 0 0; color: var(--text-secondary);">
            ${statusText}
          </p>
        </div>
      </div>
      
      <div style="display: grid; gap: 1rem; margin-top: 1.5rem;">
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;">
          <span style="font-weight: 500;">Arquivo:</span>
          <span>${dados.arquivo || 'Não informado'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;">
          <span style="font-weight: 500;">Data de Envio:</span>
          <span>${dados.dataEnvio ? new Date(dados.dataEnvio).toLocaleDateString('pt-BR') : 'Não informado'}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem;">
          <span style="font-weight: 500;">Última Atualização:</span>
          <span>${dados.ultimaAtualizacao ? new Date(dados.ultimaAtualizacao).toLocaleDateString('pt-BR') : 'Não informado'}</span>
        </div>
        ${dados.mensagem ? `
        <div style="padding: 0.75rem; background: rgba(255,255,255,0.1); border-radius: 0.5rem; border-left: 3px solid var(--primary);">
          <span style="font-weight: 500;">Detalhes:</span>
          <p style="margin: 0.5rem 0 0;">${dados.mensagem}</p>
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Função para mostrar resultado de erro
function mostrarResultadoErro(protocolo, mensagem = 'Protocolo não encontrado') {
  const resultadoConsulta = document.getElementById('resultadoConsulta');
  
  resultadoConsulta.innerHTML = `
    <div class="status-box error" style="animation: scaleIn 0.5s ease-out;">
      <div style="display: flex; align-items: center; gap: 1rem;">
        <div style="font-size: 2rem;">❌</div>
        <div>
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: var(--error);">
            Erro na Consulta
          </h3>
          <p style="margin: 0.5rem 0 0; color: var(--text-secondary);">
            ${mensagem}
          </p>
        </div>
      </div>
      
      <div style="margin-top: 1.5rem; padding: 1rem; background: rgba(239, 68, 68, 0.1); border-radius: 0.5rem; border-left: 3px solid var(--error);">
        <p style="margin: 0; font-size: 0.875rem; color: var(--error);">
          <strong>Protocolo consultado:</strong> ${protocolo}
        </p>
      </div>
    </div>
  `;
}

// Função para mostrar erro genérico
function mostrarErro(mensagem) {
  const inputProtocolo = document.getElementById('protocolo');
  const form = document.getElementById('consultaForm');
  
  if (!inputProtocolo || !form) return;
  
  // Animar shake no input
  inputProtocolo.style.animation = 'shake 0.5s ease-out';
  inputProtocolo.style.borderColor = 'var(--error)';
  
  // Mostrar tooltip
  mostrarTooltip(inputProtocolo, mensagem);
  
  // Remover animação após 500ms
  setTimeout(() => {
    inputProtocolo.style.animation = '';
    inputProtocolo.style.borderColor = '';
  }, 500);
}

// Função para adicionar sugestões de protocolo
function adicionarSugestoes() {
  const inputProtocolo = document.getElementById('protocolo');
  
  if (!inputProtocolo) return;
  
  // Simular dados de protocolos anteriores (em produção, viria da API)
  const protocolosAnteriores = ['ABC123', 'DEF456', 'GHI789', 'JKL012', 'MNO345'];
  
  inputProtocolo.addEventListener('input', function() {
    const valor = this.value.toLowerCase();
    
    // Remover sugestões anteriores
    const sugestaoExistente = document.querySelector('.sugestoes');
    if (sugestaoExistente) {
      sugestaoExistente.remove();
    }
    
    if (valor.length >= 2) {
      const sugestoes = protocolosAnteriores.filter(p => 
        p.toLowerCase().includes(valor)
      );
      
      if (sugestoes.length > 0) {
        const container = document.createElement('div');
        container.className = 'sugestoes';
        container.style.cssText = `
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-overlay);
          backdrop-filter: blur(15px);
          border: 1px solid var(--border-light);
          border-radius: 0 0 0.5rem 0.5rem;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          animation: fadeInUp 0.3s ease-out;
        `;
        
        sugestoes.forEach(sugestao => {
          const item = document.createElement('div');
          item.textContent = sugestao;
          item.style.cssText = `
            padding: 0.75rem 1rem;
            cursor: pointer;
            transition: background 0.2s ease-out;
            border-bottom: 1px solid var(--border-light);
          `;
          
          item.addEventListener('mouseenter', function() {
            this.style.background = 'rgba(99, 102, 241, 0.1)';
          });
          
          item.addEventListener('mouseleave', function() {
            this.style.background = '';
          });
          
          item.addEventListener('click', function() {
            inputProtocolo.value = sugestao;
            container.remove();
            inputProtocolo.focus();
          });
          
          container.appendChild(item);
        });
        
        // Posicionar container
        const form = document.getElementById('consultaForm');
        const rect = inputProtocolo.getBoundingClientRect();
        const formRect = form.getBoundingClientRect();
        
        container.style.left = (rect.left - formRect.left) + 'px';
        container.style.width = rect.width + 'px';
        
        form.appendChild(container);
      }
    }
  });
  
  // Remover sugestões ao clicar fora
  document.addEventListener('click', function(e) {
    if (!e.target.closest('#consultaForm')) {
      const sugestaoExistente = document.querySelector('.sugestoes');
      if (sugestaoExistente) {
        sugestaoExistente.remove();
      }
    }
  });
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
    
    .form-group {
      position: relative;
    }
    
    input.valid {
      border-color: var(--success) !important;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1) !important;
    }
    
    input.invalid {
      border-color: var(--error) !important;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .tooltip {
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
  
  // Configurar funcionalidades
  animarElementosEntrada();
  adicionarValidacaoTempoReal();
  adicionarSugestoes();
  
  // Event listener para o formulário
  const form = document.getElementById('consultaForm');
  if (form) {
    form.addEventListener('submit', processarConsulta);
  }
  
  // Animar entrada do formulário
  setTimeout(() => {
    animarFormulario();
  }, 500);
});

// Exportar funções
window.consultaJS = {
  processarConsulta,
  mostrarResultadoSucesso,
  mostrarResultadoErro
};