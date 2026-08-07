import { generate } from "./generate-bookshop-sign.mjs";

generate().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
