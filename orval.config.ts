import { defineConfig } from "orval";

export default defineConfig({
  redmine: {
    input: {
      target: "./redmine-api.json",
    },
    output: {
      target: "./src/api-redmine-hooks",
      client: "react-query",
      mode: "tags",
      clean: true,
      override: {
        mutator: {
          path: "./src/mutators/redmine.ts",
          name: "redmineAxios",
        },
      },
    },
  },
  toggl: {
    input: {
      target: "./toggl-api-v9-patched.json",
      parserOptions: {
        validate: false,
      },
      converterOptions: {
        patch: true,
        warnOnly: true,
      },
    },
    output: {
      target: "./src/api-toggl-hooks",
      client: "react-query",
      mode: "tags",
      clean: true,
      override: {
        mutator: {
          path: "./src/mutators/toggl.ts",
          name: "togglAxios",
        },
      },
    },
  },
});
