"use client";

import {
  DecodedMessage,
  LightNode,
  createDecoder,
  createEncoder,
  createLightNode,
  waitForRemotePeer,
} from "@waku/sdk";

const contentTopic = "/newsletter/0";

import protobuf from "protobufjs";

export interface IPollMessage {
  authorName: string;
  timestamp: number;
  article: string;
}

export interface ILikeMessage{
    authorName:string;
    like:number[];
}

export const  PPollMessage = new protobuf.Type("PPollMessage") //PPollMessage
  .add(new protobuf.Field("authorName", 1, "string"))
  .add(new protobuf.Field("timestamp", 2, "uint64"))
  .add(new protobuf.Field("article", 3, "string"))
  
export const Like = new protobuf.Type("like")
.add(new protobuf.Field("author",1, "string"))
.add(new protobuf.Field("like",2, "uint64"))

const encoder = createEncoder({ contentTopic });
const decoder = createDecoder(contentTopic);


export const createNode = async () => {
  const waku = await createLightNode({ defaultBootstrap: true });
  await waitForRemotePeer(waku);
  return waku;
};

export const receiveVotes = async (
  waku: LightNode,
  callback: (pollMessage: IPollMessage) => void,
) => {
  const _callback = (wakuMessage: DecodedMessage): void => {
    if (!wakuMessage.payload) return;
    const pollMessageObj = PPollMessage.decode(wakuMessage.payload);
    const pollMessage = pollMessageObj.toJSON() as IPollMessage;
    callback(pollMessage);
  };

  const unsubscribe = await waku.filter.subscribe([decoder], _callback);
  return unsubscribe;
};

export const sendVote = async (waku: LightNode, pollMessage: IPollMessage) => {
  const protoMessage = PPollMessage.create({
    authorname: pollMessage.authorName,
    timestamp: pollMessage.timestamp,
    article: pollMessage.article,
  });

  // Serialise the message using Protobuf
  const serialisedMessage = PPollMessage.encode(protoMessage).finish();

  // Send the message using Light Push
  await waku.lightPush.send(encoder, {
    payload: serialisedMessage,
  });
};

export const retrieveExistingVotes = async (
  waku: LightNode,
  callback: (pollMessage: IPollMessage) => void,
) => {
  const _callback = (wakuMessage: DecodedMessage): void => {
    if (!wakuMessage.payload) return;
    const pollMessageObj = PPollMessage.decode(wakuMessage.payload);
    const pollMessage = pollMessageObj.toJSON() as IPollMessage;
    callback(pollMessage);
  };

  // Query the Store peer
  await waku.store.queryWithOrderedCallback([decoder], _callback);
};