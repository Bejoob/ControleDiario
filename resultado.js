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
  popupBg.style.background = 'rgba(20,22,40,0.65)';
  popupBg.style.zIndex = '9998';
  popupBg.style.display = 'flex';
  popupBg.style.alignItems = 'center';
  popupBg.style.justifyContent = 'center';

  const popup = document.createElement('div');
  popup.id = 'custom-popup';
  popup.innerHTML = `
    <div style="display:flex;align-items:center;gap:18px;">
      <span style="font-size:2.5rem;display:flex;align-items:center;justify-content:center;">
        ${type === 'win' ? `<svg width='48' height='48' fill='none' viewBox='0 0 48 48'><circle cx='24' cy='24' r='24' fill='#22c55e'/><path d='M34 18l-12 12-6-6' stroke='#fff' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/></svg>` : ''}
        ${type === 'loss' ? `<svg width='48' height='48' fill='none' viewBox='0 0 48 48'><circle cx='24' cy='24' r='24' fill='#ef4444'/><path d='M30 18l-12 12M18 18l12 12' stroke='#fff' stroke-width='3' stroke-linecap='round'/></svg>` : ''}
      </span>
      <span style="display:block;line-height:1.2;">${message}</span>
    </div>
    <button id="close-popup" style="position:absolute;top:12px;right:18px;background:rgba(0,0,0,0.08);border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;font-size:1.3rem;color:#333;">&times;</button>
  `;
  popup.style.position = 'fixed';
  popup.style.top = '50%';
  popup.style.left = '50%';
  popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
  popup.style.background = `linear-gradient(135deg, ${color} 60%, #fff 100%)`;
  popup.style.color = '#222';
  popup.style.padding = '36px 56px 36px 36px';
  popup.style.borderRadius = '22px';
  popup.style.fontSize = '2rem';
  popup.style.fontWeight = 'bold';
  popup.style.boxShadow = '0 12px 40px rgba(0,0,0,0.22)';
  popup.style.zIndex = '9999';
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 0.35s, transform 0.5s cubic-bezier(.68,-0.55,.27,1.55)';
  popup.style.minWidth = '320px';
  popup.style.maxWidth = '90vw';
  popup.style.textAlign = 'left';
  popup.style.overflow = 'visible';

  popupBg.appendChild(popup);
  document.body.appendChild(popupBg);
  setTimeout(() => {
    popup.style.opacity = '1';
    popup.style.transform = 'translate(-50%, -50%) scale(1.08)';
  }, 10);
  setTimeout(() => {
    popup.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 400);
  // Fechar ao clicar no botão X
  popup.querySelector('#close-popup').onclick = () => popupBg.remove();
  // Fechar automaticamente após 3s
  setTimeout(() => {
    if (document.getElementById('custom-popup')) {
      popup.style.opacity = '0';
      popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
      setTimeout(() => { if (popupBg.parentNode) popupBg.remove(); }, 400);
    }
  }, 3000);
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
    previaLossMsg = `Próxima entrada se Loss: R$ ${previaProximaEntradaLoss.toFixed(2)}`;
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