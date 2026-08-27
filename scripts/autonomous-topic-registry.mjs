/**
 * Workflow Vault Autonomous Topic Discovery & Synthesis Engine
 * 
 * Curates real-world, high-demand automation problems, trending developer requests,
 * and battle-tested production blueprints without hallucination.
 */

export const BLUEPRINT_TOPIC_REGISTRY = [
  {
    topicId: "deepseek-r1-n8n-local-rag",
    title: "Self-Hosted DeepSeek-R1 & Qdrant RAG Agent with n8n",
    category: "AI & LLMs",
    difficulty: "Intermediate",
    readingTime: "22 min",
    tools: ["DeepSeek-R1", "n8n", "Qdrant", "Docker", "Ollama"],
    tags: ["AI & LLMs", "DeepSeek", "n8n", "RAG", "Vector Search", "Ollama"],
    description: "Run private local reasoning LLMs with DeepSeek-R1, vectorize company knowledge in Qdrant, and orchestrate intelligent autonomous search agents via n8n.",
    overview: "This blueprint details how to build a 100% private, on-premise Retrieval-Augmented Generation (RAG) agent. It connects a local Ollama instance running DeepSeek-R1 (or Llama 3.3) with a self-hosted Qdrant vector database and n8n orchestration. No customer data or internal company documents ever leave your private server network.",
    whatYoullBuild: "A secure, containerized RAG pipeline running in Docker Compose. Incoming Slack or webhook queries are embedded via local fastembed, matched against semantic vectors in Qdrant, analyzed by DeepSeek-R1 with chain-of-thought reasoning, and delivered back with source citations.",
    architecture: "Webhook / Slack Trigger -> n8n AI Agent Node -> Ollama (DeepSeek-R1 Reasoner) <-> Qdrant Vector DB (Dense Embeddings) -> Synthesized Response with Citations",
    prerequisites: [
      "[You'll need this already] A Linux server (VPS or local workstation) with at least 16 GB RAM (NVIDIA GPU recommended for sub-second inference, or modern CPU for 8B quantized models).",
      "[You'll need this already] Docker Engine 24+ and Docker Compose v2 installed.",
      "[You'll need this already] Basic familiarity with running shell commands over SSH.",
      "[Optional, not required] Cloudflare Tunnel or Caddy if exposing the n8n webhook endpoint to external Slack/Discord bots."
    ],
    glossary: [
      {
        term: "RAG (Retrieval-Augmented Generation)",
        definition: "An architecture where an LLM is provided with relevant factual context retrieved from a private database before generating an answer, preventing hallucinations."
      },
      {
        term: "DeepSeek-R1",
        definition: "An open-weights reasoning model that uses reinforcement learning to produce verifiable, step-by-step chain-of-thought logic before answering."
      },
      {
        term: "Qdrant",
        definition: "An open-source vector similarity search engine written in Rust, optimized for fast semantic filtering and payload storage."
      },
      {
        term: "Ollama",
        definition: "A lightweight CLI and API server that downloads, optimizes, and runs open-source language models locally on your GPU or CPU."
      }
    ],
    steps: [
      {
        title: "Step 1: Define the Unified Multi-Container Compose Stack",
        why: "Running n8n, Ollama, and Qdrant in the same Docker network provides high-speed internal socket communication and eliminates public exposure of the database.",
        content: "Create a dedicated directory `ai-rag-stack` and define `docker-compose.yml` declaring n8n, Ollama with GPU acceleration (or CPU fallback), and Qdrant storage.",
        code: {
          language: "yaml",
          code: `services:\n  ollama:\n    image: ollama/ollama:latest\n    container_name: ollama_llm\n    restart: unless-stopped\n    volumes:\n      - ollama_data:/root/.ollama\n    ports:\n      - "127.0.0.1:11434:11434"\n\n  qdrant:\n    image: qdrant/qdrant:latest\n    container_name: qdrant_db\n    restart: unless-stopped\n    ports:\n      - "127.0.0.1:6333:6333"\n    volumes:\n      - qdrant_data:/qdrant/storage\n\n  n8n:\n    image: n8nio/n8n:latest\n    container_name: n8n_rag_engine\n    restart: unless-stopped\n    ports:\n      - "127.0.0.1:5678:5678"\n    environment:\n      - N8N_HOST=localhost\n      - N8N_PORT=5678\n      - N8N_PROTOCOL=http\n      - WEBHOOK_URL=http://localhost:5678/\n    volumes:\n      - n8n_data:/home/node/.n8n\n    depends_on:\n      - ollama\n      - qdrant\n\nvolumes:\n  ollama_data:\n  qdrant_data:\n  n8n_data:`
        },
        expectedResult: "All 3 containers start cleanly without port conflicts."
      },
      {
        title: "Step 2: Pull the DeepSeek-R1 Model & Embedding Model",
        why: "The LLM needs weights downloaded to disk before the n8n agent node can establish inference sessions.",
        content: "Execute the Ollama CLI inside the running container to pull the quantized reasoning model and a high-speed embedding model.",
        code: {
          language: "bash",
          code: `# Pull DeepSeek-R1 (8B distilled reasoning model)
docker exec -it ollama_llm ollama run deepseek-r1:8b

# Pull high-performance BGE embedding model for vector indexing
docker exec -it ollama_llm ollama pull bge-m3`
        },
        expectedResult: "Ollama downloads model weights and responds with a success status."
      },
      {
        title: "Step 3: Configure the n8n RAG Chain & Vector Store Connector",
        why: "Connecting the vector retriever node to Ollama ensures n8n queries Qdrant first, injects relevant document chunks into memory, and passes the augmented prompt to DeepSeek-R1.",
        content: "Open n8n at `http://localhost:5678`, add an `AI Agent` node, configure `Ollama Chat Model` (Host: `http://ollama:11434`, Model: `deepseek-r1:8b`), attach the `Qdrant Vector Store` tool, and set top-k retrieval to 4.",
        code: {
          language: "json",
          code: `{\n  "nodes": [\n    {\n      "name": "Ollama DeepSeek-R1",\n      "type": "@n8n/n8n-nodes-langchain.lmChatOllama",\n      "parameters": {\n        "model": "deepseek-r1:8b",\n        "baseURL": "http://ollama:11434"\n      }\n    },\n    {\n      "name": "Qdrant Vector Store",\n      "type": "@n8n/n8n-nodes-langchain.vectorStoreQdrant",\n      "parameters": {\n        "qdrantUrl": "http://qdrant:6333",\n        "collectionName": "company_docs"\n      }\n    }\n  ]\n}`
        },
        expectedResult: "n8n verifies the connection to both internal containers."
      }
    ],
    result: "A private, zero-subscription RAG pipeline processing sensitive queries locally with step-by-step reasoning and semantic document retrieval.",
    troubleshooting: [
      {
        issue: "Ollama returns HTTP 500 or out-of-memory error",
        cause: "The selected model size exceeds available system RAM or VRAM.",
        fix: "Switch to a smaller quantized model such as deepseek-r1:1.5b or allocate swap space on Linux (`sudo fallocate -l 8G /swapfile`)."
      },
      {
        issue: "n8n cannot connect to http://ollama:11434",
        cause: "Docker containers are running on separate bridge networks or using localhost instead of container hostnames.",
        fix: "Use the internal Docker service name `http://ollama:11434` rather than `http://localhost:11434` inside n8n."
      }
    ],
    nextSteps: [
      "Add automated document ingestion triggers from Google Drive or local folders",
      "Set up systemd auto-restart on host reboot"
    ]
  },
  {
    topicId: "github-webhook-slack-release-radar",
    title: "Automated GitHub Release Radar & Changelog Synthesizer for Slack",
    category: "DevOps & CI/CD",
    difficulty: "Beginner",
    readingTime: "12 min",
    tools: ["GitHub Webhooks", "Node.js", "Slack Webhooks", "Express", "Docker"],
    tags: ["DevOps & CI/CD", "GitHub", "Slack", "Webhooks", "Node.js"],
    description: "Intercept GitHub release and tag events, format rich Slack block-kit messages with author avatars and markdown changelogs, and deliver real-time deployment notifications.",
    overview: "Engineering teams often miss critical repository releases, dependency bumps, or hotfix tags. This lightweight microservice captures GitHub `release` events over webhooks, verifies HMAC cryptographic signatures, converts markdown release notes to Slack Block Kit format, and posts formatted notifications to your team channel.",
    whatYoullBuild: "A zero-dependency Express.js microservice running in a small Alpine Docker container. It listens for `release.published` and `release.prereleased` actions, filters out draft releases, and constructs interactive Slack cards.",
    architecture: "GitHub Release Event -> HMAC SHA-256 Validation -> Markdown Parser -> Slack Webhook Block Kit -> Team Channel Notification",
    prerequisites: [
      "[You'll need this already] A GitHub repository where you have Admin or Maintainer permissions to configure Webhooks.",
      "[You'll need this already] A Slack Workspace with an Incoming Webhook URL configured.",
      "[You'll need this already] Node.js 18+ or Docker installed to host the webhook listener."
    ],
    glossary: [
      {
        term: "Slack Block Kit",
        definition: "A visual UI framework provided by Slack to build rich interactive messages with buttons, author images, and formatted sections."
      },
      {
        term: "GitHub Webhook Secret",
        definition: "A secret token configured in GitHub that signs the request with an X-Hub-Signature-256 header."
      }
    ],
    steps: [
      {
        title: "Step 1: Create the Webhook Receiver with HMAC Security",
        why: "Validating the X-Hub-Signature-256 header ensures only genuine GitHub notifications are processed.",
        content: "Write an Express.js server that extracts the raw body buffer and compares the cryptographic hash.",
        code: {
          language: "typescript",
          code: `import express from "express";\nimport crypto from "crypto";\n\nconst app = express();\napp.use(express.json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));\n\nfunction verifyGitHubSignature(req: any) {\n  const secret = process.env.GITHUB_WEBHOOK_SECRET || "";\n  const signature = req.headers["x-hub-signature-256"] as string;\n  if (!signature) return false;\n  const hmac = crypto.createHmac("sha256", secret);\n  const digest = "sha256=" + hmac.update(req.rawBody).digest("hex");\n  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));\n}\n\napp.post("/webhook/github", async (req, res) => {\n  if (!verifyGitHubSignature(req)) {\n    return res.status(401).send("Invalid Signature");\n  }\n  const event = req.headers["x-github-event"];\n  if (event === "release" && req.body.action === "published") {\n    await postToSlack(req.body.release, req.body.repository);\n  }\n  return res.status(200).send("OK");\n});`
        },
        expectedResult: "Server logs confirm HMAC signature verification."
      }
    ],
    result: "Instant, formatted release notes delivered to Slack whenever a new release is published.",
    troubleshooting: [
      {
        issue: "GitHub shows 401 Unauthorized in Webhook Deliveries",
        cause: "The webhook secret in GitHub settings does not match `GITHUB_WEBHOOK_SECRET`.",
        fix: "Double-check the secret string in GitHub Settings -> Webhooks and restart the application."
      }
    ],
    nextSteps: [
      "Add Discord Webhook fallback integration",
      "Attach automatic commit list diff links"
    ]
  }
];
