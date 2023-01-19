exports.getNotFoundPage = (req, res) => {
  // res.status(404).send('<h1>Page not found</h1>');
  // res.status(404).sendFile(path.join(__dirname, 'views', 'not-found.html'));
  res
    .status(404)
    .render('not-found', { pageTitle: 'Page Not Found', path: '' });
};
