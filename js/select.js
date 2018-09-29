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
    $('#'+prefix+'ItemType'+type+'Table').append('<thead><tr><th colspan="5">'+ITEM_TYPE_DATA[type]+'　<input type="button" value="装備を外す" onclick="clearItem('+isFriend+')"></th></tr></thead>');
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

function clearItem(isFriend){
  let dialog = isFriend ? '#friendItemDialog' : '#enemyItemDialog';
  let parent = $(dialog).attr('parent');
  let i = parent.substring(2,3);
  let j = parent.substring(4,5);
  let k = parent.substring(9,10);
  resetItem(i,j,k);
  calc();
  $(dialog).dialog("close");
}

function onSelectItem(itemid,isFriend){
  let dialog = isFriend ? '#friendItemDialog' : '#enemyItemDialog';
  let parent = $(dialog).attr('parent');
  let i = parent.substring(2,3);
  let j = parent.substring(4,5);
  let k = parent.substring(9,10);
  // 無理やり登録
  setItem(i,j,k,itemid,0,isFriend);
  calc();
  $(dialog).dialog("close");
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
    if((isFriend && id > 0 && id <= 1000)||(!isFriend && id > 1500)){
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
    $('#'+prefix+'ShipType'+type+'Table').append('<thead><tr><th colspan="5">'+SHIP_TYPE_DATA[type]+'　<input type="button" value="'+ (isFriend ? "艦娘" : "深海棲艦") + 'を外す" onclick="clearShip('+isFriend+')"></th></tr></thead>');
    let insert = $('<tbody>');
    insert.append('<tr>');
    for(let id in typelist[type]){
      if(id % 5 == 0) insert.append('</tr><tr>');
      let shipid = typelist[type][id];
      let name = SHIP_DATA[shipid].name;
      let tyku = SHIP_DATA[shipid].tyku;
      let img = '<img src="http://nishisonic.xsrv.jp/ship/banner/'+shipid+'.png" width="100%" title="'+shipid+':'+name+' 対空:'+tyku+'">';
      insert.append('<td><table><tbody onclick="onSelectShip('+shipid+','+isFriend+')"><tr><td>'+img+'</td></tr><tr><td>'+name+'</td></tr></tbody></table></td>');
    }
    insert.append('</tr>');
    $('#'+prefix+'ShipType'+type+'Table').append(insert);
  }
}

function clearShip(isFriend){
  let dialog = isFriend ? '#friendShipDialog' : '#enemyShipDialog';
  let parent = $(dialog).attr('parent');
  let i = parent.substring(2,3);
  let j = parent.substring(4,5);
  resetShip(i,j);
  calc();
  $(dialog).dialog("close");
}

function onSelectShip(shipid,isFriend){
  let dialog = isFriend ? '#friendShipDialog' : '#enemyShipDialog';
  let parent = $(dialog).attr('parent');
  let i = parent.substring(2,3);
  let j = parent.substring(4,5);
  // 無理やり登録
  setShip(i,j,shipid);
  setStatus(parent,shipid,isFriend);
  $(dialog).dialog("close");
}
