var mongoose=require("mongoose");
	
//Schema({..}, options);
var user=new mongoose.Schema({
		username: {type:String, required:true, unique:true},
		password: {type:String,required: true},
		name: {type:String, required: true, trim: true},
		role: {type: String, required: true, trim: true}
	},
		{versionKey: false}
	);

var subject=new mongoose.Schema({
		name: {type: String, required: true},
		marks: {type: Number, require: true},
		fullMarks:{type: Number, require: true}
	},
		{versionKey: false}
	);

var test=new mongoose.Schema({
		testName:{type:String, required:true},
		subject: subject,
		testDate:{type: Date}
	},
		{versionKey: false}
	);

var stream=new mongoose.Schema({
	name:{type:String, required:true, unique:true},
	optionals:[subject],
	compulsory:[subject],
	honours:[subject],
	},
		{versionKey: false}
	);

var bill=new mongoose.Schema({
		bill_number: {type: Number, required: true, unique: true},
		bill_amount: {type: Number, required: true},
		bill_date: {type: Date, required: true},
		for_month: {type: String, required: true},
		payee_rollnumber: {type: String, required: true},
		payee_name: {type: String, required: true},
		received_by: {type: String, required: true}
	},
		{versionKey: false}
	);

var student=new mongoose.Schema({
			name: {type: String, required: true},
			dob: {type: Date, required: true},
			gender: {type: String, required: true},
			parent_name: {type: String, required: true},
			pass_year: {type: String, required: true},
			academic_session: {type: String, required: true},
			level: {type: String, required: true},
			subjects: {type: [String], required: true},
			roll_number: {type: String, required: true},
			admission_date: {type: Date, required: true},
			paymenet_mode: {type: String, required: true},
			fees: {type: Number, required: true},
			neg_fees: {type: Number, required: true},
			college_name: {type: String, required: true},
			cell_no: {type: Number, required: true},
			pres_address: {type: String, required: true},
			perm_address: {type: String, required: true},
			photo: {type: String, required: true},
			payments: [bill],
			tests: {type: [test]},
		},{versionKey: false});

var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];

var models={
	User : mongoose.model("Users", user),
	Student : mongoose.model("Students", student),
	Bill : mongoose.model("Bills", bill),
	MONTHS: MONTHS,
	Subject: mongoose.model("Subjects", subject),
	Streams: mongoose.model("Streams", stream),
	Test: mongoose.model("Tests", test)
}

module.exports=models;
