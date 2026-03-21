import {Request, Response, NextFunction} from 'express'
import {rateLimitCollection} from '../db/mongo.db'
import {HttpStatuses} from '../types/http-statuses'

const WINDOW_MS = 10 * 1000
const MAX_REQUESTS = 5

export const ipRateLimitMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const ip = req.ip
        const url = req.path
        const now = new Date()
        const windowStart = new Date(now.getTime() - WINDOW_MS)

        const count = await rateLimitCollection.countDocuments({
            ip,
            url,
            date: {$gte: windowStart},
        })

        if (count >= MAX_REQUESTS) {
            res.sendStatus(HttpStatuses.TOO_MANY_REQUESTS)
            return
        }

        await rateLimitCollection.insertOne({ip, url, date: now})

        next()
    } catch (e) {
        res.sendStatus(HttpStatuses.INTERNAL_SERVER_ERROR)
    }
}
