import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configure CORS
  app.enableCors({
    origin: [
      'http://localhost:5174',
      'http://localhost:5173', // Vite dev server
      'http://localhost:3000', // React dev server
      'http://localhost:3001', // Alternative React dev server
      'http://localhost:4200', // Angular dev server
      'http://localhost:8080', // Vue dev server
      // Add your production domains here
      process.env.FRONTEND_URL, // Environment variable for frontend URL
    ].filter(Boolean), // Remove undefined values
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    credentials: true, // Allow cookies and authorization headers
  });

  // Increase the request body size limit
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('The API description')
    .setVersion('1.0')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Benefits', 'Benefits management endpoints')
    .addTag('Applications', 'Application management endpoints')
    .addTag('ApplicationFiles', 'File management endpoints')
    .addApiKey(
      { type: 'apiKey', name: 'Authorization', in: 'header' },
      'access-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document, {
    customSiteTitle: 'API Documentation UBI Provider',
    swaggerOptions: {
      tagsSorter: (a, b) => {
        const order = ['Auth', 'Benefits', 'Applications', 'ApplicationFiles'];
        return order.indexOf(a) - order.indexOf(b);
      },
      operationsSorter: 'alpha'
    },
  });

  console.log('process.env.PORT-->>', process.env.PORT);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();