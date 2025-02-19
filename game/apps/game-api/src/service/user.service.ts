import { UserModel } from "@packages/game-db";

export const createUser = async (email: string, username: string, password: string) => {
    const user = new UserModel({
        email, username, password
    })

    return await user.save();
}
