const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Surveva Backend',
    version: '1.0.0',
    description: 'This is the backend for a survey/poll collection app.',
  },
  servers: [
    {
      url: `http://localhost:5000/api/v1`,
      description: 'Development Server',
    },
  ],
};

export default swaggerDefinition;
