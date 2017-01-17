$(function() {
  createItemTabs(true);
  createItemTabs(false);
  createShipTabs(true);
  createShipTabs(false);
  $("#friendItemDialog").dialog({
    autoOpen: false,
    height: 480,
    width: 800,
    uiTabs: true,
    open:function(event,ui){
      $(this).val("");
    },
  });
  $("#enemyItemDialog").dialog({
    autoOpen: false,
    height: 480,
    width: 800,
    uiTabs: true,
    open:function(event,ui){
      $(this).val("");
    },
  });
  $("#friendShipDialog").dialog({
    autoOpen: false,
    height: 480,
    width: 800,
    uiTabs: true,
    open:function(event,ui){
      $(this).val("");
    },
  });
  $("#enemyShipDialog").dialog({
    autoOpen: false,
    height: 480,
    width: 800,
    uiTabs: true,
    open:function(event,ui){
      $(this).val("");
    },
  });
  $('#friendItemTab-container').easytabs();
  $('#enemyItemTab-container').easytabs();
  $('#friendShipTab-container').easytabs();
  $('#enemyShipTab-container').easytabs();
});

function createItemTabs(isFriend){
  let container = isFriend ? '#friendItemTab-container' : '#enemyItemTab-container';
  let prefix = isFriend ? 'friend' : 'enemy';
  let insert = $('<ul>').attr("class","etabs");
  let typelist = {};

  // 初期化
  for(let type in ITEM_TYPE_DATA){
    typelist[type] = [];
  }

  for(let id in ITEM_DATA){
    if((isFriend && id > 0 && id <= 500)||(!isFriend && id > 500)){
      typelist[ITEM_DATA[id].type].push(id);
    }
  }

  for(let type in ITEM_TYPE_DATA){
    if(typelist[type].length > 0){
      let newLi = $('<li>').addClass('tab').prepend('<a href="#'+prefix+'ItemTabs'+type+'"><img src="img/itemicon/'+type+'.png" width="30" height="30">'+ITEM_TYPE_DATA[type]+'</a>');
      insert.append(newLi);
    }
  }
  $(container).append(insert);

  for(let type in ITEM_TYPE_DATA){
    if(typelist[type].length > 0){
      let newLi = $('<div>').attr("id",prefix+"ItemTabs"+type);
      insert.append(newLi);
    }
  }
  $(container).append(insert);
  createItemTable(isFriend,typelist);
}

function createItemTable(isFriend,typelist){
  let prefix = isFriend ? 'friend' : 'enemy';
  for(let type in ITEM_TYPE_DATA){
    let table = $('<table>').attr("id",prefix+"ItemType"+type+"Table").addClass('selectItemTable').attr("border",1);
    $('#'+prefix+'ItemTabs'+type).append(table);
  }

  for(let type in ITEM_TYPE_DATA){
    $('#'+prefix+'ItemType'+type+'Table').append('<thead><tr><th colspan="5">'+ITEM_TYPE_DATA[type]+'　<input type="button" value="装備を外す" onclick="clearItem()"></th></tr></thead>');
    let insert = $('<tbody>');
    insert.append('<tr>');
    for(let id in typelist[type]){
      if(id % 5 == 0) insert.append('</tr><tr>');
      let itemid = typelist[type][id];
      let name = ITEM_DATA[itemid].name;
      let tyku = ITEM_DATA[itemid].tyku;
      insert.append('<td class="btn" onclick="onSelectItem('+itemid+','+isFriend+')" title="'+itemid+':'+name+' 対空+'+tyku+'">'+name+'</td>');
    }
    insert.append('</tr>');
    $('#'+prefix+'ItemType'+type+'Table').append(insert);
  }
}

function clearItem(){
  let dialog = isFriend ? '#friendItemDialog' : '#enemyItemDialog';
  let parent = $(dialog).attr('parent');
  $(parent).empty();
  $(parent).val(0);
  $(dialog).dialog("close");
}

function onSelectItem(itemid,isFriend){
  let dialog = isFriend ? '#friendItemDialog' : '#enemyItemDialog';
  let parent = $(dialog).attr('parent');
  let img = '<img src="img/itemicon/'+ITEM_DATA[itemid].type+'.png" width="30" height="30" style="float:left;margin-right:5px;">';
  // 無理やり登録
  $(parent).val(itemid);
  $(parent).attr('title',"対空+"+ITEM_DATA[itemid].tyku);
  if(isFriend){
    let style = '<select id="'+parent.substring(1)+'alv'+'" style="color:#45A9A5"></select>';
    $(parent).html(img+ITEM_DATA[itemid].name+' '+style);
    createAlvSelection(isFriend);
    $(parent+'alv').on("click",function(event){
      event.stopPropagation();
    });
  } else {
    $(parent).html(img+ITEM_DATA[itemid].name);
  }
  $(dialog).dialog("close");
}

function createAlvSelection(isFriend){
  let dialog = isFriend ? '#friendItemDialog' : '#enemyItemDialog';
  let parent = $(dialog).attr('parent');
  let select = document.getElementById(parent.substring(1)+'alv');
  let selectBox = ["","★+1","★+2","★+3","★+4","★+5","★+6","★+7","★+8","★+9","★max"];
  
  for(i = 0;i < selectBox.length;i++){
    let option = document.createElement('option');
    option.setAttribute('value', i);
    option.innerHTML = selectBox[i];
    select.appendChild(option);
  }
}

function createShipTabs(isFriend){
  let container = isFriend ? '#friendShipTab-container' : '#enemyShipTab-container';
  let prefix = isFriend ? 'friend' : 'enemy';
  let insert = $('<ul>').attr("class","etabs");
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
    if(typelist[type].length > 0){
      let newLi = $('<li>').addClass('tab').prepend('<a href="#'+prefix+'ShipTabs'+type+'">'+SHIP_TYPE_DATA[type]+'</a>');
      insert.append(newLi);
    }
  }
  $(container).append(insert);

  for(let type in SHIP_TYPE_DATA){
    if(typelist[type].length > 0){
      let newLi = $('<div>').attr("id",prefix+"ShipTabs"+type);
      insert.append(newLi);
    }
  }
  $(container).append(insert);
  createShipTable(isFriend,typelist);
}

function createShipTable(isFriend,typelist){
  let prefix = isFriend ? 'friend' : 'enemy';
  for(let type in SHIP_TYPE_DATA){
    let table = $('<table>').attr("id",prefix+"ShipType"+type+"Table").addClass('selectShipTable').attr("border",1);
    $('#'+prefix+'ShipTabs'+type).append(table);
  }

  for(let type in SHIP_TYPE_DATA){
    $('#'+prefix+'ShipType'+type+'Table').append('<thead><tr><th colspan="5">'+SHIP_TYPE_DATA[type]+'　<input type="button" value="'+ (isFriend ? "艦娘" : "深海棲艦") + 'を外す" onclick="clearShip()"></th></tr></thead>');
    let insert = $('<tbody>');
    insert.append('<tr>');
    for(let id in typelist[type]){
      if(id % 5 == 0) insert.append('</tr><tr>');
      let shipid = typelist[type][id];
      let name = SHIP_DATA[shipid].name;
      let tyku = SHIP_DATA[shipid].tyku;
      let img = '<img src="img/ship/'+shipid+'.png" width="100%" title="'+shipid+':'+name+' 対空:'+tyku+'">';
      insert.append('<td><table><tbody onclick="onSelectShip('+shipid+','+isFriend+')"><tr><td>'+img+'</td></tr><tr><td>'+name+'</td></tr></tbody></table></td>');
    }
    insert.append('</tr>');
    $('#'+prefix+'ShipType'+type+'Table').append(insert);
  }
}

function clearShip(){
  let dialog = isFriend ? '#friendShipDialog' : '#enemyShipDialog';
  let parent = $(dialog).attr('parent');
  $(parent).empty();
  $(parent).val(0);
  $(dialog).dialog("close");
}

function onSelectShip(shipid,isFriend){
  let dialog = isFriend ? '#friendShipDialog' : '#enemyShipDialog';
  let parent = $(dialog).attr('parent');
  let name = SHIP_DATA[shipid].name;
  let tyku = SHIP_DATA[shipid].tyku;
  // 無理やり登録
  $(parent).val(shipid);
  $(parent).html('<img src="img/ship/'+shipid+'.png" width="160" height="40" title="'+shipid+':'+name+' 対空:'+tyku+'">');
  $(dialog).dialog("close");
}
