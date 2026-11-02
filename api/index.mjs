import { connectDb } from "../backend/src/db.js";
import { seedAll } from "../backend/src/seed.js";
import { createApp } from "../backend/src/app.js";

const app = createApp();
let ready;

// Vercel runs the Express app as a serverless function: connect (and seed) once per instance, then serve requests.
export default async function handler(req, res) {
  ready ??= connectDb()
    .then(seedAll)
    .catch((err) => {
      ready = undefined;
      throw err;
    });
  await ready;
  return app(req, res);
}
