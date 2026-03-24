// 1. Função que busca no Firebase e desenha a tabela principal
async function carregarDadosDoBanco() {
    const corpoTabela = document.getElementById('corpoTabela');
    const grupoSelecionado = document.getElementById('filterGrupo').value;
    
    // Feedback visual enquanto carrega
    corpoTabela.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Carregando dados do Firebase...</td></tr>";

    try {
        let consulta = db.collection("especies");

        // Aplica o filtro de grupo se não for "Todos"
        if (grupoSelecionado !== "Todos") {
            consulta = consulta.where("grupo", "==", grupoSelecionado);
        }

        const snapshot = await consulta.get();
        let linhas = "";
        let contador = 1;

        snapshot.forEach((doc) => {
            const animal = doc.data();
            
            // Lógica de cores FIEL ao seu CSS original
            let classeCSS = "";
            const cat = (animal.categoria || "").toLowerCase();

            if (cat.includes("vulnerável")) classeCSS = "vu";
            else if (cat.includes("criticamente")) classeCSS = "cr";
            else if (cat.includes("em perigo")) classeCSS = "en";

            linhas += `
                <tr>
                    <td>${contador++}</td>
                    <td><strong><i>${animal.especie || "N/A"}</i></strong></td>
                    <td>${animal.nome_comum || "---"}</td>
                    <td>${animal.grupo || "---"}</td>
                    <td><span class="status ${classeCSS}">${animal.categoria}</span></td>
                    <td>${animal.bioma || "Não informado"}</td>
                </tr>
            `;
        });

        corpoTabela.innerHTML = linhas || "<tr><td colspan='6'>Nenhuma espécie encontrada.</td></tr>";

    } catch (error) {
        console.error("Erro ao carregar espécies:", error);
        corpoTabela.innerHTML = "<tr><td colspan='6' style='color:red;'>Erro ao conectar com o banco de dados.</td></tr>";
    }
}

// 2. Função de pesquisa por texto (Pesquisa na tabela já carregada)
function filtrarTexto() {
    const input = document.getElementById("searchInput").value.toUpperCase();
    const rows = document.getElementById("corpoTabela").getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {
        const text = rows[i].textContent || rows[i].innerText;
        rows[i].style.display = text.toUpperCase().includes(input) ? "" : "none";
    }
}

// 3. Inicialização
document.addEventListener('DOMContentLoaded', carregarDadosDoBanco);

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