import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real data from WB API (fetched via browser session)
const data = {
  "119833702": {"rating": 4.6, "feedbacks": 155, "root": 107552947},
  "144391368": {"rating": 4.9, "feedbacks": 34, "root": 107552947},
  "165436665": {"rating": 5.0, "feedbacks": 22, "root": 151647669},
  "165436666": {"rating": 5.0, "feedbacks": 26, "root": 151647669},
  "185673251": {"rating": 4.8, "feedbacks": 31, "root": 151647669},
  "226020314": {"rating": 4.8, "feedbacks": 27, "root": 203403742},
  "226023435": {"rating": 4.5, "feedbacks": 16, "root": 203406688},
  "226024975": {"rating": 4.7, "feedbacks": 21, "root": 203406688},
  "226025376": {"rating": 4.8, "feedbacks": 21, "root": 203406688},
  "253033047": {"rating": 4.9, "feedbacks": 41, "root": 229090903},
  "253051367": {"rating": 4.9, "feedbacks": 51, "root": 229103887},
  "253053689": {"rating": 4.6, "feedbacks": 15, "root": 203406688},
  "261294903": {"rating": 4.8, "feedbacks": 25, "root": 203403742},
  "328031735": {"rating": 4.3, "feedbacks": 9, "root": 309204328},
  "328035699": {"rating": 4.7, "feedbacks": 25, "root": 309204328},
  "391150373": {"rating": 4.7, "feedbacks": 21, "root": 382509233},
  "391159701": {"rating": 3.6, "feedbacks": 5, "root": 554753518},
  "391176745": {"rating": 4.7, "feedbacks": 18, "root": 440884678},
  "391198267": {"rating": 4.8, "feedbacks": 13, "root": 440884678},
  "425312758": {"rating": 5.0, "feedbacks": 7, "root": 229090903},
  "445414843": {"rating": 5.0, "feedbacks": 10, "root": 440884678},
  "445415947": {"rating": 4.2, "feedbacks": 19, "root": 107552947},
  "462984217": {"rating": 5.0, "feedbacks": 7, "root": 229090903},
  "462987423": {"rating": 4.6, "feedbacks": 25, "root": 107552947},
  "462990511": {"rating": 4.8, "feedbacks": 13, "root": 382509233},
  "462991980": {"rating": 5.0, "feedbacks": 5, "root": 382509233},
  "462993756": {"rating": 4.7, "feedbacks": 16, "root": 203403742},
  "463001457": {"rating": 4.6, "feedbacks": 32, "root": 309204328},
  "577159834": {"rating": 5.0, "feedbacks": 5, "root": 151647669},
  "584837180": {"rating": 4.2, "feedbacks": 6, "root": 608120169},
  "584838455": {"rating": 3.5, "feedbacks": 2, "root": 608120169},
  "584839195": {"rating": 4.8, "feedbacks": 6, "root": 608120169},
  "584856106": {"rating": 4.9, "feedbacks": 7, "root": 608138357},
  "584857819": {"rating": 4.7, "feedbacks": 10, "root": 608138357},
  "584864653": {"rating": 4.5, "feedbacks": 11, "root": 608159463},
  "584878143": {"rating": 5.0, "feedbacks": 2, "root": 608167729},
  "584881064": {"rating": 5.0, "feedbacks": 4, "root": 608167729},
  "584882297": {"rating": 5.0, "feedbacks": 3, "root": 608167729},
  "899303821": {"rating": 5.0, "feedbacks": 2, "root": 107552947},
  "899312868": {"rating": 0, "feedbacks": 0, "root": 107552947},
  "899315968": {"rating": 0, "feedbacks": 0, "root": 107552947},
  "899321020": {"rating": 0, "feedbacks": 0, "root": 107552947},
  "899355983": {"rating": 5.0, "feedbacks": 1, "root": 608159463},
  "899371733": {"rating": 5.0, "feedbacks": 2, "root": 608120169},
  "899375103": {"rating": 5.0, "feedbacks": 1, "root": 608120169},
  "969008238": {"rating": 0, "feedbacks": 0, "root": 1578724105},
  "969020680": {"rating": 0, "feedbacks": 0, "root": 1578724105},
  "969025312": {"rating": 0, "feedbacks": 0, "root": 1578724105},
  "969178673": {"rating": 0, "feedbacks": 0, "root": 608138357},
  "969189657": {"rating": 0, "feedbacks": 0, "root": 1579462421},
  "969253912": {"rating": 0, "feedbacks": 0, "root": 1579462421},
  "969257682": {"rating": 0, "feedbacks": 0, "root": 1579462421},
  "969260081": {"rating": 0, "feedbacks": 0, "root": 1579462421},
  "969265618": {"rating": 0, "feedbacks": 0, "root": 1579462421}
};

async function main() {
  let updated = 0;
  let skipped = 0;

  for (const [articleStr, info] of Object.entries(data)) {
    const article = parseInt(articleStr, 10);

    const product = await prisma.product.findFirst({
      where: { wbArticle: article },
      select: { id: true, wbArticle: true, rating: true, reviewsCount: true, imtId: true },
    });

    if (!product) {
      console.log('SKIP: no product for article ' + article);
      skipped++;
      continue;
    }

    const rating = info.rating > 0 ? info.rating : null;
    const reviewsCount = info.feedbacks > 0 ? info.feedbacks : null;
    const imtId = info.root || null;

    await prisma.product.update({
      where: { id: product.id },
      data: { rating, reviewsCount, imtId },
    });
    updated++;
  }

  console.log('Updated ' + updated + ' products, skipped ' + skipped);

  // Show sample
  const sample = await prisma.product.findMany({
    where: { rating: { not: null } },
    select: { id: true, rating: true, reviewsCount: true, salesCount: true },
    take: 5,
    orderBy: { reviewsCount: 'desc' },
  });
  for (const s of sample) {
    console.log(s.id + ': rating=' + s.rating + ' reviews=' + s.reviewsCount);
  }
}

main()
  .catch((e) => { console.error('FATAL:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
