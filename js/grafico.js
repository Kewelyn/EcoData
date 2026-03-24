document.addEventListener('DOMContentLoaded', async () => {
    // 1. BUSCAR DADOS DO FIREBASE (A única mudança real é aqui)
    const querySnapshot = await db.collection("especies").get();
    const especies = [];
    querySnapshot.forEach((doc) => {
        especies.push(doc.data());
    });

    // 2. ATUALIZAR OS CARDS DE TOTAL (Lá no topo do Dashboard)
    // Ele procura o elemento e conta quantos tem no banco
    if(document.getElementById('total-aves')) 
        document.getElementById('total-aves').innerText = especies.filter(e => e.grupo === "Aves").length;
    if(document.getElementById('total-mamiferos'))
        document.getElementById('total-mamiferos').innerText = especies.filter(e => e.grupo === "Mamíferos").length;
    if(document.getElementById('total-repteis'))
        document.getElementById('total-repteis').innerText = especies.filter(e => e.grupo === "Répteis").length;

    // 3. IDENTIFICAR TODOS OS GRUPOS EXISTENTES NO BANCO (Dinâmico)
    const gruposNoBanco = [...new Set(especies.map(e => e.grupo))]; 
    const biomasNoBanco = [...new Set(especies.map(e => e.bioma).filter(b => b))];

    // --- GRÁFICO 1: STATUS DE AMEAÇA (Mantendo suas cores e estilo) ---
    const ctxStatus = document.getElementById('graficoStatus').getContext('2d');
    new Chart(ctxStatus, {
        type: 'bar',
        data: {
            labels: gruposNoBanco, // Agora ele coloca todos os grupos que você importou
            datasets: [
                { 
                    label: 'VU', 
                    data: gruposNoBanco.map(g => especies.filter(e => e.grupo === g && e.categoria.includes("Vulnerável")).length), 
                    backgroundColor: '#FFD700' 
                },
                { 
                    label: 'EN', 
                    data: gruposNoBanco.map(g => especies.filter(e => e.grupo === g && e.categoria.includes("Em Perigo") && !e.categoria.includes("Criticamente")).length), 
                    backgroundColor: '#FF8C00' 
                },
                { 
                    label: 'CR', 
                    data: gruposNoBanco.map(g => especies.filter(e => e.grupo === g && e.categoria.includes("Criticamente")).length), 
                    backgroundColor: '#DC143C' 
                }
            ]
        },
        options: {
            responsive: true,
            scales: { x: { stacked: true }, y: { stacked: true, beginAtZero: true } }
        }
    });

    // --- GRÁFICO 2: DISTRIBUIÇÃO POR BIOMA (Mantendo seu estilo Doughnut) ---
    const biomasContagem = {};
    especies.forEach(e => {
        if(e.bioma) biomasContagem[e.bioma] = (biomasContagem[e.bioma] || 0) + 1;
    });

    const ctxBiomas = document.getElementById('graficoBiomas').getContext('2d');
    new Chart(ctxBiomas, {
        type: 'doughnut',
        data: {
            labels: Object.keys(biomasContagem),
            datasets: [{
                data: Object.values(biomasContagem),
                backgroundColor: ['#2E7D32', '#81C784', '#FFB300', '#D32F2F', '#0288D1', '#795548']
            }]
        },
        options: { responsive: true, plugins: { legend: { position: 'bottom' } } }
    });

    // --- GRÁFICO 3: NÍVEL DE AMEAÇA POR BIOMA ---
    const ctxBiomaStatus = document.getElementById('graficoBiomaStatus').getContext('2d');
    new Chart(ctxBiomaStatus, {
        type: 'bar',
        data: {
            labels: biomasNoBanco,
            datasets: [
                { 
                    label: 'VU', 
                    data: biomasNoBanco.map(b => especies.filter(e => e.bioma === b && e.categoria.includes("Vulnerável")).length), 
                    backgroundColor: '#FFD700' 
                },
                { 
                    label: 'EN', 
                    data: biomasNoBanco.map(b => especies.filter(e => e.bioma === b && e.categoria.includes("Em Perigo") && !e.categoria.includes("Criticamente")).length), 
                    backgroundColor: '#FF8C00' 
                },
                { 
                    label: 'CR', 
                    data: biomasNoBanco.map(b => especies.filter(e => e.bioma === b && e.categoria.includes("Criticamente")).length), 
                    backgroundColor: '#DC143C' 
                }
            ]
        },
        options: {
            responsive: true,
            scales: { x: { stacked: true }, y: { stacked: true } }
        }
    });
});