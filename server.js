require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json({ limit: "10mb" }));
app.use(cors());

// Configuration AWS SDK
AWS.config.update({
    accessKeyId: process.env.AKIAXKEXQYECCOGWNGOW,
    secretAccessKey: process.env.T2W6qepWcAEfDrpiKII0LnyJsn2gU8u2lR5aEKaU,
    region: process.env.us-east-1
});

const textract = new AWS.Textract();

// Endpoint OCR avec AWS Textract
app.post("/ocr", async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ error: "Aucune image fournie." });
        }

        const params = {
            Document: { Bytes: Buffer.from(image, "base64") },
            FeatureTypes: ["TEXT_DETECTION"]
        };

        const response = await textract.analyzeDocument(params).promise();
        const extractedText = response.Blocks
            .filter(block => block.BlockType === "LINE")
            .map(block => block.Text)
            .join("\n");

        res.json({ text: extractedText });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Vérification du statut de l'API
app.get("/health", (req, res) => {
    res.json({ message: "L'API Textract est en ligne" });
});

app.listen(port, () => {
    console.log(`Serveur OCR AWS Textract en ligne sur le port ${port}`);
});
