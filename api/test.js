module.exports = (req, res) => {
  res.json({ message: "API is working", path: req.url });
};
