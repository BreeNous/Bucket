const withAuth = (req, res, next) => {
  console.log("🔑 Checking session in withAuth middleware:", req.session);

  // If the user is not logged in, redirect to the landing
  if (!req.session.logged_in) {
    console.log("❌ User not logged in. Redirecting to '/'");
    return res.redirect('/');
  }
  
  console.log("✅ User is authenticated! Proceeding...");
  next();
};

module.exports = withAuth;
