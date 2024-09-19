import { Elysia } from "elysia";
import { Client, Databases, Query } from "node-appwrite";

const api = "[APPWRITE_API_URL]";
const apiKey = "[APPWRITE_API_KEY]";
const projectId = "[APPWRITE_PROJECT_ID]";
const databaseId = "[APPWRITE_DATABASE_ID]";
const usersCollectionId = "[APPWRITE_USERS_COLLECTION_ID]";
const productsCollectionId = "[APPWRITE_PRODUCTS_COLLECTION_ID]";

const client = new Client()
  .setEndpoint(api)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

const app = new Elysia();

app
  .get("/random-user", async () => {
    const user = await databases.listDocuments(databaseId, usersCollectionId, [
      Query.equal("name", "Thomas Alexander"),
    ]);

    return user;
  })
  .onError(({ error, code }) => {
    if (code === "NOT_FOUND") return;
    console.error(error);
  });

app
  .get("/random-products", async () => {
    const products = await databases.listDocuments(
      databaseId,
      productsCollectionId,
      [
        Query.select(["name", "image"]),
        Query.search("name", "game"),
        Query.isNotNull("image"),
        Query.orderAsc("name"),
        Query.limit(10),
      ]
    );

    return products;
  })
  .onError(({ error, code }) => {
    if (code === "NOT_FOUND") return;
    console.error(error);
  });

app.listen(3000);
