var myauth={};

myauth.isUserExist= function(req, res, next){
	if(req.session && req.session.user){
		models.User.findOne({ username: req.session.user.username }, function(err, user) {
			if (user) {
				req.user= user.toObject();
				delete req.user.password;
				req.session.user= req.user;
				res.locals.user=req.user;
		    } 
		    next();
		});
	}else{
		next();
	}
}

myauth.requreLogin=function (req, res, next) {
  if (!req.user) {
    res.redirect('/');
  } else {
    next();
  }
}
/*myauth.csrfAuthentication=function (err, req, res, next) {
  if (err.code !== 'EBADCSRFTOKEN') {
  	console.log("csrf error");
  	return next(err);
  }

  // handle CSRF token errors here
  var url=req.url;
  res.locals.csrfError="Form has been tampered..:(";
  console.log(res.locals.csrfError);
  console.log(url);
  console.log(err);
  res.redirect(url);
}
*/
module.exports=myauth;