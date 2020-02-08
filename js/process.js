$(function () {
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 7; j++) {
      $('#f' + i + 's' + j + 'name').on("click", function () {
        $('#friendShipDialog').dialog('close');
        $('#friendShipDialog').dialog('option', 'position', {
          my: 'left center',
          at: 'right center',
          of: $(this)
        });
        $('#friendShipDialog').attr('parent', '#' + $(this).attr('id'));
        $('#friendShipDialog').dialog('open');
      });
      for (let k = 1; k <= 6; k++) {
        $('#f' + i + 's' + j + 'item' + k).on("click", function () {
          $('#friendItemDialog').dialog('close');
          $('#friendItemDialog').dialog('option', 'position', {
            my: 'left center',
            at: 'right center',
            of: $(this)
          });
          $('#friendItemDialog').attr('parent', '#' + $(this).attr('id'));
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

function setAACI() {
  const kind = Number($("#tyku_cutin").val());
  if (kind !== -1) {
    $("#aaciValueA").prop("disabled", true);
    $("#aaciValueB").prop("disabled", true);
    $("#aaciValueC").prop("disabled", true);
    if (kind !== 0) {
      $("#aaciValueA").val(TYKU_CUTIN[kind].A);
      $("#aaciValueB").val(TYKU_CUTIN[kind].B);
      $("#aaciValueC").val(TYKU_CUTIN[kind].C);
    } else {
      const camp = $("#isFriend").is(':checked') ? "FRIEND" : "ENEMY";
      $("#aaciValueA").val(TYKU_CUTIN[kind][camp].A);
      $("#aaciValueB").val(TYKU_CUTIN[kind][camp].B);
      $("#aaciValueC").val(TYKU_CUTIN[kind][camp].C);
    }
  } else {
    $("#aaciValueA").prop("disabled", false);
    $("#aaciValueB").prop("disabled", false);
    $("#aaciValueC").prop("disabled", false);
    $("#aaciValueA").val(1);
    $("#aaciValueB").val(0);
    $("#aaciValueC").val(1);
  }
}

// parent = #f1s1name
function setStatus(parent, shipid, isFriend) {
  let fleet = parent.substring(2, 3);
  let ship = parent.substring(4, 5);
  for (let i = 1; i <= 5; i++) {
    let itemid = SHIP_DATA[shipid]["i" + i];
    if (itemid === undefined || itemid === 0) {
      resetItem(fleet, ship, i);
    } else {
      setItem(fleet, ship, i, itemid, 0, isFriend);
    }
  }
  calc();
}

function setCombinedStatus(isCombined) {
  const isFriend = $('input[name=isFriend]:checked').val() === 'true';
  let formation = $('#formation').children('option:selected').attr('kc-id');
  //console.log(formation,isCombined)
  if (isCombined) {
    $('#isCombinedLabel').text("連合艦隊");
    if (isFriend) {
      $('#airRaid').css("display", "inline");
    }
    if (formation <= 10) {
      $("#formation").children('[kc-id=14]').prop('selected', true);
    }
    showCombinedFormation();
  } else {
    $('#isCombinedLabel').text("通常艦隊");
    $('#airRaid').css("display", "none");
    if (formation > 10) {
      $("#formation").children('[kc-id=1]').prop('selected', true);
    }
    showNormalFormation();
  }
}

function calc() {
  let isCombined = (function () {
    let isExist = [false, false];
    for (let i = 1; i <= 2; i++) {
      for (let j = 1; j <= 7; j++) {
        let t_name = '#f' + i + 's' + j + 'name';
        let shipid = $(t_name).val();
        if (shipid > 0) {
          isExist[i - 1] = true;
          break;
        }
      }
    }
    return (isExist[0] && isExist[1]);
  })();
  let isFriend = $('input[name=isFriend]:checked').val() === 'true';
  let isBrowser = $('#useBrowserCheckBox').prop('checked');
  // めんどいのでここで入れ替える
  setCombinedStatus(isCombined);
  let kantaiAirBonus = 0;
  // 艦隊防空値
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 7; j++) {
      let shipKantaiAirBonus = 0;
      let t_name = '#f' + i + 's' + j + 'name';
      let shipid = $(t_name).val();
      if (shipid <= 0) continue;
      for (let k = 1; k <= 6; k++) {
        let t_item = '#f' + i + 's' + j + 'item' + k;
        let t_alv = '#f' + i + 's' + j + 'item' + k + 'alv option:selected';
        let itemid = $(t_item).val();
        if (itemid <= 0) continue;
        let tyku = ITEM_DATA[itemid].tyku;
        if (tyku <= 0) continue;
        let alv = $(t_alv).val() | 0;
        let type = ITEM_DATA[itemid].type;
        // 艦隊防空加重對空值 = 裝備對空值*艦隊防空裝備定數A
        let kantaiKajuValue = tyku * getKantaiItem_A(type, itemid);
        // 艦隊防空裝備改修補正 = 艦隊防空裝備定數B*sqrt(★)
        let kaishuBonus = getKantaiItem_B(type, itemid) * Math.sqrt(alv);
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
  // ブラウザ版補正(1.3で割る)
  kantaiAirBonus = Math.floor($('#formation').val() * kantaiAirBonus / ((isBrowser && isFriend) ? 1.3 : 1.0));
  $('#kantaiLabel').val(kantaiAirBonus);
  let shipNum = 0;
  let annihilationCnt = 0;
  let slotNum = $('#slotNumSpinner').val();
  // 加重対空値
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 7; j++) {
      let t_kaju = 'f' + i + 's' + j + 'kaju';
      let t_shotDownA = 'f' + i + 's' + j + 'shotDownA';
      let t_shotDownB = 'f' + i + 's' + j + 'shotDownB';
      let t_proportionShotDown = 'f' + i + 's' + j + 'proportionShotDown';
      let t_fixedShotDown = 'f' + i + 's' + j + 'fixedShotDown';
      let t_guaranteedShotDown = 'f' + i + 's' + j + 'guaranteedShotDown';
      let t_total = 'f' + i + 's' + j + 'total';
      let t_name = '#f' + i + 's' + j + 'name';
      let shipid = $(t_name).val();
      if (shipid > 0) {
        let shipTyku = SHIP_DATA[shipid].tyku;
        let totalItemTyku = 0;
        let sum = 0;
        for (let k = 1; k <= 6; k++) {
          let t_item = '#f' + i + 's' + j + 'item' + k;
          let t_alv = '#f' + i + 's' + j + 'item' + k + 'alv option:selected';
          let itemid = $(t_item).val();
          if (itemid <= 0) continue;
          let itemTyku = ITEM_DATA[itemid].tyku;
          let type = ITEM_DATA[itemid].type;
          let alv = $(t_alv).val() | 0;
          // 艦船對空改修補正 = 裝備定數B*sqrt(★)
          let kaishuBonus = getKansenItem_B(type, itemTyku) * Math.sqrt(alv);
          totalItemTyku += itemTyku;
          // 裝備對空值*裝備定數A
          sum += itemTyku * getKansenItem_A(type) + kaishuBonus;
        }
        // 味方艦船加重對空值 = 素對空值 / 2 + ∑(裝備對空值*裝備定數A + 艦船對空改修補正)
        // 相手艦船加重對空值 = sqrt(素對空值 + 裝備對空值) + ∑(裝備對空值*裝備定數A + 艦船對空改修補正) ※変更
        // 相手艦船加重對空值 = int(sqrt(素對空值 + 裝備對空值)) + ∑(裝備對空值*裝備定數A + 艦船對空改修補正) ※ブラウザ版新補正
        let kaju = (isFriend ? (shipTyku / 2) : (isBrowser ? Math.floor(Math.sqrt(shipTyku + totalItemTyku)) : Math.sqrt(shipTyku + totalItemTyku))) + sum;
        // 最終加重對空值 = (艦船加重對空值 + 艦隊防空補正)*基本定數*味方相手補正(0.8(味方の対空砲火) or 0.75(相手の対空砲火))
        let kajuTotal = (kaju + kantaiAirBonus) * AIR_BATTLE_FACTOR * (isFriend ? FRIEND_FACTOR : ENEMY_FACTOR);
        const ciA = Number($("#aaciValueA").val());
        const ciB = Number($("#aaciValueB").val());
        const ciC = Number($("#aaciValueC").val());
        //console.log(kaju,tykuCIkind,kajuTotal)
        const isAirRaid = $('#isAirRaid').prop('checked');
        // 擊墜數A = int( 最終加重對空值*((0 or 1)の一様な乱数)*対空カットイン定數C + 対空カットイン定數A )
        const minA = ciA;
        const maxA = getA(kajuTotal, ciA, ciC, isFriend, isCombined, i, isAirRaid);
        // 擊墜數B = int( 0.02*基本定數*機數*艦船加重對空值*((0 or 1)の一様な乱数) + 対空カットイン定數B )
        const minB = ciB;
        const maxB = getB(kaju, slotNum, ciB, isFriend, isCombined, i, isAirRaid);
        // 割合撃墜
        const proportionShotDown = getProportion(kaju, isCombined, i, isFriend, isAirRaid);
        const proportionShotDownNum = getProportionNum(kaju, slotNum, isCombined, i, isFriend, isAirRaid);
        // 固定撃墜
        const fixedShotDown = getFixedNum(kajuTotal, ciC, isFriend, isCombined, i, isAirRaid);
        // 最低保証
        const guaranteedShotDown = getGuaranteedNum(ciA, ciB);

        // 確率計算
        shipNum++;
        if ((minA + minB) >= slotNum) {
          annihilationCnt += 2 * 2;
        } else {
          if ((maxA + minB) >= slotNum) annihilationCnt += 2;
          if ((minA + maxB) >= slotNum) annihilationCnt += 2;
          if (!((maxA + minB) >= slotNum || (minA + maxB) >= slotNum) && (maxA + maxB) >= slotNum) {
            annihilationCnt++;
          }
          if (maxA >= slotNum && maxB >= slotNum) annihilationCnt -= 2;
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

function reset(no) {
  for (let i = 1; i <= 7; i++) {
    resetShip(no, i);
  }
  calc();
}

function initialize() {
  reset(1);
  reset(2);
  let nameSource;
  let itemSource;
  if ($('input[name=isFriend]:checked').val() === 'true') {
    $("#aaciValueA").val(TYKU_CUTIN[0]["FRIEND"].A);
    $("#aaciValueB").val(TYKU_CUTIN[0]["FRIEND"].B);
    $("#aaciValueC").val(TYKU_CUTIN[0]["FRIEND"].C);
    nameSource = '#friendShipDialog';
    itemSource = '#friendItemDialog';
    $('.parseEnemy').hide();
    $('.parseFriend').show();
  } else {
    $("#aaciValueA").val(TYKU_CUTIN[0]["ENEMY"].A);
    $("#aaciValueB").val(TYKU_CUTIN[0]["ENEMY"].B);
    $("#aaciValueC").val(TYKU_CUTIN[0]["ENEMY"].C);
    nameSource = '#enemyShipDialog';
    itemSource = '#enemyItemDialog';
    $('.parseFriend').hide();
    $('.parseEnemy').show();
  }
  $('#formation').prop('selectedIndex', 0);
  // $('#slotNumSpinner').val(0);
  $('#tyku_cutin').prop('selectedIndex', 0);
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 7; j++) {
      $('#f' + i + 's' + j + 'name').off('click');
      $('#f' + i + 's' + j + 'name').on("click", function () {
        $(nameSource).dialog('close');
        $(nameSource).dialog('option', 'position', {
          my: 'left center',
          at: 'right center',
          of: $(this)
        });
        $(nameSource).attr('parent', '#' + $(this).attr('id'));
        $(nameSource).dialog('open');
      });
      for (let k = 1; k <= 6; k++) {
        $('#f' + i + 's' + j + 'item' + k).off('click');
        $('#f' + i + 's' + j + 'item' + k).on("click", function () {
          $(itemSource).dialog('close');
          $(itemSource).dialog('option', 'position', {
            my: 'left center',
            at: 'right center',
            of: $(this)
          });
          $(itemSource).attr('parent', '#' + $(this).attr('id'));
          $(itemSource).dialog('open');
        });
      }
    }
  }
}

function parseDeckFormat() {
  /* 初期化 */
  $('input[name=isFriend]').val([true]);
  initialize();
  /* 解析 */
  let time = setInterval(function () {
    let str = $('#parseDeckFormatLabel').val();
    let json = str.substring(str.indexOf('{'));
    let object = JSON.parse(json);
    if (object['version'] == 4) {
      for (let i = 1; i <= 2; i++) {
        let fleet = object['f' + i];
        if (fleet == null) continue;
        for (let j = 1; j <= 7; j++) {
          let ship = fleet['s' + j];
          if (ship == null) continue;
          let shipid = parseInt(ship['id']);
          setShip(i, j, shipid);
          let items = ship['items'];
          for (let k = 1; k <= 5; k++) {
            let item = items['i' + k];
            if (item == null) continue;
            let itemid = parseInt(item['id']);
            let alv = parseInt(item['rf']);
            setItem(i, j, k, itemid, alv, true);
          }
          let item = items['ix'];
          if (item == null) continue;
          let itemid = parseInt(item['id']);
          if (itemid == null) continue;
          let alv = parseInt(item['rf']);
          setItem(i, j, 6, itemid, alv, true);
        }
      }
      calc();
      clearInterval(time);
    }
  }, 500);
}

function parseID() {
  /* 初期化 */
  $('input[name=isFriend]').val([false]);
  initialize();
  /* 解析 */
  let time = setInterval(function () {
    let ids = toHalfWidth($('#parseIDLabel').val()).split(/\D/);
    for (let i = 1; i <= 2; i++) {
      for (let j = 1; j <= 6; j++) {
        if ((i - 1) * 6 + j - 1 >= ids.length) break;
        let shipid = ids[(i - 1) * 6 + j - 1];
        if (shipid == "") continue;
        setShip(i, j, shipid);
        setStatus('#f' + i + 's' + j, shipid, false);
      }
      calc();
      clearInterval(time);
    }
  }, 500);
}

function toHalfWidth(value) {
  return value.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
    return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
  });
}

function parseName(names, shouldCalc) {
  if (shouldCalc === null) shouldCalc = true;
  /* 初期化 */
  $('input[name=isFriend]').val([false]);
  initialize();
  /* 解析 */
  //let names = $('#parseNameLabel').val().split(/[、,\,]/);
  for (let i = 1; i <= 2; i++) {
    for (let j = 1; j <= 6; j++) {
      if ((i - 1) * 6 + j - 1 >= names.length) break;
      let name = names[(i - 1) * 6 + j - 1];
      if (name == "") continue;
      let shipid = findID(name);
      setShip(i, j, shipid);
      setStatus('#f' + i + 's' + j, shipid, false);
    }
    if (shouldCalc) calc();
  }
}

function findID(t) {
  let matchList = {
    0: 0
  };
  let target = String(t.replace(/[\s,\?,(,),\*\d,　]/g, ""));
  for (let shipid in SHIP_DATA) {
    if (shipid <= 500) continue;
    let name = SHIP_DATA[shipid].name.replace(/[\s,\?,\*\d,　]/g, "");
    let kind = name.substring(name.indexOf('(')).replace(/[(,)]/g, "").split(/[/]/g);
    for (let k in kind) {
      let tmpName = name.replace(/\(.*\)/g, kind[k]);
      let count = 0;
      if (tmpName == target) return shipid;
      for (let i = 0; i < tmpName.length; i++) {
        for (let j = 0; j < target.length; j++) {
          if (tmpName.charAt(i) == target.charAt(j)) {
            count++;
            break;
          }
        }
      }
      matchList[shipid] = (matchList[shipid] !== undefined && matchList[shipid] > count) ? matchList[shipid] : count;
    }
  }
  let maxMatchIndex = 0;
  for (let shipid in matchList) {
    if (matchList[shipid] > matchList[maxMatchIndex] || (shipid !== 0 && maxMatchIndex !== 0 && matchList[shipid] === matchList[maxMatchIndex] && SHIP_DATA[maxMatchIndex].name.length > SHIP_DATA[shipid].name.length)) {
      maxMatchIndex = shipid;
    }
  }
  return maxMatchIndex;
}

function changeShowRow() {
  for (let i = 1; i <= 2; i++) {
    if ($('input[name=isShowUsualRow]:checked').val() === 'true') {
      $('#f' + i + 'shotDownAheader').hide();
      $('#f' + i + 'shotDownBheader').hide();
      $('#f' + i + 'proportionShotDownHeader').show();
      $('#f' + i + 'fixedShotDownHeader').show();
      $('#f' + i + 'guaranteedShotDownHeader').show();
      for (let j = 1; j <= 7; j++) {
        $('#f' + i + 's' + j + 'shotDownA').hide();
        $('#f' + i + 's' + j + 'shotDownB').hide();
        $('#f' + i + 's' + j + 'proportionShotDown').show();
        $('#f' + i + 's' + j + 'fixedShotDown').show();
        $('#f' + i + 's' + j + 'guaranteedShotDown').show();
      }
    } else {
      $('#f' + i + 'shotDownAheader').show();
      $('#f' + i + 'shotDownBheader').show();
      $('#f' + i + 'proportionShotDownHeader').hide();
      $('#f' + i + 'fixedShotDownHeader').hide();
      $('#f' + i + 'guaranteedShotDownHeader').hide();
      for (let j = 1; j <= 7; j++) {
        $('#f' + i + 's' + j + 'shotDownA').show();
        $('#f' + i + 's' + j + 'shotDownB').show();
        $('#f' + i + 's' + j + 'proportionShotDown').hide();
        $('#f' + i + 's' + j + 'fixedShotDown').hide();
        $('#f' + i + 's' + j + 'guaranteedShotDown').hide();
      }
    }
  }
}

function setShip(i, j, shipid) {
  $('#f' + i + 's' + j + 'name').val(shipid);
  $('#f' + i + 's' + j + 'name').html('<img src="https://www.nishikuma.net/ImgKCbuilder/static/ship/banner/' + shipid + '.png" width="160" height="40" title="' + shipid + ':' + SHIP_DATA[shipid].name + ' 対空:' + SHIP_DATA[shipid].tyku + '">');
  $('#f' + i + 's' + j + 'tyku').text(SHIP_DATA[shipid].tyku);
}

function resetShip(i, j) {
  $('#f' + i + 's' + j + 'name').empty();
  $('#f' + i + 's' + j + 'name').val(0);
  $('#f' + i + 's' + j + 'tyku').text(0);
  for (let k = 1; k <= 6; k++) {
    resetItem(i, j, k);
  }
}

function setItem(i, j, k, itemid, alv, isFriend) {
  let img = '<img src="img/itemicon/' + ITEM_DATA[itemid].type + '.png" width="30" height="30" style="float:left;margin-right:5px;">';
  $('#f' + i + 's' + j + 'item' + k).val(itemid);
  $('#f' + i + 's' + j + 'item' + k).attr('title', "対空+" + ITEM_DATA[itemid].tyku);
  if (isFriend) {
    let style = '<select id="f' + i + 's' + j + 'item' + k + 'alv' + '" style="color:#45A9A5"></select>';
    $('#f' + i + 's' + j + 'item' + k).html(img + ITEM_DATA[itemid].name + ' ' + style);
    /* 改修度部分 */
    let selectBox = ["", "★+1", "★+2", "★+3", "★+4", "★+5", "★+6", "★+7", "★+8", "★+9", "★max"];
    for (let l = 0; l < selectBox.length; l++) {
      let option = document.createElement('option');
      option.setAttribute('value', l);
      option.innerHTML = selectBox[l];
      $('#f' + i + 's' + j + 'item' + k + 'alv').append(option);
    }
    $('#f' + i + 's' + j + 'item' + k + 'alv').val(alv);
    $('#f' + i + 's' + j + 'item' + k + 'alv').on("click", function (event) {
      event.stopPropagation();
    });
    $('#f' + i + 's' + j + 'item' + k + 'alv').on('change', function (event) {
      calc();
    });
  } else {
    $('#f' + i + 's' + j + 'item' + k).html(img + ITEM_DATA[itemid].name);
  }
}

function resetItem(i, j, k) {
  $('#f' + i + 's' + j + 'item' + k).empty();
  $('#f' + i + 's' + j + 'item' + k).val(0);
}

function showCombinedFormation() {
  $("#formation").children('[kc-id=1]').prop('disabled', true);
  $("#formation").children('[kc-id=2]').prop('disabled', true);
  $("#formation").children('[kc-id=3]').prop('disabled', true);
  $("#formation").children('[kc-id=4]').prop('disabled', true);
  $("#formation").children('[kc-id=5]').prop('disabled', true);
  $("#formation").children('[kc-id=6]').prop('disabled', true);
  $("#formation").children('[kc-id=11]').prop('disabled', false);
  $("#formation").children('[kc-id=12]').prop('disabled', false);
  $("#formation").children('[kc-id=13]').prop('disabled', false);
  $("#formation").children('[kc-id=14]').prop('disabled', false);
  $("#formation").children('[kc-id=1]').hide();
  $("#formation").children('[kc-id=2]').hide();
  $("#formation").children('[kc-id=3]').hide();
  $("#formation").children('[kc-id=4]').hide();
  $("#formation").children('[kc-id=5]').hide();
  $("#formation").children('[kc-id=6]').hide();
  $("#formation").children('[kc-id=11]').show();
  $("#formation").children('[kc-id=12]').show();
  $("#formation").children('[kc-id=13]').show();
  $("#formation").children('[kc-id=14]').show();
}

function showNormalFormation() {
  $("#formation").children('[kc-id=1]').prop('disabled', false);
  $("#formation").children('[kc-id=2]').prop('disabled', false);
  $("#formation").children('[kc-id=3]').prop('disabled', false);
  $("#formation").children('[kc-id=4]').prop('disabled', false);
  $("#formation").children('[kc-id=5]').prop('disabled', false);
  $("#formation").children('[kc-id=6]').prop('disabled', false);
  $("#formation").children('[kc-id=11]').prop('disabled', true);
  $("#formation").children('[kc-id=12]').prop('disabled', true);
  $("#formation").children('[kc-id=13]').prop('disabled', true);
  $("#formation").children('[kc-id=14]').prop('disabled', true);
  $("#formation").children('[kc-id=1]').show();
  $("#formation").children('[kc-id=2]').show();
  $("#formation").children('[kc-id=3]').show();
  $("#formation").children('[kc-id=4]').show();
  $("#formation").children('[kc-id=5]').show();
  $("#formation").children('[kc-id=6]').show();
  $("#formation").children('[kc-id=11]').hide();
  $("#formation").children('[kc-id=12]').hide();
  $("#formation").children('[kc-id=13]').hide();
  $("#formation").children('[kc-id=14]').hide();
}
