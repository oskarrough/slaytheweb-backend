import * as sdk from "matrix-js-sdk";

const client = sdk.createClient({ baseUrl: "https://matrix.org" });
client.publicRooms(function (err, data) {
    console.log("Public Rooms: %s", JSON.stringify(data));
});

await client.startClient({ initialSyncLimit: 10 });

const content = {
    body: "message text",
    msgtype: "m.text",
};
client.sendEvent("roomId", "m.room.message", content, "", (err, res) => {
    console.log(err);
});
