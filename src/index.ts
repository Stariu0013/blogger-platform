import express from "express";
import {setupApp} from "./setupApp";
import {Settings} from "./core/settings/settings";
import { runDB } from "./core/db/mongo.db";

async function bootstrap() {
    const app = express();
    const PORT = Settings.PORT;

    setupApp(app);
    await runDB(Settings.MONGO_URL);

    app.listen(PORT, () => {
        console.log(`Example app listening on port ${PORT}`);
    });
    return app;
}

bootstrap()