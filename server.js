var http=require("http"),
	app=require("./app")();

http.createServer(app).listen(app.get("port"), function(){
	console.log("Express server is running on port :" + app.get("port"));
	/*if (req.url === '/register-student' && req.method === 'POST') {
    // parse a file upload
    var form = new multiparty.Form();

    form.parse(req, function(err, fields, files) {
      res.writeHead(200, {'content-type': 'text/plain'});
      res.write('received upload:\n\n');
      res.end(util.inspect({fields: fields, files: files}));
    });

    return;*/
});