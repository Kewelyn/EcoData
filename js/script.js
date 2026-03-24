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

function exportarParaCSV() {
    // 1. Seleciona a tabela (especiesTable)
    const tabela = document.getElementById("especiesTable");
    if (!tabela) {
        alert("A tabela ainda não foi carregada!");
        return;
    }

    let csv = [];
    const linhas = tabela.querySelectorAll("tr");

    for (const linha of linhas) {
        const colunas = linha.querySelectorAll("th, td");
        const conteudoLinha = [];

        for (const coluna of colunas) {
            // Limpa o texto: remove quebras de linha e troca vírgulas por ponto-e-vírgula
            // Isso evita que o CSV quebre as colunas errado
            let texto = coluna.innerText.replace(/(\r\n|\n|\r)/gm, "").replace(/,/g, ";");
            conteudoLinha.push(texto);
        }
        
        // Junta as colunas com vírgula (formato CSV)
        csv.push(conteudoLinha.join(","));
    }

    // 2. Transforma o array de strings em um arquivo (Blob)
    // O "\ufeff" serve para o Excel entender caracteres especiais (acentos)
    const csvFinal = "\ufeff" + csv.join("\n");
    const blob = new Blob([csvFinal], { type: "text/csv;charset=utf-8;" });

    // 3. Cria um link invisível para disparar o download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "especies_ameacadas_ecodata.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}