function init(){
    var url="https://api.guildwars2.com/v1/world_names.json?lang=de"
    cros(url, handleResult)
}


function cros(url, handler){
    var req= new XMLHttpRequest();
    req.open("GET", url, true);
    req.onreadystatechange = handler;
    req.send();
}

function handleResult(evt){
    var req=evt.srcElement;
    console.log(req);
    if(req.readyState=4 && req.status==200){
        var response=JSON.parse(req.responseText);
        var foo="";
        for(var i=0;i<response.length;i++){
            foo.push(response[i].name)
        }
        document.getElementById("content").innerHTML=foo;
    }
}
