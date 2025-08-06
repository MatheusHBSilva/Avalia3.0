# Models (SQLite)

Este módulo encapsula a conexão e definição de esquemas de tabelas SQLite usadas pela aplicação.

---

## Conexão com o Banco

Abre (ou cria) o arquivo `database.db` na raiz do projeto:

```js
const sqlite3 = require('sqlite3').verbose();
const path   = require('path');

const db = new sqlite3.Database(
  path.resolve(__dirname, '../../database.db'),
  err => {
    if (err) console.error('Erro ao conectar no SQLite:', err.message);
    else     console.log('Conectado ao SQLite com sucesso');
  }
);
```

## Função `initTables()`:
Executa comandos `CREATE TABLE IF NOT EXISTS` em sequência (`db.serialize()`) para garantir que todas as tabelas existam. Deve ser chamada uma vez (ou a cada start) antes de usar o banco.

```js
function initTables() {
  db.serialize(() => {
    db.run(/* CREATE TABLE restaurants */);
    db.run(/* CREATE TABLE clients */);
    db.run(/* CREATE TABLE favoritos */);
    db.run(/* CREATE TABLE reviews */);
    db.run(/* CREATE TABLE reports */);
  });
}
```

## Exportação
O módulo expõe:

```js
module.exports = {
  db,         // instância de sqlite3.Database
  initTables // função para criar as tabelas
};
```