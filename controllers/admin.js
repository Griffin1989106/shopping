const { validationResult } = require('express-validator');

const Product = require('../models/product');
const { fetchAllProducts, forwardError, deleteFile } = require('../utils');

const renderProductForm = (
  res,
  status = 200,
  product = {},
  errorMessage = null,
  validationErrors = [],
  title = 'Add Product',
  path = '/admin/add-product',
  editing = false
) => {
  return res.status(status).render('admin/edit-product', {
    title,
    path,
    editing,
    product,
    errorMessage,
    validationErrors
  });
};

const renderProductFormError = (
  req,
  res,
  errorMessage,
  validationErrors = []) => {
  return renderProductForm(
    res,
    422,
    {
      title: req.body.title,
      price: +req.body.price,
      description: req.body.description
    },
    errorMessage,
    validationErrors
  );
};

const renderEditProductForm = (
  res,
  product,
  status = 200,
  errorMessage = null,
  validationErrors = []
) => {
  return renderProductForm(
    res,
    status,
    product,
    errorMessage,
    validationErrors,
    'Edit Product',
    '/admin/edit-product',
    true
  );
};

exports.getAddProduct = (req, res, next) => {
  renderProductForm(res);
};

exports.postAddProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return renderProductFormError(
      req,
      res,
      errors.array()[0].msg,
      errors.array()
    );
  }

  if (!req.file) {
    return renderProductFormError(req, res, 'Attached file is not an image.');
  }

  const product = new Product({
    title: req.body.title,
    price: +req.body.price,
    imageUrl: req.file.path,
    description: req.body.description,
    userId: req.user
  });
  product
    .save()
    .then(() => res.redirect('/products'))
    .catch(err => forwardError(err, next));
};

exports.getProducts = (req, res, next) => {
  fetchAllProducts(
    'admin/products',
    'Admin Products',
    '/admin/products',
    req,
    res,
    next,
    { userId: req.user._id }
  );
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/admin/products');
  }
  Product.findById(req.params.productId)
    .then((product) => {
      if (!product) {
        return res.redirect('/admin/products');
      }
      renderEditProductForm(res, product);
    })
    .catch(err => forwardError(err, next));
};

exports.postEditProduct = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return renderEditProductForm(
      res,
      {
        title: req.body.title,
        price: +req.body.price,
        description: req.body.description,
        _id: req.body.id
      },
      422,
      errors.array()[0].msg,
      errors.array()
    );
  }

  Product.findById(req.body.id)
    .then((product) => {
      // Protect the edit by another user
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      product.title = req.body.title;
      product.price = +req.body.price;
      product.description = req.body.description;
      if (req.file) {
        deleteFile(product.imageUrl);
        product.imageUrl = req.file.path;
      }
      return product.save()
        .then(() => res.redirect('/admin/products'));
    })
    .catch(err => forwardError(err, next));
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.id
  Product.findById(productId)
    .then(product => {
      if (!product) {
        return forwardError('No Product for id = ' + productId);
      }
      deleteFile(product.imageUrl);
      return Product.deleteOne({ _id: productId, userId: req.user._id });
    })
    .then(() => res.status(200).json({
      message: 'Success!'
    }))
    .catch(err => res.status(500).json({
      message: 'Deleting product failed!'
    }));
};
