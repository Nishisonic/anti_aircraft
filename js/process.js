$(function(){
  $('#formationBox').load('formation.html');
  $('#taiku_cutinBox').load('taiku_cutin.html');
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      $('#f' + i + 's' + j + 'name').on( "click", function() {
        $('#friendShipDialog').dialog('close');
        $('#friendShipDialog').dialog('option', 'position', { my: 'left top', at: 'right bottom', of: $(this)});
        $('#friendShipDialog').attr('parent', '#f' + i + 's' + j + 'name');
        $('#friendShipDialog').dialog('open');
      });
      for(let k = 1;k <= 5;k++){
        $('#f' + i + 's' + j + 'item' + k).on( "click", function() {
          $('#friendItemDialog').dialog('close');
          $('#friendItemDialog').dialog('option', 'position', { my: 'left top', at: 'right bottom', of: $(this)});
          $('#friendItemDialog').attr('parent', '#f' + i + 's' + j + 'item' + k);
          $('#friendItemDialog').dialog('open');
        });
      }
      document.getElementById('f' + i + 's' + j + 'tyku').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'kaju').innerHTML = "0.00";
      document.getElementById('f' + i + 's' + j + 'shotDownA').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'shotDownB').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'total').innerHTML = 0;
    }
  }
});

// parent = #f1s1name
function setStatus(parent,shipid,isFriend){
  let fleet = parent.substring(2,3);
  let ship = parent.substring(4,5);
  let t_tyku = 'f' + fleet + 's' + ship + 'tyku';
  let tyku = SHIP_DATA[shipid].tyku;
  document.getElementById(t_tyku).innerHTML = tyku;
  for(let i = 1;i <= 5;i++){
    let t_item = '#f' + fleet + 's' + ship + 'item' + i;
    let t_item_alv = '#f' + fleet + 's' + ship + 'item' + i + 'alv';
    let itemid = SHIP_DATA[shipid]["i"+i];
    if(itemid === undefined || itemid === 0){
      $(t_item).empty();
      $(t_item).val(0);
    } else {
      let img = '<img src="img/itemicon/'+ITEM_DATA[itemid].type+'.png" width="30" height="30" style="float:left;margin-right:5px;">';
      if(isFriend){
        let style = '<select id="'+t_item_alv.substring(1)+'alv'+'" style="color:#45A9A5"></select>';
        $(t_item).html(img+ITEM_DATA[itemid].name+' '+style);
        createAlvSelection(isFriend,t_item);
        $(t_item_alv).on("click",function(event){
          event.stopPropagation();
        });
      } else {
        $(t_item).html(img+ITEM_DATA[itemid].name);
      }
      $(t_item).val(itemid);
    }
  }
  calc();
}

function calc(){
  let kantaiAirBonus = 0;
  // 艦隊防空値
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      let shipKantaiAirBonus = 0;
      for(let k = 1;k <= 5;k++){
        let t_item = '#f' + i + 's' + j + 'item' + k;
        let t_alv = '#f' + i + 's' + j + 'item' + k + 'alv option:selected';
        let itemid = $(t_item).val();
        if(itemid <= 0) continue;
        let tyku = ITEM_DATA[itemid].tyku;
        if(tyku <= 0) continue;
        let alv = $(t_alv).val()|0;
        let type = ITEM_DATA[itemid].type;
        // 艦隊防空加重對空值 = 裝備對空值*艦隊防空裝備定數A
        let kantaiKajuValue = tyku * getKantaiItem_A(type,itemid);
        // 艦隊防空裝備改修補正 = 艦隊防空裝備定數B*sqrt(★)
        let kaishuBonus = getKantaiItem_B(type,itemid) * Math.sqrt(alv);
        // 1スロット裝備の艦隊防空補正 = 艦隊防空加重對空值 + 艦隊防空裝備改修補正
        let slotKantaiAirBonus = kantaiKajuValue + kaishuBonus;
        // 1艦娘の艦隊防空補正 = ∑(1スロット裝備の艦隊防空補正)
        shipKantaiAirBonus += slotKantaiAirBonus;
      }
      // ∑(int(1艦娘の艦隊防空補正))
      kantaiAirBonus += Math.floor(shipKantaiAirBonus);
    }
  }
  // 艦隊防空補正 = int( 陣型補正*(∑(1艦娘の艦隊防空補正)) )
  kantaiAirBonus = Math.floor($('#formationBox').children().val() * kantaiAirBonus);
  $('#kantaiLabel').val(kantaiAirBonus);
  let shipNum = 0;
  let annihilationCnt = 0;
  let slotNum = $('#slotNumSpinner').val();
  // 加重対空値
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      let t_kaju = 'f' + i + 's' + j + 'kaju';
      let t_shotDownA = 'f' + i + 's' + j + 'shotDownA';
      let t_shotDownB = 'f' + i + 's' + j + 'shotDownB';
      let t_total = 'f' + i + 's' + j + 'total';
      let t_name = '#f' + i + 's' + j + 'name';
      let shipid = $(t_name).val();
      if(shipid > 0){
        let shipTyku = SHIP_DATA[shipid].tyku;
        let totalItemTyku = 0;
        let sum = 0;
        for(let k = 1;k <= 5;k++){
          let t_item = '#f' + i + 's' + j + 'item' + k;
          let t_alv = '#f' + i + 's' + j + 'item' + k + 'alv option:selected';
          let itemid = $(t_item).val();
          if(itemid <= 0) continue;
          let itemTyku = ITEM_DATA[itemid].tyku;
          let type = ITEM_DATA[itemid].type;
          let alv = $(t_alv).val()|0;
          // 艦船對空改修補正 = 裝備定數B*sqrt(★)
          let kaishuBonus = getKansenItem_B(type,itemTyku) * Math.sqrt(alv);
          totalItemTyku += itemTyku;
          // 裝備對空值*裝備定數A
          sum += itemTyku * getKansenItem_A(type) + kaishuBonus;
        }
        let isFriend = $('input[name=isFriend]:checked').val() === 'true';
        // 味方艦船加重對空值 = 素對空值 / 2 + ∑(裝備對空值*裝備定數A + 艦船對空改修補正)
        // 相手艦船加重對空值 = sqrt(素對空值 + 裝備對空值) + ∑(裝備對空值*裝備定數A + 艦船對空改修補正)
        let kaju = (isFriend ? (shipTyku / 2) : (Math.sqrt(shipTyku + totalItemTyku))) + sum;
        // 最終加重對空值 = (艦船加重對空值 + 艦隊防空補正)*基本定數*味方相手補正(0.8(味方の対空砲火) or 0.75(相手の対空砲火))
        let kajuTotal = (kaju + kantaiAirBonus) * AIR_BATTLE_FACTOR * (isFriend ? FRIEND_FACTOR : ENEMY_FACTOR);
        let taikuCIkind = $('#taiku_cutinBox').children().val();
        let factor = getTaikuCuinFactor(taikuCIkind,isFriend);
        // 擊墜數A = int( 最終加重對空值*((0 or 1)の一様な乱数)*対空カットイン定數C + 対空カットイン定數A )
        let minA = factor.A;
        let maxA = getA(kajuTotal,taikuCIkind,isFriend);
        // 擊墜數B = int( 0.02*基本定數*機數*艦船加重對空值*((0 or 1)の一様な乱数) + 対空カットイン定數B )
        let minB = factor.B;
        let maxB = getB(kaju,slotNum,taikuCIkind,isFriend);

        // 確率計算
        shipNum++;
        if((minA + minB) >= slotNum){
          annihilationCnt += 2 * 2;
        } else {
          if((maxA + minB) >= slotNum) annihilationCnt += 2;
          if((minA + maxB) >= slotNum) annihilationCnt += 2;
          if(!((maxA + minB) >= slotNum || (minA + maxB) >= slotNum) && (maxA + maxB) >= slotNum){
            annihilationCnt++;
          }
          if(maxA >= slotNum && maxB >= slotNum) annihilationCnt -= 2;
        }
        // 表示処理
        document.getElementById(t_kaju).innerHTML = (kajuTotal).toFixed(2);
        document.getElementById(t_shotDownA).innerHTML = minA + " - " + maxA;
        document.getElementById(t_shotDownB).innerHTML = minB + " - " + maxB;
        // 最終擊墜數 = 擊墜數A + 擊墜數B
        document.getElementById(t_total).innerHTML = (minA + minB) + " - " + (maxA + maxB);
      } else {
        // 表示処理
        document.getElementById(t_kaju).innerHTML = "0.00";
        document.getElementById(t_shotDownA).innerHTML = 0;
        document.getElementById(t_shotDownB).innerHTML = 0;
        document.getElementById(t_total).innerHTML = 0;
      }
    }
    let annihilationProbability = (slotNum > 0 && shipNum > 0) ? annihilationCnt / (shipNum * 2 * 2) * 100 : 100;
    $('#annihilationLabel').val(annihilationProbability.toFixed(2) + "%");
  }
}

function reset(no){
  for(let i = 1;i <= 6;i++){
    let target = '#f' + no + 's' + i + 'name';
    $(target).empty();
    $(target).val(0);
    let t_tyku = 'f' + no + 's' + i + 'tyku';
    document.getElementById(t_tyku).innerHTML = 0;
    for(let j = 1;j <= 5;j++){
      let t_item = '#f' + no + 's' + i + 'item' + j;
      $(t_item).empty();
      $(t_item).val(0);
    }
  }
  calc();
}

function initialize(){
  reset(1);
  reset(2);
  let nameSource;
  let itemSource;
  if($('input[name=isFriend]:checked').val() === 'true'){
    nameSource = '#friendShipDialog';
    itemSource = '#friendItemDialog';
  } else {
    nameSource = '#enemyShipDialog';
    itemSource = '#enemyItemDialog';
  }
  $('#formationBox').children().prop('selectedIndex', 0);
  $('#slotNumSpinner').val(0);
  $('#taiku_cutinBox').children().prop('selectedIndex', 0);
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      $('#f' + i + 's' + j + 'name').off('click');
      $('#f' + i + 's' + j + 'name').on( "click", function() {
        $(nameSource).dialog('close');
        $(nameSource).dialog('option', 'position', { my: 'left top', at: 'right bottom', of: $(this)});
        $(nameSource).attr('parent', '#f' + i + 's' + j + 'name');
        $(nameSource).dialog('open');
      });
      for(let k = 1;k <= 5;k++){
        $('#f' + i + 's' + j + 'item' + k).off('click');
        $('#f' + i + 's' + j + 'item' + k).on( "click", function() {
          $(itemSource).dialog('close');
          $(itemSource).dialog('option', 'position', { my: 'left top', at: 'right bottom', of: $(this)});
          $(itemSource).attr('parent', '#f' + i + 's' + j + 'item' + k);
          $(itemSource).dialog('open');
        });
      }
    }
  }
}

function parse(){
  /* 初期化 */
  $('input[name=isFriend]').val([true]);
  initialize();
  /* 解析 */
  var time = setInterval(function(){
    let json = $('#parseLabel').val();
    let object = JSON.parse(json);
    if(object['version'] == 4){
      for(let i = 1;i <= 2;i++){
        let fleet = object['f' + i];
        if(fleet === undefined) continue;
        for(let j = 1;j <= 6;j++){
          let ship = fleet['s' + j];
          if(ship === undefined) continue;
          let shipid = ship['id'];
          $('#f'+i+'s'+j+'name').val(shipid);
          $('#f'+i+'s'+j+'name').html('<img src="img/ship/'+shipid+'.png" width="160" height="40" title="'+shipid+':'+SHIP_DATA[shipid].name+' 対空:'+SHIP_DATA[shipid].tyku+'">');
          $('#f'+i+'s'+j+'tyku').val(SHIP_DATA[shipid].tyku);
          let items = ship['items'];
          for(let k = 1;k <= 4;k++){
            let item = items['i' + k];
            if(item === undefined) continue;
            let itemid = item['id'];
            let img = '<img src="img/itemicon/'+ITEM_DATA[itemid].type+'.png" width="30" height="30" style="float:left;margin-right:5px;">';
            let style = '<select id="f'+i+'s'+j+'item'+k+'alv'+'" style="color:#45A9A5"></select>';
            let alv = item['rf'];
            $('#f'+i+'s'+j+'item'+k).val(itemid);
            $('#f'+i+'s'+j+'item'+k).html(img+ITEM_DATA[itemid].name+' '+style);
            createAlvSelection(true,'#f'+i+'s'+j+'item'+k);
            $('#f'+i+'s'+j+'item'+k+'alv').val(alv);
            $('#f'+i+'s'+j+'item'+k+'alv').on("click",function(event){
              event.stopPropagation();
            });
          }
          let item = items['ix'];
          if(item === undefined) continue;
          let itemid = item['id'];
          let alv = item['rf'];
          $('#f'+i+'s'+j+'item5').val(itemid);
          $('#f'+i+'s'+j+'item5').html(img+ITEM_DATA[itemid].name+' '+style);
          createAlvSelection(true,'#f'+i+'s'+j+'item5');
          $('#f'+i+'s'+j+'item5alv').val(alv);
          $('#f'+i+'s'+j+'item5alv').on("click",function(event){
            event.stopPropagation();
          });
        }
      }
      calc();
      clearInterval(time);
    }
  },500);
}
