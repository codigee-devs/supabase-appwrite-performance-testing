import { Elysia } from "elysia";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "[SUPABASE_URL]";
const supabaseKey = "[SUPABASE_KEY]";
const supabaseDbScheme = "public";

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: { schema: supabaseDbScheme },
});

const app = new Elysia();

app
  .get("/random-user", async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("name", "Thomas Alexander");

    if (error) {
      console.error(error);
      return error;
    }

    return data;
  })
  .onError(({ error, code }) => {
    if (code === "NOT_FOUND") return;
    console.error(error);
  });

app
  .get("/random-products", async () => {
    const { data, error } = await supabase
      .from("products")
      .select("name, image")
      .ilike("name", "%game%")
      .not("image", "is", null)
      .order("name", { ascending: true })
      .limit(10);

    if (error) {
      console.error(error);
      return error;
    }

    return data;
  })
  .onError(({ error, code }) => {
    if (code === "NOT_FOUND") return;
    console.error(error);
  });

app.listen(3000);
