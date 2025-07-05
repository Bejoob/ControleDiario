document.getElementById('controle-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const saldoInicial = parseFloat(document.getElementById('saldo').value);
  const meta = parseFloat(document.getElementById('meta').value) / 100;
  const payout = parseFloat(document.getElementById('payout').value) / 100;
  const porcentagemEntrada = parseFloat(document.getElementById('porcentagem-entrada').value) / 100;

  let saldoAtual = saldoInicial;
  const stopwin = saldoInicial + (saldoInicial * meta);
  const stoploss = saldoInicial - (saldoInicial * meta); // Stop Loss é igual ao valor do Stop Win
  let operacaoAtiva = true;
  let valorEntrada = saldoInicial * porcentagemEntrada; // porcentagem da entrada
  let ultimoLoss = false;
  let prejuizoAcumulado = 0;
  let primeiraEntrada = valorEntrada;

  function showPopup(message, color) {
    // Remove popup existente, se houver
    const existing = document.getElementById('custom-popup');
    if (existing) existing.remove();

    const popup = document.createElement('div');
    popup.id = 'custom-popup';
    popup.textContent = message;
    popup.style.position = 'fixed';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
    popup.style.background = color;
    popup.style.color = '#fff';
    popup.style.padding = '32px 48px';
    popup.style.borderRadius = '18px';
    popup.style.fontSize = '2rem';
    popup.style.fontWeight = 'bold';
    popup.style.boxShadow = '0 8px 32px rgba(0,0,0,0.18)';
    popup.style.zIndex = '9999';
    popup.style.opacity = '0';
    popup.style.transition = 'opacity 0.3s, transform 0.4s cubic-bezier(.68,-0.55,.27,1.55)';

    document.body.appendChild(popup);
    setTimeout(() => {
      popup.style.opacity = '1';
      popup.style.transform = 'translate(-50%, -50%) scale(1.1)';
    }, 10);
    setTimeout(() => {
      popup.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 400);
    setTimeout(() => {
      popup.style.opacity = '0';
      popup.style.transform = 'translate(-50%, -50%) scale(0.8)';
    }, 2500);
    setTimeout(() => {
      popup.remove();
    }, 3000);
  }

  function atualizarOperacaoInfo() {
    let lucroDesejado = primeiraEntrada * payout;
    if (ultimoLoss && prejuizoAcumulado > 0) {
      valorEntrada = (prejuizoAcumulado + lucroDesejado) / payout;
    }
    let html = `<strong>Saldo atual:</strong> R$ ${saldoAtual.toFixed(2)}<br>`;
    html += `<strong>Próxima entrada:</strong> R$ ${valorEntrada.toFixed(2)}<br>`;
    html += `<strong>Stop Win (Meta):</strong> R$ ${stopwin.toFixed(2)}<br>`;
    html += `<strong>Stop Loss:</strong> R$ ${stoploss.toFixed(2)}<br>`;
    html += `<strong>Falta para Stop Win:</strong> R$ ${(stopwin - saldoAtual).toFixed(2)}<br>`;
    html += `<strong>Falta para Stop Loss:</strong> R$ ${(saldoAtual - stoploss).toFixed(2)}<br>`;
    if (saldoAtual >= stopwin) {
      showPopup('Parabéns! Meta do dia atingida!', '#22c55e');
      operacaoAtiva = false;
    } else if (saldoAtual <= stoploss) {
      showPopup('Stop Loss do dia atingido.', '#ef4444');
      operacaoAtiva = false;
    }
    document.getElementById('operacao-info').innerHTML = html;
    document.getElementById('btn-win').disabled = !operacaoAtiva;
    document.getElementById('btn-loss').disabled = !operacaoAtiva;

    // Prévia da próxima entrada em caso de Loss
    const previaPrejuizoAcumulado = prejuizoAcumulado + valorEntrada;
    let previaProximaEntradaLoss = (previaPrejuizoAcumulado + lucroDesejado) / payout;
    // Limitar a entrada para não ultrapassar o Stop Loss
    const maxEntradaPossivel = saldoAtual - stoploss;
    if (previaProximaEntradaLoss > maxEntradaPossivel) {
      previaProximaEntradaLoss = maxEntradaPossivel;
      if (previaProximaEntradaLoss < 0) previaProximaEntradaLoss = 0;
    }
    document.getElementById('previa-loss').innerHTML =
      `Próxima entrada se Loss: R$ ${previaProximaEntradaLoss.toFixed(2)}`;
  }

  document.getElementById('operacao-area').style.display = 'block';
  document.getElementById('operacao-info').innerHTML = '';
  saldoAtual = saldoInicial;
  operacaoAtiva = true;
  atualizarOperacaoInfo();

  document.getElementById('btn-win').onclick = function() {
    if (!operacaoAtiva) return;
    const lucro = valorEntrada * payout;
    saldoAtual += lucro;
    if (ultimoLoss) {
      // Após ciclo de loss, volta para entrada inicial (apenas porcentagem do saldo)
      valorEntrada = saldoAtual * porcentagemEntrada;
      primeiraEntrada = valorEntrada;
    } else {
      // Win seguido de Win: porcentagem do saldo + 50% do lucro
      valorEntrada = (saldoAtual * porcentagemEntrada) + (lucro * 0.5);
      primeiraEntrada = valorEntrada;
    }
    ultimoLoss = false;
    prejuizoAcumulado = 0;
    atualizarOperacaoInfo();
  };
  document.getElementById('btn-loss').onclick = function() {
    if (!operacaoAtiva) return;
    saldoAtual -= valorEntrada;
    ultimoLoss = true;
    prejuizoAcumulado += valorEntrada;
    atualizarOperacaoInfo();
  };

  // Não exibir mais o resumo do controle diário
  document.getElementById('controle-resultado').innerHTML = '';
});