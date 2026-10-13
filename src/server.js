import "dotenv/config";
import Fastify from "fastify";
import prisma from "./lib/prisma.js";

const app = Fastify({ logger: true });

// Root route
app.get("/", async () => ({
  success: true,
  message: "Welcome to QueueFlow API",
}));

// Health check
app.get("/health", async () => ({
  success: true,
  message: "QueueFlow API is running",
}));

// Create a job
app.post("/api/jobs", async (request, reply) => {
  const { name, payload } = request.body ?? {};

  if (typeof name !== "string" || !name.trim()) {
    return reply.code(400).send({
      success: false,
      message: "Job name is required",
    });
  }

  const job = await prisma.job.create({
    data: {
      name: name.trim(),
      ...(payload !== undefined ? { payload } : {}),
    },
  });

  return reply.code(201).send({
    success: true,
    data: job,
  });
});

// Get all jobs->next i add 2nd step
app.get("/api/jobs", async (request, reply) => {
  const jobs = await prisma.job.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return reply.send({
    success: true,
    count: jobs.length,
    data: jobs,
  });
});


// Get a single job by ID
app.get("/api/jobs/:id", async (request, reply) => {
  const id = Number(request.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return reply.code(400).send({
      success: false,
      message: "Invalid job ID",
    });
  }

  const job = await prisma.job.findUnique({
    where: { id },
  });

  if (!job) {
    return reply.code(404).send({
      success: false,
      message: "Job not found",
    });
  }

  return reply.send({
    success: true,
    data: job,
  });
});
//  Update a job's status
app.patch("/api/jobs/:id", async (request, reply) => {
  const id = Number(request.params.id);
  const { status } = request.body ?? {};

  const allowedStatuses = ["pending", "processing", "completed", "failed"];

  if (!Number.isInteger(id) || id <= 0) {
    return reply.code(400).send({
      success: false,
      message: "Invalid job ID",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return reply.code(400).send({
      success: false,
      message: "Invalid job status",
    });
  }

  const existingJob = await prisma.job.findUnique({
    where: { id },
  });

  if (!existingJob) {
    return reply.code(404).send({
      success: false,
      message: "Job not found",
    });
  }

  const updatedJob = await prisma.job.update({
    where: { id },
    data: { status },
  });

  return reply.send({
    success: true,
    message: "Job status updated successfully",
    data: updatedJob,
  });
});


// Start server
const start = async () => {
  try {
    await app.listen({
      port: 3000,
      host: "127.0.0.1",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
