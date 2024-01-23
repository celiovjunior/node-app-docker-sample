import { PrismaClient } from "@prisma/client";
import fastify from "fastify";
import { z } from 'zod';
import cors from "@fastify/cors";

const app = fastify();

app.register(cors, {
    origin: true,
});
const prisma = new PrismaClient();

app.get('/users', async() => {
    const users = await prisma.user.findMany();
    
    return { users };
})

app.get('/users/:id', async(request) => {
    const paramsScheme = z.object({
        id: z.string().cuid(),
    })
    const { id } = paramsScheme.parse(request.params);
    const user = await prisma.user.findUniqueOrThrow({
        where: {
            id,
        }
    })
    return user;
})

app.post('/users', async(request, reply) => {
    const createUserSchema = z.object({
        name: z.string(),
        email: z.string().email()
    })

    const { name, email } = createUserSchema.parse(request.body);

    await prisma.user.create({
        data: {
            name,
            email
        }
    })

    return reply.status(201).send()
})

app.delete('/users/:id', async(request, reply) => {
    const paramsScheme = z.object({
        id: z.string().cuid(),
    })
    const { id } = paramsScheme.parse(request.params)
    await prisma.user.delete({
        where: {
            id
        }
    })
    return reply.send({ message: 'user deleted' })
})

app.listen({
    host: '0.0.0.0',
    port: process.env.PORT ? Number(process.env.PORT) : 3333
}).then(() => {
    console.log('HTTP server is running')
})