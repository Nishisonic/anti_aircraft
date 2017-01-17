$(function() {
  createItemTabs();
  createShipTabs();
  $( "#itemDialog" ).dialog({
    autoOpen: false,
    height: 650,
    width: 800,
    uiTabs: true,
    open:function(event,ui){
      $(this).val("");
    },
    close:function(event,ui){
      $(this).remove();
    }
  });
  $( "#shipDialog" ).dialog({
    autoOpen: false,
    height: 650,
    width: 800,
    uiTabs: true,
    open:function(event,ui){
      $(this).val("");
    },
    close:function(event,ui){
      $(this).remove();
    }
  });
  $('#itemTab-container').easytabs();
  $('#shipTab-container').easytabs();
});

function createItemTabs(){
  let insert = $('<ul>').attr("id","eItemtabs").attr("class","etabs");

  for(let type in ITEM_TYPE_DATA){
    let newLi = $('<li>').addClass('tab').prepend('<a href="#itemTabs'+type+'"><img src="img/'+type+'.png" width="30" height="30">'+ITEM_TYPE_DATA[type]+'</a>');
    insert.append(newLi);
  }
  $('#itemTab-container').append(insert);

  for(let type in ITEM_TYPE_DATA){
    let newLi = $('<div>').attr("id","itemTabs"+type);
    insert.append(newLi);
  }
  $('#itemTab-container').append(insert);
  createItemTable($('#itemDialog').attr('friend'));
}

function createItemTable(isFriend = true){
  for(let type in ITEM_TYPE_DATA){
    let table = $('<table>').attr("id","itemType"+type+"table").addClass('selectItemTable').attr("border",1);
    $('#itemTabs'+type).append(table);
  }

  let typelist = {};

  for(let type in ITEM_TYPE_DATA){
    typelist[type] = [];
  }
  for(let id in ITEM_DATA){
    if((isFriend && id > 0 && id <= 500)||(!isFriend && id > 500)){
      typelist[ITEM_DATA[id].type].push(id);
    }
  }

  for(let type in ITEM_TYPE_DATA){
    $('#itemType'+type+'table').append('<thead><tr><th colspan="5">'+ITEM_TYPE_DATA[type]+'</th></tr></thead>');
    let insert = $('<tbody>');
    insert.append('<tr>');
    for(let id in typelist[type]){
      if(id % 5 == 0) insert.append('</tr><tr>');
      let itemid = typelist[type][id];
      let name = ITEM_DATA[itemid].name;
      let tyku = ITEM_DATA[itemid].tyku;
      insert.append('<td class="btn" onclick="onSelectItem('+itemid+')" title="'+itemid+':'+name+' 対空+'+tyku+'">'+name+'</td>');
    }
    insert.append('</tr>');
    $('#itemType'+type+'table').append(insert);
  }
}

function onSelectItem(itemid){
  let parent = $('#itemDialog').attr('parent');
  // 無理やり登録
  $(parent).val(itemid);
  $(parent).html(ITEM_DATA[itemid].name + ' <select id="'+parent.substring(1)+'alv'+'" style="color:#45A9A5"></select>');
  createAlvSelection();
  $(parent+'alv').on("click",function(event){
    event.stopPropagation();
  });
  $('#itemDialog').dialog("close");
}

function createAlvSelection(){
  let parent = $('#itemDialog').attr('parent');
  let select = document.getElementById(parent.substring(1)+'alv');
  let selectBox = ["","★+1","★+2","★+3","★+4","★+5","★+6","★+7","★+8","★+9","★max"];
  
  for(i = 0;i < selectBox.length;i++){
    let option = document.createElement('option');
    option.setAttribute('value', i);
    option.innerHTML = selectBox[i];
    select.appendChild(option);
  }
}

function createShipTabs(){
  let insert = $('<ul>').attr("id","eShiptabs").attr("class","etabs");

  for(let type in SHIP_TYPE_DATA){
    let newLi = $('<li>').addClass('tab').prepend('<a href="#shipTabs'+type+'">'+SHIP_TYPE_DATA[type]+'</a>');
    insert.append(newLi);
  }
  $('#shipTab-container').append(insert);

  for(let type in SHIP_TYPE_DATA){
    let newLi = $('<div>').attr("id","shipTabs"+type);
    insert.append(newLi);
  }
  $('#shipTab-container').append(insert);
  createShipTable($('#shipDialog').attr('friend'));
}

function createShipTable(isFriend = true){
  for(let type in SHIP_TYPE_DATA){
    let table = $('<table>').attr("id","shipType"+type+"table").addClass('selectShipTable').attr("border",1);
    $('#shipTabs'+type).append(table);
  }

  let typelist = {};

  for(let type in SHIP_TYPE_DATA){
    typelist[type] = [];
  }
  for(let id in SHIP_DATA){
    if((isFriend && id > 0 && id <= 500)||(!isFriend && id > 500)){
      if(SHIP_DATA[id].fr){
        typelist[SHIP_DATA[id].type].push(id);
      } else {
        typelist[0].push(id);
      }
    }
  }

  for(let type in SHIP_TYPE_DATA){
    $('#shipType'+type+'table').append('<thead><tr><th colspan="5">'+SHIP_TYPE_DATA[type]+'</th></tr></thead>');
    let insert = $('<tbody>');
    insert.append('<tr>');
    for(let id in typelist[type]){
      if(id % 5 == 0) insert.append('</tr><tr>');
      let shipid = typelist[type][id];
      let name = SHIP_DATA[shipid].name;
      let tyku = SHIP_DATA[shipid].tyku;
      insert.append('<td class="btn" onclick="onSelectShip('+shipid+')" title="'+shipid+':'+name+' 対空+'+tyku+'">'+name+'</td>');
    }
    insert.append('</tr>');
    $('#shipType'+type+'table').append(insert);
  }
}

function onSelectShip(shipid){
  let parent = $('#shipDialog').attr('parent');
  // 無理やり登録
  $(parent).val(shipid);
  $(parent).html(SHIP_DATA[shipid].name);
  $('#shipDialog').dialog("close");
}