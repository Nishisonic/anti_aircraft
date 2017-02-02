// mapdata[海域Area(1)][海域No(1)][セル(A)][パターン(1)][編成or陣形orボス]
// mapdata[海域Area(1)][海域No(1)][セル(A)][難易度(甲)][パターン(1)][編成or陣形orボス]
let mapdata = {0:{}};
const FILTER_PATTERN = /燃料|弾薬|鋼材|ボーキ|回避|編成|？/;

function getDifficultyID(name){
  switch(name){
    case "甲":return 1;
    case "乙":return 2;
    case "丙":return 3;
    default  :return 0;
  }
}

const AREA_NAMES = {
  0:["<海域を選択して下さい>",false], // 6
  1:["鎮守府海域",false], // 6
  2:["南西諸島海域",false], // 5
  3:["北方海域",false], // 5
  4:["西方海域",false], // 5
  5:["南方海域",false], // 5
  6:["中部海域",false], // 5
  22:["敵艦隊前線泊地殴り込み",false], // 4
  23:["南方海域強襲偵察！",false], // 4
  24:["決戦！鉄底海峡を抜けて！",false], // 5
  25:["迎撃！霧の艦隊",false], // 3
  26:["索敵機、発艦始め！",false], // 5
  27:["AL作戦／MI作戦",false], // 6
  28:["発動！渾作戦",false], // 4
  29:["迎撃！トラック泊地強襲",false], // 5
  30:["発令！第十一号作戦",false], // 6
  31:["反撃！第二次SN作戦",true], // 7
  32:["突入！海上輸送作戦",false], // 5
  33:["出撃！礼号作戦",false], // 3
  34:["開設！基地航空隊",true], // 7
  35:["迎撃！第二次マレー沖海戦",false], // 4
  36:["発令！「艦隊作戦第三法」",false], // 5
};

function loadWikiData(areaIdx){
  loadWikiHtmlAsync(areaIdx,AREA_NAMES[areaIdx][1]);
  //return JSON.parse(JSON.stringify((areaIdx ? _getWikiData(areaIdx,AREA_NAMES[areaIdx][1]) : mapdata)));
}

function parseHtml(areaIdx,isExtend,responseText){
  mapdata[areaIdx] = {};
  let html = new DOMParser().parseFromString(responseText,"text/html");
  let tables = html.getElementById('body').getElementsByTagName('table');
  let no = isExtend ? 5 : 1; // gbgb
  for(let i = 0;i < tables.length;i++){
    /* 海域抽出 */
    let tbody = tables[i].getElementsByTagName('tbody')[0];
    let tbodyText = tbody.innerText.replace(/\s/g,"");
    if(!tbodyText.match(/(難易度)?出現場所(戦闘開始時の司令(L|l)v|難易度)?パターン(海域EXP)?出現艦船陣形敵制空値優勢確保/)) continue;
    /* 振り分け パターン1[出現場所,パターン,出現艦船,陣形,敵制空値,優勢,確保] */
    if(tbodyText.match(/出現場所パターン出現艦船陣形敵制空値優勢確保/)){
      mapdata[areaIdx][no] = {};
      pattern1(tbody,areaIdx,no);
      no++;
      break;
    }
    return;
    /* 振り分け パターン2[出現場所,戦闘開始時の司令lv,パターン,出現艦船,陣形,敵制空値,優勢,確保] */
    if(tbodyText.match(/出現場所戦闘開始時の司令(L|l)vパターン出現艦船陣形敵制空値優勢確保/)){
      mapdata[areaIdx][no] = {};
      pattern2(tbody,areaIdx,no);
      no++;
      continue;
    }
    /* 振り分け パターン3[出現場所,難易度,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保] */
    if(tbodyText.match(/出現場所難易度パターン海域EXP出現艦船陣形敵制空値優勢確保/)){
      mapdata[areaIdx][no] = {};
      pattern3(tbody,areaIdx,no);
      no++;
      continue;
    }
    /* 振り分け パターン4[出現場所,戦闘開始時の司令lv,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保] */
    if(tbodyText.match(/出現場所戦闘開始時の司令(L|l)vパターン海域EXP出現艦船陣形敵制空値優勢確保/)){
      mapdata[areaIdx][no] = {};
      pattern4(tbody,areaIdx,no);
      no++;
      continue;
    }
    /* 振り分け パターン5[難易度,出現場所,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保] */
    try{
      tbody = tbody.getElementsByTagName('tr')[0].getElementsByTagName('td')[3].getElementsByTagName('div')[0].getElementsByTagName('table')[0].getElementsByTagName('tbody')[0];
      if(tbodyText.match(/難易度出現場所パターン海域EXP出現艦船陣形敵制空値優勢確保/)){
        if(getDifficulty(tbody) == 1) mapdata[areaIdx][no] = {};
        pattern5(tbody,areaIdx,no);
        if(getDifficulty(tbody) == 3) no++;
        continue;
      }
    }catch(e){}
  }
}

// wikiから読み込み
function loadWikiHtmlAsync(areaIdx,isExtend){
  resetPresetAreaNo();
  resetPresetAreaCell();
  if(mapdata[areaIdx] !== undefined){
    for(let no in mapdata[areaIdx]){
      _setPresetAreaNo(no);
    }
    for(let no in mapdata[areaIdx]){
      for(let cell in mapdata[areaIdx][no]){
        _setPresetAreaCell(cell);
      }
      break;
    }
    return;
  }
  let suffix = isExtend ? "/拡張作戦" : "";
  let areaUrl = EscapeEUCJP(AREA_NAMES[areaIdx][0] + suffix);
  $.ajax({
    url: 'http://wikiwiki.jp/kancolle/?' + areaUrl,
    type: 'GET',
    success:function(res){
      parseHtml(areaIdx,isExtend,res.responseText);
      for(let no in mapdata[areaIdx]){
        _setPresetAreaNo(no);
      }
      for(let no in mapdata[areaIdx]){
        for(let cell in mapdata[areaIdx][no]){
          _setPresetAreaCell(cell);
        }
        break;
      }
      /*
      for(let no in mapdata[areaIdx]){
        for(let cell in mapdata[areaIdx][no]){
          _setPresetAreaCell(cell);
        }
        break;
      }*/
      console.log(mapdata)
    }
  });
  if(isExtend) loadWikiHtmlAsync(areaIdx,false);
}

function createTable(trs,iniValue){
  let table = [];
  let columns = 0;
  for(let i = 0;i < trs[0].getElementsByTagName('th').length;i++){
    columns += trs[0].getElementsByTagName('th')[i].colSpan;
  }
  for(let i = 1;i < trs.length;i++){ // ヘッダーを弾く
    table.push([]);
    // 敵制空値、優勢、確保は邪魔なので弾く
    for(let j = 0;j < columns - 3;j++){
      table[i - 1].push(iniValue);
    }
  }
  return table;
}

/* 振り分け パターン1[出現場所,パターン,出現艦船,陣形,敵制空値,優勢,確保] ~13秋までのマップに採用 */
function pattern1(tbody,areaIdx,no){
  let trs = tbody.getElementsByTagName('tr');
  let table = createTable(trs,null);

  //console.log(table)
  for(let i = 1;i < trs.length;i++){
    let tds = trs[i].getElementsByTagName('td');
    let j = 0;
    while(j < tds.length - 3){
      let rowSpan = tds[j].rowSpan;
      let colSpan = tds[j].colSpan;
      for(let k = 0;k < rowSpan;k++){
        for(let l = 0;l < colSpan;l++){
          let adjustValue = 0;
          while(table[i + k - 1][j + l + adjustValue] != null){
            //console.log('adjust',i + k - 1,j + l + adjustValue,table[i + k - 1][j + l + adjustValue])
            adjustValue++;
          }
          //console.log('debug',i + k - 1,j + l + adjustValue,tds[j + l + adjustValue].innerText)
          table[i + k - 1][j + l + adjustValue] = tds[j + l].innerText;
        }
      }
      j += colSpan;
    }
  }
  /*
  for(let i = 1;i < trs.length;i++){
    let tds = trs[i].getElementsByTagName('td');
    let rowSpans = [];
    table.push([]);
    // 代入
    for(let j = 0;j < tds.length;j++){
      rowSpans[j] += tds[j].rowSpan;
    }
    for(let j = 0;j < tds.length;j++){
      let colSpan = tds[j].colSpan;
      table[row].push([rowSpan]);
    }
  }*/
  console.log(table)
}

/* 振り分け パターン2[出現場所,戦闘開始時の司令lv,パターン,出現艦船,陣形,敵制空値,優勢,確保] ~14秋までのマップに採用 */
function pattern2(tbody,areaIdx,no){
  let trs = tbody.getElementsByTagName('tr');
  let cell = {};
  for(let j = 1;j < trs.length;j++){
    let tds = trs[j].getElementsByTagName('td');
    //console.log(areaIdx,no,cell.point,tds.length)
    if(tds.length === 8){
      cell['point'] = tds[0].innerText.substring(":")[0]; // セル(例：A,B,C)
      cell['formation'] = tds[4].innerText.split(/[、,\s]/); // 陣形
      cell['boss'] = String(tds[0].innerHTML).match(/^(?=.*<strong>)(?=.*style=\"color:Red\")/) !== null;
      // 出現場所,戦闘開始時の司令lv,パターン,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[3].innerText.match(FILTER_PATTERN) || tds[2].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[2].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']] = {};
      mapdata[areaIdx][no][cell['point']]['difficulty'] = {};
      mapdata[areaIdx][no][cell['point']]['difficulty'][0] = {};
      mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'] = {};
      if(!Array.isArray(mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern])){
        pattern = Object.keys(mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern']).length + 1;
        mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern] = {};
      }
      mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern]['organization'] = tds[3].innerText.split("、");
      mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern]['formation'] = cell['formation'];
    } else if(tds.length === 7){
      cell['formation'] = tds[3].innerText.split(/[、,\s]/); // 陣形
      // 戦闘開始時の司令lv,パターン,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[2].innerText.match(FILTER_PATTERN) || tds[1].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[1].innerText.replace(/\D/g,""); // パターン
      if(!Array.isArray(mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern])){
        pattern = Object.keys(mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern']).length + 1;
        mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern] = {};
      }
      mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern]['organization'] = tds[2].innerText.split("、");
      mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern]['formation'] = cell['formation'];
    } else {
      if(tds.length === 1) continue; // ボスセリフ除外
      // 戦闘開始時の司令lv,パターン,出現艦船,敵制空値,優勢,確保
      if(tds[1].innerText.match(FILTER_PATTERN) || tds[0].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[0].innerText.replace(/\D/g,""); // パターン
      if(!Array.isArray(mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern])){
        pattern = Object.keys(mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern']).length + 1;
        mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern] = {};
      }
      // あとで14夏を踏まえた処理を追加する
      mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern]['organization'] = tds[2].innerText.split("、"); // 14春
      mapdata[areaIdx][no][cell['point']]['difficulty'][0]['pattern'][pattern]['formation'] = cell['formation'];
    }
    mapdata[areaIdx][no][cell['point']]['boss'] = cell['boss'];
  }
}

/* 振り分け パターン3[出現場所,難易度,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保] 15冬マップに採用 */
function pattern3(tbody,areaIdx,no){
  let trs = tbody.getElementsByTagName('tr');
  let cell = {};
  for(let j = 1;j < trs.length;j++){
    let tds = trs[j].getElementsByTagName('td');
    if(tds.length === 9){
      cell['point'] = tds[0].innerText.substring(":")[0]; // セル(例：A,B,C)
      cell['difficulty'] = getDifficultyID(tds[1].innerText); // 難易度
      cell['formation'] = tds[5].innerText.split(/[、,\s]/); // 陣形
      cell['boss'] = String(tds[0].innerHTML).match(/^(?=.*<strong>)(?=.*style=\"color:Red\")/) !== null;
      // 出現場所,難易度,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[4].innerText.match(FILTER_PATTERN) || tds[2].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[2].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['organization'] = tds[4].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['formation'] = cell['formation'];
    } else if(tds.length === 8){
      cell['difficulty'] = getDifficultyID(tds[0].innerText); // 難易度
      cell['formation'] = tds[4].innerText.split(/[、,\s]/); // 陣形
      // 難易度,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[3].innerText.match(FILTER_PATTERN) || tds[1].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[1].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']][cell['difficulty']] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['organization'] = tds[3].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['formation'] = cell['formation'];
    } else {
      if(tds.length === 1) continue; // ボスセリフ除外
      if(tds.length === 7){
        cell['formation'] = tds[3].innerText.split(/[、,\s]/); // 陣形
      }
      // パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[2].innerText.match(FILTER_PATTERN) || tds[0].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[0].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['organization'] = tds[2].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['formation'] = cell['formation'];
    }
    mapdata[areaIdx][no][cell['point']]['boss'] = cell['boss'];
  }
}

/* 振り分け パターン4[出現場所,戦闘開始時の司令lv,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保] 最近の通常海域マップに採用 */
function pattern4(tbody,areaIdx,no){
  let trs = tbody.getElementsByTagName('tr');
  let cell = {};
  for(let j = 1;j < trs.length;j++){
    let tds = trs[j].getElementsByTagName('td');
    if(tds.length === 10){
      cell['point'] = tds[0].innerText.substring(":")[0]; // セル(例：A,B,C)
      cell['formation'] = tds[6].innerText.split(/[、,\s]/); // 陣形
      cell['boss'] = String(tds[0].innerHTML).match(/^(?=.*<strong>)(?=.*style=\"color:Red\")/) !== null;
      // 出現場所,戦闘開始時の司令lv,前哨戦or最終形態,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[5].innerText.match(FILTER_PATTERN) || tds[3].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[3].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']] = {};
      mapdata[areaIdx][no][cell['point']][0] = {};
      mapdata[areaIdx][no][cell['point']][0]['pattern'] = {};
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern]['organization'] = tds[5].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern]['formation'] = cell['formation'];
    } else if(tds.length === 9 || (tds.length === 8 && tds[1].innerText.match(/(前哨戦|最終形態)/))){ // 4-5専用処理
      if(tds.length === 9){
        cell['point'] = tds[0].innerText.substring(":")[0]; // セル(例：A,B,C)
        cell['formation'] = tds[5].innerText.split(/[、,\s]/); // 陣形
        cell['boss'] = String(tds[0].innerHTML).match(/^(?=.*<strong>)(?=.*style=\"color:Red\")/) !== null;
      }
      // 出現場所,戦闘開始時の司令lv,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[4].innerText.match(FILTER_PATTERN) || tds[2].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[2].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']] = {};
      mapdata[areaIdx][no][cell['point']][0] = {};
      mapdata[areaIdx][no][cell['point']][0]['pattern'] = {};
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern]['organization'] = tds[4].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern]['formation'] = cell['formation'];
    } else {
      if(tds.length === 1) continue; // ボスセリフ除外
      if(tds.length === 8){
        cell['formation'] = tds[4].innerText.split(/[、,\s]/); // 陣形
      }
      // 出現場所,戦闘開始時の司令lv,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[3].innerText.match(FILTER_PATTERN) || tds[1].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[1].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern]['organization'] = tds[3].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][0]['pattern'][pattern]['formation'] = cell['formation'];
    }
    mapdata[areaIdx][no][cell['point']]['boss'] = cell['boss'];
  }
}

/* 振り分け パターン5[難易度,出現場所,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保] 15春マップ以降に採用 */
function pattern5(tbody,areaIdx,no){
  let trs = tbody.getElementsByTagName('tr');
  let cell = {};
  for(let j = 1;j < trs.length;j++){
    let tds = trs[j].getElementsByTagName('td');
    if(tds.length === 9){
      cell['difficulty'] = getDifficultyID(tds[0].innerText); // 難易度
      cell['point'] = tds[1].innerText.substring(":")[0]; // セル(例：A,B,C)
      cell['formation'] = tds[5].innerText.split(/[、,\s]/); // 陣形
      cell['boss'] = String(tds[1].innerHTML).match(/^(?=.*<strong>)(?=.*style=\"color:Red\")/) !== null;
      // 難易度,出現場所,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[4].innerText.match(FILTER_PATTERN) || tds[2].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[2].innerText.replace(/\D/g,""); // パターン
      //mapdata[areaIdx][no][cell['point']] = {};
      if(cell['difficulty'] === 1) mapdata[areaIdx][no][cell['point']] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['organization'] = tds[4].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['formation'] = cell['formation'];
    } else if(tds.length === 8){
      cell['point'] = tds[0].innerText.substring(":")[0]; // セル(例：A,B,C)
      cell['formation'] = tds[4].innerText.split(/[、,\s]/); // 陣形
      cell['boss'] = String(tds[0].innerHTML).match(/^(?=.*<strong>)(?=.*style=\"color:Red\")/) !== null;
      // 出現場所,パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[3].innerText.match(FILTER_PATTERN) || tds[1].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[1].innerText.replace(/\D/g,""); // パターン
      //mapdata[areaIdx][no][cell['point']] = {};
      if(cell['difficulty'] === 1) mapdata[areaIdx][no][cell['point']] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['organization'] = tds[3].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['formation'] = cell['formation'];
    } else {
      if(tds.length === 1) continue; // ボスセリフ除外
      if(tds.length === 7){
        cell['formation'] = tds[3].innerText.split(/[、,\s]/); // 陣形
      }
      // パターン,海域EXP,出現艦船,陣形,敵制空値,優勢,確保
      if(tds[2].innerText.match(FILTER_PATTERN) || tds[0].innerText.replace(/\D/g,"") == "") continue;
      let pattern = tds[0].innerText.replace(/\D/g,""); // パターン
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern] = {};
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['organization'] = tds[2].innerText.split("、");
      mapdata[areaIdx][no][cell['point']][cell['difficulty']]['pattern'][pattern]['formation'] = cell['formation'];
    }
    mapdata[areaIdx][no][cell['point']]['boss'] = cell['boss'];
  }
}

function getDifficulty(tbody){
  return getDifficultyID(tbody.getElementsByTagName('tr')[1].getElementsByTagName('td')[0].innerText);
}