const express = require("express");
const path = require("path");
require("dotenv").config();
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;

// Load Concordia info from JSON file
const concordiaInfoPath = path.join(
  __dirname,
  "public",
  "js",
  "concordia-info.json"
);
const concordiaInfo = require(concordiaInfoPath);

const formatConcordiaContext = (info) => {
  // Summary from several pieces of information
  const history = info["concordia-general-info"].history.join("\n");
  const campuses = info["concordia-general-info"].campuses.join(", ");
  const dates = JSON.stringify(
    info["concordia-general-info"].general_dates,
    null,
    2
  );
  return `History:\n${history}\n\nCampuses: ${campuses}\n\nImportant Dates:\n${dates}`;
};

const CONCORDIA_CONTEXT = formatConcordiaContext(concordiaInfo);

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve static files from 'public' directory

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    const userMessage = messages.find((m) => m.role === "user").content;

    // Construct prompt for Hugging Face model
    const prompt = `<|system|>You are Sting, Concordia University's (Montreal) virtual tour guide. Be friendly, knowledgeable, and enthusiastic. Only discuss Concordia University topics and politely deflect unrelated questions. Use a warm, welcoming tone and speak in first person as Sting.

Context about Concordia:
${CONCORDIA_CONTEXT}

<|user|>${userMessage}

<|assistant|>`;

    const response = await fetch(
      // "https://api-inference.huggingface.co/models/tiiuae/falcon-7b-instruct", // Alternative model
      "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `API call failed: ${response.status} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    // Extract the response text, removing any system-style tokens if present
    const assistantResponse = data[0].generated_text
      .replace(/<\|assistant\|>/g, "")
      .replace(/<\|system\|>/g, "")
      .replace(/<\|user\|>/g, "")
      .trim();

    res.json({ response: assistantResponse });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({
      error: "Failed to generate response",
      details: error.message,
    });
  }
});

// Serve the main HTML file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
