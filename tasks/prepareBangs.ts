/**
 * Script to prepare the external `bang.js` file for use in the project.
 */

const dataDir = `${import.meta.dirname}/../data`;
const rawInput = await Deno.readTextFile(`${dataDir}/bang.js`);
const inputBangs: Array<{ t: string, u: string }> = JSON.parse(rawInput);

const bangs: Record<string, string> = {};
for (const importBang of inputBangs) {
  bangs[importBang.t] = importBang.u
}

await Deno.writeTextFile(
  `${dataDir}/bngs.json`,
  JSON.stringify(bangs, null, "\t")
);
