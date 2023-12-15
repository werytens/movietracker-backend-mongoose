import { Controller, Get, Post, Body, Headers } from '@nestjs/common';
import { userModel } from 'src/db/models/user';
import { ApiProperty } from '@nestjs/swagger';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class UserDto {
    @ApiProperty()
    username: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    avatarLink: string | undefined;
}

class TokenDto {
    @ApiProperty()
    token: string;
}

@Controller('/api/auth')
export class AuthController {
    @Post('/registration')
    async registration(@Body() body: UserDto) {

        const user = await userModel.findOne({"username": body.username})
        if (user) {
            return {isOk: false, message: 'This user already created'}
        }

        const hashPassword = await bcrypt.hash(body.password, 10)

        const response = await userModel.create({
            username: body.username,
            passwordHash: hashPassword,
            avatarLink: 'none',
            status: 'Member'
        })

        const token = jwt.sign(response._doc, process.env.TOKEN_SECRET);

        return {isOk: true, ...response._doc, token: token}
    }

    @Post('/login')
    async login(@Body() body: UserDto) {
        const user = await userModel.findOne({"username": body.username})

        if (!user) {
            return {isOk: false, message: 'This user not created'}
        }

        const checkPassword = await bcrypt.compare(body.password, user._doc.passwordHash)

        if (!checkPassword) {
            return {isOk: false, message: 'Invalid password'}
        }

        const token = jwt.sign(user._doc, process.env.TOKEN_SECRET);

        return {isOk: true, ...user._doc, token: token}
    }

    // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1heGlta2EyIiwicGFzc3dvcmRIYXNoIjoiJDJiJDEwJGJSMzlJQ0MxcG85N01sMXlncllub09rM3VFMXpVdE0wNnNVbk9DSE5ON1prVEU2RzVQSVUyIiwiX2lkIjoiNjUzYTM0Njc3YjU4MTAxM2E0OGMxNTQ1IiwiX192IjowLCJpYXQiOjE2OTgzMTMzMTl9.Ov8omzmpw_cOg29m9W-SN6ZUXHLqLMQKKW2YZH0Etiw
    @Get('/me')
    async me(@Headers('Authorization') headers: TokenDto) {
        const userDataJWT = jwt.verify(headers, process.env.TOKEN_SECRET);
        const userData = await userModel.findOne({"_id": userDataJWT._id})

        return {isOk: true, ...userData._doc}
    }
}

// curl -X 'GET' \
//   'http://localhost:5000/api/auth/me' \
//   -H 'accept: */*' \
//   -H 'Content-Type: application/json' \
//   -H 'Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im1heGlta2EyIiwicGFzc3dvcmRIYXNoIjoiJDJiJDEwJGJSMzlJQ0MxcG85N01sMXlncllub09rM3VFMXpVdE0wNnNVbk9DSE5ON1prVEU2RzVQSVUyIiwiX2lkIjoiNjUzYTM0Njc3YjU4MTAxM2E0OGMxNTQ1IiwiX192IjowLCJpYXQiOjE2OTgzMTMzMTl9.Ov8omzmpw_cOg29m9W-SN6ZUXHLqLMQKKW2YZH0Etiw'