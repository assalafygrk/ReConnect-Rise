const PageConfig = require('../models/PageConfig');

const getAllConfigs = async (req, res) => {
  const configs = await PageConfig.find({});
  const configMap = {};
  configs.forEach(c => {
    configMap[c.pageId] = c.config;
  });
  res.json(configMap);
};

const setPageConfig = async (req, res) => {
  const { pageId, config } = req.body;
  let pageConfig = await PageConfig.findOne({ pageId });
  if (pageConfig) {
    pageConfig.config = { ...pageConfig.config, ...config };
    await pageConfig.save();
  } else {
    pageConfig = await PageConfig.create({ pageId, config });
  }
  res.json(pageConfig);
};

module.exports = { getAllConfigs, setPageConfig };
