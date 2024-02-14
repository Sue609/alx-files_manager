const { createClient } = require('redis');
const { promisify } = require('util');

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.getAsync = promisify(this.client.get).bind(this.client);
    this.client.setAsync = promisify(this.client.set).bind(this.client);
    this.client.delAsync = promisify(this.client.del).bind(this.client);

    this.client.on('error', (error) => console.error('Redis error:', error));

    this.connected = false;
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    try {
      return await this.client.getAsync(key);
    } catch (error) {
      console.error('Error getting value from Redis:', error);
      throw error;
    }
  }

  async set(key, value, duration) {
    try {
      return await this.client.setAsync(key, value, 'EX', duration);
    } catch (error) {
      console.error('Error setting value in Redis:', error);
      throw error;
    }
  }

  async del(key) {
    try {
      return await this.client.delAsync(key);
    } catch (error) {
      console.error('Error deleting value from Redis:', error);
      throw error;
    }
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
