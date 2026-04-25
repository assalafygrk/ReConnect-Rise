const Settings = require('../models/Settings');

const getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  res.json(settings);
};

const updateSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings(req.body);
  } else {
    Object.assign(settings, req.body);
  }
  const updatedSettings = await settings.save();
  res.json(updatedSettings);
};

module.exports = { getSettings, updateSettings };
