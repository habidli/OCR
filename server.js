require("dotenv").config();
const express = require("express");
const Tesseract = require("tesseract.js");
const sharp = require("sharp");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: "20mb" }));
app.use(cors());

// 🔹 Route de vérification (health check)
app.get("/health", (req, res) => {
    res.status(200).json({ message: "L'API est en ligne et fonctionne correctement." });
});

// 🔹 Optimisation d'image avec Sharp
async function preprocessImage(base64Image) {
    const buffer = Buffer.from(base64Image, "base64");
    return await sharp(buffer)
        .greyscale()  // Convertir en noir et blanc
        .resize({ width: 1000 }) // Redimensionner l’image
        .toFormat("png") // Convertir en PNG
        .toBuffer();
}

// 🔹 Route OCR avec optimisation
app.post("/ocr", async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Aucune image fournie." });
        }

        const processedImage = await preprocessImage(image);
        const { data: { text } } = await Tesseract.recognize(
            processedImage,
            "eng+fra", // Langue: anglais + français
            { tessedit_pageseg_mode: 7 } // Mode "single line" pour accélérer
        );

        res.json({ text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 🔹 Lancement du serveur
app.listen(port, () => {
    console.log(`✅ Serveur OCR en ligne sur le port ${port}`);
});
