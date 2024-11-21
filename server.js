const cors = require('cors');

const express = require('express');   // Importa o Express
const bodyParser = require('body-parser'); // Importa o body-parser para tratar requisições POST
const db = require('./db');           // Importa a configuração do banco de dados (db.js)
const path = require('path');

const app = express();                // Cria uma instância do Express

app.use(bodyParser.urlencoded({ extended: true })); // Configura o body-parser
app.use(express.static('public')); // Serve arquivos estáticos da pasta 'public'

//

// Middleware para parse do body
app.use(bodyParser.urlencoded({ extended: true }));

// Configura a pasta 'public' como pasta estática
app.use(express.static('public'));

// Rota para o cadastro
app.post('/register', (req, res) => {
  const { firstname, email, password } = req.body;
  
  // Insere os dados do formulário na tabela tb_proprietario
  const query = 'INSERT INTO tb_proprietario (nome, email, senha) VALUES (?, ?, ?)';
  db.query(query, [firstname, email, password], (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      res.status(500).send('Erro ao cadastrar.');
    } else {
      console.log('Dados inseridos com sucesso:', result);
      res.send('Cadastro realizado com sucesso!');
    }
  });
});

app.listen(5000, () => {
  console.log('Servidor rodando na porta 5000');
});
// Middleware para parse do body
app.use(bodyParser.urlencoded({ extended: true }));

// Configura a pasta 'public' como pasta estática
app.use(express.static('public'));

// Rota para a página de cadastro
app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Rota para processar o formulário de cadastro
app.post('/register', (req, res) => {
  const { firstname, email, password } = req.body;

  const query = 'INSERT INTO tb_proprietario (nome, email, senha) VALUES (?, ?, ?)';
  db.query(query, [firstname, email, password], (err, result) => {
    if (err) {
      console.error('Erro ao inserir dados:', err);
      res.status(500).send('Erro ao cadastrar.');
    } else {
      console.log('Dados inseridos com sucesso:', result);
      res.send('Cadastro realizado com sucesso!');
    }
  });
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});


// Rota para a página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota para processar o login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const query = 'SELECT * FROM tb_proprietario WHERE email = ? AND senha = ?';
  db.query(query, [email, password], (err, results) => {
    if (err) {
      console.error('Erro ao verificar usuário:', err);
      return res.status(500).send('Erro interno do servidor');
    }

    if (results.length > 0) {
      console.log('Usuário autenticado:', results[0]);
      res.redirect('/cadastrar'); // Redireciona para a página de cadastro de locais
    } else {
      res.status(401).send('E-mail ou senha incorretos');
    }
  });
});


// Rota para cadastrar um local
app.post('/cadastrar', (req, res) => {
  const { endereco, tipoCamera, capacidade } = req.body;

  // Divide o endereço em partes, se necessário
  const enderecoPartes = endereco.split(',');
  const rua = enderecoPartes[0]?.trim();
  const cidade = enderecoPartes[1]?.trim();
  const estado = enderecoPartes[2]?.trim();

  // Insere no banco
  const query = `
    INSERT INTO tb_local (endereco_rua, endereco_cidade, endereco_estado, camera, capacidade)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(query, [rua, cidade, estado, tipoCamera, capacidade], (err, result) => {
    if (err) {
      console.error('Erro ao cadastrar local:', err);
      return res.status(500).send('Erro ao cadastrar o local.');
    }

    // Redireciona para a página de contagem passando os dados do local
    const localInfo = {
      rua,
      cidade,
      estado,
      tipoCamera,
      capacidade,
    };
    res.redirect(`/contagem?rua=${encodeURIComponent(rua)}&cidade=${encodeURIComponent(cidade)}&estado=${encodeURIComponent(estado)}&tipoCamera=${encodeURIComponent(tipoCamera)}&capacidade=${encodeURIComponent(capacidade)}`);
  });
});

// Rota para exibir a página de cadastro de locais
app.get('/cadastrar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'locaiscadastro.html'));
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//Rota para Renderizar a Página de Contagem
app.get('/contagem', (req, res) => {
  const { rua, cidade, estado, tipoCamera, capacidade } = req.query;

  // Renderiza o HTML com as informações do local
  res.send(`
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contagem de Local</title>
        <style>
        body {
            font-family: Arial, sans-serif;
            background: rgb(0,176,255);
            background: linear-gradient(rgba(124, 124, 124, 0.247), rgba(119, 119, 119, 0.7)), url(img/fundo.png);
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            color: #333;
        }

        /* Botão de voltar */
        .back-button {
            position: absolute;
            top: 20px;
            left: 20px;
            color: #007bff;
            border: 2px solid #007bff;
            background-color: transparent;
            padding: 8px 16px;
            font-size: 16px;
            border-radius: 6px;
            cursor: pointer;
            text-decoration: none;
            font-weight: bold;
            transition: 0.3s;
        }
        .back-button:hover {
            background-color: #007bff;
            color: white;
        }

        /* Contêiner principal */
        .container-fluid {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 85%;
            max-width: 1200px;
            gap: 40px;
        }

        /* Estilos para os cards */
        .info-card, .counter-container {
            border-radius: 15px;
            padding: 40px;
            width: 50%;
            max-width: 500px;
            min-height: 380px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            transition: 0.3s;
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .info-card:hover, .counter-container:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        /* Estilos específicos do card de informações */
        .info-card {
            background-color: #ffffff;
            color: #333;
            border: 2px solid #d0e7ff;
        }
        .info-card h2 {
            font-size: 30px;
            color: #333;
            margin-bottom: 20px;
            border-bottom: 2px solid #d0e7ff;
            padding-bottom: 10px;
        }
        .info-card p {
            margin: 12px 0;
            line-height: 1.7;
            font-size: 18px;
        }

        /* Estilos específicos do contador */
        .counter-container {
            background-color: #007bff;
            color: #ffffff;
            text-align: center;
        }
        .counter-container h1 {
            font-size: 30px;
            margin-bottom: 20px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 10px;
            color: #ffffff;
        }
        .counter-value {
            font-size: 56px;
            font-weight: bold;
            margin-top: 15px;
        }
        #limite {
            font-size: 28px;
            color: rgba(255, 255, 255, 0.7);
        }
        </style>
    </head>
    <body>
        <div class="info-card">
            <h2>Informações do Local</h2>
            <p><strong>Capacidade Máxima:</strong> ${capacidade} pessoas</p>
            <p><strong>Endereço:</strong> ${rua}, ${cidade}, ${estado}</p>
            <p><strong>Tipo de Câmera:</strong> ${tipoCamera}</p>
            <p><strong>Status:</strong> Aberto</p>
        </div>
        <div class="counter-container">
            <h1>Contagem Atual</h1>
            <div class="counter-value">
                <span id="cont">0</span><span id="limite">/${capacidade}</span>
            </div>
        </div>
        
    </body>
    </html>
  `);
});


function preencherDados() {
  const { rua, cidade, estado, tipoCamera, capacidade } = getQueryParams();

  // Substituir os dados no HTML
  const capacidadeMaximaEl = document.getElementById('capacidade-maxima');
  const enderecoEl = document.getElementById('endereco');
  const tipoCameraEl = document.getElementById('tipo-camera');
  const limiteEl = document.getElementById('limite');

  if (capacidadeMaximaEl) capacidadeMaximaEl.textContent = `${capacidade} pessoas`;
  if (enderecoEl) enderecoEl.textContent = `${rua}, ${cidade}, ${estado}`;
  if (tipoCameraEl) tipoCameraEl.textContent = tipoCamera;
  if (limiteEl) limiteEl.textContent = `/${capacidade}`;
}