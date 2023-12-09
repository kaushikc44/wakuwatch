"use client"
import { createLightNode } from "@waku/sdk";
import { waitForRemotePeer,Protocols,createEncoder,createDecoder  } from "@waku/sdk";
import protobuf from "protobufjs";

// Create and start a Light Node
const setupnode = async () => {
    const node = await createLightNode({ defaultBootstrap: true });
    console.log("node created")
    await node.start();
    await waitForRemotePeer(node,[
        Protocols.LightPush,
        Protocols.Filter
    ]);
    console.log("node connected")

    const contentTopic = "/light-guide/1/message/proto";
    const encoder = createEncoder({ contentTopic });
    const decoder = createDecoder(contentTopic);
    
    const ChatMessage = new protobuf.Type("ChatMessage")
    .add(new protobuf.Field("timestamp", 1, "uint64"))
    .add(new protobuf.Field("sender", 2, "string"))
    .add(new protobuf.Field("message", 3, "string"));

    const callback = (wakuMessage:any) => {
        // Check if there is a payload on the message
        if (!wakuMessage.payload) return;
        // Render the messageObj as desired in your application
        const messageObj = ChatMessage.decode(wakuMessage.payload);
        console.log("The message object is",messageObj);
    };
    
    // Create a filter subscription
    const subscription = await node.filter.createSubscription();
    
    // Subscribe to content topics and process new messages
    await subscription.subscribe([decoder], callback);
    
    console.log("Message has been recieved")

    const protoMessage = ChatMessage.create({
        timestamp: Date.now(),
        sender: "Alice",
        message: "Hello, World!",
    });


    console.log("The message has been created!")

    const serialisedMessage = ChatMessage.encode(protoMessage).finish();

// Send the message using Light Push
    await node.lightPush.send(encoder, {
        payload: serialisedMessage,
    });

    



}


export default function Home(){
    return (
        <>
        <button onClick={setupnode}>Click me</button>
        </>
    )
}