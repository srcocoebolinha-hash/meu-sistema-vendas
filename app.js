const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();
const porta = process.env.PORT || 3000;

// Conexão com MongoDB Atlas
mongoose.connect('mongodb+srv://<hashdothithias>:<Mat142_allowed>@<hashdomathias>.mongodb.net/?retryWrites=true&w=majority', {
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

// Exemplo de uso - Criar uma nova venda
const newSale = new Sale({
  productId: '648e8a8d4c2c8a2c8a8d4c2c',
  quantity: 2,
  customerName: 'John Doe',
  total: 10.99,
});

newSale.save((err, sale) => {
  if (err) {
    console.error(err);
  } else {
    console.log(sale);
  }
});

// Permite que o servidor entenda dados enviados pelo site
app.use(express.json());
app.use(express.static('.')); // Serve o seu index.html automaticamente

// ROTA: O site vai "chamar" este endereço para salvar a venda
app.post('/registrar-venda', (req, res) => {
    const venda = req.body;
    const linha = `Produto: ${venda.produto} | Valor: R$${venda.valor} | Data: ${new Date().toLocaleDateString()}\n`;

    fs.appendFile('vendas.txt', linha, (err) => {
        if (err) return res.status(500).send("Erro no servidor");
        res.send("✅ Venda salva com sucesso!");
    });
});

app.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});