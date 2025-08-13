// Lê dados do localStorage
const dados = JSON.parse(localStorage.getItem('controle-dados'));
if (!dados) {
  document.getElementById('controle-resultado').innerHTML = '<span style="color:#ef4444">Nenhum dado encontrado. Volte e preencha o formulário.</span>';
  document.getElementById('operacao-area').style.display = 'none';
  document.getElementById('placar-operacoes').style.display = 'none';
  throw new Error('Sem dados');
}

let saldoInicial = dados.saldoInicial;
let meta = dados.meta;
let payout = dados.payout;
let porcentagemEntrada = dados.porcentagemEntrada;
let porcentagemStopLoss = dados.porcentagemStopLoss;
let usar50Lucro = dados.usar50Lucro;
let recuperarLoss = dados.recuperarLoss;
let tipoRecuperacaoLoss = dados.tipoRecuperacaoLoss;

let saldoAtual = saldoInicial;
const stopwin = saldoInicial + (saldoInicial * meta);
const stoploss = saldoInicial - (saldoInicial * porcentagemStopLoss);
let operacaoAtiva = true;
let valorEntrada = saldoInicial * porcentagemEntrada;
let ultimoLoss = false;
let prejuizoAcumulado = 0;
let primeiraEntrada = valorEntrada;
let contadorWin = 0;
let contadorLoss = 0;

function showPopup(message, color, type = null) {
  // Remove popup existente, se houver
  const existing = document.getElementById('custom-popup');
  if (existing) existing.remove();

  const popupBg = document.createElement('div');
  popupBg.id = 'popup-bg';
  popupBg.style.position = 'fixed';
  popupBg.style.top = '0';
  popupBg.style.left = '0';
  popupBg.style.width = '100vw';
  popupBg.style.height = '100vh';
  popupBg.style.background = 'rgba(0,0,0,0.85)';
  popupBg.style.zIndex = '9998';
  popupBg.style.display = 'flex';
  popupBg.style.alignItems = 'center';
  popupBg.style.justifyContent = 'center';
  popupBg.style.backdropFilter = 'blur(20px)';

  const popup = document.createElement('div');
  popup.id = 'custom-popup';
  
  // Definir cores e estilos baseados no tipo
  const isWin = type === 'win';
  const primaryColor = isWin ? '#00ff88' : '#ff3366';
  const secondaryColor = isWin ? '#00ccff' : '#ff6b3d';
  const glowColor = isWin ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 51, 102, 0.6)';
  
  popup.innerHTML = `
    <div class="futuristic-content" style="text-align:center;position:relative;">
      <div class="status-indicator" style="
        width: 120px;
        height: 120px;
        margin: 0 auto 24px auto;
        border-radius: 50%;
        background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 40px ${glowColor}, inset 0 0 20px rgba(255,255,255,0.3);
        position: relative;
        overflow: hidden;
      ">
        <div class="pulse-ring" style="
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid ${primaryColor};
          border-radius: 50%;
          animation: pulse 2s infinite;
        "></div>
        ${isWin ? `
          <svg width="60" height="60" fill="none" viewBox="0 0 48 48">
            <path d="M18 24l4 4 8-8" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        ` : `
          <svg width="60" height="60" fill="none" viewBox="0 0 48 48">
            <path d="M18 18l12 12M30 18l-12 12" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
          </svg>
        `}
      </div>
      
      <div class="message-container" style="
        background: linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.95) 100%);
        border: 2px solid ${primaryColor};
        border-radius: 20px;
        padding: 32px 40px;
        box-shadow: 0 0 30px ${glowColor}, inset 0 0 20px rgba(255,255,255,0.05);
        backdrop-filter: blur(15px);
        position: relative;
        overflow: hidden;
      ">
        <div class="message-text" style="
          font-family: 'Orbitron', 'Courier New', monospace;
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          text-shadow: 0 0 20px ${primaryColor};
          letter-spacing: 2px;
          line-height: 1.4;
          margin: 0;
        ">${message}</div>
        
        <div class="status-label" style="
          font-family: 'Orbitron', 'Courier New', monospace;
          font-size: 1.2rem;
          font-weight: 600;
          color: ${primaryColor};
          text-transform: uppercase;
          letter-spacing: 3px;
          margin-top: 16px;
          opacity: 0.9;
        ">${isWin ? 'SUCCESS' : 'ALERT'}</div>
      </div>
      
      <button id="close-popup" style="
        position: absolute;
        top: -15px;
        right: -15px;
        background: linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        font-size: 1.5rem;
        color: #fff;
        box-shadow: 0 0 20px ${glowColor};
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      ">&times;</button>
    </div>
  `;
  
  // Adicionar estilos CSS para animações
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.7; }
      100% { transform: scale(1); opacity: 1; }
    }
    
    @keyframes slideIn {
      0% { transform: translate(-50%, -50%) scale(0.3) rotate(-10deg); opacity: 0; }
      50% { transform: translate(-50%, -50%) scale(1.1) rotate(2deg); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
    }
    
    @keyframes slideOut {
      0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
      100% { transform: translate(-50%, -50%) scale(0.3) rotate(10deg); opacity: 0; }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
    
    @keyframes fadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%) scale(0.3) rotate(-10deg)';
  popup.style.opacity = '0';
  popup.style.zIndex = '9999';
  popup.style.minWidth = '400px';
  popup.style.maxWidth = '90vw';
  popup.style.transition = 'none';

  popupBg.appendChild(popup);
  document.body.appendChild(popupBg);
  
  // Animações de entrada
  setTimeout(() => {
    popup.style.animation = 'slideIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
    popupBg.style.animation = 'fadeIn 0.6s ease-out forwards';
  }, 10);
  
  // Fechar ao clicar no botão X
  popup.querySelector('#close-popup').onclick = () => {
    popup.style.animation = 'slideOut 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
    popupBg.style.animation = 'fadeOut 0.6s ease-out forwards';
    setTimeout(() => { if (popupBg.parentNode) popupBg.remove(); }, 600);
  };
  
  // Fechar automaticamente após 4s
  setTimeout(() => {
    if (document.getElementById('custom-popup')) {
      popup.style.animation = 'slideOut 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
      popupBg.style.animation = 'fadeOut 0.6s ease-out forwards';
      setTimeout(() => { if (popupBg.parentNode) popupBg.remove(); }, 600);
    }
  }, 4000);
}

function atualizarPlacar() {
  document.getElementById('placar-operacoes').textContent = `Placar: ${contadorWin} x ${contadorLoss}`;
}

function atualizarOperacaoInfo() {
  let lucroDesejado = primeiraEntrada * payout;
  let html = `<strong>Saldo atual:</strong> R$ ${saldoAtual.toFixed(2)}<br>`;
  html += `<strong>Próxima entrada:</strong> R$ ${valorEntrada.toFixed(2)}<br>`;
  html += `<strong>Stop Win (Meta):</strong> R$ ${stopwin.toFixed(2)}<br>`;
  html += `<strong>Stop Loss:</strong> R$ ${stoploss.toFixed(2)}<br>`;
  html += `<strong>Falta para Stop Win:</strong> R$ ${(stopwin - saldoAtual).toFixed(2)}<br>`;
  html += `<strong>Falta para Stop Loss:</strong> R$ ${(saldoAtual - stoploss).toFixed(2)}<br>`;
  if (saldoAtual >= stopwin) {
    showPopup('Parabéns! Meta do dia atingida!', '#22c55e', 'win');
    operacaoAtiva = false;
  } else if (saldoAtual <= stoploss) {
    showPopup('Stop Loss do dia atingido.', '#ef4444', 'loss');
    operacaoAtiva = false;
  }
  document.getElementById('operacao-info').innerHTML = html;
  document.getElementById('btn-win').disabled = !operacaoAtiva;
  document.getElementById('btn-loss').disabled = !operacaoAtiva;

  // Prévia da próxima entrada em caso de Loss
  const previaPrejuizoAcumulado = prejuizoAcumulado + valorEntrada;
  let previaProximaEntradaLoss;
  if (recuperarLoss) {
    if (tipoRecuperacaoLoss === 'apenas-prejuizo') {
      previaProximaEntradaLoss = previaPrejuizoAcumulado / payout;
    } else {
      previaProximaEntradaLoss = ((previaPrejuizoAcumulado * 1.0) + lucroDesejado) / payout;
    }
  } else {
    previaProximaEntradaLoss = saldoAtual * porcentagemEntrada;
  }
  const maxEntradaPossivel = saldoAtual - stoploss;
  if (previaProximaEntradaLoss > maxEntradaPossivel) {
    previaProximaEntradaLoss = maxEntradaPossivel;
    if (previaProximaEntradaLoss < 0) previaProximaEntradaLoss = 0;
  }
  let previaLossMsg = '';
  if (previaProximaEntradaLoss <= 0) {
    previaLossMsg = '<span style="color:#ef4444;font-weight:bold;">Não é mais possível operar sem ultrapassar o Stop Loss.</span>';
  } else {
    previaLossMsg = `Próxima  se Loss: R$ ${previaProximaEntradaLoss.toFixed(2)}`;
  }
  document.getElementById('previa-loss').innerHTML = previaLossMsg;
}

document.getElementById('operacao-area').style.display = 'block';
document.getElementById('operacao-info').innerHTML = '';
saldoAtual = saldoInicial;
operacaoAtiva = true;
contadorWin = 0;
contadorLoss = 0;
atualizarPlacar();
atualizarOperacaoInfo();

document.getElementById('btn-win').onclick = function() {
  if (!operacaoAtiva) return;
  contadorWin++;
  atualizarPlacar();
  let lucroDesejado = primeiraEntrada * payout;
  const previaPrejuizoAcumulado = prejuizoAcumulado + valorEntrada;
  let previaProximaEntradaLoss = (previaPrejuizoAcumulado + lucroDesejado) / payout;
  const maxEntradaPossivel = saldoAtual - stoploss;
  if (previaProximaEntradaLoss > maxEntradaPossivel) {
    previaProximaEntradaLoss = maxEntradaPossivel;
    if (previaProximaEntradaLoss < 0) previaProximaEntradaLoss = 0;
  }
  let lucro = valorEntrada * payout;
  saldoAtual += lucro;
  if (ultimoLoss) {
    valorEntrada = saldoAtual * porcentagemEntrada;
    primeiraEntrada = valorEntrada;
  } else {
    if (usar50Lucro) {
      valorEntrada = (saldoAtual * porcentagemEntrada) + (lucro * 0.5);
    } else {
      valorEntrada = saldoAtual * porcentagemEntrada;
    }
    primeiraEntrada = valorEntrada;
  }
  ultimoLoss = false;
  prejuizoAcumulado = 0;
  atualizarOperacaoInfo();
};
document.getElementById('btn-loss').onclick = function() {
  if (!operacaoAtiva) return;
  contadorLoss++;
  atualizarPlacar();
  saldoAtual -= valorEntrada;
  ultimoLoss = true;
  prejuizoAcumulado += valorEntrada;
  let lucroDesejado = primeiraEntrada * payout;
  if (recuperarLoss) {
    if (tipoRecuperacaoLoss === 'apenas-prejuizo') {
      valorEntrada = prejuizoAcumulado / payout;
    } else {
      valorEntrada = ((prejuizoAcumulado * 1.0) + lucroDesejado) / payout;
    }
  } else {
    valorEntrada = saldoAtual * porcentagemEntrada;
  }
  atualizarOperacaoInfo();
}; 