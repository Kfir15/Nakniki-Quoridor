import { Request, Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';
const AuthRepository = require('../repositories/AuthRepository');
import { uploadAvatarToSupabase } from '../utils/storageHelper';

const AuthController = {
    async signUp(req: Request, res: Response) {
        try {
            // get the user info
            const { email, password, username } = req.body;
            let avatar_url = req.body.avatar_url || null;

            // user must insert email and password and username
            if (!email || !password || !username) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: "Email, password, and username are required."
                });
            }

            // if avatar was uploaded, upload to storage
            if (req.file) {
                avatar_url = await uploadAvatarToSupabase(req.file);
            }

            // create the user and return
            const data = await AuthRepository.signUp(email, password, username, avatar_url);
            return res.status(StatusCodes.CREATED).json({
                message: "User registered successfully!",
                user: data.user,
                session: data.session
            });
        } catch (error: any) {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: error.message });
        }
    },

    async signIn(req: Request, res: Response) {
        try {
            // get the email and password
            const { email, password } = req.body;

            // user must insert them both
            if (!email || !password) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    error: "Email and password are required."
                });
            }

            // get the data and return
            const data = await AuthRepository.signIn(email, password);
            return res.status(StatusCodes.OK).json({
                message: "Login successful",
                access_token: data.session?.access_token,
                refresh_token: data.session?.refresh_token,
                user: data.user
            });
        } catch (error: any) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                error: "Invalid email or password."
            });
        }
    },
}

module.exports = AuthController