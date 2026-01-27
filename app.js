const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://<hashdothithias>:<Mat142_allowed>@<hashdomathias>.mongodb.net/?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Conectado ao MongoDB Atlas'))
.catch(err => console.log('❌ Erro ao conectar:', err));

// Schema de Venda
const vendaSchema = new mongoose.Schema({
  produto: String,
  valor: Number,
  data: { type: Date, default: Date.now }
});

const Venda = mongoose.model('Venda', vendaSchema);

// Middleware
app.use(express.json());

// ROTA: O site vai "chamar" este endereço para salvar a venda
app.post('/registrar-venda', async (req, res) => {
    try {
        console.log("Dados recebidos:", req.body); // Isso ajuda a ver o erro no log
        const novaVenda = new Venda(req.body);
        await novaVenda.save();
        
        // ESSA LINHA É O QUE FAZ O "PROCESSANDO" PARAR
        return res.status(201).json({ mensagem: "Venda salva com sucesso!" });
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor", detalhe: erro.message });
    }
});

// Rota para buscar todas as vendas
app.get('/vendas', async (req, res) => {
    try {
        const vendas = await Venda.find().sort({ data: -1 }); // Traz as mais recentes primeiro
        res.json(vendas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar vendas" });
    }
});

// Rota para deletar uma única venda
app.delete('/vendas/:id', async (req, res) => {
    try {
        await Venda.findByIdAndDelete(req.params.id);
        res.json({ mensagem: "Venda removida com sucesso!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao deletar a venda." });
    }
});

// Rota para resetar o banco de dados
app.delete('/limpar-histórico', async (req, res) => {
    try {
        await Venda.deleteMany({});
        res.json({ mensagem: "Todo o histórico foi apagado!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao limpar o histórico." });
    }
});

// Rota para verificar senha do relatório
app.post('/verificar-senha', (req, res) => {
    const { senha } = req.body;
    const senhaMestra = process.env.SENHA_RELATORIO;

    if (senha === senhaMestra) {
        res.json({ autorizado: true });
    } else {
        res.json({ autorizado: false });
    }
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('.'));

// Iniciar servidor
const porta = process.env.PORT || 3000;
app.listen(porta, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${porta}`);
});