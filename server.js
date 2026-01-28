const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// CONFIGURAÇÃO DE SEGURANÇA
const SENHA_MESTRE = "1234"; 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CONEXÃO MONGODB
const url = 'mongodb://localhost:27017';
const dbName = 'sistemaVendas';
let db;

// --- SISTEMA DE BACKUP ---
async function realizarBackup() {
    try {
        const colecoes = ['vendas', 'clientes', 'sangrias'];
        const pastaBackupRaiz = path.join(__dirname, 'backups');

        // Cria a pasta principal de backups se não existir
        if (!fs.existsSync(pastaBackupRaiz)) fs.mkdirSync(pastaBackupRaiz);

        // Cria uma pasta específica para este momento (Timestamp)
        const agora = new Date();
        const timestamp = `${agora.getFullYear()}-${(agora.getMonth()+1).toString().padStart(2, '0')}-${agora.getDate().toString().padStart(2, '0')}_${agora.getHours()}-${agora.getMinutes()}`;
        const pastaPastaAtual = path.join(pastaBackupRaiz, `backup_${timestamp}`);
        fs.mkdirSync(pastaPastaAtual);

        for (const col of colecoes) {
            const dados = await db.collection(col).find().toArray();
            fs.writeFileSync(
                path.join(pastaPastaAtual, `${col}.json`), 
                JSON.stringify(dados, null, 2)
            );
        }
        console.log(`💾 Backup de segurança gerado em: ${pastaPastaAtual}`);
    } catch (err) {
        console.error("❌ Erro ao realizar backup:", err);
    }
}

MongoClient.connect(url)
    .then(async client => {
        db = client.db(dbName);
        console.log("✅ Conectado ao MongoDB");
        
        // Roda o backup assim que o servidor liga
        await realizarBackup(); 
    })
    .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));

// --- ROTAS DE SEGURANÇA ---
app.post('/verificar-senha', (req, res) => {
    const { senha } = req.body;
    res.json({ autorizado: senha === SENHA_MESTRE });
});

// --- ROTAS DE VENDAS ---
app.post('/registrar-venda', async (req, res) => {
    try {
        const novaVenda = { ...req.body, valor: parseFloat(req.body.valor), data: new Date() };
        await db.collection('vendas').insertOne(novaVenda);
        res.status(201).json({ status: 'Venda salva' });
    } catch (err) { res.status(500).send(err); }
});

app.get('/vendas', async (req, res) => {
    const vendas = await db.collection('vendas').find().sort({ data: -1 }).toArray();
    res.json(vendas);
});

app.delete('/vendas/:id', async (req, res) => {
    await db.collection('vendas').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ status: 'Removido' });
});

// --- ROTAS DE SANGRIAS ---
app.post('/registrar-sangria', async (req, res) => {
    try {
        const novaSangria = { ...req.body, valor: parseFloat(req.body.valor), data: new Date() };
        await db.collection('sangrias').insertOne(novaSangria);
        res.json({ status: 'Sangria registrada' });
    } catch (err) { res.status(500).send(err); }
});

app.get('/sangrias', async (req, res) => {
    const sangrias = await db.collection('sangrias').find().sort({ data: -1 }).toArray();
    res.json(sangrias);
});

app.delete('/sangrias/:id', async (req, res) => {
    await db.collection('sangrias').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ status: 'Sangria excluída' });
});

// --- OUTRAS ROTAS ---
app.get('/clientes', async (req, res) => {
    const clientes = await db.collection('clientes').find().toArray();
    res.json(clientes);
});

app.delete('/limpar-histórico', async (req, res) => {
    await db.collection('vendas').deleteMany({});
    await db.collection('sangrias').deleteMany({});
    res.json({ status: 'Tudo limpo' });
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});