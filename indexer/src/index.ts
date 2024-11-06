// indexer/src/index.ts
import { Client } from "@elastic/elasticsearch";
import mysql, { RowDataPacket } from "mysql2/promise";
import cron from "node-cron";

interface User extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  created_at: Date;
}

const esClient = new Client({ node: `http://${process.env.ES_HOST}:9200` });

async function checkConnection() {
  try {
    await esClient.ping();
    console.log("Conexão com Elasticsearch estabelecida com sucesso");
  } catch (error) {
    console.error("Erro ao conectar com Elasticsearch:", error);
    process.exit(1);
  }
}

async function setupElasticsearch() {
  try {
    const indexExists = await esClient.indices.exists({ index: "users" });

    if (!indexExists) {
      console.log("Criando índice users...");
      await esClient.indices.create({
        index: "users",
        body: {
          mappings: {
            properties: {
              id: { type: "integer" },
              name: { type: "text" },
              email: { type: "keyword" },
              created_at: { type: "date" },
            },
          },
        },
      });
      console.log("Índice users criado com sucesso");
    } else {
      console.log("Índice users já existe");
    }
  } catch (error: any) {
    console.error("Erro ao configurar índice:", error);
    throw error;
  }
}

async function syncUsers() {
  let connection;
  try {
    console.log("Iniciando conexão com MySQL...");
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log("Conexão com MySQL estabelecida");

    console.log("Buscando usuários...");
    const [rows] = await connection.execute<User[]>("SELECT * FROM users");
    console.log(`${rows.length} usuários encontrados`);

    for (const user of rows) {
      console.log(`Indexando usuário ${user.id} - ${user.name}...`);
      await esClient.index({
        index: "users",
        id: user.id.toString(),
        body: user,
        refresh: true, // Força refresh do índice
      });
    }

    console.log("Usuários sincronizados com sucesso");
  } catch (error) {
    console.error("Erro na sincronização:", error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log("Conexão com MySQL encerrada");
    }
  }
}

async function main() {
  console.log("Iniciando aplicação...");

  try {
    await checkConnection();
    await setupElasticsearch();

    // Executa uma sincronização inicial
    console.log("Executando sincronização inicial...");
    await syncUsers();

    // Configura a sincronização periódica
    console.log("Configurando sincronização periódica...");
    cron.schedule("*/5 * * * *", async () => {
      console.log("Iniciando sincronização agendada...");
      try {
        await syncUsers();
      } catch (error) {
        console.error("Erro na sincronização agendada:", error);
      }
    });

    console.log("Aplicação iniciada com sucesso");
  } catch (error) {
    console.error("Erro fatal:", error);
    process.exit(1);
  }
}
setTimeout(() => {
  main().catch((error) => {
    console.error("Erro não tratado:", error);
    process.exit(1);
  });
}, 20000);
