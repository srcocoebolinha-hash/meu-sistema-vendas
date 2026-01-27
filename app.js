const express = require('express');
const fs = require('fs');
const app = express();
const porta = process.env.PORT || 3000;

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