const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    title: 'Add Product',
    path: '/admin/add-product',
  });
};

exports.getProducts = (req, res, next) => {
  res.render('admin/products', {
    title: 'Products',
    path: '/admin/products',
  });
};

exports.postAddProduct = (req, res, next) => {
  const product = new Product(req.body.title);
  product.save();
  res.redirect('/');
};

exports.getIndex = (req, res, next) => {
  res.render('shop/index', {
    title: 'Index',
    path: '/',
  });
};

exports.getProductList = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      products,
      title: 'Product List',
      path: '/products',
    });
  });
};

exports.getCart = (req, res, next) => {
  res.render('shop/cart', {
    title: 'Cart',
    path: '/cart',
  });
};

exports.getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    title: 'Checkout',
    path: '/checkout',
  });
};
