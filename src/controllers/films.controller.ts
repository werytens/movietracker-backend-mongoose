import { Controller, Get, Post, Body, Param, Delete, Patch, Query  } from '@nestjs/common';
import { statusModel } from '../db/models/status';
import { filmModel } from 'src/db/models/film';
import { userModel } from 'src/db/models/user';
import { listModel } from 'src/db/models/list';
import { ApiProperty } from '@nestjs/swagger';
import { ImdbAPI, kinopoiskAPI } from 'src/service/imdbapi';

export class FilmDto {
    @ApiProperty()
    title: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    rate: number;
    @ApiProperty()
    metascore: number;
    @ApiProperty()
    genre: string;
    @ApiProperty()
    releaseDate: string;
    @ApiProperty()
    runtime: string;
    @ApiProperty()
    writer: string;
    @ApiProperty()
    actors: string;
    @ApiProperty()
    poster: string;
    @ApiProperty()
    votersCount: string;
    @ApiProperty()
    imdbID: string;
}


class FilmListActionsDto {
    @ApiProperty()
    userId: string
    @ApiProperty()
    imdbId?: string
    @ApiProperty()
    kinopoiskId?: string
    @ApiProperty()
    filmId?: string
    @ApiProperty()
    statusId?: string
}

@Controller('/api/films')
export class FilmsController {

    @Get('/get/:id')
    async getFilm(@Param() params: {id: string}) {
        let response

        try {
            response = await filmModel.findOne({'_id': params.id});

            if (!response) {
                return {isOk: false, message: "Film not found"}
            }
        } catch (e) {
            return {isOk: false, message: "Film not found / Unexpected error"}
        }

        console.log(response)

        return {isOk: true, ...response._doc}
    }

    @Get('/statuses')
    async getStatuses() {
        return {isOk: true, ...(await statusModel.find())}
    }

    // List Endpoints

    @Post('/add')
    async addFilmToUser(@Body() body: FilmListActionsDto) {
        // TODO
        let film = await filmModel.findOne({"imdbID": body.imdbId})
        // check from kinopoisk

        if (!film) {
            console.log('if working')
            // Если фильм не был найден в нашей базе данных - ищем его в базе данных IMDB, прогоняем через DTO и добавляем в свою базу данных.
            const filmResponse = await ImdbAPI.getFilm(body.imdbId);

            if (filmResponse.Response === 'False') {
                return {isOK: false, message: filmResponse["Error"]}
            }

            film = await filmModel.create({...filmResponse});
        }

        // Ищем в списке пользователя текущий фильм (добавлен ли он на текущий момент)
        const userFilm = await listModel.findOne({'filmId': film._id})

        if (userFilm) {
            return {isOk: false, message: 'This film already in your list.'}
        }
        
        let user;

        try {
            user = await userModel.findOne({"_id": body.userId});

            if (!user) {
                return {isOk: false, message: "User not found"}
            }
        } catch (e) {
            return {isOk: false, message: "User not found / Unexpected error"}
        }


        const response = await listModel.create({
            userId: user._id,
            filmId: film._id,
            statusId: (await statusModel.findOne({name: 'planned'}))._id
        })

        return {isOk: true, ...response._doc}
    }


    @Post('/addkinopoisk')
    async addFilmFromKinopoisk(@Body() body: FilmListActionsDto) {
        const filmData = await kinopoiskAPI.getFilm(body.kinopoiskId)
        
        const film = await filmModel.create({...filmData})

        let user;

        try {
            user = await userModel.findOne({"_id": body.userId});

            if (!user) {
                return {isOk: false, message: "User not found"}
            }
        } catch (e) {
            return {isOk: false, message: "User not found / Unexpected error"}
        }


        const response = await listModel.create({
            userId: user._id,
            filmId: film._id,
            statusId: (await statusModel.findOne({name: 'planned'}))._id
        })

        return {isOk: true, ...response._doc}
    }
    

    @Delete('/delete')
    async removeFilmFromList(@Body() body: FilmListActionsDto) {
        let response; 

        try {
            response = await listModel.findOneAndDelete({'filmId': body.filmId, 'userId': body.userId})
            return {isOk: true, ...response._doc};
        } catch (e) {
            return {isOk: false, message: "(User / Film / User&Film doenst exists) / Unexpected error."}
        }

    }

    @Patch('/status')
    async changeFilmStatus(@Body() body: FilmListActionsDto) {
        const statusesIdsArrays = (await statusModel.find()).map((item) => item._id.toHexString())

        if (!statusesIdsArrays.includes(body.statusId))
            return {isOk: false, message: "This status dont found"}

        let item; 

        try {
            item = await listModel.findOneAndUpdate({'filmId': body.filmId, 'userId': body.userId}, {statusId: body.statusId})
            return {isOk: true, ...item._doc}
        } catch (e) {
            return {isOk: false, message: "(User / Film / User&Film doenst exists) / Unexpected error."}
        }
    }


    @Get('/getlist/:id')
    async getUserList(@Param() params: {id: string}) {
        let user;

        try {
            user = await userModel.findOne({"_id": params.id});

            if (!user) {
                return {isOk: false, message: "User not found"}
            }
        } catch (e) {
            return {isOk: false, message: "User not found / Unexpected error"}
        }

        const response = await listModel.find({userId: user._id})

        return {isOk: true, ...response}
    }
    

    @Get('/status/:userId')
    async getByStatus(@Param('userId') userId: string, @Query('statusId') statusId: string) {
        let response;

        try {
            response = await listModel.findOne({"userId": userId, "statusId": statusId})

            if (!response) {
                return {isOk: false, message: "User not found / Status not found"}
            }
        } catch (e) {
            return {isOk: false, message: "(User not found / List not found) / Unexpected error."}
        }

        return {isOk: true, ...response._doc}
    }
}
