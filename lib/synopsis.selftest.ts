import assert from "node:assert/strict";
import { normalizeSynopsis } from "./synopsis";

assert.equal(normalizeSynopsis(undefined), "");
assert.equal(normalizeSynopsis("  hello  "), "hello");
assert.equal(
  normalizeSynopsis("Korte <em>tekst</em> met<br> breaks &amp; entities."),
  "Korte tekst met breaks & entities."
);
assert.equal(normalizeSynopsis("<p>Een&nbsp;boek.</p>"), "Een boek.");
console.log("synopsis.selftest: OK");
