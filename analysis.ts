//@ts-nocheck
import fs from "fs";

interface Bill {
  sponsor: {
    first: string;
    last: string;
  };
  billLink: string;
  title: string;
  cosponsors: string[];
  dem: number;
  gop: number;
  indie: number;
}

// function onlyUnique(value, index, self) {
//   return self.indexOf(value) === index;
// }

// const myRegex = new RegExp(/D-[A-Z]/, "g");

// fs.readFile("./bipartisanHOUSE.json", { encoding: "utf-8" }, (err, res) => {
//   const x = JSON.parse(res) as Bill[];
//   const result = x
//     .reduce((agg, val) => {
//       agg.push(...val.cosponsors);
//       return agg;
//     }, [])
//     .filter((val) => myRegex.test(val))
//     .filter(onlyUnique)
//     .sort();

//   fs.writeFile("./demCosponsors.js", JSON.stringify(result), () =>
//     console.log("done.")
//   );
// });

fs.readFile("./bipartisanHOUSE.json", { encoding: "utf-8" }, (err, res) => {
  const x = JSON.parse(res) as Bill[];
  const result = x.sort((a, b) => b.dem - a.dem);
  fs.writeFile(
    "./bipartisanSortedByDemNumbers.json",
    JSON.stringify(result),
    () => console.log("Done")
  );
  console.log(result);
});
