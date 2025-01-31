import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  
  // Enable CORS
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configuração do Express
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // Headers globais
  app.use((req, res, next) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    next();
  });

  // Prefixo global para rotas
  app.setGlobalPrefix('api');

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('Menu Icons API')
    .setDescription('API para gerenciar ícones de menu na aplicação')
    .setVersion('1.0')
    .addTag('menu-icons', 'Gerenciamento de ícones salvos')
    .addTag('icons-library', 'Busca na biblioteca de ícones')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);

  // Configuração da UI do Swagger
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Menu Icons API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelExpandDepth: 3,
      defaultModelsExpandDepth: 3,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      syntaxHighlight: {
        theme: 'monokai'
      }
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
