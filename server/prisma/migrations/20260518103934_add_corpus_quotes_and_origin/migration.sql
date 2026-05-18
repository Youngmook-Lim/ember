-- CreateTable
CREATE TABLE "CorpusQuote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "work" TEXT,
    "tags" TEXT,
    "sourceFeed" TEXT NOT NULL,
    "normalizedText" TEXT NOT NULL,
    "authorKo" TEXT,
    "workKo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Quote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "text" TEXT NOT NULL,
    "source" TEXT,
    "work" TEXT,
    "tag" TEXT,
    "reflection" TEXT,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "origin" TEXT NOT NULL DEFAULT 'user',
    "corpusQuoteId" INTEGER,
    "userId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quote" ("createdAt", "id", "pinned", "reflection", "source", "tag", "text", "updatedAt", "userId", "work") SELECT "createdAt", "id", "pinned", "reflection", "source", "tag", "text", "updatedAt", "userId", "work" FROM "Quote";
DROP TABLE "Quote";
ALTER TABLE "new_Quote" RENAME TO "Quote";
CREATE INDEX "Quote_userId_idx" ON "Quote"("userId");
CREATE INDEX "Quote_corpusQuoteId_idx" ON "Quote"("corpusQuoteId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "CorpusQuote_normalizedText_key" ON "CorpusQuote"("normalizedText");

-- CreateIndex
CREATE INDEX "CorpusQuote_sourceFeed_idx" ON "CorpusQuote"("sourceFeed");
