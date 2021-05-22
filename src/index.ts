import { setupPuppeteer } from "./puppeteer";
import { Page } from "puppeteer";
import fs from "fs";
import util from "util";

const writer = util.promisify(fs.writeFile);
const reader = util.promisify(fs.readFile);

const headless = true;
const executablePath = "/usr/local/bin/chromium";

const getCosponsorshipLinks = async (page: Page) =>
  page.evaluate(() => {
    return Array.from(
      document.querySelectorAll("li.expanded span.result-item a")
    )
      .map((x) => x.getAttribute("href"))
      .filter((x) => x!.includes("cosponsors"))
      .map((x) => `https://www.congress.gov`.concat(x || ""));
  });

const hasWithdrawnSponsors = async (page: Page) =>
  page.evaluate(() => {
    return !!document.querySelector("a#withdrawnCosponsorsToggle"); // Check whether toggle exists
  });

async function setup(done: boolean) {
  if (done) return; // If file already written, skip this step
  const { browser } = await setupPuppeteer(headless, executablePath);
  const page = await browser.newPage();

  const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Goes up to 10, based on current data...

  const links = [];

  for await (const pageNumber of pageNumbers) {
    const startingLink = `https://www.congress.gov/search?searchResultViewType=expanded&q={"source":"legislation","congress":"117","party":"Republican","type":["bills","resolutions","joint-resolutions","concurrent-resolutions"]}&pageSize=250&page=${pageNumber}`;
    await page.goto(startingLink);
    links.push(...(await getCosponsorshipLinks(page)));
    console.log(`${links.length} added`);
  }

  await writer(
    "./cosponsorLinks.json",
    JSON.stringify(links, null, 2),
    "utf-8"
  );

  console.log("Links written!");

  try {
    await browser.close();
  } catch (err) {
    console.log(err);
    console.log("DONE WRITING FILES!");
  }
}

async function execute() {
  const { browser } = await setupPuppeteer(headless, executablePath);
  const page = await browser.newPage();

  const results: string[] = [];
  let links: string[];

  try {
    const linksString = await reader("./cosponsorLinks.json", {
      encoding: "utf-8",
    });
    links = JSON.parse(linksString) as string[];
  } catch (err) {
    console.error("Could not read file");
    console.error(err);
    process.exit(1);
  }

  console.log("Reading files...");
  for await (const link of links) {
    await page.goto(link);
    if (await hasWithdrawnSponsors(page)) {
      console.log(link);
      results.push(link);
    }
  }
  await writer("./withdrawn.json", JSON.stringify(results, null, 2), "utf-8");

  try {
    await browser.close();
  } catch (err) {
    console.log(err);
    console.log("DONE WRITING FILES!");
  }
}

setup().then(() => execute());
