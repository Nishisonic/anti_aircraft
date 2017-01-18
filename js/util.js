const AIR_BATTLE_FACTOR = 0.25;
const FRIEND_FACTOR = 0.8;
const ENEMY_FACTOR = 0.75;
const FORMATION = {
  TANJU:1.0,
  FUKUJU:1.2,
  RINKEI:1.6,
  TEIKEI:1.0,
  TANOU:1.0,
  DAIICHI:1.1,
  DAINI:1.0,
  DAISAN:1.5,
  DAIYON:1.0,
};
const TYKU_CUIIN = [
  {"FRIEND":{A:1,B:0,C:1},"ENEMY":{A:0,B:0,C:1}},
  {A:3,B:5,C:1.75}, // 1
  {A:3,B:4,C:1.7},  // 2
  {A:2,B:3,C:1.6},  // 3
  {A:5,B:2,C:1.5},  // 4
  {A:2,B:3,C:1.55}, // 5
  {A:4,B:1,C:1.5},  // 6
  {A:2,B:2,C:1.35}, // 7
  {A:2,B:3,C:1.45}, // 8
  {A:1,B:2,C:1.3},  // 9
  {A:3,B:6,C:1.65}, // 10
  {A:2,B:5,C:1.5},  // 11
  {A:1,B:3,C:1.25}, // 12
  {A:1,B:4,C:1.35}, // 13
  {A:1,B:4,C:1.45}, // 14
  {A:1,B:3,C:1.3},  // 15
  {A:1,B:4,C:1.4},  // 16
  {A:1,B:2,C:1.25}, // 17
  {A:1,B:2,C:1.2},  // 18
  {A:1,B:5,C:1.45}, // 19
  {A:1,B:3,C:1.25}, // 20
];
// 装備定数A
function getKansenItem_A(type){
  switch(type){
    case 16: // 高角砲
    case 30: // 高射装置
      return 2;
    case 15: // 機銃
      return 3;
    case 11: // 電探
      return 1.5;
    default:
      return 0;
  }
}
// 装備定数B
function getKansenItem_B(type,tyku){
  switch(type){
    case 16: // 高角砲
    case 30: // 高射装置
      if(tyku <= 7) return 1;
      return 1.5;
    case 15: // 機銃
      if(tyku <= 7) return 2;
      return 3;
    default:
      return 0;
  }
}
// 艦隊防空装備定数A
function getKantaiItem_A(type,id){
  switch(type){
    case 16: // 高角砲
    case 30: // 高射装置
      return 0.35;
    case 12: // 対空強化弾
      return 0.6;
    case 11: // 電探
      return 0.4;
    default:
      if(id == 9) return 0.25; // 46cm三連装砲
      return 0.2;
  }
}
// 艦隊防空装備定数B
function getKantaiItem_B(type,tyku){
  switch(type){
    case 16: // 高角砲
    case 30: // 高射装置
      if(tyku <= 7) return 2;
      return 3;
    case 11: // 電探
      if(tyku > 1) return 1.5;
    default:
      return 0;
  }
}
function getFormationBonus(formation){
  switch (formation) {
    case 2: // 複縦陣
      return 1.2;
    case 3: // 輪形陣
      return 1.6;
    case 11: // 第一警戒航行序列
      return 1.1;
    case 13: // 第三警戒航行序列
      return 1.5;
    default:
      return 1.0;
  }
}
// 撃墜数A
function getA(kaju,ciKind = 0,isFriend = false){
  let ciFactor = getTykuCuinFactor(ciKind,isFriend);
  return Math.floor(kaju * ciFactor.C + ciFactor.A);
}
// 撃墜数B
function getB(kaju,slot,ciKind = 0,isFriend = false){
  let ciFactor = getTykuCuinFactor(ciKind,isFriend);
  return Math.floor(0.02 * AIR_BATTLE_FACTOR * slot * kaju + ciFactor.B);
}
function getTykuCuinFactor(ciKind,isFriend = false){
  if(TYKU_CUIIN[ciKind].A !== undefined){
    return TYKU_CUIIN[ciKind];
  }
  return TYKU_CUIIN[ciKind][isFriend ? "FRIEND" : "ENEMY"];
}
// 割合撃墜確率
function getProportion(kaju){
  return 0.02 * AIR_BATTLE_FACTOR * kaju;
}
// 割合撃墜数
function getProportionNum(kaju,slot){
  return Math.floor(0.02 * AIR_BATTLE_FACTOR * slot * kaju);
}
// 固定撃墜数
function getFixedNum(kaju,ciKind = 0,isFriend = false){
  let ciFactor = getTykuCuinFactor(ciKind,isFriend);
  return Math.floor(kaju * ciFactor.C);
}
// 最低保証数
function getGuaranteedNum(ciKind = 0,isFriend = false){
  let ciFactor = getTykuCuinFactor(ciKind,isFriend);
  return ciFactor.A + ciFactor.B;
}