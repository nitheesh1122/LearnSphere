import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10)

    // 1. Create Roles
    const roles = ['ADMIN', 'INSTRUCTOR', 'LEARNER']
    const roleRecords: Record<string, any> = {}

    for (const roleName of roles) {
        const role = await prisma.role.upsert({
            where: { name: roleName },
            update: {},
            create: { name: roleName },
        })
        roleRecords[roleName] = role
        console.log(`Role created: ${roleName}`)
    }

    // 2. Create Users
    const users = [
        { email: 'admin@learnsphere.com', role: 'ADMIN', name: 'Admin User' },
        { email: 'instructor@learnsphere.com', role: 'INSTRUCTOR', name: 'Instructor User' },
        { email: 'learner@learnsphere.com', role: 'LEARNER', name: 'Learner User' },
    ]

    for (const u of users) {
        const user = await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                email: u.email,
                name: u.name,
                passwordHash,
            },
        })

        // Assign Role
        await prisma.userRole.upsert({
            where: {
                userId_roleId: {
                    userId: user.id,
                    roleId: roleRecords[u.role].id
                }
            },
            update: {},
            create: {
                userId: user.id,
                roleId: roleRecords[u.role].id
            }
        })

        console.log(`User created: ${u.email} with role ${u.role}`)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
