const isAuth = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/signin");
  }
};
const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.redirect("/");
  }
};
export {isAuth,isAdmin};
