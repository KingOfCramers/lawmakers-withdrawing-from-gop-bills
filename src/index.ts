import { setupPuppeteer } from "./puppeteer";
import { Page } from "puppeteer";
import fs from "fs";
import util from "util";

const writer = util.promisify(fs.writeFile);
const headless = false;
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
    return !!document.querySelector("TKTKTK"); // TK will write later, congress.gov is down at the moment.
  });

async function execute() {
  const { browser } = await setupPuppeteer(headless, executablePath);
  const page = await browser.newPage();

  const pageNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; // Goes up to 10, based on current data...

  const results = [];
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

  for await (const link of links) {
    page.goto(link);
    if (await hasWithdrawnSponsors(page)) {
      results.push(link);
      console.log(link);
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

execute();
