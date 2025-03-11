require("dotenv").config();
const express = require("express");
const Tesseract = require("tesseract.js");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(cors());

app.post("/ocr", async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Aucune image en Base64 envoyée" });
        }

        const { data: { text } } = await Tesseract.recognize(
            image, 
            "eng", 
            { logger: (m) => console.log(m) }
        );

        res.json({ text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur OCR en ligne sur le port ${port}`);
});
