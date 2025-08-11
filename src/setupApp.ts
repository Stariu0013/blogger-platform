import express, {Express, Request, Response} from "express";
import {APP_ROUTES} from "./core/routes";
import testingRouter from "./testing/router/testing.router";
import blogsRouter from "./blogs/router";
import postsRouter from "./posts/router";

export const setupApp = (app: Express) => {
    app.use(express.json());

    const PORT = process.env.PORT || 3000;

    app.get('/', (req: Request, res: Response) => {
        res.send('Hello World');
    });

    app.use(APP_ROUTES.TESTING, testingRouter);
    app.use(APP_ROUTES.BLOGS, blogsRouter);
    app.use(APP_ROUTES.POSTS, postsRouter);

    return app;
}