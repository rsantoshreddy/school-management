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
	    res.locals.students=getStudentSummary(dbStudents);	
		res.render('dashboard',{title:"Dashboard"});
    });
}

function getStudentSummary(students){
	var studentList=[];
	for(var i=0; students.length>i; i++){
		var student={}
		student.name=students[i].name;
		student.dob=students[i].dob.toDateString();
		student.gender=students[i].gender;
		student.parent_name=students[i].parent_name;
		student.pass_year=students[i].pass_year;
		student.academic_session=students[i].academic_session;
		student.level=students[i].level;
		student.roll_number=students[i].roll_number;
		student.admission_date=students[i].admission_date.toDateString();
		student.cell_no=students[i].cell_no;
		student.photo=students[i].photo;

		studentList.push(student);
	}
	return studentList;
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
	res.locals.errorMsg=req.session.errorMsg;

	delete req.session.successMsg;
	delete req.session.errorMsg;

	models.Streams.find(function(err, streams){
		res.locals.streams=streams;
		res.render('register-student', {/*csrfToken: req.csrfToken(),*/ title:'Student registration'});
	});
}

/*save student data from register page*/
controllers.saveStudent=function(req, res){
	var admissionDate=(new Date(req.body.admissionDate)) || (new Date());
	
    var Student=new models.Student({
    	name: req.body.sname,
    	dob: req.body.dob,
    	parent_name: req.body.parentName,
    	academic_session: req.body.academicSession,
    	level: req.body.level,
    	subjects: req.body.subjects,
    	roll_number: req.body.rollNumber,
    	admission_date: admissionDate,
    	paymenet_mode: req.body.paymenetMode,
    	fees: req.body.fees,
    	neg_fees: req.body.negFees,
    	college_name: req.body.collegeName,
    	cell_no: req.body.cellNo,
    	pres_address: req.body.presAddress,
    	perm_address: req.body.permAddress,
    	photo: req.body.photo,
    	pass_year: req.body.pass_year,
    	gender: req.body.gender
    });

    Student.save(function(err){
		if(err){
			var error= 'Something went wrong! Pls try again.'
			if(err.code===11000){
				error= 'That roll number is already taken, try another';
			}
			req.session.errorMsg=error;
			res.redirect('/register-student');
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
		received_by: req.user.name,
		payee_rollnumber: data.rollNumber,
		payee_name: data.name
	});
	
	//update({condition},{update},{options},callback)
	models.Student.update({roll_number: data.rollNumber},{$push:{payments: payment}},function(err, dbmodel){
		if(err){
			console.log("Update error");
			console.log(err);
		}else{
			console.log("Updated Succefully");
			console.log(dbmodel);
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
		}
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

/*get subjects handler*/
controllers.getSubjects=function(req, res){
		models.Streams.findOne({name:req.query.stream},function(err, streamObj){
			res.send(streamObj);
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
			res.locals.academicSummary=getAcademicSummary(student.tests);
			res.render("profile", {title:"Profile"});
		}
	});
}

controllers.resisterTest=function(req, res){
	res.render('exam',{title:"Exam details"});
}
controllers.updateTest=function(req,res){
	var rollNumbers=req.body.rollnumber;
	var marks=req.body.marks;
	var subjets=req.body.subject;
	var fullMarks=req.body.fullmarks;

	var dateOfExam=req.body.dateOfExam;
	var exam=req.body.exam;

	var j=0;

	var subj=new models.Subject({
			name: subjets,
			fullMarks:fullMarks
		});

	var SampleTest=new models.Test({
			testName: exam,
			subject: subj,
			testDate: dateOfExam
		});
	
	SampleTest.save(function(err){
		if(err){
			console.log("Something Went Wrong, Please try again.")
		}
	});
	
	for(var i=0; i<rollNumbers.length;i++){
		var sub=new models.Subject({
			name: subjets,
			marks: marks[i],
			fullMarks:fullMarks
		});

		var test=new models.Test({
			testName: exam,
			subject: sub,
			testDate: dateOfExam
		});
		models.Student.update({"roll_number":rollNumbers[i]},{$push:{"tests":test}},function(err, model){
				if(err)
					console.log(err);
				j++;
				if(rollNumbers.length==j)
					res.redirect("/register-test");
		});
	}
}

controllers.getStudentKeyList=function(req, res){
	models.Student.find(function(err, students){
		var keyPairs={};
		for(var i=0; students.length>i;i++){
			var rollNumber=students[i].roll_number;
			var sName=students[i].name;
			keyPairs[rollNumber]=sName;
		}
		res.send(keyPairs);
	});
}

controllers.addStream=function(req, res){
	res.render('stream',{title:"Add Stream"});
}
controllers.saveStream=function(req, res){
	var optionals=[];
	var compulsories=[];
	var honours=[];

	var inputOpt=req.body.optional;

	for(var i=0; inputOpt.length>i; i++){
		var subject=new models.Subject({
			name: inputOpt[i]
		});
		optionals.push(subject);
	};

	var inputComp=req.body.compulsory;

	for(var i=0; inputComp.length>i; i++){
		var subject=new models.Subject({
			name: inputComp[i]
		});
		compulsories.push(subject);
	};
	
	var inputHonours=req.body.honours;

	for(var i=0; inputHonours.length>i; i++){
		var subject=new models.Subject({
			name: inputHonours[i]
		});
		honours.push(subject);
	};
	

	var StreamObj=new models.Streams({
		name:req.body.stream,
		optionals:optionals,
		compulsory:compulsories,
		honours:honours
	});

	StreamObj.save(function(err){
		if(err){
			console.log(err)
		}
		res.redirect('/addStream');
	});
}
controllers.getCollectionReport=function(req, res){
	res.render('collection',{title:"Collections"});
}

controllers.showCollectionReport=function(req, res){
	var fromDate=new Date(req.body.fromdate);
	var toDate=new Date(req.body.todate);

	models.Bill.find(function(err, bills){
		res.locals.report=getPaymentSummary(bills, fromDate, toDate);
		//console.log(res.locals.report);
		res.render('collection',{title:"Collections"});
	});
}

controllers.getExamReport=function(req,res){
	models.Subject.find(function(err, model){
		res.locals.exams=getExamList(model);
		res.render('exam-report',{title:"Exams"});
	});
}
controllers.postExamReport=function(req,res){

}

controllers.getPayReport=function(req,res){
	models.Streams.find(function(err, streams){
		req.session.streams=streams;
		res.locals.streams=streams;
		res.locals.MONTHS=models.MONTHS;
		res.render('payment-report', {/*csrfToken: req.csrfToken(),*/ title:'Payments'});
	});
}
controllers.postPayReport=function(req,res){
	var batch=req.body.batch;
	var month=req.body.month;
	var year=req.body.year;
	models.Student.find({"level": batch},function(err, model){
		res.locals.report=getPaymentReport(model,month,year);
		res.locals.streams=req.session.streams;
		res.locals.MONTHS=models.MONTHS;
		res.render('payment-report', {/*csrfToken: req.csrfToken(),*/ title:'Payments Report'});
	});
}
function getPaymentReport(model,month,year){
	var report=[];
	for(var i=0;i<model.length;i++){
		for(var j=0;j<model[i].payments.length;j++){
			var billYear=model[i].payments[j].bill_date.getFullYear();

			if(billYear==year  && model[i].payments[j].for_month==month){
				report.push(model[i].payments[j]);
			}
		}
	}
	return report;
}
function getExamList(students){
	var list=[];
	for(var i=0;i<students.length;i++){
		for(var j=0; students[i].tests;j++){
			var c=""
			if(c!=students[i].tests[j].testName){
				list.push(students[i].tests[j]);
				c=students[i].tests[j].testName;
			}
		}
	}

	return list;
}
/*logout handler*/
controllers.logout=function(req, res){
	if(req.session)
	 req.session.destroy();
	res.redirect('/');
}

function getAcademicSummary(test){
	var examSummary=[];
	for(var i=0; i<test.length;i++){
		var exam={};
		exam.name=test[i].testName;
		exam.date=test[i].testDate.toDateString();
		exam.subject=test[i].subject.name;
		exam.marks=test[i].subject.marks;
		exam.fullmarks=test[i].subject.fullMarks;
		exam.percent=(exam.marks/exam.fullmarks)*100;
		examSummary.push(exam);
	}
	return examSummary;
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
			//console.log(paymentdate);
			//console.log(fromDate);
			//console.log(toDate);
			
			if(  paymentdate >= fromDate && paymentdate <= toDate){
				//console.log("true");
				paymentSummary.total+=parseInt(payments[i].bill_amount);
				paymentSummary.payments.push(payment);
			}
		}
	}
	return paymentSummary;
}


module.exports=controllers;