import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const modelsDirectory = path.join(__dirname, "..", "models");
