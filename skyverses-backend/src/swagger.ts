// src/swagger.ts

export const swaggerOptions: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "AI Dubbing API",
      version: "1.0.0",
      description: "APIs for uploading video and generating voice-over",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
      {
        url: " https://api.skyverses.com",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Nơi chứa comment @swagger
};
