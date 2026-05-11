import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Mazání starých dat...");
  await prisma.activityLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.anonymousUser.deleteMany();
  await prisma.user.deleteMany();

  console.log("Vytváření uživatelů...");

  const adminHash = await hash("admin", 12);
  const admin = await prisma.user.create({
    data: {
      email: "admin@scriptum.cz",
      name: "admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  const janaHash = await hash("heslo123", 12);
  const jana = await prisma.user.create({
    data: {
      email: "jana.novakova@email.cz",
      name: "Jana Nováková",
      passwordHash: janaHash,
    },
  });

  const tomasHash = await hash("heslo123", 12);
  const tomas = await prisma.user.create({
    data: {
      email: "tomas.prochazka@email.cz",
      name: "Tomáš Procházka",
      passwordHash: tomasHash,
    },
  });

  const lucie = await prisma.user.create({
    data: {
      email: "lucie.dvorakova@email.cz",
      name: "Lucie Dvořáková",
      passwordHash: await hash("heslo123", 12),
    },
  });

  console.log("Vytváření anonymních uživatelů...");

  const anon1 = await prisma.anonymousUser.create({
    data: { cookieId: "anon-cookie-001", nickname: "Zvědavý_čtenář" },
  });

  const anon2 = await prisma.anonymousUser.create({
    data: { cookieId: "anon-cookie-002", nickname: "NočníPisatel" },
  });

  console.log("Vytváření příspěvků...");

  const post1 = await prisma.post.create({
    data: {
      authorId: jana.id,
      title: "Jak jsem přestala prokrastinovat – a co mi opravdu pomohlo",
      content: `Celý život jsem odkládala věci na poslední chvíli. Práci, úklid, telefonáty k lékaři. Říkala jsem si, že jsem prostě „noční typ" nebo že „pracuji lépe pod tlakem". Byl to samozřejmě nesmysl.

Zlom nastal před rokem, kdy jsem si koupila papírový diář. Žádná aplikace, žádné notifikace – jen pero a stránka. Každé ráno jsem napsala tři věci, které musím udělat. Jen tři. A ty jsem splnila.

Zní to banálně, ale funguje to. Mozek nemá rád otevřené smyčky – nedokončené úkoly nás zatěžují víc, než si uvědomujeme. Jakmile je úkol zapsaný a splněný, smyčka se uzavře.

Druhá věc, která pomohla: pravidlo dvou minut. Pokud něco zabere méně než dvě minuty, udělám to hned. Odpověď na e-mail, zaplacení faktury, rychlý telefonát. Přestala jsem budovat hromady „malých věcí".

Není to dokonalé. Stále jsou dny, kdy nic nefunguje. Ale těch špatných dní je teď výrazně méně.`,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      authorId: tomas.id,
      title: "Recenze: Strávil jsem týden bez sociálních sítí",
      content: `Experiment začal v pondělí ráno. Vymazal jsem Instagram, Twitter/X a TikTok z telefonu. Jen tak, na týden. Čekal jsem, že to bude těžké. Bylo – ale jinak, než jsem si myslel.

První dva dny jsem sahal po telefonu doslova každých pět minut. Reflex byl tak silný, že jsem si toho ani nevšiml. Ruka prostě sáhla, obrazovka se rozsvítila, a pak jsem si uvědomil, že tam nic není.

Od třetího dne jsem začal číst. Přečetl jsem dvě knihy, které jsem měl rozečtené půl roku. Vaření mi najednou přišlo zábavné – protože jsem u toho nepustil žádný podcast ani video na pozadí.

Největší překvapení: splpal jsem lépe. Hned od první noci.

Vrátil jsem se na sítě po týdnu. Ale jinak – jen ráno, dvacet minut. Zatím to drží.`,
    },
  });

  const post3 = await prisma.post.create({
    data: {
      authorId: lucie.id,
      title: "Proč jsem začala psát deník v 34 letech",
      content: `Vždycky mi přišlo psaní deníku infantilní. Jako něco pro puberťačky, které řeší kluka ze třídy. Pak jsem prošla rozvodem a terapeut mi řekl, ať zkusím psát.

Začala jsem. Neohrabaně, s odporem. Pár vět denně. Co se stalo, jak jsem se cítila. Nic literárního.

Po měsíci jsem si přečetla zápisky od začátku. Viděla jsem vzorce, které jsem předtím neviděla. Jak reaguji na stres. Co mě opravdu trápí versus co říkám nahlas. Byl to zvláštní pocit – číst sama sebe jako cizí člověk.

Terapeut říká, že psaní aktivuje jiné části mozku než mluvení. Nevím, jestli je to pravda, ale něco na tom bude.

Píšu každý večer už přes rok. Deníky nepřečtu. Ale psaní samotné mi dává smysl.`,
    },
  });

  const post4 = await prisma.post.create({
    data: {
      authorId: jana.id,
      title: "Tři věci, které jsem se naučila při stěhování do menšího bytu",
      content: `Z 90 metrů na 48. Dobrovolně. Lidé si mysleli, že jsem se zbláznila.

Za prvé: 80 % věcí nepotřebujete. Měla jsem skříň plnou oblečení, z níž jsem nosila stále stejných deset kusů. Polovina kuchyňského nádobí ležela roky nedotčená. Vyhazování bolelo – ale jen chvíli.

Za druhé: méně prostoru nutí k jiným návykům. Nemůžu si koupit novou věc, aniž bych se zamyslela, kam ji dám. To samo o sobě zastaví spoustu impulsivních nákupů.

Za třetí: domov není o velikosti. Malý byt, ve kterém se cítím dobře, mi dává víc než velký, kde jsem se ztrácela. Záleží na světle, pořádku a na tom, co v něm děláte.

Lituju? Vůbec ne.`,
    },
  });

  const post5 = await prisma.post.create({
    data: {
      authorId: tomas.id,
      title: "Jsem programátor a naučil jsem se vařit. Tady je co mě překvapilo.",
      content: `Vaření mě vždy děsilo. Zdálo se mi chaotické – příliš mnoho proměnných najednou, žádné jasné výstupy. Pak mě kamarád přivedl na myšlenku přistupovat k tomu jako k programování.

Recept je algoritmus. Ingredience jsou vstupy. Jídlo je výstup. Pokud výstup nesedí, hledáš, který krok selhal.

Začal jsem od základů: jak správně nakrájet cibuli, jak ovládat teplotu pánve, co znamená „restovat". Jako když se učíš syntax nového jazyka.

Po třech měsících vařím čtyřikrát týdně. Jídlo je lepší, levnější a víc si ho vážím, protože vím, co do něj šlo.

Největší lekce: trpělivost. V programování se chyba projeví okamžitě. U vaření musíš počkat, ochutnat, přizpůsobit. To mě hodně naučilo i mimo kuchyni.`,
    },
  });

  console.log("Vytváření komentářů...");

  const c1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: tomas.id,
      content: "Taky jsem přešel na papírový diář a je to jiný svět. Ta aplikace mi pořád dávala notifikace a já je odkládal. Pero a papír tohle nemají.",
    },
  });

  const c1r1 = await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: jana.id,
      parentId: c1.id,
      content: "Přesně tak! A taky mi papírový diář pomáhá líp si věci zapamatovat – psaní rukou to nějak zakóduje do hlavy líp než klikání.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      anonymousId: anon1.id,
      content: "Pravidlo dvou minut znám z GTD. Funguje skvěle na e-maily, ale u větších projektů si musím dávat pozor, abych to příliš nerozdrobila.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post1.id,
      authorId: lucie.id,
      content: "Díky za sdílení. Já prokrastinovám nejvíc u věcí, které mě nezajímají. Zatím jsem nenašla lék – prostě je odkládám, dokud to hoří.",
    },
  });

  const c2 = await prisma.comment.create({
    data: {
      postId: post2.id,
      anonymousId: anon2.id,
      content: "Zkusil jsem to taky, ale vydržel jsem jen tři dny. Ten reflex sahat po telefonu byl silnější než vůle.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: jana.id,
      parentId: c2.id,
      content: "Tři dny je taky něco! Já začínala postupně – nejdřív jsem smazala jen TikTok. Až za měsíc Instagram.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post2.id,
      authorId: lucie.id,
      content: "Ten lepší spánek zmiňuje úplně každý, kdo to zkusí. Modré světlo před spaním je fakt problém.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      authorId: tomas.id,
      content: "Zajímavé. Já psal deník v pubertě a pak jsem přestal. Možná bych to měl zkusit znovu – jinak, bez ambice být literární.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post3.id,
      anonymousId: anon1.id,
      content: "Terapeut mi říkal totéž. Psaní pomáhá zpracovat věci, které nejde jen tak říct nahlas. Je to jiný mód přemýšlení.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post4.id,
      authorId: tomas.id,
      content: "Z 90 na 48 dobrovolně – to bych nedal. Ale chápu tu logiku. Já mám taky věci, které jsem za rok nepoužil.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post4.id,
      anonymousId: anon2.id,
      content: "Já bydlím v 38 metrech sám a spousta lidí se na mě dívá divně. Ale já jsem spokojený – platím málo, mám uklizeno za hodinu.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post5.id,
      authorId: lucie.id,
      content: "Jako programátor přistupovat k vaření jako k algoritmu – to je tak typické a zároveň geniální. Musím to zkusit na svého bratra, který říká, že neumí vařit.",
    },
  });

  await prisma.comment.create({
    data: {
      postId: post5.id,
      authorId: jana.id,
      content: "Teplota pánve je fakt klíč. Než jsem to pochopila, dělala jsem ze všeho gumu nebo uhel.",
    },
  });

  console.log("Vytváření notifikací...");

  await prisma.notification.createMany({
    data: [
      {
        userId: jana.id,
        type: "NEW_COMMENT",
        message: `Tomáš Procházka okomentoval váš příspěvek „Jak jsem přestala prokrastinovat“`,
        read: true,
        linkUrl: `/posts/${post1.id}`,
      },
      {
        userId: jana.id,
        type: "COMMENT_REPLY",
        message: `Odpověď na váš komentář v příspěvku „Recenze: Strávil jsem týden bez sociálních sítí"`,
        read: false,
        linkUrl: `/posts/${post2.id}`,
      },
      {
        userId: tomas.id,
        type: "NEW_COMMENT",
        message: `Jana Nováková okomentovala váš příspěvek „Jsem programátor a naučil jsem se vařit"`,
        read: false,
        linkUrl: `/posts/${post5.id}`,
      },
      {
        userId: lucie.id,
        type: "NEW_COMMENT",
        message: `Anonymní uživatel okomentoval váš příspěvek „Proč jsem začala psát deník"`,
        read: false,
        linkUrl: `/posts/${post3.id}`,
      },
    ],
  });

  console.log("Vytváření activity logů...");

  await prisma.activityLog.createMany({
    data: [
      { action: "USER_REGISTERED", userId: jana.id },
      { action: "USER_REGISTERED", userId: tomas.id },
      { action: "USER_REGISTERED", userId: lucie.id },
      { action: "USER_REGISTERED", userId: admin.id },
      { action: "POST_CREATED", userId: jana.id, targetType: "Post", targetId: post1.id },
      { action: "POST_CREATED", userId: tomas.id, targetType: "Post", targetId: post2.id },
      { action: "POST_CREATED", userId: lucie.id, targetType: "Post", targetId: post3.id },
      { action: "POST_CREATED", userId: jana.id, targetType: "Post", targetId: post4.id },
      { action: "POST_CREATED", userId: tomas.id, targetType: "Post", targetId: post5.id },
      { action: "COMMENT_CREATED", userId: tomas.id, targetType: "Comment", targetId: c1.id },
      { action: "COMMENT_REPLIED", userId: jana.id, targetType: "Comment", targetId: c1r1.id },
      { action: "COMMENT_CREATED", anonymousId: anon2.id, targetType: "Comment", targetId: c2.id },
      { action: "NICKNAME_CHANGED", anonymousId: anon1.id, metadata: "Zvědavý_čtenář" },
      { action: "NICKNAME_CHANGED", anonymousId: anon2.id, metadata: "NočníPisatel" },
      { action: "USER_LOGIN", userId: jana.id },
      { action: "USER_LOGIN", userId: tomas.id },
    ],
  });

  console.log("✓ Seed dokončen.");
  console.log("");
  console.log("Účty:");
  console.log("  admin@scriptum.cz       / admin       (ADMIN)");
  console.log("  jana.novakova@email.cz  / heslo123");
  console.log("  tomas.prochazka@email.cz / heslo123");
  console.log("  lucie.dvorakova@email.cz / heslo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
