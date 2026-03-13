export const DEFAULT_DEMO_KEY = "collections";

export const demoCatalog = {
  collections: {
    demoKey: "collections",
    label: "Soft Collection",
    visibleFields: [
      { key: "firstName", label: "Nombre", type: "text", required: true },
      { key: "lastName", label: "Apellido", type: "text", required: true },
      { key: "phone", label: "Telefono", type: "tel", required: true },
      { key: "amount", label: "Monto", type: "number", required: true },
    ],
    phoneField: "phone",
    fieldToVariableMap: {
      firstName: "rl_clientName",
      lastName: "rl_clientSurname",
      amount: "rl_debtAmount",
    },
    fixedVariables: {
      int_companyName: "defaultCompanyName",
      rl_dueDate: "defaultDueDate",
    },
    generatedVariables: {
      rl_today: "today",
    },
    retell: {
      agentIdSource: "retellAgentId",
    },
  },
};

export function getDemoByKey(demoKey) {
  return demoCatalog[demoKey] || null;
}

export function getDefaultDemo() {
  return demoCatalog[DEFAULT_DEMO_KEY];
}

export function toPublicDemoConfig(demo) {
  return {
    demoKey: demo.demoKey,
    label: demo.label,
    visibleFields: demo.visibleFields,
  };
}
