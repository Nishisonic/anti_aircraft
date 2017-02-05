let mapdata = {0:{}};
const FILTER_PATTERN = /燃料|弾薬|鋼材|ボーキ|回避|編成|？|高速建造材|高速修復材|開発資材|家具箱/;

function toDifficultyID(name){
  switch(name){
    case "甲":return 1;
    case "乙":return 2;
    case "丙":return 3;
    default  :return 0;
  }
}

function toDifficultyName(id){
  switch(id|0){
    case 1:return "甲";
    case 2:return "乙";
    case 3:return "丙";
    default:return "なし";
  }
}

function toFormatFormationArray(array){
  let result = [];
  array.forEach(function(value){
    switch(true){
      case /単縦/.test(value):
        result.push(1);
        break;
      case /複縦/.test(value):
        result.push(2);
        break;
      case /輪形/.test(value):
        result.push(3);
        break;
      case /梯形/.test(value):
        result.push(4);
        break;
      case /単横/.test(value):
        result.push(5);
        break;
      case /第一/.test(value):
        result.push(11);
        break;
      case /第二/.test(value):
        result.push(12);
        break;
      case /第三/.test(value):
        result.push(13);
        break;
      case /第四/.test(value):
        result.push(14);
        break;
      default:
        break;
    }
  });
  return result;
}

function toFormationName(id){
  switch(id){
    case 1:return "単縦陣";
    case 2:return "複縦陣";
    case 3:return "輪形陣";
    case 4:return "梯形陣";
    case 5:return "単横陣";
    case 11:return "第一警戒航行序列";
    case 12:return "第二警戒航行序列";
    case 13:return "第三警戒航行序列";
    case 14:return "第四警戒航行序列";
    default:return "";
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
    // 海域抽出
    let tbody = tables[i].getElementsByTagName('tbody')[0];
    let tbodyText = tbody.innerText.replace(/\s/g,"");
    if(!tbodyText.match(/(難易度)?出現場所(戦闘開始時の司令(部)?(L|l)v|難易度)?パターン(海域EXP)?出現艦船陣形(敵制空値優勢確保)?/)) continue;
    if(areaIdx <= 30){
      mapdata[areaIdx][no] = {};
      setMapData(tbody,areaIdx,no);
      no++;
    } else {
      try{
        tbody = tbody.getElementsByTagName('tr')[0].getElementsByTagName('td')[3].getElementsByTagName('div')[0].getElementsByTagName('table')[0].getElementsByTagName('tbody')[0];
        if(tbodyText.match(/難易度出現場所パターン海域EXP出現艦船陣形敵制空値優勢確保/)){
          if(getDifficulty(tbody) == 1) mapdata[areaIdx][no] = {};
          setMapData(tbody,areaIdx,no);
          if(getDifficulty(tbody) == 3) no++;
          continue;
        }
      }catch(e){}
    }
  }
}

// wikiから読み込み
function loadWikiHtmlAsync(areaIdx,isExtend){
  resetPresetAll();
  if(mapdata[areaIdx] !== undefined){
    setPresetAll(areaIdx);
    return;
  }
  let suffix = isExtend ? "/拡張作戦" : "";
  let areaUrl = EscapeEUCJP(AREA_NAMES[areaIdx][0] + suffix);
  //console.log(areaUrl)
  $.ajax({
    url: 'http://wikiwiki.jp/kancolle/?' + areaUrl,
    type: 'GET',
    success:function(res){
      //console.log(res)
      parseHtml(areaIdx,isExtend,res.responseText);
      setPresetAll(areaIdx);
      //console.log(mapdata)
    }
  });
  if(isExtend) loadWikiHtmlAsync(areaIdx,false);
}

// 初期テーブル作成
function createIniTable(trs,iniValue){
  let table = [];
  let columns = 0;
  for(let i = 0;i < trs[0].getElementsByTagName('th').length;i++){
    columns += trs[0].getElementsByTagName('th')[i].colSpan;
  }
  for(let i = 0;i < trs.length;i++){
    table.push([]);
    for(let j = 0;j < columns;j++){
      table[i].push(iniValue);
    }
  }
  return table;
}

// 整形されたテーブルを作成する
function createTable(tbody){
  let trs = tbody.getElementsByTagName('tr');
  let table = createIniTable(trs,null);

  for(let i = 0,row = 0;i < trs.length;i++,row++){
    let columns = i == 0 ? trs[i].getElementsByTagName('th') : trs[i].getElementsByTagName('td');
    let column = 0;
    for(let j = 0;j < columns.length;j++){
      while(column < table[row].length && table[row][column] !== null) column++;
      let rowSpan = columns[j].rowSpan;
      let colSpan = columns[j].colSpan;
      for(let k = 0;k < rowSpan;k++){
        for(let l = 0;l < colSpan;l++){
          //console.log(i + k,j + l,columns[j + l].innerText)
          //table[row + k][column + l] = columns[j].innerText + ' ' + [i,j,k,l] + ' ' + [rowSpan,colSpan];
          table[row + k][column + l] = columns[j];
        }
      }
    }
  }
  //console.log(table)
  return table;
}

function setMapData(tbody,areaIdx,no){
  let table = createTable(tbody);
  let cellIdx = -1;
  let patternIdx = -1;
  let organizationIdx = -1;
  let formationIdx = -1;
  let difficultyIdx = -1;
  for(let i = 0;i < table[0].length;i++){
    switch(table[0][i].innerText){
      case "出現場所":
        cellIdx = i;
        break;
      case "パターン":
        patternIdx = i;
        break;
      case "出現艦船":
        organizationIdx = i;
        break;
      case "陣形":
        formationIdx = i;
        break;
      case "難易度":
        difficultyIdx = i;
        break;
      default:
        break;
    }
  }
  let oldRawPattern = null;
  // ヘッダーを弾く
  for(i = 1;i < table.length;i++){
    let boss = String(table[i][cellIdx].innerHTML).match(/^(?=.*<strong>)(?=.*style=\"color:Red\")/) !== null;
    let cell = table[i][cellIdx].innerText.substring(":")[0];
    let pattern = table[i][patternIdx].innerText.replace(/\D/g,"");
    let organization = table[i][organizationIdx].innerText;
    let formation = toFormatFormationArray(table[i][formationIdx].innerText.split(/[、,\s]/)); 
    let difficulty = difficultyIdx === -1 ? 0 : toDifficultyID(table[i][difficultyIdx].innerText);
    if(organization.match(FILTER_PATTERN) || pattern.replace(/\D/g,"") == "") continue;
    // 連合艦隊処理用
    if(table[i][patternIdx] !== oldRawPattern){
      oldRawPattern = table[i][patternIdx]; // 入れ替え
      if(!isAssociativeArray(mapdata[areaIdx][no][cell])){
        mapdata[areaIdx][no][cell] = {'difficulty':{},'boss':boss};
      }
      if(!isAssociativeArray(mapdata[areaIdx][no][cell]['difficulty'][difficulty])){
        mapdata[areaIdx][no][cell]['difficulty'][difficulty] = {'pattern':{}};
      }
      if(isAssociativeArray(mapdata[areaIdx][no][cell]['difficulty'][difficulty]['pattern'][pattern])){
        while(isAssociativeArray(mapdata[areaIdx][no][cell]['difficulty'][difficulty]['pattern'][pattern])) pattern++;
      }
      mapdata[areaIdx][no][cell]['difficulty'][difficulty]['pattern'][pattern] = {'organization':[],'formation':[]};
    }
    mapdata[areaIdx][no][cell]['difficulty'][difficulty]['pattern'][pattern]['organization'] = mapdata[areaIdx][no][cell]['difficulty'][difficulty]['pattern'][pattern]['organization'].concat(organization.split("、"));
    mapdata[areaIdx][no][cell]['difficulty'][difficulty]['pattern'][pattern]['formation'] = formation;
  }
}

let isAssociativeArray = function(o) {
  return (o instanceof Object && !(o instanceof Array));
};
