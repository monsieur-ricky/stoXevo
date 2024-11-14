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

- This project was created using [Angular CLI](https://github.com/angular/angular-cli) version 18.1.2 therefore make sure that [NodeJS](https://nodejs.org/en) (version >= 18.19.1) is installed on your operating system.

- This application requires [stoXscraper Web API](https://github.com/monsieur-ricky/stoXscraper) to retrieve the necessary financial information. Please make sure to run this [Web API](https://github.com/monsieur-ricky/stoXscraper) before using **stoXevo**.

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
   npm install
   ```

4. Start the application:

   ```bash
   npm run start
   ```

5. The application will run at `http://localhost:4200`.

## Usage

- Before you start you need to chose a PIN number in order to use the App. This PIN is used to encrypt and decrypt all of the information stored locally in the browser **It's important you memorize the PIN, as it will be required to access the application and all saved data (locally and exported).**

- Add your [stoXscraper](https://github.com/monsieur-ricky/stoXscraper) API Key in the settings.

- Once everything is setup, you can manage your financial portfolio directly within your browser. All your financial data will remain local, and you can add stocks, ETFs, or any other financial assets to your portfolio.

## Contributing

Contributions are welcome! If you'd like to improve **stoXevo**, feel free to open a pull request or submit an issue.

### TODOs

- Unit Tests
- Add asset currency stats
- Add historical stats
- Use IndexedDB instead of localStorage
- ?

## Online Demo

Want to try out the app without setting it up locally or deploying it yourself? Check out the online version: **[stoXeveo Online](https://stoxevo.blacklambs.eu)**

This will give you a quick and easy way to experience the app's features and functionality.

---

Enjoy managing your financial portfolio securely with **[stoXevo](https://stoxevo.blacklambs.eu)**!
