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
		subjects: [subject]
	},
		{versionKey: false}
	);

var stream=new mongoose.Schema({
	name:{type:String, required:true, unique:true},
	optionals:[subject],
	compulsory:[subject]
	},
		{versionKey: false}
	);

var bill= new mongoose.Schema({
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
			parent_name: {type: String, required: true},
			academic_session: {type: String, required: true},
			level: {type: String, required: true},
			stream: {type: String, required: true},
			roll_number: {type: String, required: true, unique: true},
			admission_date: {type: Date, required: true},
			paymenet_mode: {type: String, required: true},
			fees: {type: Number, required: true},
			neg_fees: {type: Number, required: true},
			college_name: {type: String, required: true},
			cell_no: {type: Number, required: true},
			pres_address: {type: String, required: true},
			perm_address: {type: String, required: true},
			photo: {type: String, required: true, unique: true},
			payments: [bill]
		},{versionKey: false});

var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
var SUBJECTS={
	"arts": {
			"optionals": ["MIL(TAMIL)", "MIL(SANSKRIT)", "MIL(HINDI)", "MIL(ALT. ENG.)"],
			"compulsory": ["ENGLISH", "HISTORY", "POLITICAL SCIENCE", "ECONOMICS", "EDUCATION", "OPTIONAL TAMIL", "IRPM", "HOME SCIENCE","PSYCHOLOGY", "LOGIC"]
			},
	"commerce": {
			"optionals": ["ENGLISH", "MIL(TAMIL)", "MIL(SANSKRIT)", "MIL(HINDI)", "MIL(ALT. ENG.)"],
			"compulsory": ["ACCOUNTANCY", "COST ACCOUNTING", "BUSINESS STUDIES AND MANAGEMENT", "BUSINESS MATHEMATICS AND STATISTICS", "COMPUTER APPLICATION", "IT", "BANKING AND INSURANCE", "MANAGEMENT ACCOUNTING", "COMPANY ACCOUNTING", "FUNDAMENTALS OF ENTREPRENUERSHIP", "SALESMANSHIP"]
			},
	"science": {
			"optionals": ["MIL(TAMIL)", "MIL(SANSKRIT)", "MIL(HINDI)", "MIL(ALT. ENG.)"],
			"compulsory": ["ENGLISH", "PHYSICS", "CHEMISTRY", "MATHEMATICS", "BOTANY", "ZOOLOGY", "IT", "ELECTRONICS", "GEOLOGY", "COMPUTER SCIENCE", "STATISTICS"]
			}
	};

var models={
	User : mongoose.model("Users", user),
	Student : mongoose.model("Students", student),
	Bill : mongoose.model("Bills", bill),
	MONTHS: MONTHS,
	SUBJECTS: SUBJECTS,
	Subject: mongoose.model("Subjects", subject),
	Streams: mongoose.model("Streams", stream)
}

module.exports=models;
