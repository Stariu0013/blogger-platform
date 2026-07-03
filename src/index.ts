import 'reflect-metadata'
import express, { NextFunction, Request, Response } from 'express'
import { setupApp } from './setupApp'
import { Settings } from './core/settings/settings'
import { runDB } from './core/db/mongo.db'

const app = express()

app.set('trust proxy', true)

let dbConnection: Promise<void> | null = null

app.use((req: Request, res: Response, next: NextFunction) => {
    if (!dbConnection) {
        dbConnection = runDB(Settings.MONGO_URL)
    }
    dbConnection.then(() => next()).catch(next)
})

setupApp(app)

if (!process.env.VERCEL) {
    app.listen(Settings.PORT, () => {
        console.log(`Example app listening on port ${Settings.PORT}`)
    })
}

export default app
