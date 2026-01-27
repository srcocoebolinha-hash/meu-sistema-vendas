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
        const venda = req.body;
        const novaVenda = new Sale({
            productId: venda.productId,
            quantity: venda.quantity,
            customerName: venda.customerName,
            total: venda.total
        });
        
        await novaVenda.save();
        res.status(200).send("✅ Venda salva com sucesso!");
    } catch (err) {
        res.status(500).send("❌ Erro ao salvar venda no banco");
    }
});

// Servir arquivos estáticos (HTML, CSS, JS)
app.use(express.static('.'));

// Iniciar servidor
const porta = process.env.PORT || 3000;
app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});