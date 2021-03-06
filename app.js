
module.exports=function(){
	var express=require('express'),
		app=express(),
		path=require('path'),
		db=require('./db'),
		dust = require('dustjs-linkedin'),
		cons = require('consolidate'),
		session = require('express-session'),
		bodyParser = require('body-parser'),
		//csrf=require('csurf'),
		myauth=require('./myauth'),
		routes=require('./routes');

		models=require('./schemas');
		formidable = require('formidable');
		bcrypt = require('bcryptjs');
		//multer = require('multer');

	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.engine('dust', cons.dust);
	app.set('view engine', 'dust');
	app.use(express.static(path.join(__dirname, 'public')));
	app.use(bodyParser.json()).use(bodyParser.urlencoded({ extended: true, defer: true }));
	app.set('view options', { pretty: true });

	app.use(session({
	    cookieName: 'session',
	    secret: '987123546@gmail.com',
	    duration: 30 * 60 * 1000,
	    activeDuration: 5 * 60 * 1000,
	    resave: true,
  		saveUninitialized: true,
  		httpOnly: true, //dont let browser javascript access cookies ever
  		secure: true, //only use cookies over https
  		ephemeral: true //delete this cookie when the browser is closed 
  	}));

	/*var storage = multer.diskStorage({
	  destination: function (request, file, callback) {
	    callback(null, 'public/photos');
	  },
	  filename: function (request, file, callback) {
	    console.log(file);
	    callback(null, file.originalname)
	  }
	});

	upload = multer({storage: storage}).single('file');*/

	//app.use(csrf());
	
	app.use(myauth.isUserExist);
	//app.use(myauth.csrfAuthentication);
	
	/*login routs*/
	app.get('/', routes.login);
	app.post('/', routes.authenticate);

	/*dashboard routs*/
	app.get('/dashboard', myauth.requreLogin, routes.dashboard);
	
	/*register user routs*/
	app.get('/register', myauth.requreLogin, routes.registerUser);
	app.post('/register', myauth.requreLogin, routes.saveUserData);

	/*register student routs*/
	app.get('/register-student', myauth.requreLogin, routes.registerStudent);
	app.post('/register-student', myauth.requreLogin, routes.saveStudent);
	
	/*receive payments*/
	app.get('/payments', myauth.requreLogin, routes.getPayments);
	app.post('/payments', myauth.requreLogin, routes.receivePayments);
	
	app.get('/getSubjects', myauth.requreLogin, routes.getSubjects);
	
	/*get Student*/
	app.get('/student', myauth.requreLogin, routes.getStudent);
	app.get('/studentKeyList', myauth.requreLogin, routes.getStudentKeyList);
	app.get('/generateBill', myauth.requreLogin, routes.generateBill);
	
	//app.get('/updateBills', myauth.requreLogin, routes.updateBills);

	app.get('/search', myauth.requreLogin, routes.search);
	
	app.get('/register-test', myauth.requreLogin, routes.resisterTest);
	app.post('/register-test', myauth.requreLogin, routes.updateTest);
	
	app.get('/addStream', myauth.requreLogin, routes.addStream);
	app.post('/addStream', myauth.requreLogin, routes.saveStream);

	app.get('/collection-report', myauth.requreLogin, routes.getCollectionReport);
	app.post('/collection-report', myauth.requreLogin, routes.showCollectionReport);
	
	app.get('/exam-report', myauth.requreLogin, routes.getExamReport);
	app.post('/exam-report', myauth.requreLogin, routes.postExamReport);
	
	app.get('/pay-report', myauth.requreLogin, routes.getPayReport);
	app.post('/pay-report', myauth.requreLogin, routes.postPayReport);


	/*logout routs*/
	app.get('/logout', routes.logout);

	return app;
}