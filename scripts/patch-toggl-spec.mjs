/**
 * Patches toggl-api-v9.json to fix Swagger 2.0 compliance issues before orval generation.
 * - Ensures all path parameters have required: true
 * - Adds missing path parameter definitions for operations that reference them in the URL
 * - Adds missing `items` to array schemas
 */
import { readFileSync, writeFileSync } from "fs";

const spec = JSON.parse(readFileSync("./toggl-api-v9.json", "utf-8"));
const methods = ["get", "post", "put", "patch", "delete", "options", "head"];

// Recursively fix all schemas in an object
function fixSchema(obj) {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj)) {
    obj.forEach(fixSchema);
    return;
  }
  if (obj.type === "array" && !obj.items) {
    obj.items = {};
  }
  for (const val of Object.values(obj)) {
    fixSchema(val);
  }
}

fixSchema(spec.definitions ?? {});

for (const [path, pathItem] of Object.entries(spec.paths)) {
  const pathParams = [...path.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);

  // Fix path-level parameters
  for (const param of pathItem.parameters ?? []) {
    if (param.in === "path") param.required = true;
    fixSchema(param.schema ?? param);
  }

  for (const method of methods) {
    const operation = pathItem[method];
    if (!operation) continue;
    if (!operation.parameters) operation.parameters = [];

    // Fix schemas inside parameters
    for (const param of operation.parameters) {
      if (param.in === "path") param.required = true;
      fixSchema(param.schema ?? param);
    }

    // Fix response schemas
    fixSchema(operation.responses ?? {});

    // Ensure path params are declared
    for (const paramName of pathParams) {
      const inOperation = operation.parameters.some(
        (p) => p.name === paramName && p.in === "path"
      );
      const inPathLevel = (pathItem.parameters ?? []).some(
        (p) => p.name === paramName && p.in === "path"
      );

      if (!inOperation && !inPathLevel) {
        operation.parameters.push({
          name: paramName,
          in: "path",
          required: true,
          type: "string",
        });
      }
    }
  }
}

writeFileSync(
  "./toggl-api-v9-patched.json",
  JSON.stringify(spec, null, 2),
  "utf-8"
);
console.log("✓ Toggl spec patched → toggl-api-v9-patched.json");
