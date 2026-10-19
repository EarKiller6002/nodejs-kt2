const Joi = require('joi');

module.exports = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params
      },
      { abortEarly: false, stripUnknown: true }
    );

    if (error) {
      const details = error.details.map((err) => ({
        message: err.message,
        path: err.path.slice(1)
      }));
      return res.status(400).json({ details });
    }

    req.body = value.body;
    req.query = value.query;
    req.params = value.params;
    next();
  };
};
