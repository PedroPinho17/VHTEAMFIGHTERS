import { PrismaClient, PersonRole, WeekDay, UserRole } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@vhteamfighters.local";
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const name = process.env.ADMIN_NAME ?? "Admin VH";
  const passwordHash = await hashPassword(password);

  let admin = await prisma.user.findUnique({ where: { email } });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
        role: UserRole.ADMIN,
        accounts: {
          create: {
            accountId: email,
            providerId: "credential",
            password: passwordHash,
          },
        },
      },
    });
  } else {
    await prisma.user.update({
      where: { id: admin.id },
      data: { name, role: UserRole.ADMIN },
    });
    const existingAccount = await prisma.account.findFirst({
      where: { userId: admin.id, providerId: "credential" },
    });
    if (existingAccount) {
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { password: passwordHash },
      });
    } else {
      await prisma.account.create({
        data: {
          userId: admin.id,
          accountId: email,
          providerId: "credential",
          password: passwordHash,
        },
      });
    }
  }

  const homeCount = await prisma.siteHome.count();
  if (homeCount === 0) {
    await prisma.siteHome.create({
      data: {
        heroTitle: "VH Team Fighters",
        heroSubtitle: "Kickboxing com atitude, disciplina e resultados",
        bodyText:
          "Treina com uma equipa focada em técnica, condição física e mentalidade de combate. Do iniciante ao atleta de competição.",
        ctaPrimaryLabel: "Inscreve-te",
        ctaPrimaryHref: "/contactos",
        ctaSecondaryLabel: "Ver horários",
        ctaSecondaryHref: "/horarios",
      },
    });
  }

  const peopleCount = await prisma.person.count();
  if (peopleCount === 0) {
    await prisma.person.createMany({
      data: [
        {
          role: PersonRole.COACH,
          name: "Coach VH",
          bio: "Fundador e treinador principal. Anos de experiência em kickboxing e preparação de atletas.",
          titles: ["Treinador Principal", "Kickboxing"],
          sortOrder: 1,
          published: true,
        },
        {
          role: PersonRole.FIGHTER,
          name: "Atleta VH",
          bio: "Lutador da equipa com foco em competitividade e evolução constante.",
          weightKg: 70,
          titles: ["Kickboxing"],
          sortOrder: 1,
          published: true,
        },
        {
          role: PersonRole.FIGHTER,
          name: "Atleta Rising",
          bio: "Jovem promessa da VH Team Fighters.",
          weightKg: 63.5,
          titles: ["Amador"],
          sortOrder: 2,
          published: true,
        },
      ],
    });
  }

  const slots = await prisma.trainingSlot.count();
  if (slots === 0) {
    await prisma.trainingSlot.createMany({
      data: [
        {
          day: WeekDay.MONDAY,
          startTime: "19:00",
          endTime: "20:30",
          modality: "Kickboxing",
          level: "Todos os níveis",
          sortOrder: 1,
        },
        {
          day: WeekDay.WEDNESDAY,
          startTime: "19:00",
          endTime: "20:30",
          modality: "Kickboxing",
          level: "Todos os níveis",
          sortOrder: 2,
        },
        {
          day: WeekDay.FRIDAY,
          startTime: "18:30",
          endTime: "20:00",
          modality: "Sparring / Técnica",
          level: "Intermédio+",
          sortOrder: 3,
        },
      ],
    });
  }

  const events = await prisma.event.count();
  if (events === 0) {
    await prisma.event.create({
      data: {
        title: "Open Training Day",
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
        location: "Ginásio VH Team",
        description: "Dia aberto para novos atletas conhecerem a equipa e o treino.",
        published: true,
      },
    });
  }

  const posts = await prisma.post.count();
  if (posts === 0) {
    await prisma.post.create({
      data: {
        title: "Bem-vindo à VH Team Fighters",
        slug: "bem-vindo-vh-team-fighters",
        excerpt: "O site oficial da equipa já está online.",
        body: "## Nova casa digital\n\nAcompanham eventos, horários e notícias da equipa diretamente aqui.\n\nSegue-nos no Instagram [@vhteamfighters](https://www.instagram.com/vhteamfighters).",
        published: true,
        publishedAt: new Date(),
      },
    });
  }

  const contact = await prisma.contactSettings.findFirst({ orderBy: { createdAt: "asc" } });
  const openingHours = [
    { day: "MONDAY", open: "07:00", close: "22:00" },
    { day: "TUESDAY", open: "07:00", close: "22:00" },
    { day: "WEDNESDAY", open: "07:00", close: "22:00" },
    { day: "THURSDAY", open: "07:00", close: "22:00" },
    { day: "FRIDAY", open: "07:00", close: "22:00" },
    { day: "SATURDAY", open: "08:00", close: "19:00" },
    { day: "SUNDAY", closed: true },
  ];
  const contactData = {
    address: "R. Principal n.104, 4505-515 Lobão",
    phone: "917 673 853",
    email: "contacto@vhteamfighters.local",
    instagramUrl: "https://www.instagram.com/vhteamfighters",
    facebookUrl: "https://www.facebook.com/100063594130412",
    openingHours,
  };
  if (!contact) {
    await prisma.contactSettings.create({ data: contactData });
  } else {
    await prisma.contactSettings.update({
      where: { id: contact.id },
      data: contactData,
    });
  }

  console.log("Seed complete. Admin:", email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
