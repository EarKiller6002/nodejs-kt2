module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Размер файла не должен превышать 2 МБ' });
  }

  if (err.message === 'Разрешены только изображения форматов JPEG и PNG') {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
};
