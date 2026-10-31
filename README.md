# stoXevo

This is a personal open-source project designed to help you easily manage and track your financial assets, such as Stocks and ETFs.

This web app was created with privacy and simplicity in mind. All your data is securely stored locally in your browser, ensuring that only you have access to your financial information.

Whether you're an experienced investor or just getting started, this tool provides a straightforward and easy way to monitor your portfolio. With real market updates and a user-friendly interface, you can stay on top of your investments without the need for complex software or cloud storage.

## Features

- **Manage multiple Asset types**: Add any number of assets to your portfolio (ex.: Stocks, ETFs, Crypto, etc).
- **Dashboard with Metrics**: Visualize the status of assets.
- **Import/Export Data**: Easily import and export your encrypted data.
- **Simple and Intuitive UI**: A clean and simple interface focused on delivering an easy-to-use experience.
- **Secure by Design**: User data is not shared or stored on remote servers. Privacy is at the core of this app.
- **Open Source**: The project is open source, allowing the community to contribute and improve the application over time.

## Screenshots

<img width="100%" alt="Dahsboard" src="https://github.com/user-attachments/assets/93ea07bd-21e6-4602-8114-8407484d7b71">
<img width="100%" alt="Portfolio" src="https://github.com/user-attachments/assets/30140c26-6c36-4200-8a8b-99bbd7778156">
<img width="100%" alt="Asset Details" src="https://github.com/user-attachments/assets/509e3a28-2b18-48d3-a482-723ce638661c">

## Table of Contents

- [Prerequisites](#prerequisites)
- [Integration with stoXscraper](#integration-with-stoxscraper)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [Online Demo](#online-demo)

## Prerequisites

- Angular 22 and [Node.js](https://nodejs.org/en) 24.22.2 (see `.nvmrc`). Angular 22 supports Node `^22.22.3`, `^24.15.0` or `>=26`; use the pinned Node 24 release for reproducible development and CI.

- [stoXscraper Web API](https://github.com/monsieur-ricky/stoXscraper) is optional for automatic quotes and symbol profiles. Manual asset entry and local portfolio tracking work without it.

## Integration with stoXscraper

**stoXevo** retrieves real-time financial data by leveraging the stoXscraper API. To make the integration seamless and secure, the application communicates with stoXscraper using API keys. The key ensures that only authorized requests can fetch financial data.

All the necessary information to setup and run [stoXscraper Web API](https://github.com/monsieur-ricky/stoXscraper) can be found [here](https://github.com/monsieur-ricky/stoXscraper).

## Installation

1. Clone the repository:

   ```bash
   git clone git@github.com:monsieur-ricky/stoXevo.git
   ```

2. Navigate to the project directory:

   ```bash
   cd stoXevo
   ```

3. Install the dependencies:

   ```bash
    npm ci
   ```

4. Start the application:

   ```bash
   npm run start
   ```

5. The application will run at `http://localhost:4200`.

## Usage

- Before you start you need to chose a PIN number in order to use the App. This PIN is used to encrypt and decrypt all of the information stored locally in the browser **It's important you memorize the PIN, as it will be required to access the application and all saved data (locally and exported).**

- For automatic updates, optionally add your [stoXscraper](https://github.com/monsieur-ricky/stoXscraper) API key in settings. The default endpoint is `http://localhost:3000/asset` in `src/app/app.settings.ts`; host the scraper yourself and configure a trusted endpoint. An HTTPS deployment also needs an HTTPS scraper endpoint to avoid mixed-content restrictions.

- Once everything is setup, you can manage your financial portfolio directly within your browser. All your financial data will remain local, and you can add stocks, ETFs, or any other financial assets to your portfolio.

## Contributing

Contributions are welcome! If you'd like to improve **stoXevo**, feel free to open a pull request or submit an issue.

### Quality checks

```bash
npm ci
npm run check
```

The test suite uses Angular TestBed and Vitest. Following the testing trophy,
most coverage should exercise collaborating services, stores and rendered UI;
use small unit tests for financial calculations and edge cases. HTTP tests mock
stoXscraper, and storage tests use disposable fixtures. No E2E tests or real
financial credentials are needed. Run `npm test` for interactive watch mode.

The upgrade work and per-step validation results are tracked in
[MIGRATION_PLAN.md](MIGRATION_PLAN.md).

The UI uses [Optimus UI](https://github.com/openng-org/optimus-ui) 2 (MIT),
its Lara theme, OpenNG Icons and Tailwind CSS 4. `p-*` selectors and `--p-*`
design tokens are retained by Optimus; they do not imply a PrimeNG dependency.
See [docs/TESTING.md](docs/TESTING.md) for test conventions.
Compatibility decisions, audit findings and pre-existing privacy/security
limitations are documented in [docs/MIGRATION_NOTES.md](docs/MIGRATION_NOTES.md).

### TODOs

- Add asset currency stats
- Add historical stats
- Use IndexedDB instead of localStorage
- ?

## Online Demo

Want to try out the app without setting it up locally or deploying it yourself? Check out the online version: **[stoXeveo Online](https://stoxevo.blacklambs.eu)**

This will give you a quick and easy way to experience the app's features and functionality.

---

Enjoy managing your financial portfolio securely with **[stoXevo](https://stoxevo.blacklambs.eu)**!
