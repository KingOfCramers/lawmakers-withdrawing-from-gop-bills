# 🏛️ Bipartisanship Rates Among Electoral Objectors

This is the source code for checking whether there is any Republican-sponsored legislation from which members have withdrawn their support in the 117th Congress after the bill moved out of committee.

## Installation

This program runs using Node.js, please [install](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) the `npm` package management library for it to work. The program also relies on Chromium, Google's headless browser, which you'll need to [install](https://www.chromium.org/getting-involved/download-chromium). You may need to replace the `executablePath` in your `src/setupPuppeteer/index.ts` file to your local installation of Chromium. By default it's pointing at `/usr/local/bin/chromium`.

Then navigate into the directory and run:

`npm install` or `yarn install`

## Run

`npm run start`

This command will run the program.

By default, it'll check the House lawmakers in Puppeteer's headless mode. That can be changed by altering the constants contained in the `index.ts` file.
