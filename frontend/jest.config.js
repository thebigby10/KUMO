module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/generated/prisma$": "<rootDir>/src/__mocks__/prismaClient.ts",
    "^@/generated/prisma/(.*)$": "<rootDir>/src/__mocks__/prismaClient.ts",
  },
};
