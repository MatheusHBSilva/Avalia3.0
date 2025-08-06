document.addEventListener('DOMContentLoaded', () => {
  fetchRestaurantDetails();
  document.querySelector('.back-button').addEventListener('click', () => {
    window.history.back();
  });
});

async function fetchRestaurantDetails() {
  const restaurantNameSpan = document.getElementById('restaurantName');
  const tagsContainer = document.getElementById('restaurantTags');
  const reportList = document.getElementById('reportList');
  const message = document.getElementById('message');

  try {
    const meResponse = await fetch('/api/me', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const meData = await meResponse.json();

    if (!meResponse.ok) {
      message.textContent = meData.error || 'Erro ao buscar dados do restaurante.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    restaurantNameSpan.textContent = meData.restaurantName;
    meData.tags.forEach(tag => {
      const span = document.createElement('span');
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    const restaurantId = meData.restaurantId;
    const reportsResponse = await fetch(`/api/report-history?restaurantId=${restaurantId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    const reportsData = await reportsResponse.json();

    if (!reportsResponse.ok) {
      message.textContent = reportsData.error || 'Erro ao carregar histórico de relatórios.';
      message.classList.add('error');
      message.style.display = 'block';
      return;
    }

    reportList.innerHTML = '';
    reportsData.reports.forEach(report => {
      const div = document.createElement('div');
      div.innerHTML = `
        <p>${report.date}</p>
        <button onclick="downloadReport(${report.id}, '${report.date}')">Acessar relatório</button>
      `;
      reportList.appendChild(div);
    });
  } catch (error) {
    message.textContent = 'Erro ao conectar ao servidor: ' + error.message;
    message.classList.add('error');
    message.style.display = 'block';
  }
}

async function downloadReport(reportId, date) {
  const message = document.getElementById('message');
  try {
    const response = await fetch('/api/download-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Erro ao baixar relatório.');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${date.replace(/\//g, '-')}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    message.textContent = error.message || 'Erro ao baixar relatório.';
    message.classList.add('error');
    message.style.display = 'block';
  }
}