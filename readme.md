# Projeto de Sincronização de Usuários

Este projeto consiste em uma API e um indexador que sincronizam dados de usuários entre um banco de dados MySQL e um índice Elasticsearch.

## Estrutura do Projeto

- `api/`: Contém a API que expõe endpoints para listar e buscar usuários.
- `indexer/`: Contém o indexador que sincroniza os dados de usuários do MySQL para o Elasticsearch.
- `mysql-init/`: Contém o script SQL para inicializar o banco de dados MySQL.
- `docker-compose.yml`: Arquivo de configuração do Docker Compose para subir todos os serviços necessários.

## Subindo o Projeto

Para subir o projeto completo, incluindo MySQL, Elasticsearch, API e Indexador, execute o seguinte comando:

```sh
 docker-compose up --build
```

Para derrubar

```sh
docker-compose down -v
```

## Endpoints da API

### Verificar se o Elasticsearch está rodando

GET http://localhost:9200/\_cat/indices

### Listar todos os usuários

GET http://localhost:3000/users

### Buscar um usuário específico

GET http://localhost:3000/users/search?q=joao

## Dependências

- Docker
- Docker Compose

## Configurações

As configurações de ambiente estão definidas no arquivo `docker-compose.yml`. Certifique-se de que as variáveis de ambiente estão corretamente configuradas para o seu ambiente.

## Scripts de Inicialização

O script SQL para inicializar o banco de dados MySQL está localizado em `mysql-init/init.sql`.
