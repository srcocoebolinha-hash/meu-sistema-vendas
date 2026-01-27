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
const saleSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const Sale = mongoose.model('Sale', saleSchema);

// Middleware
app.use(express.json());

// ROTA: O site vai "chamar" este endereço para salvar a venda
app.post('/registrar-venda', async (req, res) => {
    try {
        console.log("Dados recebidos:", req.body); // Isso ajuda a ver o erro no log
        const novaVenda = new Sale(req.body);
        await novaVenda.save();
        
        // ESSA LINHA É O QUE FAZ O "PROCESSANDO" PARAR
        return res.status(201).json({ mensagem: "Venda realizada com sucesso!" });
    } catch (erro) {
        console.error("Erro ao salvar:", erro);
        return res.status(500).json({ erro: "Erro interno no servidor", detalhe: erro.message });
    }
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('.'));

// Iniciar servidor
const porta = process.env.PORT || 3000;
app.listen(porta, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${porta}`);
});