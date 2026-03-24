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