import express, {Express, Request, Response} from "express";
import {APP_ROUTES} from "./core/routes";
import testingRouter from "./testing/router/testing.router";
import blogsRouter from "./blogs/router";
import postsRouter from "./posts/router";
import usersRouter from "./users/router";
import {authRouter} from "./auth/router";
import {commentRouter} from "./comments/router";
import cookieParser from 'cookie-parser';

export const setupApp = (app: Express) => {
    app.use(express.json());
    app.use(cookieParser());

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World');
    });

    app.use(APP_ROUTES.TESTING, testingRouter);
    app.use(APP_ROUTES.BLOGS, blogsRouter);
    app.use(APP_ROUTES.POSTS, postsRouter);
    app.use(APP_ROUTES.USERS, usersRouter);
    app.use(APP_ROUTES.LOGIN, authRouter);
    app.use(APP_ROUTES.COMMENTS, commentRouter);

    return app;
}