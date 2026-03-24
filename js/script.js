// Variável global para guardar os dados que vierem do Firebase
let todasEspeciesDoBanco = [];

// 1. Função que preenche a tabela no Modal
function mostrarNaTabela(dadosParaExibir) {
    const modal = document.getElementById('detalhes-especies');
    const corpoTabela = document.getElementById('corpo-tabela');
    
    corpoTabela.innerHTML = ""; 

    if (dadosParaExibir && dadosParaExibir.length > 0) {
        let linhas = "";
        dadosParaExibir.forEach((animal, index) => {
            // AJUSTE AQUI: usando os nomes de campos do seu JSON do Firebase
            const nomeCientifico = animal.especie || "N/A";
            const nomeComum = animal.nome_comum || "Não informado";
            const categoria = animal.categoria || "N/A";
            const bioma = animal.bioma || "Geral";

            linhas += `
                <tr>
                    <td>${index + 1}</td>
                    <td><em>${nomeCientifico}</em></td>
                    <td>${nomeComum}</td>
                    <td><span class="status-tag status-${categoria.toLowerCase().replace(/ /g, '-')}">${categoria}</span></td>
                    <td>${bioma}</td>
                </tr>
            `;
        });
        corpoTabela.innerHTML = linhas;
        modal.style.display = "flex"; 
    }
}

// 2. ÚNICA função de filtragem que os gráficos vão chamar
function filtrarAnimais(categoriaAlvo, grupoAlvo) {
    // Agora filtramos na variável global que alimentamos no carregamento
    const filtrados = todasEspeciesDoBanco.filter(animal => {
        // Verifica se o grupo bate E se a categoria contém o texto alvo (ex: "Vulnerável")
        return animal.grupo === grupoAlvo && animal.categoria.includes(categoriaAlvo);
    });
    
    mostrarNaTabela(filtrados);
}

// 3. Eventos de fechar e carregar
document.addEventListener('DOMContentLoaded', async () => {
    // Aguarda o Firebase carregar os dados para a variável global
    // Importante: No seu grafico.js, você deve preencher 'todasEspeciesDoBanco'
    const querySnapshot = await db.collection("especies").get();
    querySnapshot.forEach(doc => todasEspeciesDoBanco.push(doc.data()));

    // Botão Fechar
    const btnFechar = document.getElementById('fechar-modal');
    const modal = document.getElementById('detalhes-especies');
    
    if(btnFechar) {
        btnFechar.onclick = () => modal.style.display = "none";
    }

    // Fechar ao clicar fora
    window.onclick = (event) => {
        if (event.target == modal) modal.style.display = "none";
    };
});