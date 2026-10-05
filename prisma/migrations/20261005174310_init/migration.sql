-- CreateTable
CREATE TABLE "ApiSpec" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ApiEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    CONSTRAINT "ApiEndpoint_specId_fkey" FOREIGN KEY ("specId") REFERENCES "ApiSpec" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiParameter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpointId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "format" TEXT,
    "enumValues" TEXT,
    "description" TEXT,
    "pattern" TEXT,
    "minLength" INTEGER,
    "maxLength" INTEGER,
    "minimum" REAL,
    "maximum" REAL,
    "exclusiveMinimum" BOOLEAN,
    "exclusiveMaximum" BOOLEAN,
    CONSTRAINT "ApiParameter_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "ApiEndpoint" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FormDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "schema" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FormDefinition_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "ApiEndpoint" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
