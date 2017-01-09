$(function(){
  $('#formationBox').load('formation.html');
  $('#taiku_cutinBox').load('taiku_cutin.html');
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      $('#f' + i + 's' + j + 'name').load('name_f.html');
      $('#f' + i + 's' + j + 'name').change(i * 10 + j,setStatus);
      $('#f' + i + 's' + j + 'name').change(calc);
      for(let k = 1;k <= 5;k++){
        $('#f' + i + 's' + j + 'item' + k).load('item_f.html');
        $('#f' + i + 's' + j + 'item' + k).change(i * 100 + j * 10 + k,resetAlv);
        $('#f' + i + 's' + j + 'item' + k + 'alv').load('alv.html');
        $('#f' + i + 's' + j + 'item' + k + 'alv').change(calc);
      }
      document.getElementById('f' + i + 's' + j + 'tyku').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'kaju').innerHTML = "0.00";
      document.getElementById('f' + i + 's' + j + 'shotDownA').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'shotDownB').innerHTML = 0;
      document.getElementById('f' + i + 's' + j + 'total').innerHTML = 0;
    }
  }
});

function setStatus(e){
  let fleet = Math.floor(e.data / 10);
  let ship = e.data % 10;
  let target = '#f' + fleet + 's' + ship + 'name option:selected';
  let t_tyku = 'f' + fleet + 's' + ship + 'tyku';
  let tyku = $(target).data('tyku');
  document.getElementById(t_tyku).innerHTML = tyku;
  for(let i = 1;i <= 5;i++){
    let t_item = '#f' + fleet + 's' + ship + 'item' + i;
    let t_item_alv = '#f' + no + 's' + i + 'item' + j + 'alv';
    let item = $(target).data('i' + i);
    $(t_item).children('[name=item]').val(item);
    $(t_item_alv).children().val(0);
  }
}

function calc(e){
  let kantaiAirBonus = 0;
  // 艦隊防空値
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      for(let k = 1;k <= 5;k++){
        let t_item = '#f' + i + 's' + j + 'item' + k + ' option:selected';
        let t_alv = '#f' + i + 's' + j + 'item' + k + 'alv option:selected';
        let id = $(t_item).val();
        let tyku = $(t_item).data('tyku');
        let alv = $(t_alv).val();
        if(tyku <= 0) continue;
        let type = $(t_item).data('type');
        // 艦隊防空加重對空值 = 裝備對空值*艦隊防空裝備定數A
        let kantaiKajuValue = tyku * getKantaiItem_A(type,id);
        // 艦隊防空裝備改修補正 = 艦隊防空裝備定數B*sqrt(★)
        let kaishuBonus = getKantaiItem_B(type,id) * Math.sqrt(alv);
        // 1スロット裝備の艦隊防空補正 = int(艦隊防空加重對空值 + 艦隊防空裝備改修補正)
        kantaiAirBonus += Math.floor(kantaiKajuValue + kaishuBonus);
      }
    }
  }
  // 艦隊防空補正 = int( 陣型補正*(int(∑(1スロット裝備の艦隊防空補正))) )
  kantaiAirBonus = Math.floor($('#formationBox').children().val() * Math.floor(kantaiAirBonus));
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
      let t_name = '#f' + i + 's' + j + 'name option:selected';
      let shipTyku = $(t_name).data('tyku');
      let totalItemTyku = 0;
      let sum = 0;
      for(let k = 1;k <= 5;k++){
        let t_item = '#f' + i + 's' + j + 'item' + k + ' option:selected';
        let t_alv = '#f' + i + 's' + j + 'item' + k + 'alv option:selected';
        let itemTyku = $(t_item).data('tyku');
        let type = $(t_item).data('type');
        let alv = $(t_alv).val();
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
      // 擊墜數A = int( 最終加重對空值*((0 or 1)の一様な乱数)*対空カットイン定數C + 対空カットイン定數A )
      let a = getA(kajuTotal,taikuCIkind,isFriend);
      // 擊墜數B = int( 0.02*基本定數*機數*艦船加重對空值*((0 or 1)の一様な乱数) + 対空カットイン定數B )
      let b = getB(kaju,slotNum,taikuCIkind,isFriend);
      if($(t_name).val() != -1){
        shipNum++;
        if(a >= slotNum) annihilationCnt += 2;
        if(b >= slotNum) annihilationCnt += 2;
        if(!(a >= slotNum || b >= slotNum) && (a + b) >= slotNum){
          annihilationCnt++;
        }
        document.getElementById(t_kaju).innerHTML = (kajuTotal).toFixed(2);
        document.getElementById(t_shotDownA).innerHTML = a;
        document.getElementById(t_shotDownB).innerHTML = b;
        // 最終擊墜數 = 擊墜數A + 擊墜數B
        document.getElementById(t_total).innerHTML = a + b;
      } else {
        document.getElementById(t_kaju).innerHTML = "0.00";
        document.getElementById(t_shotDownA).innerHTML = 0;
        document.getElementById(t_shotDownB).innerHTML = 0;
        document.getElementById(t_total).innerHTML = 0;
      }
    }
    let annihilationProbability = slotNum > 0 && shipNum > 0 ? annihilationCnt / (shipNum * 2 * 2) * 100 : 100;
    $('#annihilationLabel').val(annihilationProbability.toFixed(2) + "%");
  }
}

function reset(no){
  for(let i = 1;i <= 6;i++){
    let target = '#f' + no + 's' + i + 'name';
    $(target).children('[name=name]').val(-1);
    let t_tyku = 'f' + no + 's' + i + 'tyku';
    document.getElementById(t_tyku).innerHTML = 0;
    for(let j = 1;j <= 5;j++){
      let t_item = '#f' + no + 's' + i + 'item' + j;
      let t_item_alv = '#f' + no + 's' + i + 'item' + j + 'alv';
      $(t_item).children('[name=item]').val(-1);
      $(t_item_alv).children().val(0);
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
    nameSource = 'name_f.html';
    itemSource = 'item_f.html';
  } else {
    nameSource = 'name_e.html';
    itemSource = 'item_e.html';
  }
  $('#formationBox').children().prop('selectedIndex', 0);
  $('#slotNumSpinner').val(0);
  $('#taiku_cutinBox').children().prop('selectedIndex', 0);
  for(let i = 1;i <= 2;i++){
    for(let j = 1;j <= 6;j++){
      $('#f' + i + 's' + j + 'name').load(nameSource);
      $('#f' + i + 's' + j + 'name').change(i * 10 + j,setStatus);
      $('#f' + i + 's' + j + 'name').change(calc);
      for(let k = 1;k <= 5;k++){
        $('#f' + i + 's' + j + 'item' + k).load(itemSource);
        $('#f' + i + 's' + j + 'item' + k).change(calc);
      }
    }
  }
}

function resetAlv(e){
  let fleet = Math.floor(e.data / 100);
  let ship = Math.floor(e.data / 10) % 10;
  let item = e.data % 10;
  let target = '#f' + fleet + 's' + ship + 'item' + item + 'alv';
  $(target).children().val(0);
  calc();
}