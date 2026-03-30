import express from "express"
import cors from "cors";
import { fileURLToPath } from "url";
import path from 'path';

const PORT = 5555;

// server initialization
const app = express();
app.use(cors());

// middleware initialization
app.use(express.json());

// file's directory and filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename, __dirname);

// to public folder
const public_dir = path.join(__dirname, "public");

// hosting the data folder
app.use("/public", express.static(public_dir, {
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        res.set("Cache-Control", "no-store");
    }
})); // hosting the public folder

app.listen(PORT, () => {
    console.log("The app is up and running at port", PORT);
});