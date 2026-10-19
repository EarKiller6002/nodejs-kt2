const express = require('express');
const router = express.Router();
const Joi = require('joi');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');

let products = [
  {
    id: 1,
    name: 'Смартфон',
    price: 50000,
    category: 'electronics',
    stock: 10,
    description: 'Флагманский смартфон',
    imageUrl: null,
    createdAt: new Date().toISOString()
  }
];
let currentId = 1;

const categories = ['electronics', 'clothing', 'food', 'other'];

const productBodySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  price: Joi.number().greater(0).required(),
  category: Joi.string().valid(...categories).required(),
  stock: Joi.number().integer().min(0).default(0),
  description: Joi.string().max(500).optional()
});

const productPatchSchema = Joi.object({
  name: Joi.string().min(2).max(100).optional(),
  price: Joi.number().greater(0).optional(),
  category: Joi.string().valid(...categories).optional(),
  stock: Joi.number().integer().min(0).optional(),
  description: Joi.string().max(500).optional()
}).min(1);

const idParamSchema = Joi.object({
  id: Joi.number().integer().required()
});

const querySchema = Joi.object({
  category: Joi.string().valid(...categories).optional(),
  minPrice: Joi.number().greater(0).optional(),
  maxPrice: Joi.number().greater(0).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

router.get('/', validate(Joi.object({ query: querySchema })), (req, res) => {
  const { category, minPrice, maxPrice, page, limit } = req.query;

  let filtered = [...products];

  if (category) {
    filtered = filtered.filter(p => p.category === category);
  }
  if (minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= minPrice);
  }
  if (maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }

  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedData = filtered.slice(startIndex, endIndex);

  res.json({
    data: paginatedData,
    total,
    page,
    limit
  });
});

router.get('/:id', validate(Joi.object({ params: idParamSchema })), (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Товар не найден' });
  }
  res.json(product);
});

router.post('/', validate(Joi.object({ body: productBodySchema })), (req, res) => {
  currentId += 1;
  const newProduct = {
    id: currentId,
    ...req.body,
    imageUrl: null,
    createdAt: new Date().toISOString()
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', validate(Joi.object({ params: idParamSchema, body: productBodySchema })), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  products[index] = {
    ...products[index],
    ...req.body
  };

  res.json(products[index]);
});

router.patch('/:id', validate(Joi.object({ params: idParamSchema, body: productPatchSchema })), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  products[index] = {
    ...products[index],
    ...req.body
  };

  res.json(products[index]);
});

router.delete('/:id', validate(Joi.object({ params: idParamSchema })), (req, res) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Товар не найден' });
  }

  const deletedProduct = products.splice(index, 1);
  res.json({ message: 'Товар успешно удален', product: deletedProduct[0] });
});

router.post('/:id/image', 
  validate(Joi.object({ params: idParamSchema })), 
  upload.single('image'), 
  (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    if (!product) {

      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Товар не найден' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Пожалуйста, отправьте файл в поле "image"' });
    }

    product.imageUrl = `/uploads/products/${req.file.filename}`;

    res.json({
      message: 'Изображение успешно загружено',
      product
    });
    
    console.log("Изображение загружено")
});

module.exports = router;
