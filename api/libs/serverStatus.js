"use strict";

import mcProto from "mcproto";
const { Client, PacketWriter, State } = mcProto;

export async function getBukkitExtra() {
    try {
        const host = "play.oc.tc", port = 25565;
        const client = await Client.connect(host, port);
        client.send(new PacketWriter(0x0).writeVarInt(404)
            .writeString(host).writeUInt16(port)
            .writeVarInt(State.Status));
        client.send(new PacketWriter(0x0));

        const response = await client.nextPacket(0x0);

        client.end();

        const bukkitExtra = response.readJSON().bukkit_extra;
        return (bukkitExtra);
    } catch (error) {
        throw (error);
    }
}

export async function getCurrentMatchInfo() {
    try {
        const bukkitExtra = await getBukkitExtra();
        const matchID = Object.keys(bukkitExtra.pgm)[0]
        return (bukkitExtra.pgm[matchID]);
    } catch (error) {
        throw ({
            status: "error",
            errorMessage: "Error while retrieving the server list ping."
        });
    }
}