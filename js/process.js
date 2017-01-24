$(function(){
  $('#formationBox').load('formation.html');
  $('#tyku_cutinBox').load('tyku_cutin.html');
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
      document.getElementById('f' + i + 's' + j + 'proportionShotDown').innerHTML = "0 (0%)";
      document.getElementById('f' + i + 's' + j + 'fixedShotDown').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'guaranteedShotDown').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'total').innerHTML = 0;
    }
  }
  changeShowRow();
  setCombinedStatus(false);
  $('.parseEnemy').hide();
});

// parent = #f1s1name
function setStatus(parent,shipid,isFriend){
  let fleet = parent.substring(2,3);
  let ship = parent.substring(4,5);
  for(let i = 1;i <= 5;i++){
    let itemid = SHIP_DATA[shipid]["i"+i];
    if(itemid === undefined || itemid === 0){
      resetItem(fleet,ship,i);
    } else {
      setItem(fleet,ship,i,itemid,0,isFriend);
    }
  }
  calc();
}

function setCombinedStatus(isCombined){
  let formation = $('#formationBox').children().children('option:selected').attr('kc-id');
  if(isCombined){
    $('#isCombinedLabel').text("連合艦隊");
    if(formation <= 10){
      $("#formationBox").children().children('[kc-id=14]').prop('selected', true);
    }
    showCombinedFormation();
  } else {
    $('#isCombinedLabel').text("通常艦隊");
    if(formation > 10){
      $("#formationBox").children().children('[kc-id=1]').prop('selected', true);
    }
    showNormalFormation();
  }
}

function calc(){
  let isCombined = (function(){
    let isExist = [false,false];
    for(let i = 1;i <= 2;i++){
      for(let j = 1;j <= 6;j++){
        let t_name = '#f' + i + 's' + j + 'name';
        let shipid = $(t_name).val();
        if(shipid > 0){
          isExist[i-1] = true;
          break;
        }
      }
    }
    return (isExist[0] && isExist[1]);
  })();
  // めんどいのでここで入れ替える
  setCombinedStatus(isCombined);
  let kantaiAirBonus = 0;
  // 艦隊防空値
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      let shipKantaiAirBonus = 0;
      let t_name = '#f' + i + 's' + j + 'name';
      let shipid = $(t_name).val();
      if(shipid <= 0) continue;
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
      let t_proportionShotDown = 'f' + i + 's' + j + 'proportionShotDown';
      let t_fixedShotDown = 'f' + i + 's' + j + 'fixedShotDown';
      let t_guaranteedShotDown = 'f' + i + 's' + j + 'guaranteedShotDown';
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
        let tykuCIkind = $('#tyku_cutinBox').children().val();
        let factor = getTykuCuinFactor(tykuCIkind,isFriend);
        // 擊墜數A = int( 最終加重對空值*((0 or 1)の一様な乱数)*対空カットイン定數C + 対空カットイン定數A )
        let minA = factor.A;
        let maxA = getA(kajuTotal,tykuCIkind,isFriend,isCombined,i);
        // 擊墜數B = int( 0.02*基本定數*機數*艦船加重對空值*((0 or 1)の一様な乱数) + 対空カットイン定數B )
        let minB = factor.B;
        let maxB = getB(kaju,slotNum,tykuCIkind,isFriend,isCombined,i);
        // 割合撃墜
        let proportionShotDown = getProportion(kaju,isCombined,i);
        let proportionShotDownNum = getProportionNum(kaju,slotNum,isCombined,i);
        // 固定撃墜
        let fixedShotDown = getFixedNum(kajuTotal,tykuCIkind,isFriend,isCombined,i);
        // 最低保証
        let guaranteedShotDown = getGuaranteedNum(tykuCIkind,isFriend);

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
        document.getElementById(t_proportionShotDown).innerHTML = proportionShotDownNum + " (" + (proportionShotDown * 100).toFixed(2) + "%)";
        document.getElementById(t_fixedShotDown).innerHTML = fixedShotDown;
        document.getElementById(t_guaranteedShotDown).innerHTML = guaranteedShotDown;
        // 最終擊墜數 = 擊墜數A + 擊墜數B
        document.getElementById(t_total).innerHTML = (minA + minB) + " - " + (maxA + maxB);
      } else {
        // 表示処理
        document.getElementById(t_kaju).innerHTML = "0.00";
        document.getElementById(t_shotDownA).innerHTML = 0;
        document.getElementById(t_shotDownB).innerHTML = 0;
        document.getElementById(t_proportionShotDown).innerHTML = "0 (0%)";
        document.getElementById(t_fixedShotDown).innerHTML = 0;
        document.getElementById(t_guaranteedShotDown).innerHTML = 0;
        document.getElementById(t_total).innerHTML = 0;
      }
    }
    let annihilationProbability = (slotNum > 0 && shipNum > 0) ? annihilationCnt / (shipNum * 2 * 2) * 100 : 100;
    $('#annihilationLabel').val(annihilationProbability.toFixed(2) + "%");
  }
}

function reset(no){
  for(let i = 1;i <= 6;i++){
    resetShip(no,i);
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
    $('.parseEnemy').hide();
    $('.parseFriend').show();
  } else {
    nameSource = '#enemyShipDialog';
    itemSource = '#enemyItemDialog';
    $('.parseFriend').hide();
    $('.parseEnemy').show();
  }
  $('#formationBox').children().prop('selectedIndex', 0);
  $('#slotNumSpinner').val(0);
  $('#tyku_cutinBox').children().prop('selectedIndex', 0);
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

function parseDeckFormat(){
  /* 初期化 */
  $('input[name=isFriend]').val([true]);
  initialize();
  /* 解析 */
  let time = setInterval(function(){
    let str = $('#parseDeckFormatLabel').val();
    let json = str.substring(str.indexOf('{'));
    let object = JSON.parse(json);
    if(object['version'] == 4){
      for(let i = 1;i <= 2;i++){
        let fleet = object['f' + i];
        if(fleet === undefined) continue;
        for(let j = 1;j <= 6;j++){
          let ship = fleet['s' + j];
          if(ship === undefined) continue;
          let shipid = ship['id'];
          setShip(i,j,shipid);
          let items = ship['items'];
          for(let k = 1;k <= 4;k++){
            let item = items['i' + k];
            if(item === undefined) continue;
            let itemid = item['id'];
            let alv = item['rf'];
            setItem(i,j,k,itemid,alv,true);
          }
          let item = items['ix'];
          if(item === undefined) continue;
          let itemid = item['id'];
          let alv = item['rf'];
          setItem(i,j,5,itemid,alv,true);
        }
      }
      calc();
      clearInterval(time);
    }
  },500);
}

function parseID(){
  /* 初期化 */
  $('input[name=isFriend]').val([false]);
  initialize();
  /* 解析 */
  let time = setInterval(function(){
    let ids = toHalfWidth($('#parseIDLabel').val()).split(/\D/);
    for(let i = 1;i <= 2;i++){
      for(let j = 1;j <= 6;j++){
        if((i-1)*6+j-1>=ids.length) break;
        let shipid = ids[(i-1)*6+j-1];
        if(shipid=="") continue;
        setShip(i,j,shipid);
        setStatus('#f'+i+'s'+j,shipid,false);
      }
      calc();
      clearInterval(time);
    }
  },500);
}

function toHalfWidth(value) {
  return value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s){
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}

function parseName(){
  /* 初期化 */
  $('input[name=isFriend]').val([false]);
  initialize();
  /* 解析 */
  let time = setInterval(function(){
    let names = $('#parseNameLabel').val().split(/[、,\,]/);
    for(let i = 1;i <= 2;i++){
      for(let j = 1;j <= 6;j++){
        if((i-1)*6+j-1>=names.length) break;
        let name = names[(i-1)*6+j-1];
        if(name=="") continue;
        let shipid = searchID(name);
        setShip(i,j,shipid);
        setStatus('#f'+i+'s'+j,shipid,false);
      }
      calc();
      clearInterval(time);
    }
  },500);
}

function searchID(t){
  let matchList = {0:0};
  let target = String(t.replace(/[\s,\?,(,),\*\d,　]/g,""));
  for(let shipid in SHIP_DATA){
    if(shipid <= 500) continue;
    let name = SHIP_DATA[shipid].name.replace(/[\s,\?,\*\d,　]/g,"");
    let kind = name.substring(name.indexOf('(')).replace(/[(,)]/g,"").split(/[/]/g);
    for(let k in kind){
      let tmpName = name.replace(/\(.*\)/g,kind[k]);
      let count = 0;
      if(tmpName == target) return shipid;
      for(let i = 0;i < tmpName.length;i++){
        for(let j = 0;j < target.length;j++){
          if(tmpName.charAt(i) == target.charAt(j)){
            count++;
            break;
          }
        }
      }
      matchList[shipid] = (matchList[shipid] !== undefined && matchList[shipid] > count) ? matchList[shipid] : count;
    }
  }
  let maxIndex = 0;
  for(let shipid in matchList){
    if(matchList[shipid] > matchList[maxIndex] || (shipid !== 0 && maxIndex !== 0 && matchList[shipid] === matchList[maxIndex] && SHIP_DATA[maxIndex].name.length > SHIP_DATA[shipid].name.length)){
      maxIndex = shipid;
    }
  }
  return maxIndex;
}

function changeShowRow(){
  for(let i = 1;i <= 2;i++){
    if($('input[name=isShowUsualRow]:checked').val() === 'true'){
      $('#f'+i+'shotDownAheader').hide();
      $('#f'+i+'shotDownBheader').hide();
      $('#f'+i+'proportionShotDownHeader').show();
      $('#f'+i+'fixedShotDownHeader').show();
      $('#f'+i+'guaranteedShotDownHeader').show();
      for(let j = 1;j <= 6;j++){
        $('#f'+i+'s'+j+'shotDownA').hide();
        $('#f'+i+'s'+j+'shotDownB').hide();
        $('#f'+i+'s'+j+'proportionShotDown').show();
        $('#f'+i+'s'+j+'fixedShotDown').show();
        $('#f'+i+'s'+j+'guaranteedShotDown').show();
      }
    } else {
      $('#f'+i+'shotDownAheader').show();
      $('#f'+i+'shotDownBheader').show();
      $('#f'+i+'proportionShotDownHeader').hide();
      $('#f'+i+'fixedShotDownHeader').hide();
      $('#f'+i+'guaranteedShotDownHeader').hide();
      for(let j = 1;j <= 6;j++){
        $('#f'+i+'s'+j+'shotDownA').show();
        $('#f'+i+'s'+j+'shotDownB').show();
        $('#f'+i+'s'+j+'proportionShotDown').hide();
        $('#f'+i+'s'+j+'fixedShotDown').hide();
        $('#f'+i+'s'+j+'guaranteedShotDown').hide();
      }
    }
  }
}

function setShip(i,j,shipid){
  $('#f'+i+'s'+j+'name').val(shipid);
  $('#f'+i+'s'+j+'name').html('<img src="img/ship/'+shipid+'.png" width="160" height="40" title="'+shipid+':'+SHIP_DATA[shipid].name+' 対空:'+SHIP_DATA[shipid].tyku+'">');
  $('#f'+i+'s'+j+'tyku').text(SHIP_DATA[shipid].tyku);
}

function resetShip(i,j){
  $('#f'+i+'s'+j+'name').empty();
  $('#f'+i+'s'+j+'name').val(0);
  $('#f'+i+'s'+j+'tyku').text(0);
  for(let k = 1;k <= 5;k++){
    resetItem(i,j,k);
  }
}

function setItem(i,j,k,itemid,alv,isFriend){
  let img = '<img src="img/itemicon/'+ITEM_DATA[itemid].type+'.png" width="30" height="30" style="float:left;margin-right:5px;">';
  $('#f'+i+'s'+j+'item'+k).val(itemid);
  $('#f'+i+'s'+j+'item'+k).attr('title',"対空+"+ITEM_DATA[itemid].tyku);
  if(isFriend){
    let style = '<select id="f'+i+'s'+j+'item'+k+'alv'+'" style="color:#45A9A5"></select>';
    $('#f'+i+'s'+j+'item'+k).html(img+ITEM_DATA[itemid].name+' '+style);
    /* 改修度部分 */
    let selectBox = ["","★+1","★+2","★+3","★+4","★+5","★+6","★+7","★+8","★+9","★max"];
    for(let l = 0;l < selectBox.length;l++){
      let option = document.createElement('option');
      option.setAttribute('value', l);
      option.innerHTML = selectBox[l];
      $('#f'+i+'s'+j+'item'+k+'alv').append(option);
    }
    $('#f'+i+'s'+j+'item'+k+'alv').val(alv);
    $('#f'+i+'s'+j+'item'+k+'alv').on("click",function(event){ event.stopPropagation(); });
    $('#f'+i+'s'+j+'item'+k+'alv').on('change',function(event){ calc(); });
  } else {
    $('#f'+i+'s'+j+'item'+k).html(img+ITEM_DATA[itemid].name);
  }
}

function resetItem(i,j,k){
  $('#f'+i+'s'+j+'item'+k).empty();
  $('#f'+i+'s'+j+'item'+k).val(0);
}

function showCombinedFormation(){
  $("#formationBox").children().children('[kc-id=1]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=2]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=3]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=4]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=5]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=11]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=12]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=13]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=14]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=1]').hide();
  $("#formationBox").children().children('[kc-id=2]').hide();
  $("#formationBox").children().children('[kc-id=3]').hide();
  $("#formationBox").children().children('[kc-id=4]').hide();
  $("#formationBox").children().children('[kc-id=5]').hide();
  $("#formationBox").children().children('[kc-id=11]').show();
  $("#formationBox").children().children('[kc-id=12]').show();
  $("#formationBox").children().children('[kc-id=13]').show();
  $("#formationBox").children().children('[kc-id=14]').show();
}

function showNormalFormation(){
  $("#formationBox").children().children('[kc-id=1]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=2]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=3]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=4]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=5]').prop('disabled', false);
  $("#formationBox").children().children('[kc-id=11]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=12]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=13]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=14]').prop('disabled', true);
  $("#formationBox").children().children('[kc-id=1]').show();
  $("#formationBox").children().children('[kc-id=2]').show();
  $("#formationBox").children().children('[kc-id=3]').show();
  $("#formationBox").children().children('[kc-id=4]').show();
  $("#formationBox").children().children('[kc-id=5]').show();
  $("#formationBox").children().children('[kc-id=11]').hide();
  $("#formationBox").children().children('[kc-id=12]').hide();
  $("#formationBox").children().children('[kc-id=13]').hide();
  $("#formationBox").children().children('[kc-id=14]').hide();
}