# stoXevo

This is a personal open-source project designed to help you easily manage and track your financial assets, such as Stocks and ETFs.

This web app was created with privacy and simplicity in mind. All your data is securely stored locally in your browser, ensuring that only you have access to your financial information.

Whether you're an experienced investor or just getting started, this tool provides a straightforward and easy way to monitor your portfolio. With real market updates and a user-friendly interface, you can stay on top of your investments without the need for complex software or cloud storage.

## Settings

### PIN

Before you start you need to chose a PIN number in order to use the App. This PIN is used to encrypt and decrypt all of the information stored locally in the browser.

It's important you memorize the PIN, as it will be required to access the application and all saved data (locally and exported).

### API Key

All the financial information used in this app is retrieved by the [FMP](https://site.financialmodelingprep.com/) API.

[FMP - Financial Modeling Prep](https://site.financialmodelingprep.com/) provides real time stock price, company financial statements, major index prices, stock historical data, forex real time rate and cryptocurrencies.

In order to use stoXevo you need to request a free API Key from their site and save it in the app's Application Settings.

## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.1.2.

### Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running unit tests

Run `ng test` to execute the unit tests via [Jest](https://jestjs.io/).
