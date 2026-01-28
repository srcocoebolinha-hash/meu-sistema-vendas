const express = require('express');
const mongoose = require('mongoose');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('.'));

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'sua_string_aqui', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch(err => console.log('❌ Erro ao conectar:', err));

// --- SCHEMAS ---

// Schema de Venda (AGORA COM CLIENTE)
const vendaSchema = new mongoose.Schema({
  produto: String,
  valor: Number,
  cliente: String, // Campo essencial para o vínculo!
  formaPagamento: String,
  data: { type: Date, default: Date.now }
});
const Venda = mongoose.model('Venda', vendaSchema);

// Schema de Cliente
const clienteSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  whatsapp: { type: String, unique: true, required: true },
  email: String,
  dataCadastro: { type: Date, default: Date.now }
});
const Cliente = mongoose.model('Cliente', clienteSchema);

// --- ROTAS DE VENDAS ---

// Rota Unificada para Registrar Venda
app.post('/registrar-venda', async (req, res) => {
    try {
        console.log("Dados recebidos na venda:", req.body);
        const novaVenda = new Venda(req.body); // Aqui ele pega o campo 'cliente' do JSON
        await novaVenda.save();
        return res.status(201).json({ mensagem: "Venda salva com sucesso!" });
    } catch (erro) {
        console.error("Erro ao salvar venda:", erro);
        return res.status(500).json({ erro: "Erro ao salvar venda" });
    }
});

app.get('/vendas', async (req, res) => {
    try {
        const vendas = await Venda.find().sort({ data: -1 });
        res.json(vendas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar vendas" });
    }
});

app.delete('/vendas/:id', async (req, res) => {
    try {
        await Venda.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Venda removida!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao deletar" });
    }
});

app.delete('/limpar-histórico', async (req, res) => {
    try {
        await Venda.deleteMany({});
        res.json({ mensagem: "Histórico limpo!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao limpar" });
    }
});

// --- ROTAS DE CLIENTES ---

app.post('/clientes', async (req, res) => {
    try {
        const novoCliente = new Cliente(req.body);
        await novoCliente.save();
        res.status(201).json({ mensagem: "Cliente cadastrado!" });
    } catch (erro) {
        if (erro.code === 11000) {
            return res.status(400).json({ erro: "Este WhatsApp já existe!" });
        }
        res.status(500).json({ erro: "Erro ao cadastrar cliente" });
    }
});

app.get('/clientes', async (req, res) => {
    try {
        const clientes = await Cliente.find().sort({ nome: 1 });
        res.json(clientes);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar clientes" });
    }
});

// --- SEGURANÇA ---

app.post('/verificar-senha', (req, res) => {
    const { senha } = req.body;
    if (senha === process.env.SENHA_RELATORIO) {
        res.json({ autorizado: true });
    } else {
        res.json({ autorizado: false });
    }
});

// Iniciar servidor
const porta = process.env.PORT || 3000;
app.listen(porta, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${porta}`);
});