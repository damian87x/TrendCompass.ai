# TrendCompass

**Stay on top of trending topics on social media — all in one place.**

TrendCompass is a tool that helps you track trending topics across various sources, generates draft posts about these trends, and sends notifications through your preferred channels.

## Monorepo Structure

This project is organized as a monorepo using Nx, with the following packages:

- **core**: Contains the core business logic, including:
  - Configuration management
  - Web scraping and data collection
  - AI-powered content generation
  - Notification interfaces

- **integrations**: Implements notification drivers for different platforms:
  - Slack integration
  - Discord integration
  - (More can be added easily)

- **scheduler**: Handles scheduled execution of the TrendCompass process
  - Cron-based scheduling
  - Event triggers

- **cli**: Command-line interface for using TrendCompass
  - Interactive commands
  - Configuration management
  - Manual and scheduled execution

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm (v8 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/damian87x/trend-compass.git
   cd trend-compass
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build all packages:
   ```bash
   npm run build
   ```

### Configuration

Copy the `.env.example` file to `.env` and fill in your API keys and configuration values:

```bash
copy .env.example .env
```

Edit the `trend-compass.config.json` file to customize sources, notification preferences, and other settings.

## Usage

### Command Line Interface

Run the CLI with:

```bash
npm run cli
```

This will display available commands and options.

### Common Tasks

- **Run once**: Execute the complete TrendCompass process once
  ```bash
  npm run cli -- run
  ```

- **Schedule**: Set up a recurring schedule using cron expression
  ```bash
  npm run cli -- schedule "0 */12 * * *"
  ```

- **Configure**: Update configuration settings
  ```bash
  npm run cli -- config
  ```

## Development

### Project Commands

- **Build all packages**:
  ```bash
  npm run build
  ```

- **Clean build artifacts**:
  ```bash
  npm run clean
  ```

- **Run tests**:
  ```bash
  npm test
  ```

- **Lint code**:
  ```bash
  npm run lint
  ```

- **Format code**:
  ```bash
  npm run format
  ```

### Adding a New Integration

1. Create a new file in `packages/integrations/src` (e.g., `emailIntegration.ts`)
2. Implement the `NotificationDriver` interface from the core package
3. Export your new driver from the integrations package index
4. Update the configuration schema in the core package to include your new driver

## Environment Variables

The following environment variables are required:

- `OPENAI_API_KEY`: Your OpenAI API key for content generation
- `FIRECRAWL_API_KEY`: API key for the Firecrawl web scraping service
- `DISCORD_WEBHOOK_URL` (optional): Discord webhook URL for notifications
- `SLACK_WEBHOOK_URL` (optional): Slack webhook URL for notifications

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
