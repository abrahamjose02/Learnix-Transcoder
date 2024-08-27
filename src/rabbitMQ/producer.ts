import { Channel } from "amqplib";
import { v4 as uuidv4 } from "uuid";
import rabbiMQConfig from "../config/rabbitMQ.config";
import EventEmitter from "events";

export default class Producer{
    constructor(private channel:Channel,private replyQueueName:string,private eventEmitter:EventEmitter){}

    async produceMessages(data:any,operation:string){
        const uuid = uuidv4();
        this.channel.sendToQueue(rabbiMQConfig.rabbitMQ.queues.authQueue,Buffer.from(JSON.stringify(data)),{
            replyTo:this.replyQueueName,
            correlationId:uuid,
            expiration:10,
            headers:{function:operation}
        });

        return new Promise((resolve,reject)=>{
            this.eventEmitter.once(uuid,async(data)=>{
                resolve(data);
            })
        })
    }

}