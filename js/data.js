$(function () {
  $.ajax({
    beforeSend : function(xhr) {
        xhr.overrideMimeType("text/plain; charset=shift_jis");
    },
    url : 'assets/ShipParameterRecord.csv',
    dataType : 'text'
  }).then(function(text) {
    const params = csv2json(text.split("\n")).filter(function(data){
      return data["艦船名"] !== "null"
    }).reduce(function(p, data){
      p[data["艦船ID"]] = data;
      return p;
    }, {});
    $.ajax({
      url : 'assets/START2.json',
      dataType : 'json',
    }).then(function(master) {
      const data = master.api_data;
      const ships = data.api_mst_ship.reduce(function(p, data){
        p[data.api_id] = data;
        return p;
      }, {});

      const isFR = function(ship, a) {
        const array = a || [];
        // 敵艦除外
        if (!ship.api_aftershipid) {
          return true;
        }
        if (ship.api_aftershipid === "0") {
          // 最終改造艦判定
          return array.length === 0;
        }
        if (array.indexOf(ship.api_id) >= 0) {
          // コンバート艦判定
          return true;
        }
        array.push(ship.api_id);
        return isFR(ships[ship.api_aftershipid], array);
      }

      const getType = function(ship) {
        if (ship.api_id <= 1500) {
          return ship.api_stype;
        }
        const name = ship.api_name;
        if (name === "PT小鬼群") {
          return 9993;
        }
        if (name === "砲台小鬼") {
          return 9994;
        }
        if (["浮遊要塞", "護衛要塞"].indexOf(name) >= 0) {
          return 9995;
        }
        if (name.indexOf("水姫") >= 0) {
          return 9996;
        }
        if (name.indexOf("水鬼") >= 0) {
          return 9997;
        }
        if (name.indexOf("姫") >= 0) {
          return 9998;
        }
        if (name.indexOf("鬼") >= 0) {
          return 9999;
        }
        return ship.api_stype;
      }

      const fixID = function(id) {
        return Number(id) === -1 ? 0 : Number(id);
      }

      SHIP_DATA = data.api_mst_ship.reduce(function(p, ship){
        p[ship.api_id] = {
          name: ship.api_name,
          type: getType(ship),
          tyku: Number(params[ship.api_id]["対空最大"]),
          fr: isFR(ship)
        };
        if (ship.api_id > 1500) {
          p[ship.api_id].i1 = fixID(params[ship.api_id]["装備1"]);
          p[ship.api_id].i2 = fixID(params[ship.api_id]["装備2"]);
          p[ship.api_id].i3 = fixID(params[ship.api_id]["装備3"]);
          p[ship.api_id].i4 = fixID(params[ship.api_id]["装備4"]);
          p[ship.api_id].i5 = fixID(params[ship.api_id]["装備5"]);
        }
        return p;
      }, {});
      ITEM_DATA = data.api_mst_slotitem.reduce(function(p, slotitem){
        p[slotitem.api_id] = {
          name: slotitem.api_name,
          type: slotitem.api_type[3],
          tyku: slotitem.api_tyku
        };
        return p;
      }, {});

      // select.jsから移管(無理やり)

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
  });
});

function csv2json(csvArray){
  var jsonArray = [];
  var items = csvArray[0].split(',');
  for (var i = 1; i < csvArray.length - 1; i++) {
    var a_line = new Object();
    var csvArrayD = csvArray[i].split(',');
    for (var j = 0; j < items.length; j++) {
      a_line[items[j]] = csvArrayD[j];
    }
    jsonArray.push(a_line);
  }
  return jsonArray;
}

let ITEM_DATA = null;

let SHIP_DATA = null;

const ITEM_TYPE_DATA = {
  1:"小口径主砲",
  2:"中口径主砲",
  3:"大口径主砲",
  4:"副砲",
  5:"魚雷",
  6:"艦上戦闘機",
  7:"艦上爆撃機",
  8:"艦上攻撃機",
  9:"艦上偵察機",
  10:"水上機",
  11:"電探",
  12:"対空強化弾",
  13:"対艦強化弾",
  14:"応急修理要員",
  15:"対空機銃",
  16:"高角砲",
  17:"爆雷",
  18:"ソナー",
  19:"機関部強化",
  20:"上陸用舟艇",
  21:"オートジャイロ",
  22:"対潜哨戒機",
  23:"追加装甲",
  24:"探照灯",
  25:"簡易輸送部材",
  26:"艦艇修理施設",
  27:"照明弾",
  28:"司令部施設",
  29:"航空要員",
  30:"高射装置",
  31:"対地装備",
  32:"水上艦要員",
  33:"大型飛行艇",
  34:"戦闘糧食",
  35:"補給物資",
  36:"特型内火艇",
  37:"陸上攻撃機",
  38:"局地戦闘機",
  39:"噴式戦闘爆撃機(噴式景雲改)",
  40:"噴式戦闘爆撃機(橘花改)",
  41:"輸送機材",
  42:"潜水艦装備",
  43:"水上戦闘機",
  44:"陸上戦闘機",
  45:"夜間戦闘機",
  46:"夜間攻撃機",
  47:"陸上対潜哨戒機",
};

const SHIP_TYPE_DATA = {
  1:"海防艦",
  2:"駆逐艦",
  3:"軽巡洋艦",
  4:"重雷装巡洋艦",
  5:"重巡洋艦",
  6:"航空巡洋艦",
  7:"軽空母",
  8:"巡洋戦艦",
  9:"戦艦",
  10:"航空戦艦",
  11:"正規空母",
  12:"超弩級戦艦",
  13:"潜水艦",
  14:"潜水空母",
  15:"補給艦",
  16:"水上機母艦",
  17:"揚陸艦",
  18:"装甲空母",
  19:"工作艦",
  20:"潜水母艦",
  21:"練習巡洋艦",
  22:"補給艦",
  9999:"鬼",
  9998:"姫",
  9997:"水鬼",
  9996:"水姫",
  9995:"要塞",
  9994:"砲台",
  9993:"水雷艇",
  0:"その他",
};
