"use strict";

import Koa from "koa";
import Router from "koa-router";
import cache from "koa-cache-lite";
import fetchMaps from "./libs/fetchMaps.js";
import cors from "@koa/cors";
import { getCurrentMatchInfo } from "./libs/serverStatus.js";

const app = new Koa();
const router = new Router({
    sensitive: true,
    strict: true
});
app.use(cors());

router.get("/", async (ctx, next) => {
    ctx.redirect('https://github.com/unixfox/OCCNotifier');
});

router.get("/v1/maps", async (ctx, next) => {
    ctx.body = await fetchMaps();
});

router.get("/v1/servers", async (ctx, next) => {

    try {
        const matchInfo = await getCurrentMatchInfo();
        const mapName = matchInfo.map.name;
        const participants = matchInfo.participants;
        const maxPlayers = matchInfo.max_players;
        const mapID = ((await fetchMaps()).maps
            .filter(map => map.name == mapName)
            .map(map => map.id))[0];

        ctx.body = {
            "status": "success",
            "servers": [
                {
                    "region": "US",
                    "map": {
                        "id": mapID,
                        "name": mapName
                    },
                    "name": "OCC",
                    "participants": participants,
                    "maxPlayers": maxPlayers,
                    "tags": matchInfo.map.tags
                }
            ]
        };
    } catch (error) {
        ctx.body = error;
    }
});

cache.configure(
    {
        "/v1/maps": false,
        "/v1/servers": 5000
    }
    , {
        external: {
            type: "redis",
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
            password: process.env.REDIS_PASSWORD
        },
        debug: (process.env.DEV || false),
    });

app.use(cache.middleware());
app.use(router.routes(), router.allowedMethods());

app.listen(process.env.PORT || 3000);
console.log("Server listening on port:", process.env.PORT || 3000);