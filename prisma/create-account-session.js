const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

async function main() {
  const email = 'micrimblehelm@aol.com'

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found:', email)
    process.exit(1)
  }

  // Create an Account if it doesn't exist
  const provider = 'email'
  const providerAccountId = email

  const existingAccount = await prisma.account.findFirst({
    where: { provider, providerAccountId },
  })

  if (existingAccount) {
    console.log('Account already exists:', existingAccount.id)
  } else {
    const account = await prisma.account.create({
      data: {
        userId: user.id,
        type: 'email',
        provider,
        providerAccountId,
        refresh_token: null,
        access_token: null,
        expires_at: null,
        token_type: null,
        scope: null,
        id_token: null,
        session_state: null,
      },
    })
    console.log('Created Account:', account.id)
  }

  // Create a Session
  const sessionToken = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const existingSession = await prisma.session.findFirst({
    where: { userId: user.id },
  })

  if (existingSession) {
    console.log('Session already exists:', existingSession.id)
  } else {
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    })
    console.log('Created Session:', session.id)
    console.log('Session token (store securely):', sessionToken)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
