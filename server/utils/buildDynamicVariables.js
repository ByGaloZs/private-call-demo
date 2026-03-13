import { getTodayDate } from "./date.js";

export function buildDynamicVariables({ demo, formData, envConfig }) {
  const dynamicVariables = {};

  for (const [fieldName, variableName] of Object.entries(demo.fieldToVariableMap)) {
    dynamicVariables[variableName] = String(formData[fieldName] ?? "").trim();
  }

  for (const [variableName, envKey] of Object.entries(demo.fixedVariables)) {
    dynamicVariables[variableName] = String(envConfig[envKey] ?? "").trim();
  }

  for (const [variableName, generator] of Object.entries(demo.generatedVariables)) {
    if (generator === "today") {
      dynamicVariables[variableName] = getTodayDate();
    }
  }

  return dynamicVariables;
}
