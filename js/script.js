// ============================================
// Estado da aplicação
// ============================================
let criteria = [
    { id: 'c0', name: 'Preço', weight: 25, normalization: { mode: 'manual' } },
    { id: 'c1', name: 'Localização', weight: 20, normalization: { mode: 'manual' } },
    { id: 'c2', name: 'Topografia', weight: 15, normalization: { mode: 'manual' } },
    { id: 'c3', name: 'Tipo de solo', weight: 15, normalization: { mode: 'manual' } },
    { id: 'c4', name: 'Potencial construtivo', weight: 15, normalization: { mode: 'manual' } },
    { id: 'c5', name: 'Infraestrutura', weight: 10, normalization: { mode: 'manual' } }
];

let terrains = [
    { id: 't0', name: 'A' },
    { id: 't1', name: 'B' },
    { id: 't2', name: 'C' },
    { id: 't3', name: 'D' }
];

// Notas calculadas (0-10)
let scores = {};

// Valores brutos para critérios normalizados
let rawValues = {};

function initScoresAndRaw() {
    scores = {};
    rawValues = {};
    criteria.forEach(c => {
        scores[c.id] = {};
        rawValues[c.id] = {};
        terrains.forEach(t => {
            scores[c.id][t.id] = 5; // nota padrão
            rawValues[c.id][t.id] = 0; // valor bruto padrão
        });
    });
}
initScoresAndRaw();

// ============================================
// Elementos DOM
// ============================================
const criteriaListDiv = document.getElementById('criteria-list');
const terrainsListDiv = document.getElementById('terrains-list');
const scoresThead = document.getElementById('scores-thead');
const scoresTbody = document.getElementById('scores-tbody');
const rankingListDiv = document.getElementById('ranking-list');
const addCriterionBtn = document.getElementById('add-criterion');
const addTerrainBtn = document.getElementById('add-terrain');
const exportPdfBtn = document.getElementById('export-pdf');
const exportXlsxBtn = document.getElementById('export-xlsx');
const weightWarning = document.getElementById('weight-warning');

// Abas
const tabLearn = document.getElementById('tab-learn');
const tabSimulator = document.getElementById('tab-simulator');
const tabGuide = document.getElementById('tab-guide');
const tabExamples = document.getElementById('tab-examples');
const learnContent = document.getElementById('learn-content');
const simulatorContent = document.getElementById('simulator-content');
const guideContent = document.getElementById('guide-content');
const examplesContent = document.getElementById('examples-content');

// Botões de exemplo
const loadExample1Btn = document.getElementById('load-example-1');
const loadExample2Btn = document.getElementById('load-example-2');

// Botão de tour
const startTourBtn = document.getElementById('start-tour');

// Gráficos
let barChart, radarChart;

// ============================================
// Utilitários
// ============================================
function generateId(prefix) {
    return prefix + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
}

function refreshFeather() {
    if (typeof feather !== 'undefined') {
        feather.replace();
    }
}

// ============================================
// Gerenciamento de abas
// ============================================
function activateTab(tabId) {
    [tabLearn, tabSimulator, tabGuide, tabExamples].forEach(t => t.classList.remove('active'));
    [learnContent, simulatorContent, guideContent, examplesContent].forEach(c => c.classList.remove('active'));

    if (tabId === 'learn') {
        tabLearn.classList.add('active');
        learnContent.classList.add('active');
    } else if (tabId === 'simulator') {
        tabSimulator.classList.add('active');
        simulatorContent.classList.add('active');
        setTimeout(() => {
            updateChartsAndRanking();
            refreshFeather();
        }, 100);
    } else if (tabId === 'guide') {
        tabGuide.classList.add('active');
        guideContent.classList.add('active');
    } else if (tabId === 'examples') {
        tabExamples.classList.add('active');
        examplesContent.classList.add('active');
    }
    refreshFeather();
}

tabLearn.addEventListener('click', () => activateTab('learn'));
tabSimulator.addEventListener('click', () => activateTab('simulator'));
tabGuide.addEventListener('click', () => activateTab('guide'));
tabExamples.addEventListener('click', () => activateTab('examples'));

// ============================================
// Tour interativo
// ============================================
if (startTourBtn) {
    startTourBtn.addEventListener('click', () => {
        introJs().setOptions({
            steps: [
                {
                    title: 'Bem-vindo ao PonderaCivil',
                    intro: 'Este tour vai te ajudar a conhecer as principais funcionalidades.'
                },
                {
                    element: document.querySelector('.tabs'),
                    title: 'Abas',
                    intro: 'Navegue entre as abas: Aprender (teoria), Simulador (ferramenta), Guia de Uso e Exemplos.'
                },
                {
                    element: document.querySelector('#simulator-content .manager-panel:first-child'),
                    title: 'Critérios',
                    intro: 'Aqui você gerencia os critérios: adiciona, remove, define pesos e escolhe o modo de normalização (manual ou valor bruto).'
                },
                {
                    element: document.querySelector('#simulator-content .manager-panel:last-child'),
                    title: 'Terrenos',
                    intro: 'Gerencie os terrenos (opções) da mesma forma.'
                },
                {
                    element: document.querySelector('.scores-panel'),
                    title: 'Tabela de notas/valores',
                    intro: 'Para critérios manuais, insira notas de 0 a 10. Para critérios com normalização, insira valores brutos (ex: preço em R$) e a nota é calculada automaticamente.'
                },
                {
                    element: document.querySelector('.results-panel'),
                    title: 'Resultados',
                    intro: 'Veja a pontuação final e compare os perfis nos gráficos. Exporte PDF ou Excel.'
                }
            ],
            showProgress: true,
            showBullets: false,
            exitOnOverlayClick: true
        }).start();
    });
}

// ============================================
// Exemplos práticos
// ============================================
function loadExample1() {
    // Exemplo com normalização de preço
    criteria = [
        { id: 'c0', name: 'Preço (R$/m²)', weight: 50, normalization: { mode: 'raw', direction: 'lower' } },
        { id: 'c1', name: 'Localização', weight: 30, normalization: { mode: 'manual' } },
        { id: 'c2', name: 'Topografia', weight: 20, normalization: { mode: 'manual' } }
    ];
    terrains = [
        { id: 't0', name: 'A' },
        { id: 't1', name: 'B' }
    ];
    // Inicializar valores brutos
    rawValues = {};
    scores = {};
    criteria.forEach(c => {
        rawValues[c.id] = {};
        scores[c.id] = {};
        terrains.forEach(t => {
            if (c.id === 'c0') {
                rawValues[c.id][t.id] = (t.id === 't0') ? 1300 : 1700;
            } else if (c.id === 'c1') {
                rawValues[c.id][t.id] = 0; // não usado
                scores[c.id][t.id] = (t.id === 't0') ? 8 : 9;
            } else {
                rawValues[c.id][t.id] = 0;
                scores[c.id][t.id] = (t.id === 't0') ? 7 : 6;
            }
        });
    });
    // Recalcular notas do preço
    recalculateNormalizedScores('c0');
    activateTab('simulator');
    updateAll();
}

function loadExample2() {
    criteria = [
        { id: 'c0', name: 'Custo', weight: 40, normalization: { mode: 'manual' } },
        { id: 'c1', name: 'Rapidez', weight: 30, normalization: { mode: 'manual' } },
        { id: 'c2', name: 'Segurança', weight: 30, normalization: { mode: 'manual' } }
    ];
    terrains = [
        { id: 't0', name: 'Estaca' },
        { id: 't1', name: 'Sapata' },
        { id: 't2', name: 'Radier' }
    ];
    rawValues = {};
    scores = {};
    criteria.forEach(c => {
        rawValues[c.id] = {};
        scores[c.id] = {};
        terrains.forEach(t => {
            if (c.id === 'c0') {
                scores[c.id][t.id] = (t.id === 't0') ? 6 : (t.id === 't1' ? 8 : 7);
            } else if (c.id === 'c1') {
                scores[c.id][t.id] = (t.id === 't0') ? 5 : (t.id === 't1' ? 9 : 8);
            } else {
                scores[c.id][t.id] = (t.id === 't0') ? 9 : (t.id === 't1' ? 7 : 6);
            }
            rawValues[c.id][t.id] = 0; // não usado
        });
    });
    activateTab('simulator');
    updateAll();
}

if (loadExample1Btn) {
    loadExample1Btn.addEventListener('click', loadExample1);
}
if (loadExample2Btn) {
    loadExample2Btn.addEventListener('click', loadExample2);
}

// ============================================
// Funções de normalização
// ============================================
function recalculateNormalizedScores(criterionId) {
    const criterion = criteria.find(c => c.id === criterionId);
    if (!criterion || criterion.normalization.mode !== 'raw') return;

    const direction = criterion.normalization.direction; // 'lower' ou 'higher'
    const values = [];
    terrains.forEach(t => {
        const val = rawValues[criterionId][t.id];
        if (val !== undefined && !isNaN(val)) {
            values.push(val);
        }
    });

    if (values.length === 0) return;

    const min = Math.min(...values);
    const max = Math.max(...values);

    terrains.forEach(t => {
        const val = rawValues[criterionId][t.id];
        let note = 5; // valor padrão se min==max
        if (max !== min) {
            if (direction === 'lower') {
                note = 10 * (1 - (val - min) / (max - min));
            } else { // higher
                note = 10 * (val - min) / (max - min);
            }
        }
        // Arredondar para 1 casa decimal
        scores[criterionId][t.id] = Math.round(note * 10) / 10;
    });
}

// ============================================
// Renderização dos critérios com botões de normalização
// ============================================
function renderCriteria() {
    let html = '';
    criteria.forEach(c => {
        const norm = c.normalization || { mode: 'manual' };
        const isManual = norm.mode === 'manual';
        const isRawLower = norm.mode === 'raw' && norm.direction === 'lower';
        const isRawHigher = norm.mode === 'raw' && norm.direction === 'higher';

        html += `
            <div class="item-row" data-id="${c.id}">
                <span class="item-name" data-field="name">${c.name}</span>
                <input type="number" class="item-weight" min="0" max="100" value="${c.weight}" step="1" title="Peso em porcentagem">
                <button class="btn-icon normalize-manual ${isManual ? 'active' : ''}" title="Nota manual"><i data-feather="edit-3"></i></button>
                <button class="btn-icon normalize-lower ${isRawLower ? 'active' : ''}" title="Menor melhor (valor bruto)"><i data-feather="arrow-down"></i></button>
                <button class="btn-icon normalize-higher ${isRawHigher ? 'active' : ''}" title="Maior melhor (valor bruto)"><i data-feather="arrow-up"></i></button>
                <button class="btn-icon remove-item" title="Remover critério"><i data-feather="trash-2"></i></button>
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
            if (criterion) {
                criterion.weight = newWeight;
                if (newWeight < 0 || newWeight > 100) this.classList.add('error');
                else this.classList.remove('error');
            }
            validateWeights();
            updateAll();
        });
    });

    // Eventos de normalização
    document.querySelectorAll('#criteria-list .normalize-manual').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.closest('.item-row').dataset.id;
            const criterion = criteria.find(c => c.id === id);
            if (criterion) {
                criterion.normalization = { mode: 'manual' };
                renderCriteria(); // re-render para atualizar botões ativos
                renderScoresTable(); // atualiza tabela
                updateChartsAndRanking();
            }
        });
    });

    document.querySelectorAll('#criteria-list .normalize-lower').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.closest('.item-row').dataset.id;
            const criterion = criteria.find(c => c.id === id);
            if (criterion) {
                criterion.normalization = { mode: 'raw', direction: 'lower' };
                // Inicializar rawValues se necessário
                terrains.forEach(t => {
                    if (rawValues[id][t.id] === undefined) rawValues[id][t.id] = 0;
                });
                recalculateNormalizedScores(id);
                renderCriteria();
                renderScoresTable();
                updateChartsAndRanking();
            }
        });
    });

    document.querySelectorAll('#criteria-list .normalize-higher').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.closest('.item-row').dataset.id;
            const criterion = criteria.find(c => c.id === id);
            if (criterion) {
                criterion.normalization = { mode: 'raw', direction: 'higher' };
                terrains.forEach(t => {
                    if (rawValues[id][t.id] === undefined) rawValues[id][t.id] = 0;
                });
                recalculateNormalizedScores(id);
                renderCriteria();
                renderScoresTable();
                updateChartsAndRanking();
            }
        });
    });

    // Eventos de editar nome (inline)
    document.querySelectorAll('#criteria-list .edit-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.item-row');
            const id = row.dataset.id;
            const nameSpan = row.querySelector('.item-name');
            const currentName = nameSpan.innerText;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'item-input';
            input.setAttribute('data-id', id);

            nameSpan.replaceWith(input);
            input.focus();

            const saveEdit = () => {
                const newName = input.value.trim();
                if (newName) {
                    const criterion = criteria.find(c => c.id === id);
                    if (criterion) criterion.name = newName;
                }
                const newSpan = document.createElement('span');
                newSpan.className = 'item-name';
                newSpan.innerText = newName || currentName;
                input.replaceWith(newSpan);
                renderScoresTable();
                updateChartsAndRanking();
                refreshFeather();
            };

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                }
            });
        });
    });

    // Eventos de remover
    document.querySelectorAll('#criteria-list .remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.closest('.item-row').dataset.id;
            removeCriterion(id);
        });
    });

    refreshFeather();
}

// Renderiza lista de terrenos (sem alterações)
function renderTerrains() {
    let html = '';
    terrains.forEach(t => {
        html += `
            <div class="item-row" data-id="${t.id}">
                <span class="item-name">${t.name}</span>
                <button class="btn-icon edit-item" title="Editar nome"><i data-feather="edit-2"></i></button>
                <button class="btn-icon remove-item" title="Remover terreno"><i data-feather="trash-2"></i></button>
            </div>
        `;
    });
    terrainsListDiv.innerHTML = html;

    document.querySelectorAll('#terrains-list .edit-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('.item-row');
            const id = row.dataset.id;
            const nameSpan = row.querySelector('.item-name');
            const currentName = nameSpan.innerText;

            const input = document.createElement('input');
            input.type = 'text';
            input.value = currentName;
            input.className = 'item-input';
            input.setAttribute('data-id', id);

            nameSpan.replaceWith(input);
            input.focus();

            const saveEdit = () => {
                const newName = input.value.trim();
                if (newName) {
                    const terrain = terrains.find(t => t.id === id);
                    if (terrain) terrain.name = newName;
                }
                const newSpan = document.createElement('span');
                newSpan.className = 'item-name';
                newSpan.innerText = newName || currentName;
                input.replaceWith(newSpan);
                renderScoresTable();
                updateChartsAndRanking();
                refreshFeather();
            };

            input.addEventListener('blur', saveEdit);
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveEdit();
                }
            });
        });
    });

    document.querySelectorAll('#terrains-list .remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.closest('.item-row').dataset.id;
            removeTerrain(id);
        });
    });

    refreshFeather();
}

function removeCriterion(id) {
    criteria = criteria.filter(c => c.id !== id);
    delete scores[id];
    delete rawValues[id];
    updateAll();
}

function removeTerrain(id) {
    terrains = terrains.filter(t => t.id !== id);
    criteria.forEach(c => {
        delete scores[c.id][id];
        delete rawValues[c.id][id];
    });
    updateAll();
}

function addCriterion() {
    const newId = generateId('c');
    const newName = prompt('Nome do novo critério:');
    if (!newName) return;
    criteria.push({ id: newId, name: newName, weight: 10, normalization: { mode: 'manual' } });
    scores[newId] = {};
    rawValues[newId] = {};
    terrains.forEach(t => {
        scores[newId][t.id] = 5;
        rawValues[newId][t.id] = 0;
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
        rawValues[c.id][newId] = 0;
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

// ============================================
// Renderização da tabela de notas/valores brutos
// ============================================
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

        const norm = c.normalization || { mode: 'manual' };

        terrains.forEach(t => {
            if (norm.mode === 'raw') {
                // Modo valor bruto
                const rawVal = rawValues[c.id]?.[t.id] ?? 0;
                const note = scores[c.id]?.[t.id] ?? 5;
                tbodyHtml += `<td class="raw-cell">
                    <input type="number" class="raw-input" step="any" value="${rawVal}" data-criterion="${c.id}" data-terrain="${t.id}" title="Valor bruto">
                    <span class="calc-note">(${note.toFixed(1)})</span>
                </td>`;
            } else {
                // Modo manual
                const note = scores[c.id]?.[t.id] ?? 5;
                tbodyHtml += `<td><input type="number" min="0" max="10" step="0.1" value="${note}" class="score-input" data-criterion="${c.id}" data-terrain="${t.id}" title="Nota de 0 a 10"></td>`;
            }
        });
        tbodyHtml += '</tr>';
    });
    scoresTbody.innerHTML = tbodyHtml;

    // Eventos para inputs manuais
    document.querySelectorAll('.score-input').forEach(input => {
        input.addEventListener('input', function(e) {
            const criterionId = this.dataset.criterion;
            const terrainId = this.dataset.terrain;
            const val = parseFloat(e.target.value);
            if (!isNaN(val) && val >= 0 && val <= 10) {
                scores[criterionId][terrainId] = val;
                this.classList.remove('error');
            } else {
                this.classList.add('error');
            }
            updateChartsAndRanking();
        });
    });

    // Eventos para inputs brutos
    document.querySelectorAll('.raw-input').forEach(input => {
        input.addEventListener('input', function(e) {
            const criterionId = this.dataset.criterion;
            const terrainId = this.dataset.terrain;
            const val = parseFloat(e.target.value);
            if (!isNaN(val)) {
                rawValues[criterionId][terrainId] = val;
                // Recalcula todas as notas desse critério
                recalculateNormalizedScores(criterionId);
                // Atualiza a exibição da nota ao lado
                const cell = this.closest('td');
                const noteSpan = cell.querySelector('.calc-note');
                if (noteSpan) {
                    noteSpan.textContent = `(${scores[criterionId][terrainId].toFixed(1)})`;
                }
                updateChartsAndRanking();
            }
        });
    });

    refreshFeather();
}

// ============================================
// Cálculos e gráficos (sem alterações)
// ============================================
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
        let medalIcon = '';
        if (index === 0) medalIcon = '<i data-feather="award" style="stroke: gold;"></i>';
        else if (index === 1) medalIcon = '<i data-feather="award" style="stroke: silver;"></i>';
        else if (index === 2) medalIcon = '<i data-feather="award" style="stroke: #cd7f32;"></i>';
        html += `<div class="ranking-item">${medalIcon} ${item.name} <span>${item.score.toFixed(2)}</span></div>`;
    });
    rankingListDiv.innerHTML = html;
    refreshFeather();
}

function updateCharts(finalScores) {
    const terrainNames = terrains.map(t => t.name);
    const scoresArray = terrains.map(t => finalScores[t.id].score);

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

// ============================================
// Exportações (PDF e XLSX) - mantidas iguais
// ============================================
async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');

    doc.setFontSize(18);
    doc.text('Análise de Decisão - PonderaCivil', 20, 20);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

    doc.setFontSize(12);
    doc.text('Critérios e Pesos:', 20, 40);
    let y = 48;
    criteria.forEach((c, i) => {
        doc.text(`${c.name}: ${c.weight}%`, 25, y);
        y += 6;
    });

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

function exportToXLSX() {
    const wb = XLSX.utils.book_new();

    const criteriaData = [['Critério', 'Peso (%)', 'Modo']];
    criteria.forEach(c => {
        let modo = 'Manual';
        if (c.normalization.mode === 'raw') {
            modo = c.normalization.direction === 'lower' ? 'Menor melhor' : 'Maior melhor';
        }
        criteriaData.push([c.name, c.weight, modo]);
    });
    const wsCriteria = XLSX.utils.aoa_to_sheet(criteriaData);
    XLSX.utils.book_append_sheet(wb, wsCriteria, 'Critérios');

    const notesData = [['Critério', ...terrains.map(t => t.name)]];
    criteria.forEach(c => {
        const row = [c.name, ...terrains.map(t => scores[c.id]?.[t.id] ?? 5)];
        notesData.push(row);
    });
    const wsNotes = XLSX.utils.aoa_to_sheet(notesData);
    XLSX.utils.book_append_sheet(wb, wsNotes, 'Notas');

    const finalScores = calculateFinalScores();
    const finalData = [['Terreno', 'Pontuação']];
    terrains.forEach(t => finalData.push([t.name, finalScores[t.id].score]));
    const wsFinal = XLSX.utils.aoa_to_sheet(finalData);
    XLSX.utils.book_append_sheet(wb, wsFinal, 'Resultado');

    XLSX.writeFile(wb, 'analise_ponderada.xlsx');
}

// ============================================
// Event listeners principais
// ============================================
addCriterionBtn.addEventListener('click', addCriterion);
addTerrainBtn.addEventListener('click', addTerrain);
exportPdfBtn.addEventListener('click', exportToPDF);
exportXlsxBtn.addEventListener('click', exportToXLSX);

// Inicialização
updateAll();
refreshFeather();
