import {Router, Request, Response} from "express";
import {APP_ROUTES} from "../../core/routes";
import TestingRepository from "../repositories/testing.repository";
import {HttpStatuses} from "../../core/types/http-statuses";

const testingRouter = Router({});

testingRouter.delete(`/all-data`, async (req: Request, res: Response) => {
    await TestingRepository.deleteAllData();

    res.sendStatus(HttpStatuses.NO_CONTENT);
})

export default testingRouter;