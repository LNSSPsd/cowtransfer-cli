const https=require("https");
const http=require("http");
const fs=require("fs");
const assert=require("assert");
const formData=require("form-data");
const readline=require("readline").createInterface({input:process.stdin,output:process.stdout});
readline.on("SIGINT",()=>{console.log();process.exit(0);});
let greferer;

let cookies=[];
function request(opt,addt){
	console.log("%s https://%s%s",opt.method,opt.hostname,opt.path);
	return new Promise((done)=>{
	if(!opt.headers)opt.headers={};
	opt.headers.cookie=cookies;
	opt.headers["Origin"]="https://cowtransfer.com";
	opt.headers["Referer"]=greferer;
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

function upload(opt,things){
	console.log("Uploading: %s https://%s%s",opt.method,opt.hostname,opt.path);
	return new Promise((done)=>{
	if(!opt.headers)opt.headers={};
	opt.headers.cookie=cookies;
	opt.headers["Origin"]="https://cowtransfer.com";
	opt.headers["Referer"]="https://cowtransfer.com/";
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
			//process.stdout.write("\033[M\rUploaded\n");
			done(ad);
		});
	});
	/*const startDate=new Date();
	for(let c=0;;c+=100){
		if(c+100>=things.length){
			req.write(things.slice(c));
			process.stdout.write("\033[M\rUploading...\t"+(c/1024/1024).toFixed(2)+"MB/"+(things.length/1024/1024).toFixed(2)+"MB\tSpeed:"+((c/1024/1024)/((new Date()).getTime()/1000-startDate.getTime()/1000)).toFixed(2)+"MB/s");	
			req.end();
			break;
		}
		req.write(things.slice(c,c+100));
		process.stdout.write("\033[M\rUploading...\t"+(c/1024/1024).toFixed(2)+"MB/"+(things.length/1024/1024).toFixed(2)+"MB\tSpeed:"+((c/1024/1024)/((new Date()).getTime()/1000-startDate.getTime()/1000)).toFixed(2)+"MB/s");	
	}*/
	req.write(things);
	req.end();
	});
}

function download(url,referer){
	return new Promise((done)=>{
	console.log("GET %s(download)",url);
	let opt={};
	opt.headers={};
	opt.headers.cookie=cookies;
	opt.headers["Origin"]="https://cowtransfer.com";
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
	opt.headers["Referer"]=greferer;
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
	greferer="";
	await get(ref);
	greferer=ref;
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
			console.log("Incorrect password!");
		}
	}
	//assert(detail.uploaded,"File haven't uploaded yet.");
	assert(!detail.deleted,"File is deleted.");
	console.log("\n\nFiles:");
	for(let i in detail.transferFileDtos){
		console.log("#"+i+"\t"+detail.transferFileDtos[i].fileName);
	}
	let id;
	if(detail.transferFileDtos.length>1){
		id=parseInt(await readl("Which file to download?(input File ID): "));
	}else{
		id=0;
	}
	console.log("ID: %d",id);
	console.log("File GUID: %s",detail.transferFileDtos[id].guid);
	let dlink=await request({method:"POST",headers:{"Referer":ref},hostname:"cowtransfer.com",path:"/transfer/download?guid="+detail.transferFileDtos[id].guid});
	dlink=JSON.parse(dlink);
	console.log(dlink);
	console.log("Download link: "+dlink.link);
	console.log("Starting download");
	let file=await download(dlink.link,ref);
	fs.writeFileSync(process.argv[4]?process.argv[4]:detail.transferFileDtos[id].fileName,file);
	console.log("Saved as:",process.argv[4]?process.argv[4]:detail.transferFileDtos[id].fileName);
	process.exit(0);
}

async function main_upload(){
	let fn=process.argv[3];
	let file=fs.readFileSync(fn);
	fn=fn.replace(/ |\ufffd/g, "_");
	greferer="";
	await get("https://cowtransfer.com/");
	greferer="https://cowtransfer.com/";
	let psForm=new formData();
	psForm.append("totalSize",file.length);
	psForm.append("message","");
	psForm.append("notifyEmail","");
	psForm.append("validDays",7);
	psForm.append("saveToMyCloud","false");
	psForm.append("downloadTimes",-1);
	psForm.append("smsReceivers","");
	psForm.append("emailReceivers","");
	psForm.append("enableShareToOthers","false");
	psForm.append("language","cn");
	let preparesend=await request({method:"POST",hostname:"cowtransfer.com",path:"/transfer/preparesend",headers:psForm.getHeaders()},
		psForm.getBuffer());
	preparesend=JSON.parse(preparesend);
	preparesend.miniappqrcode="(ignored)";
	console.log(preparesend);
	if(preparesend.error)throw preparesend.error_message;
	let fileId=fn+"-"+(new Date()).getTime();
	let buForm=new formData();
	buForm.append("type","");
	buForm.append("fileId","");
	buForm.append("fileName",fn);
	buForm.append("originalName",fn);
	buForm.append("fileSize",file.length);
	buForm.append("transferGuid",preparesend.transferguid);
	buForm.append("storagePrefix","anonymous");
	let bfHeaders=buForm.getHeaders();
	bfHeaders["Referer"]="https://cowtransfer.com";
	let beforeupload=await request({method:"POST",hostname:"cowtransfer.com",path:"/transfer/beforeupload",headers:bfHeaders},
		buForm.getBuffer());
	beforeupload=JSON.parse(beforeupload);
	console.log(beforeupload);
	let urForm=new formData();
	urForm.append("file",file,{filename:fn,contentType:"application/octet-stream",knownLength: file.length});
	urForm.append("token",preparesend.uptoken);
	urForm.append("key",`anonymous/${preparesend.transferguid}/${fn}`);
	urForm.append("fname",fn);
	let uploadres=await upload({method:"POST",headers:urForm.getHeaders(),hostname:"upload.qiniup.com",path:"/"},
		urForm.getBuffer());
	console.log(uploadres);
	let udForm=new formData();
	udForm.append("fileId","");
	udForm.append("transferGuid",preparesend.transferguid);
	let uploaded=await request({method:"POST",headers:udForm.getHeaders(),hostname:"cowtransfer.com",path:"/transfer/uploaded"},
		udForm.getBuffer());
	console.log(uploaded);
	let cpt=new formData();
	cpt.append("transferGuid",preparesend.transferguid);
	let complete=await request({method:"POST",headers:cpt.getHeaders(),hostname:"cowtransfer.com",path:"/transfer/complete"},
		cpt.getBuffer());
	console.log(complete);
	console.log("File uploaded successfully.\nDownload link: %s\nExpire at %s.",preparesend.uniqueurl,preparesend.expireAt);
	process.exit(0);
}

if(process.argv[2]=="d")main_download();
else if(process.argv[2]=="u")main_upload();
else{
	console.log("No such method.\nMethods: d <link> [path]\nu <filename>");
	process.exit(1);
}
