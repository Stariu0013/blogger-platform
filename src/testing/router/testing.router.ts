import {Router, Request, Response} from "express";
import {APP_ROUTES} from "../../core/routes";
import TestingRepository from "../repositories/testing.repository";
import {HttpStatuses} from "../../core/types/http-statuses";

const testingRouter = Router({});

testingRouter.delete(`/all-data`, (req: Request, res: Response) => {
    TestingRepository.deleteAllData();

    res.sendStatus(HttpStatuses.NO_CONTENT);
})

export default testingRouter;