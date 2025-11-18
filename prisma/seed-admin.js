const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = 'micrimblehelm@aol.com'
  const name = 'Michael Kelly'

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log('User already exists:', existing.id)
    return
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      emailVerified: new Date(),
    },
  })

  console.log('Created user:', user.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
