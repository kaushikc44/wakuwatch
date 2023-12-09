"use client"
import React from 'react';
import { createNode, receiveVotes, PPollMessage } from "../waku";
import { createDecoder } from '@waku/sdk';
import protobuf from "protobufjs";

import { useState } from 'react';
export interface IPollMessage {
  authorName: string;
  timestamp: number;
  article: string;
}

export default function Read() {
  const [newsArray,setnewsArray] = useState([]);
  
  const recieverValue = async () => {
    const contentTopic = "/newsletter/0";
    const decorder = createDecoder(contentTopic);
    const node = await createNode()

    console.log("The node has been created",node)
    console.log("Creating the article");

    const PollMessage = new protobuf.Type("PPollMessage") //PPollMessage
    .add(new protobuf.Field("authorName", 1, "string"))
    .add(new protobuf.Field("timestamp", 2, "uint64"))
    .add(new protobuf.Field("article", 3, "string"))

    const storeQuery = node.store.queryGenerator([decorder]);

// Process the messages
    for await (const messagesPromises of storeQuery) {
        // Fulfil the messages promises
        const messages = await Promise.all(messagesPromises
            .map(async (p) => {
                const msg = await p;
                console.log("Message value",msg);
                if(!msg?.payload ) return;
                const messageObj = PollMessage.decode(msg?.payload)
                // Render the message/payload in your application
                console.log("The message object is: " + messageObj.toJSON());
            })
        )
    }
  


    const callback = (wakuMessage:any) => {
        // Check if there is a payload on the message
        if (!wakuMessage.payload) return;
        // Render the messageObj as desired in your application
        const messageObj = PollMessage.decode(wakuMessage.payload);
        console.log("The message object is",messageObj);
    };

    
    
    const subscription = await node.filter.createSubscription();
    
    // Subscribe to content topics and process new messages
    await subscription.subscribe([decorder], callback);
    
    console.log("Message has been recieved")
  }
  return (
    <>
      <button onClick={recieverValue}>Click me!</button>
    </>
  );
}
