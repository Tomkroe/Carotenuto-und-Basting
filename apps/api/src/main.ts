import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { json, urlencoded } from "express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Höheres Limit für den KI-Assistenten, der Datei-Anhänge base64-kodiert im JSON-Body sendet.
  app.use(json({ limit: "30mb" }));
  app.use(urlencoded({ extended: true, limit: "30mb" }));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}
bootstrap();
