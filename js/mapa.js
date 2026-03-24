Chart.register(ChartGeo.ChoroplethController, ChartGeo.GeoFeature, ChartGeo.ColorScale, ChartGeo.ProjectionScale);

async function carregarMapa() {
    try {
        // 1. CARREGA A FORMA (Arquivo fixo no seu projeto)
        const response = await fetch('js/brasil-estados.json'); // ou o nome do seu arquivo .json
        const geoJsonData = await response.json();

        // 2. BUSCA OS DADOS NO BANCO (Firebase)
        const querySnapshot = await db.collection("especies").get();
        
        // Criamos um contador: { "AM": 5, "SP": 10... }
        const contagemPorSigla = {};

        // Inicializa todas as siglas que existem no seu JSON com zero
        geoJsonData.features.forEach(feature => {
            contagemPorSigla[feature.properties.sigla] = 0;
        });

        // Mapeamento de Nome para Sigla (Caso seu banco salve "Amazonas" em vez de "AM")
        const deNomeParaSigla = {
            "Amazonas": "AM", "Amapá": "AP", "São Paulo": "SP", "Rio de Janeiro": "RJ",
            // ... adicione os outros estados conforme a necessidade
        };

        querySnapshot.forEach((doc) => {
            const animal = doc.data();
            // Se no banco estiver "AM", usa direto. Se estiver "Amazonas", converte.
            const sigla = deNomeParaSigla[animal.estado] || animal.estado;
            
            if (contagemPorSigla[sigla] !== undefined) {
                contagemPorSigla[sigla]++;
            }
        });

        // 3. PREPARA OS DADOS PARA O GRÁFICO
        const dadosParaOMapa = geoJsonData.features.map((feature) => ({
            feature: feature,
            value: contagemPorSigla[feature.properties.sigla] || 0
        }));

        // 4. DESENHA O MAPA
        const ctx = document.getElementById('mapa-brasil').getContext('2d');
        new Chart(ctx, {
            type: 'choropleth',
            data: {
                labels: geoJsonData.features.map(f => f.properties.name),
                datasets: [{
                    label: 'Espécies Ameaçadas',
                    outline: geoJsonData.features,
                    data: dadosParaOMapa,
                    borderColor: '#ffffff',
                    borderWidth: 0.5
                }]
            },
            options: {
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    projection: {
                        axis: 'xy',
                        projection: 'mercator'
                    },
                    color: {
                        axis: 'x',
                        interpolate: 'YlOrRd', // Escala de cores (Amarelo -> Vermelho)
                        min: 0,
                        // Define o máximo baseado no estado que tem mais espécies
                        max: Math.max(...Object.values(contagemPorSigla), 1)
                    }
                }
            }
        });

    } catch (error) {
        console.error("Erro ao montar o mapa:", error);
    }
}

carregarMapa();