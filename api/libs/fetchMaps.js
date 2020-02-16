"use strict";

import got from 'got';
import Keyv from '@keyv/redis';

const redis = new Keyv("redis://user:" + process.env.REDIS_PASSWORD + "@" + process.env.REDIS_HOST + ":" + process.env.REDIS_PORT);

export default async function fetchMaps() {
    const response = await got('https://api.github.com/repos/OvercastCommunity/maps/git/trees/HEAD', {
        resolveBodyOnly: true,
        responseType: "json",
        cache: redis
    });
    response.maps = response.tree;
    let { sha, url, truncated, tree, ...mapsList } = response;
    mapsList.maps = mapsList.maps
        .filter(map => map.type === "tree")
        .map(({ mode, type, sha, url, ...keepAttrs }) => ({ "name": keepAttrs.path }))
        .filter(map => !map.name.startsWith("."));
    mapsList.maps.forEach((o, i) => o.id = (i + 1) - 1);
    return (mapsList);
}