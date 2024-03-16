const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/acme_store_db');
const uuid = require('uuid');
const bcrypt = require('bcrypt');

async function createTables() {
  const SQL = `
    DROP TABLE IF EXISTS favorites;
    DROP TABLE IF EXISTS users;
    DROP TABLE IF EXISTS products;

    CREATE TABLE users(
      id UUID PRIMARY KEY,
      username VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(100) NOT NULL
    );

    CREATE TABLE products(
      id UUID PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL
    );

    CREATE TABLE favorites(
      id UUID PRIMARY KEY,
      product_id UUID REFERENCES products(id) NOT NULL,
      user_id UUID REFERENCES users(id) NOT NULL,
      CONSTRAINT user_product UNIQUE (product_id, user_id)
    );
  `;
  await client.query(SQL);
}; 

async function createUser(username, password) {
  const SQL = `
    INSERT INTO users(id, username, password)
    VALUES($1, $2, $3)
    RETURNING *;
  `;
  const hash = await bcrypt.hash(password, 5);
  const response = await client.query(SQL, [uuid.v4(), username, hash]);
  return response.rows[0];
};

async function createProduct(name) {
  const SQL = `
    INSERT INTO products(id, name)
    VALUES($1, $2)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), name]);
  return response.rows[0];
};

async function createFavorite(user_id, product_id) {
  const SQL = `
    INSERT INTO favorites(id, user_id, product_id)
    VALUES($1, $2, $3)
    RETURNING *;
  `;
  const response = await client.query(SQL, [uuid.v4(), user_id, product_id]);
  return response.rows[0];
};

async function fetchUsers() {
  const SQL = `
    SELECT id, username FROM users;
  `;
  const response = await client.query(SQL);
  return response.rows;
};

async function fetchProducts() {
  const SQL = `
    SELECT * from products;
  `;
  const response = await client.query(SQL);
  return response.rows;
}

async function fetchFavorites(id) {
  const SQL = ` 
    SELECT * FROM favorites
    WHERE user_id = $1;
  `;
  const response = await client.query(SQL, [id]);
  return response.rows;
};

async function destroyFavorite(user_id, id) {
  const SQL = `
    DELETE FROM favorites
    WHERE user_id = $1 AND id = $2;
  `;
  await client.query(SQL, [user_id, id]);
};

module.exports = {
  client,
  createTables,
  createUser,
  createProduct,
  createFavorite,
  fetchUsers,
  fetchProducts,
  fetchFavorites,
  destroyFavorite
};