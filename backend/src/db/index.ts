import { prisma } from '../prisma/client';

async function connectDatabase() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
    }
}

async function disconnectDatabase() {
    try {
        await prisma.$disconnect();
        console.log('Database disconnected successfully');
    } catch (error) {
        console.error('Database disconnection failed:', error);
        throw error;
    }
}

export { connectDatabase, disconnectDatabase, prisma };