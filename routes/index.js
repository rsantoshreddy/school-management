var controllers={};


/*login renderer*/
controllers.login=function(req, res){
	if (!req.user){
  		res.render('index', {/*csrfToken: req.csrfToken(),*/title:"Login"});
	}else{
		res.redirect('/dashboard');
	}
}

/*user page renderer after authentication*/
controllers.dashboard=function(req, res){
	models.Student.find(function(err, dbStudents) {
	    res.locals.students=dbStudents;	
		res.render('dashboard',{title:"Dashboard"});
    });
}

/*register user page renderer*/
controllers.registerUser=function(req, res){
	var msg=res.locals.successMsg;
	res.render('register-user', {/*csrfToken: req.csrfToken(),*/ msg:msg});
}

/*
register student page renderer
*/
controllers.registerStudent=function(req, res){
	res.locals.successMsg=req.session.successMsg;
	delete req.session.successMsg;
	res.render('register-student', {/*csrfToken: req.csrfToken(),*/ title:'Student registration'});
}

/*save student data from register page*/
controllers.saveStudent=function(req, res){
	var admissionDate=(new Date(req.body.admissionDate)) || (new Date());
    var Student=new models.Student({
    	name: req.body.sname,
    	parent_name: req.body.parentName,
    	academic_session: req.body.academicSession,
    	level: req.body.level,
    	stream: req.body.stream,
    	roll_number: req.body.rollNumber,
    	admission_date: admissionDate,
    	paymenet_mode: req.body.paymenetMode,
    	fees: req.body.fees,
    	neg_fees: req.body.negFees,
    	college_name: req.body.collegeName,
    	cell_no: req.body.cellNo,
    	pres_address: req.body.presAddress,
    	perm_address: req.body.permAddress,
    	photo: req.body.photo
    });

    Student.save(function(err){
		if(err){
			var error= 'Something went wrong! Pls try again.'
			if(err.code===11000){
				error= 'That roll number is already taken, try another';
			}
			res.render('register-student', {error: error});
		}else{
			req.session.successMsg="Succefull saved student data:";
			res.redirect('/register-student');
		}
	});

}

/*authentication required*/
controllers.authenticate=function(req, res){
	models.User.findOne({ username: req.body.username }, function(err, user) {
	    if (!user) {
	      res.render('index', { error: 'Incorrect email / password.'});
	    } else {
	    	if (bcrypt.compareSync(req.body.password, user.password)) {
	    		req.session.user=user; //set-cookie: session=falkjfdoikljhjkjleosdaklj
		        res.redirect('/dashboard');
	      } else {
	        res.render('index', { error: 'Incorrect email / password.'});
	      }
    	}
    });
}

/*save data from register page*/
controllers.saveUserData=function(req, res){
	var hash= bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
	var fullName= (req.body.firstname || '') + ' ' + (req.body.middlename || '') + ' ' + (req.body.lastname || '');
	var user= new models.User({
		username: req.body.username,
		password: hash,
		name: fullName,
		role: req.body.role
	});

	user.save(function(err){
		if(err){
			var error= 'Something went wrong! Pls try again.'
			if(err.code===11000){
				error= 'That email/username is already taken, try another';
			}
			res.render('register-user', {error: error});
		}else{
			res.redirect('/register');
		}
	});
}

/*get payments handler*/
controllers.getPayments=function(req, res){
		res.render('payments', {/*csrfToken: req.csrfToken(),*/title:'Payment form', months: models.MONTHS});
}

/*post payments handler*/
controllers.receivePayments=function(req, res){
	var data=req.body.data;
	var payment=new models.Bill({
		bill_number: data.billNumber,
		bill_amount: data.installmentFee,
		bill_date: data.paymentdate,
		for_month: data.formonth,
		received_by: req.user.name
	});
	
	console.log(typeof data.billNumber);
	console.log(typeof payment.bill_number);
	
	console.log(typeof data.installmentFee);
	console.log(typeof payment.bill_amount);

	//update({condition},{update},{options},callback)
	models.Student.update({roll_number: data.rollNumber},{$push:{payments: payment}},function(err, dbmodel){
		if(err){
			console.log("Update error");
			console.log(err);
		}else{
			console.log("Updated Succefully");
			console.log(dbmodel);
		}
		
		//Add name and roll number to update bill
		payment.payee_rollnumber= data.rollNumber;
		payment.payee_name= data.name;

		payment.save(function(err, dbBill){
			if(err){
				console.log("Bill Update error");
				console.log(err);
			}else{
				console.log("Bill Updated Succefully");
				console.log(dbBill);
			}
			res.send(dbBill);
		});
	});
}

/*get student handler*/
controllers.getStudent=function(req, res){
	models.Student.findOne({roll_number: req.query.rollNumber},function(err, dbStudent) {
		if(err){
			var dberror="Please enter correct Roll Number";
			res.send(dberror);	
		}
		res.send(dbStudent);	
	});
}

controllers.generateBill=function(req, res){
	models.Bill.find(function(err, bills){
		var billNumber="";

		/*Error*/
		if(err){
			var dberror="Failed to generate Bill Number";
			res.send(dberror);	
		}

		/*Generate Bill Number*/
		if(bills.length>0){
			bills.sort(function(a,b){
				return (a.bill_number - b.bill_number);
			});
			
			billNumber=bills[bills.length-1].bill_number + 1;
			res.send(billNumber.toString());
		}else{
			res.send("1");
		}
	});
}

controllers.search=function(req, res){
	//console.log("Search page");
	var query=req.query.candidate_rollnumber;
	models.Student.findOne({roll_number:query}, function(err, student){
		if(err){
			var error="Something went wrong. Please try again."
			res.render("dashboard", {title:"Dashboard", error: error});
		}
		if(!student){
			req.session.errorMsg="No student found with the queried Roll Number..:(";
			res.redirect("/dashboard");
		}else{
			res.locals.student=student;
			res.locals.paymentSummary=getPaymentSummary(student.payments);
			res.render("profile", {title:"Profile"});
		}
	});
}

controllers.resisterTest=function(req, res){
	res.render('exam',{title:"Exam details"});
}

controllers.getCollectionReport=function(req, res){
	res.render('collection',{title:"Collections"});
}

controllers.showCollectionReport=function(req, res){
	var fromDate=new Date(req.body.fromdate);
	var toDate=new Date(req.body.todate);

	models.Bill.find(function(err, bills){
		res.locals.report=getPaymentSummary(bills, fromDate, toDate);
		console.log(res.locals.report);
		res.render('collection',{title:"Collections"});
	});
}

/*logout handler*/
controllers.logout=function(req, res){
	if(req.session)
	 req.session.destroy();
	res.redirect('/');
}


/*General Functions*/
function getPaymentSummary(payments){
	var paymentSummary={
			total: 0,
			payments: []
		};
	var fromDate= arguments[1] || "";
	var toDate= arguments[2] || "";

	for(var i=0; i< payments.length; i++){
		var payment={};
			payment.bill_number=payments[i].bill_number;
			payment.bill_date=new Date(payments[i].bill_date).toDateString();
			payment.received_by=payments[i].received_by;
			payment.for_month=payments[i].for_month;
			payment.bill_amount=payments[i].bill_amount;
			if(payments[i].payee_name)
			payment.payee_name=payments[i].payee_name;

		if(!(fromDate || toDate)){
			paymentSummary.total+=parseInt(payments[i].bill_amount);
			paymentSummary.payments.push(payment);
		}else{
			var paymentdate=new Date(payment.bill_date).getTime();
			console.log(paymentdate);
			console.log(fromDate);
			console.log(toDate);
			
			if(  paymentdate >= fromDate && paymentdate <= toDate){
				console.log("true");
				paymentSummary.total+=parseInt(payments[i].bill_amount);
				paymentSummary.payments.push(payment);
			}
		}
	}
	return paymentSummary;
}


module.exports=controllers;