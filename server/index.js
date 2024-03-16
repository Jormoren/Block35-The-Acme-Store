const {
    client,
    createTables,
    createUser,
    createProduct,
    createFavorite,
    fetchUsers,
    fetchProducts, 
    fetchFavorites,
    destroyFavorite
  } = require('./db');
  
  const express = require('express');
  const app = express();
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Something went wrong!');
  });
  
  app.get('/api/users', async (req, res, next) => {
    try {
      res.send(await fetchUsers());
    } catch(err) {
      next(err);
    }
  });
  
  app.get('/api/products', async (req, res, next) => {
    try {
      res.send(await fetchProducts());
    } catch(err) {
      next(err);
    }
  });
  
  app.get('/api/users/:id/favorites', async (req, res, next) => {
    try {
      res.send(await fetchFavorites(req.params.id));
    } catch(err) {
      next(err);
    }
  });
  
  app.post('/api/users/:userId/favorites/:productId', async (req, res, next) => {
    try {
      res.status(201).send(await createFavorite(
        req.params.userId, req.params.productId
      ));
    } catch(err) {
      next(err);
    }
  });
  
  app.delete('/api/users/:userId/favorites/:id', async (req, res, next) => {
    try {
      await destroyFavorite(req.params.userId , req.params.id);
      res.sendStatus(204);
    } catch(err) {
      next(err);
    }
  });
  
  const init = async () => {
    try {
      await client.connect();
      console.log('Connected to the database');
      await createTables();
      console.log('Tables created');
    
      const [George, Arturo, Juan, computer, calculator, smartwatch, videocamera] = await Promise.all([
        createUser('George', 'fry1potato'),
        createUser('Arturo', 'angel!39!'),
        createUser('Juan', 'J0r3k!'),
        createProduct('computer'),
        createProduct('calculator'),
        createProduct('smartwatch'),
        createProduct('videocamera')
      ]);
      
      console.log('Users:', await fetchUsers());
      console.log('Products:', await fetchProducts());
  
      const favorites = await Promise.all([
        createFavorite(George.id, computer.id),
        createFavorite(Arturo.id, calculator.id),
        createFavorite(Juan.id, computer.id),
        createFavorite(George.id, smartwatch.id),
        createFavorite(George.id, videocamera.id),
        createFavorite(Juan.id, smartwatch.id)
      ]);
  
      console.log('Favorites of Harry:', await fetchFavorites(George.id));
      console.log('Listening on port 3000');
      
      const PORT = process.env.PORT || 3000;
      app.listen(PORT);
    } catch (err) {
      console.error('Error during initialization:', err);
    }
  };
  
  init();
  