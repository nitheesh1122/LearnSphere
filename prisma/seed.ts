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
    // 3. Create Courses
    console.log("Seeding courses...");

    // Get instructor user
    const instructor = await prisma.user.findUnique({
        where: { email: 'instructor@learnsphere.com' }
    });

    if (instructor) {
        const coursesData = [
            {
                title: "Digital Illustration: Learn to Use Procreate",
                description: "Learn the basics of Procreate on the iPad. This course covers everything from tools to layers, helping you create stunning digital art.",
                price: 29.99,
                published: true,
                tags: ["Creative", "Design", "Art"],
                level: "BEGINNER",
                instructorId: instructor.id
            },
            {
                title: "Graphic Design Basics: Core Principles for Visual Design",
                description: "Master the fundamental principles of graphic design. Learn about typography, color theory, layout, and composition.",
                price: 49.99,
                published: true,
                tags: ["Design", "Business"],
                level: "BEGINNER",
                instructorId: instructor.id
            },
            {
                title: "Personal Branding: Crafting Your Social Media Presence",
                description: "Build a strong personal brand on social media. Learn strategies for content creation, engagement, and growth.",
                price: 19.99,
                published: true,
                tags: ["Marketing", "Business"],
                level: "INTERMEDIATE",
                instructorId: instructor.id
            },
            {
                title: "Productivity Masterclass: Create a Custom System that Works",
                description: "Boost your productivity with a custom system. Learn techniques for time management, goal setting, and focus.",
                price: 39.99,
                published: true,
                tags: ["Productivity", "Lifestyle"],
                level: "ADVANCED",
                instructorId: instructor.id
            }
        ];

        for (const courseData of coursesData) {
            await prisma.course.create({
                data: courseData
            });
            console.log(`Course created: ${courseData.title}`);
        }
    }

    console.log("Seeding completed.");
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
