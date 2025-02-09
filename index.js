const express = require("express");
const path = require("path");
const compression = require("compression");
require("dotenv").config();

const app = express();
app.set("view engine", "ejs");

// Cache control headers
const CACHE_CONTROL_HEADERS = {
  'Cache-Control': 'public, max-age=31536000, immutable',
  'CDN-Cache-Control': 'public, max-age=31536000, immutable',
  'Surrogate-Control': 'public, max-age=31536000',
  'Access-Control-Allow-Origin': '*',
  'Vary': 'Accept-Encoding'
};

// Add CORS middleware first
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  next();
});

// Single caching middleware
app.use((req, res, next) => {
  // Log the incoming request
  console.log('Request URL:', req.url);
  
  if (req.url.includes('.splat') || req.url.startsWith('/assets/')) {
    // Log headers before
    console.log('Before setting headers:', res.getHeaders());
    
    // Force caching headers
    Object.entries(CACHE_CONTROL_HEADERS).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Remove headers that might prevent caching
    res.removeHeader("x-powered-by");
    res.removeHeader("rndr-id");
    res.removeHeader("x-render-origin-server");
    res.removeHeader("set-cookie");
    res.removeHeader("pragma");
    res.removeHeader("expires");
    
    // Log headers after
    console.log('After setting headers:', res.getHeaders());
  }
  next();
});

// Configure static file serving - AFTER cache headers
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: 31536000000, // 1 year in milliseconds
  immutable: true,
  etag: false,
  lastModified: false
}));

// Compression middleware
app.use(compression({
  level: 6,
  filter: (req, res) => {
    if (req.url.startsWith("/assets/models/")) {
      return true;
    }
    return compression.filter(req, res);
  }
}));


// Chat endpoint with proper cache headers for dynamic content
app.post("/api/chat", async (req, res) => {
  // Set no-cache for dynamic content
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");

  try {
    const { messages } = req.body;
    const userMessage = messages.find((m) => m.role === "user").content;

    // Construct the prompt
    const prompt = `<|system|>You are Sting, Concordia University's virtual tour guide in Montreal. Embody these traits:

Personality: Warm, approachable, and passionate about Concordia's community
Voice: Use first-person ("I") and conversational language, avoiding academic jargon
Knowledge: Expert in Concordia's campuses, programs, student life, history, and facilities
Response style: Brief, engaging answers in 1-2 sentences ONLY. For greetings, use only 1 welcoming sentence
Boundaries: Focus exclusively on Concordia-related topics, gracefully redirecting other questions with "I'd love to tell you about [relevant Concordia topic] instead"
Memory: Reference Sir George Williams and Loyola legacy when relevant
Language: Bilingual responses encouraged (English/French) if requested

Example responses:
Greeting: "Hi, I'm Sting, and I'm thrilled to be your virtual guide to Concordia University!"
Topic response: "I'm excited to show you our stunning new Science Hub at the Loyola Campus, where our biology, chemistry, and physics teaching labs feature cutting-edge equipment. Would you like to learn more about our science programs or shall we explore another part of campus?"
Core values: Accuracy, inclusivity, and pride in Concordia's achievements and future vision.

Context about Concordia:
${CONCORDIA_CONTEXT}

<|user|>${userMessage}

<|assistant|>`;

    const response = await fetch(
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

// Route for home page
app.get("/", (req, res) => {
  res.render("index");
});

// Catch-all route for undefined paths
app.get("*", (req, res) => {
  res.status(404).render("coming-soon");
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
