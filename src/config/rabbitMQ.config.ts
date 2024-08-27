import "dotenv/config";

export default {
  rabbitMQ: {
    url: String(process.env.RabbitMQ_link),
    queues: {
      authQueue: "auth_queue",
    },
  },
};