const amqp = require('amqplib');

let connection;
let channel;

async function connect() {
  if (connection) return channel;
  const url = process.env.AMQP_URL || 'amqp://localhost';
  connection = await amqp.connect(url);
  channel = await connection.createChannel();
  return channel;
}

async function publish(queue, msg) {
  const ch = await connect();
  await ch.assertQueue(queue, { durable: true });
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
}

async function consume(queue, onMessage) {
  const ch = await connect();
  await ch.assertQueue(queue, { durable: true });
  ch.consume(queue, async (msg) => {
    if (msg !== null) {
      try {
        const content = JSON.parse(msg.content.toString());
        await onMessage(content);
        ch.ack(msg);
      } catch (err) {
        console.error('Queue message handling failed:', err);
        ch.nack(msg, false, false);
      }
    }
  });
}

module.exports = { publish, consume };
