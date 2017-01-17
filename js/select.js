$(function() {
  console.debug('aaaadd')
  createTabs();
  $( "#dialog" ).dialog({
    autoOpen: false,
    height: 650,
    width: 800,
    uiTabs: true,
    close:function(event,ui){
      console.log('testmode')
    },
  });
  $('#tab-container').easytabs();
});

function createTabs(){
  let insert = $('<ul>').attr("id","etabs").attr("class","etabs");

  for(let type in TYPE_DATA){
    let newLi = $('<li>').addClass('tab').prepend('<a href="#tabs'+TYPE_DATA[type].id+'"><img src="img/'+TYPE_DATA[type].id+'.png" width="30" height="30">'+TYPE_DATA[type].text+'</a>');
    insert.append(newLi);
  }
  $('#tab-container').append(insert);

  for(let type in TYPE_DATA){
    let newLi = $('<div>').attr("id","tabs"+TYPE_DATA[type].id);
    insert.append(newLi);
  }
  $('#tab-container').append(insert);
  createTable();
}

function createTable(isFriend = true){
  for(let type in TYPE_DATA){
    let table = $('<table>').attr("id","itemType"+TYPE_DATA[type].id+"table").addClass('selectItemTable').attr("border",1);
    $('#tabs'+TYPE_DATA[type].id).append(table);
  }

  let typelist = {};

  for(let type in TYPE_DATA){
    typelist[TYPE_DATA[type].id] = [];
  }
  for(let item in ITEM_DATA){
    if((isFriend && item > 0 && item <= 500)||(!isFriend && item > 500)){
      typelist[ITEM_DATA[item].type].push(item);
    }
  }

  for(let type in TYPE_DATA){
    $('#itemType'+TYPE_DATA[type].id+'table').append('<thead><tr><th colspan="5">'+TYPE_DATA[type].text+'</th></tr></thead>');
    let insert = $('<tbody>');
    insert.append('<tr>');
    for(let id in typelist[TYPE_DATA[type].id]){
      if(id % 5 == 0) insert.append('</tr><tr>');
      let itemid = typelist[TYPE_DATA[type].id][id];
      let name = ITEM_DATA[itemid].name;
      let tyku = ITEM_DATA[itemid].tyku;
      insert.append('<td class="btn" onclick="onSelectItem('+itemid+')" title="'+itemid+':'+name+' 対空+'+tyku+'">'+name+'</td>');
    }
    insert.append('</tr>');
    $('#itemType'+TYPE_DATA[type].id+'table').append(insert);
  }
}

function onSelectItem(itemid){
  console.log($(this).index())
  $('#dialog').dialog("close");
}