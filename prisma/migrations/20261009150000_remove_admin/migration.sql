-- The admin area was removed (founder's decision, 2026-10-09). Lessons and
-- challenges are now managed in prisma/content/ and loaded with the seed, so
-- the admin role and the lesson author (set only by the admin editor; no
-- lesson had one) go too.
ALTER TABLE "Lesson" DROP CONSTRAINT "Lesson_authorId_fkey";
ALTER TABLE "Lesson" DROP COLUMN "authorId";

ALTER TABLE "User" DROP COLUMN "role";
DROP TYPE "Role";
