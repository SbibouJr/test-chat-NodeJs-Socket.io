
"use strict"

let http = require("http");
let fs = require("fs");
let url = require("url");
let queryString = require("querystring");
let ent = require("ent");

// ************ HTTP SERVER ************
let server = http.createServer( (p_req, p_res) => {

	let page = url.parse(p_req.url).pathname;
	let chaineParams = url.parse(p_req.url).query;
	let params = queryString.parse(chaineParams);

	if(page === "/"){
		fs.readFile("views/index.html", "utf-8", (p_err, p_data) => {
			if(!p_err){
				p_res.writeHead(200,{ "Content-Type" : "text/html"});
				p_res.end(p_data);
			}
			else{
				p_res.writeHead(404,{ "Content-Type" : "text/html"});
				p_res.end(p_err.message);
			}
		});
	}
	else if(page === "/style"){
		fs.readFile("style/style.css", (p_err, p_data) => {
			if(!p_err){
				p_res.writeHead(200,{ "Content-Type" : "text/css"});
				p_res.end(p_data);
			}
			else{
				p_res.writeHead(404,{ "Content-Type" : "text/html"});
				p_res.end(p_err.message);
			}
		});
	}
	else{
		p_res.writeHead(404, {"Content-Type": "text/html"});
		p_res.end("ERREUR 404 : Page introuvable");
	}

	console.log("Connection client : serveur http");
});



// ************ SOCKET SERVER ************
let _idUser = 0;
let io = require("socket.io").listen(server);

io.sockets.on("connection", (p_socket) => {
	// Quand un client se connecte
	console.log("Connection client : socket.io");

	p_socket._idUser = _idUser++;

	p_socket.on("newUser", (p_pseudo) => {
		p_socket._pseudo = p_pseudo;
		console.log(p_socket._pseudo + " est connecté");
		p_socket.emit("message",{
			"pseudo": "Serveur",
			"message":"Connection au serveur ok ! Bienvenue "+ p_socket._pseudo
		});
		p_socket.broadcast.emit("newUser",p_socket._pseudo + " viens de se connecter");
	});

	p_socket.on("disconnect", () => {

		console.log(p_socket._pseudo + " s' est deconnecté !");
		p_socket.broadcast.emit("goodbye", p_socket._pseudo);
	});

	p_socket.on("message", (p_message) => {

		console.log(p_socket._pseudo + " : " + p_message);

		let messEncode = ent.encode(p_message);
		
		p_socket.broadcast.emit("message", {
			"pseudo":p_socket._pseudo,
			"message": messEncode
		});
	});
});

server.listen(8080);