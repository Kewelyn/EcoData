// Configurações do seu projeto EcoData
const firebaseConfig = {
  apiKey: "AIzaSyCEV-o1j-sAlWeK56vr21vnA4jrir2l4qk",
  authDomain: "ecodata-2e64f.firebaseapp.com",
  projectId: "ecodata-2e64f",
  storageBucket: "ecodata-2e64f.firebasestorage.app",
  messagingSenderId: "275775249441",
  appId: "1:275775249441:web:50c76a05edbcb399b69760"
};

// Inicializa o Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Inicializa o Firestore
const db = firebase.firestore();

// --- CORREÇÃO PARA O ERRO 404 / TIMEOUT ---
// Força o Firebase a usar um método de conexão que passa melhor por redes instáveis
db.settings({
  experimentalForceLongPolling: true,
  experimentalAutoDetectLongPolling: false, // Adicione esta linha para matar o conflito
  merge: true
});

// Opcional: Habilitar persistência offline local para carregar INSTANTÂNEO no F5
firebase.firestore().enablePersistence()
  .catch((err) => {
      console.log("Persistência não ativada (comum em múltiplas abas abertas)");
  });

console.log("EcoData: Conexão otimizada e persistência ativa.");