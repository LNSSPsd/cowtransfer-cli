const https=require("https");
const http=require("http");
const fs=require("fs");
const assert=require("assert");
const readline=require("readline").createInterface({input:process.stdin,output:process.stdout});
readline.on("SIGINT",()=>{console.log();process.exit(0);});

let cookies=[];
function request(opt,addt){
	console.log("%s https://%s%s",opt.method,opt.hostname,opt.path);
	return new Promise((done)=>{
	if(!opt.headers)opt.headers={};
	opt.headers.cookie=cookies;
	opt.headers["Accept"]="application/json";
	if(addt)opt.headers["Content-Length"]=addt.length;
	opt.headers["User-Agent"]="Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0";
	let req=https.request(opt,(res)=>{
		let ad="";
		res.on("data",(d)=>{ad+=d;});
		res.on("end",()=>{
			if(res.headers["set-cookie"]){
				for(let i of res.headers["set-cookie"]){
					if(cookies.indexOf(i)==-1)cookies.push(i);
				}
			}
			done(ad);
		});
	});
	if(addt)req.write(addt);
	req.end();
	});
}

function dbgrequest(opt,addt){
	console.log("%s https://%s%s",opt.method,opt.hostname,opt.path);
	return new Promise((done)=>{
	if(!opt.headers)opt.headers={};
	opt.hostname="localhost";
	opt.port=8888;
	opt.headers.cookie=cookies;
	opt.headers["Accept"]="application/json";
	opt.headers["Accept-Language"]="en-US,en;q=0.5";
	opt.headers["Content-Length"]=addt.length;
	opt.headers["User-Agent"]="Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0";
	let req=http.request(opt,(res)=>{
		let ad="";
		res.on("data",(d)=>{ad+=d;});
		res.on("end",()=>{
			if(res.headers["set-cookie"]){
				for(let i of res.headers["set-cookie"]){
					if(cookies.indexOf(i)==-1)cookies.push(i);
				}
			}
			done(ad);
		});
	});
	if(addt)req.write(addt);
	req.end();
	});
}

function upload(opt,addt,addfile,addt2){
	console.log("%s https://%s%s",opt.method,opt.hostname,opt.path);
	return new Promise((done)=>{
	if(!opt.headers)opt.headers={};
	opt.headers.cookie=cookies;
	opt.headers["Accept"]="application/json";
	opt.headers["Accept-Language"]="en-US,en;q=0.5";
	opt.headers["User-Agent"]="Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0";
	let req=https.request(opt,(res)=>{
		let ad="";
		res.on("data",(d)=>{ad+=d;});
		res.on("end",()=>{
			if(res.headers["set-cookie"]){
				for(let i of res.headers["set-cookie"]){
					cookies.push(i);
				}
			}
			done(ad);
		});
	});
	req.write(addt);
	req.write(addfile);
	req.write(addt);
	req.end();
	});
}

function download(url,referer){
	return new Promise((done)=>{
	console.log("GET %s(download)",url);
	let opt={};
	opt.headers={};
	opt.headers.cookie=cookies;
	opt.headers["Referer"]=referer;
	opt.headers["Accept"]="application/json";
	opt.headers["User-Agent"]="Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0";
	https.get(url,opt,(res)=>{
		let length=res.headers["content-length"];
		let downloaded=0;
		const startDate=new Date();
		let ad=[];
		res.on("data",(d)=>{
			ad.push(d);
			downloaded+=d.length;
			process.stdout.write("\033[M\rDownloading...\t"+(downloaded/1024/1024).toFixed(2)+"MB/"+(length/1024/1024).toFixed(2)+"MB\tSpeed:"+((downloaded/1024/1024)/((new Date()).getTime()/1000-startDate.getTime()/1000)).toFixed(2)+"MB/s");
		});
		res.on("end",()=>{
			process.stdout.write("\033[M\rDownloaded, Speed:"+((downloaded/1024/1024)/((new Date()).getTime()/1000-startDate.getTime()/1000)).toFixed(2)+"MB/s\n");
			done(Buffer.concat(ad));
		});
	});

	});
}

function get(url){
	return new Promise((done)=>{
	console.log("GET %s",url);
	let opt={};
	opt.headers={};
	opt.headers.cookie=cookies;
	opt.headers["Accept"]="application/json";
	opt.headers["User-Agent"]="Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0";
	https.get(url,opt,(res)=>{
		let ad="";
		res.on("data",(d)=>{ad+=d;});
		res.on("end",()=>{
			if(res.headers["set-cookie"]){
				for(let i of res.headers["set-cookie"]){
					cookies.push(i);
				}
			}
			done(ad);
		});
	});

	});
}

function readl(q){
	return new Promise((ok)=>{readline.question(q,(answ)=>{ok(answ);});});
}

async function main_download(){
	let url=process.argv[3];
	url=url.split("s/");
	url=url[url.length-1];
	let ref="https://cowtransfer.com/s/"+url;
	console.log("https://cowtransfer.com/transfer/transferdetail?url="+url);
	let detail=await get("https://cowtransfer.com/transfer/transferdetail?url="+url);
	detail=JSON.parse(detail);
	detail.miniAppQrCode="(ignored)";
	console.log(detail);
	while(detail.needPassword){
		let psw=await readl("Enter password:");
		detail=JSON.parse(await get("https://cowtransfer.com/transfer/transferdetail?url="+url+"&passcode="+psw));
		detail.miniAppQrCode="(ignored)";		
		console.log(detail);
		if(detail.needPassword){
			console.log("Incorrect Password!");
		}
	}
	assert(detail.uploaded,"File isn't uploaded yet.");
	assert(!detail.deleted,"File is deleted.");
	console.log("\n\nFiles:");
	for(let i in detail.transferFileDtos){
		console.log("#"+i+"\t"+detail.transferFileDtos[i].fileName);
	}
	let id;
	if(detail.transferFileDtos.length>1){
		id=parseInt(await readl("What file you need to download?(input File ID): "));
	}else{
		id=0;
	}
	console.log("ID: %d",id);
	console.log("File GUID: %s",detail.transferFileDtos[id].guid);
	let dlink=await request({method:"POST",headers:{"Referer":ref},hostname:"cowtransfer.com",path:"/transfer/download?guid="+detail.transferFileDtos[id].guid});
	dlink=JSON.parse(dlink);
	console.log(dlink);
	console.log("Download link: "+dlink.link);
	console.log("Start to download");
	let file=await download(dlink.link,ref);
	fs.writeFileSync(detail.transferFileDtos[id].fileName,file);
	console.log("Saved as: "+detail.transferFileDtos[id].fileName);
	process.exit(0);
}

async function main_upload(){
	let fn=process.argv[3];
	let file=fs.readFileSync(fn);
	fn=fn.replace(/ |\ufffd/g, "_");
	await get("https://cowtransfer.com/");
	const boundary="---------------------------18876515039264306831201553372";
	//const boundary="---------------------------13751607859746247381445938631";
	let preparesend=await request({method:"POST",hostname:"cowtransfer.com",path:"/transfer/preparesend",headers:{"Content-Type":"multipart/form-data; boundary="+boundary}},
		boundary+"\r\nContent-Disposition: form-data; name=\"orderGuid\"\r\n\r\n\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"totalSize\"\r\n\r\n"+file.length+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"language\"\r\n\r\nzh-cn\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"notifyEmail\"\r\n\r\n\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"enableShareToOthers\"\r\n\r\nfalse\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"prepareSendFileDtos[0].fileName\"\r\n\r\n"+fn+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"prepareSendFileDtos[0].size\"\r\n\r\n"+file.length+"\r\n"+boundary+"--");
	preparesend=JSON.parse(preparesend);
	preparesend.miniappqrcode="(ignored)";
	console.log(preparesend);
	if(preparesend.error)throw preparesend.error_message;
	let fileId=fn+"-"+(new Date()).getTime();
	let beforeupload=await request({method:"POST",hostname:"cowtransfer.com",path:"/transfer/beforeupload",headers:{"Referer":"https://cowtransfer.com","Content-Type":"multipart/form-data; boundary="+boundary}},
		boundary+"\r\nContent-Disposition: form-data; name=\"type\"\r\n\r\napplication/zip\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"fileId\"\r\n\r\n"+fileId+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"fileName\"\r\n\r\n"+fn+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"fileSize\"\r\n\r\n"+file.length+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"transferGuid\"\r\n\r\n"+preparesend.transferguid+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"storagePrefix\"\r\n\r\nanonymous\r\n"+boundary+"--\r\n");
	beforeupload=JSON.parse(beforeupload);
	console.log(beforeupload);
	let uploadres=await upload({method:"POST",headers:{"Content-Type":"multipart/form-data; boundary="+boundary},hostname:"upload.qiniup.com",path:"/"},
		boundary+"\r\nContent-Disposition: form-data; name=\"file\"; filename=\""+fn+"\"\r\nContent-Type: octet-stream\r\n\r\n",
		file,
		"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"token\"\r\n\r\n"+preparesend.uptoken+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"key\"\r\n\r\nanonymous/"+preparesend.transferguid+"/"+fn+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"fname\"\r\n\r\n"+fn+"\r\n"+boundary+"--");
	let uploaded=await request({method:"POST",headers:{"Content-Type":"multipart/form-data; boundary="+boundary},hostname:"cowtransfer.com",path:"/transfer/uploaded"},
		boundary+"\r\nContent-Disposition: form-data; name=\"fileId\"\r\n\r\n"+fileId+"\r\n"+boundary+"\r\nContent-Disposition: form-data; name=\"transferGuid\"\r\n\r\n"+preparesend.transferguid+"\r\n"+boundary+"--");
	console.log(uploaded);
	console.log("Upload is done.\nDownload link: %s\nExpire At %d days.",preparesend.uniqueurl,beforeupload.expireAt);
	process.exit(0);
}

if(process.argv[2]=="d")main_download();
else{
	console.log("No such method\nMethods: d <link>");
	process.exit(1);
}