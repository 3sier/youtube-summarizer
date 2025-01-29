const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta para generar resúmenes
app.post("/summarize", async (req, res) => {
  const { text } = req.body;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo", // Puedes usar "gpt-4" si tienes acceso
        messages: [
          {
            role: "system",
            content: "Eres un asistente que resume textos de manera concisa.",
          },
          {
            role: "user",
            content: `Resume el siguiente texto en un párrafo:\n\n${text}`,
          },
        ],
        max_tokens: 150, // Ajusta según sea necesario
        temperature: 0.5,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const summary = response.data.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
    console.error(
      "Error al generar el resumen:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ error: "No se pudo generar el resumen." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
