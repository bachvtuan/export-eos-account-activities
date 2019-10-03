function convertArrayOfObjectsToCSV(args) {
  var result = '';
  var data = args.data;
  if (data.length == 0) return result;
  var firstItem = data[0];
  var keys = [];

  for (var key in firstItem) {
    keys.push(key);
  }
  result += '"' + keys.join('","') + '"' + "\n\r";
  data.forEach(function(item) {
    var lines = [];
    keys.forEach(function(key) {
      lines.push(item[key]);
    });
    result += '"' + lines.join('","') + '"' + "\n\r";
  });

  return result;
}

self.onmessage = function(msg) {
  console.log(msg.data.account);
  const account = msg.data.account;
  const numbertransactions = msg.data.numbertransactions
  //const Http = new XMLHttpRequest();
  
  var link = "https://eos.greymass.com/v1/history/get_actions";
  // Http.open("GET", link);
  // Http.send();


  var Http = new XMLHttpRequest();
  
  Http.open("POST", link, true);
  Http.setRequestHeader("Content-Type", "application/json");
  
  var data = JSON.stringify({"account_name":account,"pos":-1,"offset":-100});
  Http.send(data);


  Http.onreadystatechange = (e) => {
    if (Http.readyState == 4 && Http.status == 200) {
      var data = JSON.parse(Http.responseText)
      var filterData = [];
      var pushedTxs = [];
      console.log(data.actions.length, " length action");
      data.actions.forEach(function(loopItem) {
        if (pushedTxs.indexOf( loopItem.action_trace.trx_id ) == -1){
          pushedTxs.push( loopItem.action_trace.trx_id )
          
          var item = {
            "Transaction ID": loopItem.action_trace.trx_id,
            "Created At": loopItem.block_time
          };
          item.Contract = loopItem.action_trace.act.account;
          item.Name = loopItem.action_trace.act.name;
          item.Data = '';
          if (typeof(loopItem.action_trace.act.data) != "undefined"){
            if (typeof(loopItem.action_trace.act.data)=="string"){
              item.Data = loopItem.action_trace.act.data;
            }else{
              for (var key in loopItem.action_trace.act.data) {
                if (typeof(loopItem.action_trace.act.data[key]) == "string") {
                  if (item.Data) {
                    item.Data += "\n\r";
                  }
                  item.Data += key + ' : ' + loopItem.action_trace.act.data[key].replace(/\"/g, '""')
                }
              }
            }
          }

          
          filterData.push(item);          
        }

      });
      console.log('length ',filterData.length);
      postMessage(convertArrayOfObjectsToCSV({
        data: filterData
      }));

    }
  }
}