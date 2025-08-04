import express from 'express';
const app = express();
const port = process.env.PORT || 5001;
app.get('/api', (req, res) => {
  res.json({ message: 'Hello from server!' });
});
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
