const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello, Docker World! Version 1.0.7');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
