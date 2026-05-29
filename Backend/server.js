const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");
const { error } = require("console");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/image", express.static(path.join(__dirname, "image")));

app.post("/generate", async (req, res) => {
  try {
    const { prompt, model, width, height } = req.body;

    const response = await fetch(
      `https://router.huggingface.co/fal-ai/fal-ai/flux/dev?_subdomain=queue`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: { width, height },
          options: { wait_for_model: true },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.log("HF ERROR:", errorText);

      return res.status(500).json({
        error: errorText,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filename = `img-${Date.now()}.png`;
    const filePath = path.join(__dirname, "image", filename);

    fs.writeFileSync(filePath, buffer);

    console.log("Saved image:", filePath);

    res.json({
      imageUrl: `http://localhost:3000/image/${filename}`,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

app.get("/", (req, res) => {
  res.send("Server is running");
});
