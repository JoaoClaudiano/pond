// Aguarda o DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    // Elementos do DOM
    const sliders = document.querySelectorAll('.weight-slider');
    const weightValues = document.querySelectorAll('.weight-value');
    const totalSpan = document.getElementById('total-weights');
    const weightWarning = document.getElementById('weight-warning');
    const scoreInputs = document.querySelectorAll('.score-input');
    const rankingList = document.getElementById('ranking-list');

    // Inicializa gráficos
    let barChart, radarChart;

    // Função para obter pesos atuais como objeto
    function getWeights() {
        const weights = {};
        sliders.forEach(slider => {
            const id = slider.id.replace('slider-', '');
            weights[id] = parseFloat(slider.value) / 100; // converte para decimal
        });
        return weights;
    }

    // Função para obter notas como objeto aninhado: { criterio: { A: nota, B: nota, ... } }
    function getScores() {
        const scores = {
            preco: { A: 0, B: 0, C: 0, D: 0 },
            localizacao: { A: 0, B: 0, C: 0, D: 0 },
            topografia: { A: 0, B: 0, C: 0, D: 0 },
            solo: { A: 0, B: 0, C: 0, D: 0 },
            legislacao: { A: 0, B: 0, C: 0, D: 0 },
            infra: { A: 0, B: 0, C: 0, D: 0 }
        };

        scoreInputs.forEach(input => {
            const terrain = input.dataset.terrain;
            const criterion = input.dataset.criterion;
            const value = parseFloat(input.value) || 0;
            if (scores[criterion] && scores[criterion][terrain] !== undefined) {
                scores[criterion][terrain] = value;
            }
        });
        return scores;
    }

    // Calcula pontuação final por terreno
    function calculateFinalScores(weights, scores) {
        const terrains = ['A', 'B', 'C', 'D'];
        const final = { A: 0, B: 0, C: 0, D: 0 };

        terrains.forEach(t => {
            let total = 0;
            for (let criterion in weights) {
                total += weights[criterion] * scores[criterion][t];
            }
            final[t] = total;
        });
        return final;
    }

    // Atualiza a exibição dos valores dos sliders e verifica soma
    function updateWeightsDisplay() {
        let total = 0;
        sliders.forEach(slider => {
            const val = parseInt(slider.value);
            const id = slider.id.replace('slider-', '');
            document.getElementById(`value-${id}`).innerText = val + '%';
            total += val;
        });
        totalSpan.innerText = total;

        if (total !== 100) {
            weightWarning.classList.remove('hidden');
        } else {
            weightWarning.classList.add('hidden');
        }
        return total;
    }

    // Renderiza ranking
    function renderRanking(finalScores) {
        const sorted = Object.entries(finalScores)
            .sort((a, b) => b[1] - a[1])
            .map(([terrain, score]) => ({ terrain, score: score.toFixed(2) }));

        let html = '';
        sorted.forEach((item, index) => {
            let medal = '';
            if (index === 0) medal = '🥇 ';
            else if (index === 1) medal = '🥈 ';
            else if (index === 2) medal = '🥉 ';
            html += `<div class="ranking-item">${medal}Terreno ${item.terrain} <span>${item.score}</span></div>`;
        });
        rankingList.innerHTML = html;
    }

    // Atualiza gráficos
    function updateCharts(finalScores, scores, weights) {
        const terrains = ['A', 'B', 'C', 'D'];
        const labels = terrains.map(t => `Terreno ${t}`);
        const values = terrains.map(t => finalScores[t]);

        // Bar chart
        if (barChart) barChart.destroy();
        const barCtx = document.getElementById('bar-chart').getContext('2d');
        barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pontuação ponderada',
                    data: values,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, max: 10 }
                }
            }
        });

        // Radar chart: para visualizar o perfil de cada terreno (médias por critério)
        const criteriaLabels = {
            preco: 'Preço',
            localizacao: 'Localização',
            topografia: 'Topografia',
            solo: 'Tipo de solo',
            legislacao: 'Potencial construtivo',
            infra: 'Infraestrutura'
        };
        const radarDatasets = terrains.map((t, idx) => {
            const color = `hsl(${idx * 90}, 70%, 60%)`;
            return {
                label: `Terreno ${t}`,
                data: Object.keys(criteriaLabels).map(c => scores[c][t]),
                borderColor: color,
                backgroundColor: color.replace('60%', '0.2'),
                tension: 0.1
            };
        });

        if (radarChart) radarChart.destroy();
        const radarCtx = document.getElementById('radar-chart').getContext('2d');
        radarChart = new Chart(radarCtx, {
            type: 'radar',
            data: {
                labels: Object.values(criteriaLabels),
                datasets: radarDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                },
                scales: {
                    r: { min: 0, max: 10, ticks: { stepSize: 2 } }
                }
            }
        });
    }

    // Função principal de atualização (chamada em qualquer mudança)
    function updateAll() {
        const total = updateWeightsDisplay();
        if (total !== 100) return; // não atualiza os gráficos se soma inválida

        const weights = getWeights();
        const scores = getScores();
        const finalScores = calculateFinalScores(weights, scores);
        renderRanking(finalScores);
        updateCharts(finalScores, scores, weights);
    }

    // Event listeners
    sliders.forEach(slider => {
        slider.addEventListener('input', updateAll);
    });

    scoreInputs.forEach(input => {
        input.addEventListener('input', updateAll);
    });

    // Inicialização
    updateAll();
});
