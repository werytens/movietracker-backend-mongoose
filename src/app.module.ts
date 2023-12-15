import {Module} from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { FilmsController } from './controllers/films.controller';
import { UserController } from './controllers/user.controller';

@Module({
    controllers: [AuthController, FilmsController, UserController]
})
export class AppModule {}
