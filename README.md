# Intent Parser

> **Transform natural language payment instructions into structured, validated JSON**

Intent Parser is a production-ready service that converts human-readable payment instructions into structured, type-safe JSON objects. It bridges the gap between natural language and payment execution systems.

## 🎯 What It Does

Intent Parser takes raw natural language strings about sending money and converts them into clean, validated, structured JSON objects that payment execution engines can act on. **No ambiguity. No guessing. Just reliable, typed output every time.**

### The Problem It Solves

Payment systems speak SQL and JSON. Humans and AI agents speak English. Right now there's no reliable bridge between "send Ahmed his monthly salary" and the structured data a payment rail needs to actually move that money.

**Intent Parser is that bridge.**

## ✨ Features

- 🎯 **Accurate Parsing** - Extracts amount, currency, recipient, destination country, and urgency
- 🔒 **Type-Safe** - Full TypeScript support with Zod validation
- 📊 **Confidence Scoring** - Every parsed intent includes a confidence score (0-1)
- 🚀 **Production Ready** - Modular architecture, comprehensive error handling, and extensive test coverage
- ⚡ **Fast** - Built on Fastify for high performance
- 🧪 **Well Tested** - 50+ test cases covering all scenarios
- 🔧 **Configurable** - Environment-based configuration with validation

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/PapillaeTech/intent-parser
cd intent-parser

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start the server
npm start
```

## 🚀 Quick Start

### Option 1: Command Line Interface (CLI)

Use the parser directly from the command line:

```bash
# Install globally (optional)
npm install -g .

# Or use via npx
npx intent-parser "send $500 to John in Manila"

# Or use the npm script
npm run cli "send $500 to John in Manila"

# JSON output
npm run cli -- --json "pay my sister 200 euros"

# Pipe input
echo "send $1000 USDC to Nigeria" | npm run cli
```

### Option 2: API Server

#### 1. Configure Environment

Copy `.env.example` to `.env` and customize:

```bash
PORT=3000
HOST=0.0.0.0
NODE_ENV=production
LOG_LEVEL=info
MAX_INPUT_LENGTH=1000
DEFAULT_CURRENCY=USD
DEFAULT_URGENCY=standard
```

#### 2. Start the Server

```bash
npm start
```

The server will validate all required environment variables before starting. If any are missing or invalid, it will exit with a clear error message.

#### 3. Make a Request

```bash
curl -X POST http://localhost:3000/parse \
  -H "Content-Type: application/json" \
  -d '{"input": "send $500 to John in Manila"}'
```

## 💻 Command Line Usage

The CLI provides a simple way to parse payment intents without running a server:

```bash
# Basic usage
intent-parser "send $500 to John in Manila"

# JSON output
intent-parser --json "pay my sister 200 euros"

# Pipe input
echo "send $1000 USDC to Nigeria" | intent-parser

# Help
intent-parser --help
```

**Example Output:**
```
📋 Parsed Payment Intent

Input: "send $500 to John in Manila"

💰 Amount: 500 USD
💵 Currency: USD
👤 Recipient: John
🌍 Destination: PH
🔄 Corridor: USD-PHP
⚡ Urgency: standard
📊 Confidence: 100%
```

## 📖 API Documentation

### POST `/parse`

Parse a natural language payment instruction into structured JSON.

**Request:**
```json
{
  "input": "send $500 to John in Manila"
}
```

**Response:**
```json
{
  "success": true,
  "intent": {
    "amount": 500,
    "currency": "USD",
    "recipient": "John",
    "destination_country": "PH",
    "corridor": "USD-PHP",
    "urgency": "standard",
    "confidence": 1.0
  },
  "raw_input": "send $500 to John in Manila",
  "parsed_at": "2026-02-19T10:23:01Z"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "intent-parser",
  "timestamp": "2026-02-19T10:23:01Z"
}
```

## 💡 Examples

### Example 1: Simple Payment

**Input:**
```
"send $500 to John in Manila"
```

**Output:**
```json
{
  "amount": 500,
  "currency": "USD",
  "recipient": "John",
  "destination_country": "PH",
  "corridor": "USD-PHP",
  "urgency": "standard",
  "confidence": 1.0
}
```

### Example 2: Conversational

**Input:**
```
"pay my sister 200 euros, she's in Morocco"
```

**Output:**
```json
{
  "amount": 200,
  "currency": "EUR",
  "recipient": "my sister",
  "destination_country": "MA",
  "corridor": "EUR-MAD",
  "urgency": "standard",
  "confidence": 0.91
}
```

### Example 3: Urgent Payment

**Input:**
```
"I need to send 1000 USDC to my contractor in Nigeria right now, it's urgent"
```

**Output:**
```json
{
  "amount": 1000,
  "currency": "USDC",
  "recipient": "my contractor",
  "destination_country": "NG",
  "corridor": "USDC-NGN",
  "urgency": "high",
  "confidence": 0.95
}
```

### Example 4: Ambiguous Input (Low Confidence)

**Input:**
```
"send some money to my friend"
```

**Output:**
```json
{
  "amount": null,
  "currency": null,
  "recipient": "my friend",
  "destination_country": null,
  "corridor": null,
  "urgency": "standard",
  "confidence": 0.25,
  "missing_fields": ["amount", "currency", "destination_country"],
  "clarification_needed": "How much would you like to send and in what currency?"
}
```

### Example 5: AI Agent Style

**Input:**
```
"Execute payment of 750 USD to vendor_id:4421 in PH for invoice INV-2024-089"
```

**Output:**
```json
{
  "amount": 750,
  "currency": "USD",
  "recipient": "4421",
  "destination_country": "PH",
  "corridor": "USD-PHP",
  "reference": "INV-2024-089",
  "urgency": "standard",
  "confidence": 0.99
}
```

## 🎯 Confidence Scores

Every parsed intent includes a confidence score between 0 and 1:

- **0.90 - 1.00** → All fields extracted cleanly, proceed to execution
- **0.60 - 0.89** → Most fields found, minor assumptions made, flag for review
- **0.00 - 0.59** → Too ambiguous, return clarification prompt to user

This makes the system production-safe. **The system never silently guesses on a payment.**

## 🏗️ Architecture

The codebase is fully modularized for production use:

```
src/
├── config/           # Configuration management with validation
├── routes/           # API route handlers
├── services/         # Business logic (IntentParserService)
├── types/            # TypeScript type definitions
├── utils/            # Utility extractors (amount, currency, recipient, etc.)
├── countries.ts      # Country and corridor mappings
├── schemas.ts        # Zod validation schemas
├── server.ts         # Fastify server setup
└── index.ts          # Application entry point
```

### Key Components

- **IntentParserService** - Main service orchestrating the parsing logic
- **Extractors** - Modular utilities for extracting specific fields:
  - `amount-extractor` - Extracts amounts and currencies
  - `recipient-extractor` - Extracts recipient names/IDs
  - `country-extractor` - Extracts destination countries
  - `urgency-extractor` - Detects urgency level
  - `reference-extractor` - Extracts invoice/reference numbers
  - `confidence-calculator` - Calculates confidence scores

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The test suite includes:
- Unit tests for all extractors
- Service layer tests
- Configuration validation tests
- Integration tests for the API

## 🔧 Configuration

All configuration is managed through environment variables with validation:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `HOST` | `0.0.0.0` | Server host |
| `NODE_ENV` | `development` | Environment (development/production/test) |
| `LOG_LEVEL` | `info` | Logging level (error/warn/info/debug) |
| `MAX_INPUT_LENGTH` | `1000` | Maximum input string length |
| `DEFAULT_CURRENCY` | `USD` | Default currency when not specified |
| `DEFAULT_URGENCY` | `standard` | Default urgency level |

Configuration is validated on startup. Invalid or missing required variables will cause the server to exit with a clear error message.

## 📝 Supported Currencies

- **Fiat**: USD, EUR, GBP, PHP, MAD, NGN, and 40+ more
- **Crypto**: USDC

## 🌍 Supported Countries

The parser supports 100+ countries including:
- Major countries (US, UK, Canada, Australia, etc.)
- Asian countries (Philippines, India, China, Japan, etc.)
- African countries (Nigeria, Morocco, Kenya, etc.)
- European countries (Germany, France, Spain, etc.)
- And many more...

See `src/countries.ts` for the complete list.

## ⚠️ Limitations

### 1. **Natural Language Understanding**

The parser uses pattern matching and heuristics, not advanced NLP. It works best with:
- Clear, structured sentences
- Explicit mentions of amounts, currencies, and locations
- Standard payment terminology

**What it struggles with:**
- Very informal or slang-heavy language
- Complex nested instructions
- Ambiguous references without context
- Sarcasm or non-literal language

### 2. **Currency Detection**

- Defaults to USD when currency is ambiguous
- May misinterpret currency symbols in certain contexts
- Limited support for cryptocurrency (currently only USDC)

### 3. **Recipient Extraction**

- Works best with proper names or relationship keywords
- May struggle with:
  - Very common names without context
  - Nicknames or informal names
  - Multiple recipients in one sentence

### 4. **Country Detection**

- Requires explicit country mentions or city names that map to countries
- May have false positives with words that contain country names
- Limited support for city-to-country mapping (only major cities)

### 5. **Amount Parsing**

- Handles standard number formats (with/without commas, decimals)
- May struggle with:
  - Written numbers ("five hundred" vs "500")
  - Multiple amounts in one sentence (picks the largest)
  - Very large numbers without separators

### 6. **Confidence Scoring**

- Confidence is based on field presence, not semantic understanding
- A high confidence score doesn't guarantee correctness
- Always validate critical fields before executing payments

### 7. **Language Support**

- Currently optimized for English
- May work with other languages but not guaranteed
- Currency symbols and formats may vary by locale

### 8. **Input Length**

- Maximum input length is configurable (default: 1000 characters)
- Very long inputs may be truncated or cause performance issues

### 9. **Real-time Processing**

- Designed for synchronous processing
- Not optimized for high-volume batch processing
- No built-in rate limiting or queuing

### 10. **Context Awareness**

- Each request is parsed independently
- No memory of previous requests
- Cannot handle follow-up questions or clarifications

## 🚨 Production Considerations

1. **Always validate confidence scores** - Don't execute payments with low confidence
2. **Implement additional validation** - Check amounts, recipients, and countries against your business rules
3. **Add rate limiting** - Protect your API from abuse
4. **Monitor confidence distributions** - Track how often you get low-confidence results
5. **Log all requests** - Important for debugging and compliance
6. **Handle errors gracefully** - The parser may throw errors on malformed input
7. **Consider adding caching** - For frequently parsed patterns

## 🤝 Contributing

Contributions are welcome! Please ensure:
- All tests pass
- New code is properly typed
- Documentation is updated
- Code follows the existing structure

## 📄 License

ISC

## 🙏 Acknowledgments

Built with:
- [Fastify](https://www.fastify.io/) - Fast web framework
- [Zod](https://zod.dev/) - TypeScript-first schema validation
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vitest](https://vitest.dev/) - Testing framework

---

**Remember**: This parser is a bridge, not a payment executor. Always validate and verify parsed intents before executing actual payments.
