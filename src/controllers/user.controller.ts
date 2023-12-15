import { Body, Controller, Patch, Get, Param } from '@nestjs/common';
import { statusModel } from '../db/models/status';
import { ApiProperty } from '@nestjs/swagger';
import { userModel } from 'src/db/models/user';
const bcrypt = require('bcrypt');


class AvatarDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    link: string;
}

class PasswordDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    password: string;
}

@Controller('/api/user')
export class UserController {
    @Patch('/avatar')
    async avatar(@Body() body: AvatarDto) {
        try {
            const user = await userModel.findOne({ "_id": body.id })

            if (!user)
                return {isOk: false, message: "User not found"}

            await userModel.findOneAndUpdate({
                "_id": body.id
            }, {
                avatarLink: body.link
            })
            
            return { isOk: true, message: "Avatar Changed"}
        } catch (e) {
            return {isOk: false, message: "User not found / Unexpected Error"}
        }
    }

    @Patch('/password')
    async password(@Body() body: PasswordDto) {
        try {
            const user = await userModel.findOne({ "_id": body.id })

            if (!user)
                return {isOk: false, message: "User not found"}

            await userModel.findOneAndUpdate({
                "_id": body.id
            }, {
                passwordHash: await bcrypt.hash(body.password, 10)
            })
            
            return { isOk: true, message: "Password Changed"}
        } catch (e) {
            return {isOk: false, message: "User not found / Unexpected Error"}
        }
    }

    @Get('/:username')
    async get(@Param() params: {username: string}) {
        const user = await userModel.findOne({'username': params.username});
        
        if (!user) {
            return {isOk: false, message: "User not found"}            
        }

        return {isOk: true, ...user._doc}
    }
}
