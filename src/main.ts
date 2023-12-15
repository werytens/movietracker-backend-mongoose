require('dotenv').config();
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { statusModel } from './db/models/status';


const start = async () => {
    if ((await statusModel.find()).length === 0) {
        // Добавление всех статусов просмотра фильмов
        const response = await statusModel.insertMany([
            { name: 'favorite' },
            { name: 'planned' },
			{ name: 'delayed' },
			{ name: 'watching' },
			{ name: 'watched' },
			{ name: 'abandoned' }
        ]);
    }

	const PORT = process.env.PORT || 1401;
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: true
	});
	const config = new DocumentBuilder()
		.setTitle('Swagger Test')
		.setDescription('The test API description')
		.setVersion('1.0')
		.addTag('test')
		.build();

	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('api', app, document);

	(await app).listen(PORT, () => console.log('server started, port: ' + PORT));
};

start();
