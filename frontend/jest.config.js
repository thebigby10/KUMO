module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    ".*generated/prisma/client$": "<rootDir>/src/__mocks__/prismaClient.ts",
  },
};
