# stoXevo

This is a personal open-source project designed to help you easily manage and track your financial assets, such as Stocks and ETFs.

This web app was created with privacy and simplicity in mind. All your data is securely stored locally in your browser, ensuring that only you have access to your financial information.

Whether you're an experienced investor or just getting started, this tool provides a straightforward and easy way to monitor your portfolio. With real market updates and a user-friendly interface, you can stay on top of your investments without the need for complex software or cloud storage.

### Screenshots

<img width="1279" alt="Dahsboard" src="https://github.com/user-attachments/assets/93ea07bd-21e6-4602-8114-8407484d7b71">

<img width="1279" alt="Portfolio" src="https://github.com/user-attachments/assets/30140c26-6c36-4200-8a8b-99bbd7778156">

<img width="1279" alt="Asset Details" src="https://github.com/user-attachments/assets/509e3a28-2b18-48d3-a482-723ce638661c">

<img width="1279" alt="Profile Details" src="https://github.com/user-attachments/assets/e5bc4119-95be-414e-a4ae-cb7f5b999289">

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

## TODOs

- Unit Tests
- Dark Mode
- Find a financial market API that works with non-USD assets
- Add asset currency stats
- Add historical stats
- Use IndexedDB instead of localStorage
- ?
