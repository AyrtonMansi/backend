-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "bookmarks" JSONB NOT NULL,

    PRIMARY KEY ("id")
);
