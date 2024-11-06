// api/src/index.ts
import express from "express";
import { Client } from "@elastic/elasticsearch";

interface User {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

interface SearchResponse<T> {
  hits: {
    hits: Array<{
      _source: T;
      _id: string;
      _index: string;
      _score: number;
    }>;
    total: {
      value: number;
      relation: string;
    };
    max_score: number;
  };
}

const app = express();
const esClient = new Client({ node: `http://${process.env.ES_HOST}:9200` });

async function checkElasticsearch() {
  try {
    await esClient.ping();
    console.log("Conexão com Elasticsearch estabelecida");

    const indexExists = await esClient.indices.exists({ index: "users" });
    if (!indexExists) {
      console.error("Índice users não encontrado");
      throw new Error("Índice não encontrado");
    }
    console.log("Índice users encontrado");
  } catch (error) {
    console.error("Erro ao verificar Elasticsearch:", error);
    throw error;
  }
}

app.get("/users", async (req, res) => {
  try {
    await checkElasticsearch();

    const { body } = await esClient.search<SearchResponse<User>>({
      index: "users",
      body: {
        query: {
          match_all: {},
        },
      },
    });

    const users = body.hits.hits.map((hit) => hit._source);
    console.log(`${users.length} usuários encontrados`);
    res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

app.get("/users/search", async (req, res) => {
  const { q } = req.query;

  if (!q || typeof q !== "string") {
    return res.status(400).json({ error: "Parâmetro de busca é obrigatório" });
  }

  try {
    await checkElasticsearch();

    const { body } = await esClient.search<SearchResponse<User>>({
      index: "users",
      body: {
        query: {
          multi_match: {
            query: q,
            fields: ["name", "email"],
          },
        },
      },
    });

    const users = body.hits.hits.map((hit) => hit._source);
    console.log(`${users.length} usuários encontrados para a busca "${q}"`);
    res.json(users);
  } catch (error) {
    console.error("Erro na busca:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`API rodando na porta ${port}`);
});
