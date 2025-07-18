document.getElementById('controle-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const saldoInicial = parseFloat(document.getElementById('saldo').value);
  const meta = parseFloat(document.getElementById('meta').value) / 100;
  const payout = parseFloat(document.getElementById('payout').value) / 100;
  const porcentagemEntrada = parseFloat(document.getElementById('porcentagem-entrada').value) / 100;
  const porcentagemStopLoss = parseFloat(document.getElementById('porcentagem-stoploss').value) / 100;
  const usar50Lucro = document.getElementById('usar-50-lucro').checked;
  const recuperarLoss = document.getElementById('recuperar-loss').checked;
  let tipoRecuperacaoLoss = 'lucro';
  if (recuperarLoss) {
    const radioLucro = document.getElementById('recuperar-lucro');
    const radioApenasPrejuizo = document.getElementById('recuperar-apenas-prejuizo');
    if (radioApenasPrejuizo && radioApenasPrejuizo.checked) {
      tipoRecuperacaoLoss = 'apenas-prejuizo';
    }
  }
  // Salva dados no localStorage
  localStorage.setItem('controle-dados', JSON.stringify({
    saldoInicial, meta, payout, porcentagemEntrada, porcentagemStopLoss, usar50Lucro, recuperarLoss, tipoRecuperacaoLoss
  }));
  // Redireciona para resultado.html
  window.location.href = 'resultado.html';
});