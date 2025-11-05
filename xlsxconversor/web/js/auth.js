// ===== AUTH JAVASCRIPT MELHORADO COM ANIMAÇÕES =====

// Função para verificar se o usuário está logado
function verificarLogin() {
  const token = localStorage.getItem("token");
  if (!token) {
    // Animação de saída suave antes de redirecionar
    document.body.style.opacity = '0';
    setTimeout(() => {
      window.location = "index.html";
    }, 300);
    return false;
  }
  return true;
}

// Função para fazer logout com animação
function fazerLogout() {
  // Remover token do localStorage
  localStorage.removeItem("token");
  
  // Animação de logout
  const topbar = document.querySelector('.topbar');
  const container = document.querySelector('.container');
  
  if (topbar) {
    topbar.style.animation = 'fadeInDown 0.3s ease-out reverse';
  }
  
  if (container) {
    container.style.animation = 'fadeInUp 0.3s ease-out reverse';
  }
  
  // Redirecionar após a animação
  setTimeout(() => {
    window.location = "index.html";
  }, 300);
}

// Função para animar elementos quando carregam
function animarElementos() {
  const elementos = document.querySelectorAll('.card, .card-stat, .topbar nav a');
  
  elementos.forEach((elemento, index) => {
    elemento.style.opacity = '0';
    elemento.style.transform = 'translateY(20px)';
    elemento.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    
    setTimeout(() => {
      elemento.style.opacity = '1';
      elemento.style.transform = 'translateY(0)';
      elemento.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`;
    }, 100);
  });
}

// Função para animar números (contadores)
function animarNumeros() {
  const numeros = document.querySelectorAll('.card-value');
  
  numeros.forEach(numero => {
    const valorFinal = numero.textContent;
    const numeroFinal = parseInt(valorFinal.replace(/\D/g, '')) || 0;
    
    if (numeroFinal > 0) {
      let valorAtual = 0;
      const incremento = Math.ceil(numeroFinal / 50);
      const timer = setInterval(() => {
        valorAtual += incremento;
        if (valorAtual >= numeroFinal) {
          valorAtual = numeroFinal;
          clearInterval(timer);
        }
        numero.textContent = valorAtual.toLocaleString('pt-BR');
        numero.classList.add('counting');
      }, 20);
    }
  });
}

// Função para adicionar efeito ripple aos botões
function adicionarEfeitoRipple() {
  const botoes = document.querySelectorAll('button');
  
  botoes.forEach(botao => {
    botao.addEventListener('click', function(e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
      `;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        ripple.remove();
      }, 600);
    });
  });
}

// Função para animar navegação do menu
function animarNavegacao() {
  const links = document.querySelectorAll('.topbar nav a');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      // Remover animação de todos os outros links
      links.forEach(l => l.classList.remove('active'));
      
      // Adicionar animação ao link clicado
      this.classList.add('active');
      
      // Adicionar efeito visual
      this.style.transform = 'translateY(-2px) scale(1.05)';
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
      
      setTimeout(() => {
        this.style.transform = 'translateY(0) scale(1)';
      }, 300);
    });
  });
}

// Função para adicionar feedback visual de loading
function adicionarFeedbackLoading(elemento) {
  const textoOriginal = elemento.textContent;
  const textoOriginalDisabled = elemento.disabled;
  
  elemento.textContent = 'Carregando...';
  elemento.disabled = true;
  elemento.classList.add('loading');
  
  // Adicionar spinner
  const spinner = document.createElement('span');
  spinner.className = 'spinner';
  elemento.appendChild(spinner);
  
  return {
    finish: function(sucesso = true) {
      elemento.textContent = textoOriginal;
      elemento.disabled = textoOriginalDisabled;
      elemento.classList.remove('loading');
      spinner.remove();
      
      if (sucesso) {
        elemento.style.background = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
        setTimeout(() => {
          elemento.style.background = '';
        }, 2000);
      } else {
        elemento.style.background = 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)';
        setTimeout(() => {
          elemento.style.background = '';
        }, 2000);
      }
    }
  };
}

// Função para destacar elementos em foco
function destacarElementoEmFoco() {
  const inputs = document.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'translateY(-2px)';
      this.parentElement.style.transition = 'all 0.3s ease-out';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = 'translateY(0)';
    });
  });
}

// Função para adicionar scroll suave
function adicionarScrollSuave() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const destino = document.querySelector(this.getAttribute('href'));
      
      if (destino) {
        destino.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Função para detectar elementos visíveis
function detectarElementosVisiveis() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        entry.target.style.opacity = '1';
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  const elementos = document.querySelectorAll('.card, .card-stat, .status-box');
  elementos.forEach(el => {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

// Inicialização automática quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  // Configurar logout se existir botão
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', fazerLogout);
  }
  
  // Adicionar todas as animações e efeitos
  setTimeout(() => {
    animarElementos();
    adicionarEfeitoRipple();
    animarNavegacao();
    destacarElementoEmFoco();
    adicionarScrollSuave();
    detectarElementosVisiveis();
    
    // Animar números se estiver na página dashboard
    if (document.querySelector('.card-value')) {
      setTimeout(() => {
        animarNumeros();
      }, 800);
    }
  }, 100);
});

// Função para theme toggle (para futuras implementações)
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Função para adicionar toast notifications
function mostrarToast(mensagem, tipo = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    z-index: 9999;
    transform: translateX(100%);
    transition: transform 0.3s ease-out;
    backdrop-filter: blur(10px);
  `;
  
  // Cores baseadas no tipo
  const cores = {
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    info: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'
  };
  
  if (cores[tipo]) {
    toast.style.background = cores[tipo];
  }
  
  toast.textContent = mensagem;
  document.body.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remover após 3 segundos
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Exportar funções para uso global
window.authJS = {
  verificarLogin,
  fazerLogout,
  adicionarFeedbackLoading,
  mostrarToast,
  toggleTheme
};