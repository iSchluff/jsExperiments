(function(){
  var template = tmpl("listTemplate");
  var list= $(".list-group");
  
  var toIso= function(d){
    var month= d.getMonth() < 9 ? "0"+(d.getMonth()+1) : d.getMonth()+1;
    var day= d.getDate() < 10 ? "0"+d.getDate() : d.getDate();
    return d.getFullYear()+"-"+month+"-"+day;
  };

  var now= new Date();
  var data={
    q: "created:<" + toIso(now),
    sort: "stars"
  };
  
  var xhr = $.get( "https://api.github.com/search/repositories", data, function(result) {
    console.log( result );
    list.append(template(result));
  })
  .fail(function(error) {
    console.log( "error", error);
  });
}());