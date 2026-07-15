
async function loadStatus(){

try{

const res=await fetch("/api/status");

const data=await res.json();

document.getElementById("status").innerHTML=
data.status;

}

catch{

document.getElementById("status").innerHTML=
"Server Offline";

}

}

loadStatus();
