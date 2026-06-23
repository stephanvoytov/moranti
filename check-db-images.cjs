const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findMany({
  select: { id: true, wbArticle: true, image: true, images: true, photoCount: true },
  where: { archivedAt: null }
}).then(rows => {
  const hosts = [...new Set(rows.map(r => { try { return new URL(r.image).hostname } catch { return 'bad'; } }))];
  console.log('hosts:', hosts);
  console.log('total:', rows.length);
  const c1200 = rows.filter(r => r.image.includes('c1200')).length;
  const c516 = rows.filter(r => r.image.includes('c516')).length;
  const big = rows.filter(r => r.image.includes('/big/')).length;
  console.log('c1200:', c1200, 'c516:', c516, 'big:', big);
  const oldHosts = rows.filter(r => r.image.includes('basket-'));
  console.log('old-host products:', oldHosts.length);
  if (oldHosts.length > 0) {
    console.log('first old-host image:', oldHosts[0].image);
    console.log('first old-host id:', oldHosts[0].id, 'article:', oldHosts[0].wbArticle);
    console.log('all old hosts:', [...new Set(oldHosts.map(r => { try { return new URL(r.image).hostname; } catch { return 'bad'; } }))]);
  }
  const nullPhotoCount = rows.filter(r => !r.photoCount).length;
  console.log('null photoCount:', nullPhotoCount);
  p.$disconnect();
}).catch(e => { console.error(e.message); p.$disconnect(); });
