import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const adapter = new PrismaPg(process.env.PRISMA_DATABASE_URL || '')
const prisma = new PrismaClient({ adapter })

async function main() {
    const dataPath = path.join(process.cwd(), 'data', 'data.json')
    const rawData = fs.readFileSync(dataPath, 'utf-8')
    const data = JSON.parse(rawData)

    // Clear existing data
    await prisma.prescription.deleteMany()
    await prisma.appointment.deleteMany()
    await prisma.user.deleteMany()
    await prisma.medication.deleteMany()
    await prisma.dosage.deleteMany()

    // Seed Medications
    for (const medName of data.medications) {
        await prisma.medication.create({
            data: { name: medName.trim() }
        })
    }

    // Seed Dosages
    for (const dosageName of data.dosages) {
        await prisma.dosage.create({
            data: { name: dosageName.trim() }
        })
    }

    // Seed Users, Appointments, and Prescriptions
    for (const userData of data.users) {
        const user = await prisma.user.create({
            data: {
                name: userData.name.trim(),
                email: userData.email.trim(),
                password: await bcrypt.hash(userData.password.trim(), 10),
            }
        })

        // Create Appointments
        for (const apt of userData.appointments) {
            await prisma.appointment.create({
                data: {
                    userId: user.id,
                    provider: apt.provider.trim(),
                    datetime: new Date(apt.datetime),
                    repeat: apt.repeat,
                }
            })
        }

        // Create Prescriptions
        for (const rx of userData.prescriptions) {
            await prisma.prescription.create({
                data: {
                    userId: user.id,
                    medication: rx.medication.trim(),
                    dosage: rx.dosage.trim(),
                    quantity: rx.quantity,
                    refillOn: new Date(rx.refill_on),
                    refillSchedule: rx.refill_schedule.trim(),
                }
            })
        }
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
