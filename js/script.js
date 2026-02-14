// Estado da aplicação
let criteria = [
    { id: 'c0', name: 'Preço', weight: 25 },
    { id: 'c1', name: 'Localização', weight: 20 },
    { id: 'c2', name: 'Topografia', weight: 15 },
    { id: 'c3', name: 'Tipo de solo', weight: 15 },
    { id: 'c4', name: 'Potencial construtivo', weight: 15 },
    { id: 'c5', name: 'Infraestrutura', weight: 10 }
];

let terrains = [
    { id: 't0', name: 'A' },
    { id: 't1', name: 'B' },
    { id: 't2', name: 'C' },
    { id: 't3', name: 'D' }
];

// Notas: scores[criterionId][terrainId] = nota
let scores = {};

function initScores() {
    scores = {};
    criteria.forEach(c => {
        scores[c.id] = {};
        terrains.forEach(t => {
            scores[c.id][t.id] = 5; // valor padrão
        });
    });
}
initScores();

// Elementos DOM
const criteriaListDiv = document.getElementById('criteria-list');
const terrainsListDiv = document.getElementById('terrains-list');
const scoresThead = document.getElementById('scores-thead');
const scoresTbody = document.getElementById('scores-tbody');
const rankingListDiv = document.getElementById('ranking-list');
const addCriterionBtn = document.getElementById('add-criterion');
const addTerrainBtn = document.getElementById('add-terrain');
const exportPdfBtn = document.getElementById('export-pdf');
const weightWarning = document.getElementById('weight-warning');
const tabLearn = document.getElementById('tab-learn');
const tabSimulator = document.getElementById('tab-simulator');
const learnContent = document.getElementById('learn-content');
const simulatorContent = document.getElementById('simulator-content');

// Gráficos
let barChart, radarChart;

// Utilitário de ID
function generateId(prefix) {
    return prefix + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

// Renderiza lista de critérios com opção de editar nome
function renderCriteria() {
    let html = '';
    criteria.forEach(c => {
        html += `
            <div class="item-row" data-id="${c.id}">
                <span class="item-name" data-field="name">${c.name}</span>
                <input type="number" class="item-weight" min="0" max="100" value="${c.weight}" step="1" title="Peso %">
                <button class="btn-icon edit-item" title="Editar nome">✏️</button>
                <button class="btn-icon remove-item" title="Remover">🗑️</button>
            </div>
        `;
    });
    criteriaListDiv.innerHTML = html;

    // Eventos de peso
    document.querySelectorAll('#criteria-list .item-weight').forEach(input => {
        input.addEventListener('input', function(e) {
            const id = this.closest('.item-row').dataset.id;
            const newWeight = parseInt(e.target.value) || 0;
            const criterion = criteria.find(c => c.id === id);
            if (criterion) criterion.weight = newWeight;
            validateWeights();
            updateAll();
        });
    });

    // Eventos de editar nome
    document.querySelectorAll('#criteria-list .edit-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.item-row');
            const id = row.dataset.id;
            const nameSpan = row.querySelector('.item-name');
            const currentName = nameSpan.innerText;
            const newName = prompt('Editar nome do critério:', currentName);
            if (newName && newName.trim() !== '') {
                const criterion = criteria.find(c => c.id === id);
                if (criterion) criterion.name = newName.trim();
                renderCriteria(); // re-renderiza para atualizar nome
                renderScoresTable(); // atualiza tabela
                updateChartsAndRanking();
            }
        });
    });

    // Eventos de remover
    document.querySelectorAll('#criteria-list .remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.closest('.item-row').dataset.id;
            removeCriterion(id);
        });
    });
}

// Renderiza lista de terrenos com opção de editar nome
function renderTerrains() {
    let html = '';
    terrains.forEach(t => {
        html += `
            <div class="item-row" data-id="${t.id}">
                <span class="item-name">Terreno ${t.name}</span>
                <button class="btn-icon edit-item" title="Editar nome">✏️</button>
                <button class="btn-icon remove-item" title="Remover">🗑️</button>
            </div>
        `;
    });
    terrainsListDiv.innerHTML = html;

    document.querySelectorAll('#terrains-list .edit-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.item-row');
            const id = row.dataset.id;
            const nameSpan = row.querySelector('.item-name');
            const currentName = nameSpan.innerText.replace('Terreno ', '');
            const newName = prompt('Editar nome do terreno:', currentName);
            if (newName && newName.trim() !== '') {
                const terrain = terrains.find(t => t.id === id);
                if (terrain) terrain.name = newName.trim();
                renderTerrains();
                renderScoresTable();
                updateChartsAndRanking();
            }
        });
    });

    document.querySelectorAll('#terrains-list .remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.closest('.item-row').dataset.id;
            removeTerrain(id);
        });
    });
}

function removeCriterion(id) {
    criteria = criteria.filter(c => c.id !== id);
    delete scores[id];
    updateAll();
}

function removeTerrain(id) {
    terrains = terrains.filter(t => t.id !== id);
    criteria.forEach(c => {
        delete scores[c.id][id];
    });
    updateAll();
}

function addCriterion() {
    const newId = generateId('c');
    const newName = prompt('Nome do novo critério:');
    if (!newName) return;
    criteria.push({ id: newId, name: newName, weight: 10 });
    scores[newId] = {};
    terrains.forEach(t => {
        scores[newId][t.id] = 5;
    });
    updateAll();
}

function addTerrain() {
    const newId = generateId('t');
    let name = prompt('Nome do novo terreno (ex: E, Lote 5):');
    if (!name) return;
    terrains.push({ id: newId, name: name });
    criteria.forEach(c => {
        scores[c.id][newId] = 5;
    });
    updateAll();
}

function validateWeights() {
    const total = criteria.reduce((sum, c) => sum + c.weight, 0);
    if (total !== 100) {
        weightWarning.textContent = `⚠️ A soma dos pesos é ${total}% (deve ser 100%)`;
        weightWarning.classList.remove('hidden');
        return false;
    } else {
        weightWarning.classList.add('hidden');
        return true;
    }
}

function renderScoresTable() {
    // Cabeçalho
    let theadHtml = '<tr><th>Critério / Terreno</th>';
    terrains.forEach(t => {
        theadHtml += `<th>${t.name}</th>`;
    });
    theadHtml += '</tr>';
    scoresThead.innerHTML = theadHtml;

    // Corpo
    let tbodyHtml = '';
    criteria.forEach(c => {
        tbodyHtml += '<tr>';
        tbodyHtml += `<td>${c.name}</td>`;
        terrains.forEach(t => {
            const value = scores[c.id]?.[t.id] ?? 5;
            tbodyHtml += `<td><input type="number" min="0" max="10" step="0.1" value="${value}" class="score-input" data-criterion="${c.id}" data-terrain="${t.id}"></td>`;
        });
        tbodyHtml += '</tr>';
    });
    scoresTbody.innerHTML = tbodyHtml;

    // Eventos
    document.querySelectorAll('.score-input').forEach(input => {
        input.addEventListener('input', function(e) {
            const criterionId = this.dataset.criterion;
            const terrainId = this.dataset.terrain;
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0 && val <= 10) {
                scores[criterionId][terrainId] = val;
            }
            updateChartsAndRanking();
        });
    });
}

function calculateFinalScores() {
    const final = {};
    terrains.forEach(t => {
        let total = 0;
        criteria.forEach(c => {
            const weight = c.weight / 100;
            const score = scores[c.id]?.[t.id] || 0;
            total += weight * score;
        });
        final[t.id] = { name: t.name, score: total };
    });
    return final;
}

function renderRanking(finalScores) {
    const sorted = Object.values(finalScores).sort((a, b) => b.score - a.score);
    let html = '';
    sorted.forEach((item, index) => {
        let medal = '';
        if (index === 0) medal = '🥇 ';
        else if (index === 1) medal = '🥈 ';
        else if (index === 2) medal = '🥉 ';
        html += `<div class="ranking-item">${medal}${item.name} <span>${item.score.toFixed(2)}</span></div>`;
    });
    rankingListDiv.innerHTML = html;
}

function updateCharts(finalScores) {
    const terrainNames = terrains.map(t => t.name);
    const scoresArray = terrains.map(t => finalScores[t.id].score);

    // Bar chart
    if (barChart) barChart.destroy();
    const barCtx = document.getElementById('bar-chart').getContext('2d');
    barChart = new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: terrainNames,
            datasets: [{
                label: 'Pontuação final',
                data: scoresArray,
                backgroundColor: 'rgba(59, 130, 246, 0.7)',
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true, max: 10, title: { display: true, text: 'Pontos' } } }
        }
    });

    // Radar chart
    if (criteria.length === 0) {
        if (radarChart) radarChart.destroy();
        return;
    }

    const radarLabels = criteria.map(c => c.name);
    const radarDatasets = terrains.map((t, idx) => {
        const hue = (idx * 60) % 360;
        return {
            label: t.name,
            data: criteria.map(c => scores[c.id]?.[t.id] || 0),
            borderColor: `hsl(${hue}, 70%, 50%)`,
            backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`,
            tension: 0.1
        };
    });

    if (radarChart) radarChart.destroy();
    const radarCtx = document.getElementById('radar-chart').getContext('2d');
    radarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: radarLabels,
            datasets: radarDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { r: { min: 0, max: 10, ticks: { stepSize: 2 } } }
        }
    });
}

function updateChartsAndRanking() {
    if (!validateWeights()) {
        rankingListDiv.innerHTML = '<div class="ranking-item">Ajuste os pesos para 100%</div>';
        if (barChart) barChart.destroy();
        if (radarChart) radarChart.destroy();
        return;
    }
    const finalScores = calculateFinalScores();
    renderRanking(finalScores);
    updateCharts(finalScores);
}

function updateAll() {
    renderCriteria();
    renderTerrains();
    renderScoresTable();
    updateChartsAndRanking();
}

// Exportar PDF
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFontSize(18);
    doc.text('Análise de Decisão - PonderaCivil', 20, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

    // Critérios e pesos
    doc.setFontSize(12);
    doc.text('Critérios e Pesos:', 20, 40);
    let y = 48;
    criteria.forEach((c, i) => {
        doc.text(`${c.name}: ${c.weight}%`, 25, y);
        y += 6;
    });

    // Tabela de notas
    y += 10;
    doc.text('Notas atribuídas (0-10):', 20, y);
    y += 8;

    const head = [['Critério', ...terrains.map(t => t.name)]];
    const body = criteria.map(c => {
        return [c.name, ...terrains.map(t => (scores[c.id]?.[t.id] || 0).toFixed(1))];
    });

    doc.autoTable({
        startY: y,
        head: head,
        body: body,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [59, 130, 246] }
    });

    // Pontuações finais
    const finalScores = calculateFinalScores();
    y = doc.lastAutoTable.finalY + 10;
    doc.text('Pontuação final (ponderada):', 20, y);
    y += 6;
    terrains.forEach(t => {
        doc.text(`${t.name}: ${finalScores[t.id].score.toFixed(2)}`, 25, y);
        y += 6;
    });

    doc.save('analise_ponderada.pdf');
}

// Eventos de abas
tabLearn.addEventListener('click', () => {
    tabLearn.classList.add('active');
    tabSimulator.classList.remove('active');
    learnContent.classList.add('active');
    simulatorContent.classList.remove('active');
});

tabSimulator.addEventListener('click', () => {
    tabSimulator.classList.add('active');
    tabLearn.classList.remove('active');
    simulatorContent.classList.add('active');
    learnContent.classList.remove('active');
    // Ao mostrar o simulador, garantimos que os gráficos sejam renderizados corretamente
    setTimeout(() => updateChartsAndRanking(), 100);
});

// Event listeners principais
addCriterionBtn.addEventListener('click', addCriterion);
addTerrainBtn.addEventListener('click', addTerrain);
exportPdfBtn.addEventListener('click', exportToPDF);

// Inicialização
updateAll();
