
// 簡化 querySelector 的函數
function qselect(item){
  return document.querySelector(item);
}

document.addEventListener('DOMContentLoaded', ()=>{
  change_color('temp35');
})

// 改變 radio button 顏色
function change_color(val){
  if (val == 'temp5'){ //cold
    qselect('.wi-snowflake-cold').style.color = 'rgb(79, 196, 255)';
    qselect('.wi-cloudy').style.color = 'rgb(200, 200, 204)';
    qselect('.wi-day-sunny').style.color = 'rgb(200, 200, 204)';

    qselect('.label_temp5').style.background = 'rgb(79, 196, 255)';
    qselect('.label_temp15').style.background = 'transparent';
    qselect('.label_temp35').style.background = 'transparent';
  }if (val == 'temp15'){ //cloudy
    qselect('.wi-snowflake-cold').style.color = 'rgb(200, 200, 204)';
    qselect('.wi-cloudy').style.color = 'grey';
    qselect('.wi-day-sunny').style.color = 'rgb(200, 200, 204)';

    qselect('.label_temp5').style.background = 'transparent';
    qselect('.label_temp15').style.background = 'grey';
    qselect('.label_temp35').style.background = 'transparent';
  }if (val == 'temp35'){ //sunny
    qselect('.wi-snowflake-cold').style.color = 'rgb(200, 200, 204)';
    qselect('.wi-cloudy').style.color = 'rgb(200, 200, 204)';
    qselect('.wi-day-sunny').style.color = 'rgb(255, 233, 0)';

    qselect('.label_temp5').style.background = 'transparent';
    qselect('.label_temp15').style.background = 'transparent';
    qselect('.label_temp35').style.background = 'rgb(255, 233, 0)';
  }
}

//var csv is the CSV file with headers
function csvJSON(csv){
  const result = [];
  var lines= csv.split("\n");
  var headers=lines[0].split(",");

  for(var i=1;i<lines.length;i++){
    var obj = {};
    var currentline=lines[i].split(",");
    for(var j=0;j<headers.length;j++){
      obj[headers[j]] = currentline[j];
    }
    result.push(obj);
  }
  return result; //JavaScript object
}
// 計算日期
Date.prototype.addDays = function (days) {
  var dat = new Date(this.valueOf()); // (1)
  dat.setDate(dat.getDate() + days);  // (2)
  return dat
}

// 取得 csv 所在位置 url
function get_url_temp(){
  let date = qselect('#date').value;
  let month = date.slice(5,7);
  let day = date.slice(8,10);
  let hour = qselect('#hour').value; // 輸出為 string, 所以要將其轉為 number 後再轉回 string, 以防輸入 00 ~09 的情況發生
  let today = new Date(date);
  let today_plus_1 = today.addDays(1);
  let month_1 = today_plus_1.toISOString().slice(5,7);
  let day_1 = today_plus_1.toISOString().slice(8,10);

  let temp;
  if (qselect('#temp5').checked){
    temp = qselect('#temp5').value;
  }
  if (qselect('#temp15').checked){
    temp = qselect('#temp15').value;
  }
  if (qselect('#temp35').checked){
    temp = qselect('#temp35').value;
  }

  // url example: https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_01/month_01_day_01_hour_0.csv
  let data_url = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_' + month + '/month_'
   + month + '_day_' + day + '_hour_' + parseInt(hour).toString() + '.csv';

  let data_url_1;
  let data_url_2;
  if (parseInt(hour)+2 < 24){ // 確認後兩個小時為同一天
    data_url_1 = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_' + month + '/month_'
     + month + '_day_' + day + '_hour_' + (parseInt(hour)+1).toString() + '.csv';
     data_url_2 = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_' + month + '/month_'
      + month + '_day_' + day + '_hour_' + (parseInt(hour)+2).toString() + '.csv';
  }else{ // 如果時間超過22點 ，要換日
    if (hour === '22'){ // url_1: 23點; url_2: 隔天0點
      data_url_1 = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_' + month + '/month_'
       + month + '_day_' + day + '_hour_' + (parseInt(hour)+1).toString() + '.csv';
      data_url_2 = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_' + month_1 + '/month_'
        + month_1 + '_day_' + day_1 + '_hour_' + (parseInt(hour)-22).toString() + '.csv';
    }else if ( hour === '23'){ //url_1: 隔天0點; url_2: 隔天1點
      data_url_1 = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_' + month_1 + '/month_'
        + month_1 + '_day_' + day_1 + '_hour_' + (parseInt(hour)-23).toString() + '.csv';
      data_url_2 = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_' + month_1 + '/month_'
        + month_1 + '_day_' + day_1 + '_hour_' + (parseInt(hour)-22).toString() + '.csv';
    }
  }

  let return_arr = [data_url, temp, data_url_1, data_url_2];
  return return_arr;
}


function get_predict_array(){
  const request = new XMLHttpRequest();

  //let data_url = 'https://raw.githubusercontent.com/WarrenLo/taxi_data/master/month_01/month_01_day_01_hour_0.csv'
  //let temp = 1;
  let data_url = get_url_temp()[0]; //取得 data_url
  let temp = get_url_temp()[1]; //取得 temp 資訊
  request.open('GET', data_url, true); // 非同步取得資訊
  request.send();
  request.onload =
  function (){
    let predict_arr = [];
    let date = qselect('#date').value;
    let hour = qselect('#hour').value;
    if (request.status >= 200 && request.status < 400){ // 確認目標網址正確連接

      let respon = csvJSON(request.responseText);// 將讀取到的 csv 轉成 json 格式

      for (let zone = 0; zone<=24; zone++){
        //temp5=0, temp15= 1, temp25= 2, temp35= 3;
        if (temp == '0'){
          predict_arr.push(respon[(zone)*4].Predict_HireCount);
        }else{
          predict_arr.push(respon[(zone)*4+parseInt(temp)].Predict_HireCount);
        }
      }
    }else{ // 發生無法連接到目標網址，判斷可能出現的錯誤
      qselect('#map__title').innerText = 'error'

      if (date == ''){ // 錯誤 1 : 未輸入日期
        alert('請輸入日期')
      }
      if (hour == ''){ // 錯誤 ㄉ : 未輸入日期
        alert('請輸入時間')
      }
      if (hour > 23 || hour < 0){ // 錯誤 3 : 時間範圍不合理
        alert('請輸入正確的時間 : 00 ~ 23')
      }
    }
    //確認所有預測值都抓到
    if (predict_arr.length == 25){
      initMap(predict_arr); // 建立新的 google map

      let time;

      if (hour < 12){
        if (hour< 10){
          time = '0' + parseInt(hour).toString() + ' am';
        }else{
          time = parseInt(hour).toString() + ' am';
        }
      }else{
        time = parseInt(hour).toString() + ' pm';
      }

      let temp_range = '';
      if (temp == 0){ //cold
        temp_range = '5 ~ 15';
      }if (temp == 1){ //cold
        temp_range = '15 ~ 25';
      }if (temp == 3){ //cold
        temp_range = '25 ~ 35';
      }

      qselect('#map__title').innerText =
      'Date\u00A0:\u00A0' + date
      + '\u00A0\u00A0|\u00A0\u00A0Time\u00A0:\u00A0' + time
      + '\u00A0\u00A0|\u00A0\u00A0Temparature\u00A0:\u00A0' + temp_range + '°C';
      // qselect('.sidebar__toggle').click(); //正確執行完成後，將輸入表單關閉

      var day = new Date(date).getDay(); //取得輸入日期為星期幾 : 0 代表星期日; 1 代表星期一 ...
      max_num(predict_arr, day, hour);
      get_predict_array_1();
      get_predict_array_2();

      return false;
    }
  }
}

function get_predict_array_1(){
  const request = new XMLHttpRequest();

  let data_url_1 = get_url_temp()[2]; //取得 data_url_1
  let temp = get_url_temp()[1]; //取得 temp 資訊
  request.open('GET', data_url_1, true); // 非同步取得資訊
  request.send();
  request.onload =
  function (){
    let predict_arr_1 = [];
    let date = qselect('#date').value;
    let hour = qselect('#hour').value;
    if (request.status >= 200 && request.status < 400){ // 確認目標網址正確連接

      let respon = csvJSON(request.responseText); // 將讀取到的 csv 轉成 json 格式

      for (let zone = 0; zone<=24; zone++){
        //temp5=0, temp15= 1, temp25= 2, temp35= 3;
        if (temp == '0'){
          predict_arr_1.push(respon[(zone)*4].Predict_HireCount);
        }else{
          predict_arr_1.push(respon[(zone)*4+parseInt(temp)].Predict_HireCount);
        }
      }
    }
    for (let i = 1; i <= 5; i++){
      let top = '#top-' + i;
      let zone_id = qselect(top).innerText
      let id = zone_id.slice(5, zone_id.length)-'1';
      let furture_id_1 = '#top-' + i + '-future-' + 1;
      qselect(furture_id_1).innerText = predict_arr_1[id] + ' 人';
    }
  }
}

function get_predict_array_2(){
  const request = new XMLHttpRequest();

  let data_url_2 = get_url_temp()[3]; //取得 data_url_2
  let temp = get_url_temp()[1]; //取得 temp 資訊
  request.open('GET', data_url_2, true); // 非同步取得資訊
  request.send();
  request.onload =
  function (){
    let predict_arr_2 = [];
    let date = qselect('#date').value;
    let hour = qselect('#hour').value;
    if (request.status >= 200 && request.status < 400){ // 確認目標網址正確連接

      let respon = csvJSON(request.responseText); // 將讀取到的 csv 轉成 json 格式

      for (let zone = 0; zone<=24; zone++){
        //temp5=0, temp15= 1, temp25= 2, temp35= 3;
        if (temp == '0'){
          predict_arr_2.push(respon[(zone)*4].Predict_HireCount);
        }else{
          predict_arr_2.push(respon[(zone)*4+parseInt(temp)].Predict_HireCount);
        }
      }
    }
    for (let i = 1; i <= 5; i++){
      let top = '#top-' + i;
      let zone_id = qselect(top).innerText
      let id = zone_id.slice(5, zone_id.length)-'1';
      let furture_id_2 = '#top-' + i + '-future-' + 2;
      qselect(furture_id_2).innerText = predict_arr_2[id] + ' 人';
    }
  }
}

function get_future(arr){
  let plus_1 = [];
  for (let i = 1; i <= 5; i++){
    let top = '#top-' + i;
    let zone_id = qselect(top).innerText
    let id = zone_id.slice(5, zone_id.length)-'1';
    let furture_id_1 = '#top-' + i + '-future-' + 1;
    let furture_id_2 = '#top-' + i + '-future-' + 2;
    plus_1.push(arr[id]);
  }
  console.log(plus_1);
}

function max_num(arr, day, hour){
  // 將陣列中的字串轉換為數字
  let num_arr = [];
  for (let i = 0; i< arr.length; i++){
    num_arr.push(parseInt(arr[i]));
  }

  for( let t = 1; t <= 5; t++){
    let top = '#top-' + t;
    let count = '#count-top-' + t;
    let info = '#info-' + t;
    let zone_count = comp(num_arr)[0];
    let zone_id = comp(num_arr)[1]+1
    qselect(count).innerText = zone_count + ' 人'; //zone_count
    qselect(top).innerText = 'zone ' + zone_id; //zone_id

    if (zone_id === 3){
      qselect(info).style.color = '#000';
      if (hour >= 4 && hour <= 15){

        if (day == 0 || day == 6){// 假日早上
          qselect(info).innerHTML =  `<li>美麗華</li>
          <li>台北美福大飯店</li>
          <li>大直點華</li>
          <li>台北萬豪酒店</li>
          <li>賓利台北</li>
          <li>內湖北勢湖郵局</li>
          <li>維多利亞酒店</li>
          `;
        }else{ // 平日早上
          qselect(info).innerHTML =  `<li>台北美福大飯店</li>
          <li>STARBUCKS(美麗華門市)</li>
          <li>台北萬豪酒店</li>
          <li>大直點華</li>
          <li>賓利台北</li>
          <li>鴻海內湖分公司</li>
          <li>大直美堤花園管理中心</li>`;
        }
      }else{ // 假日晚上
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>美麗華</li>
          <li>台北美福大飯店</li>
          <li>大直點華</li>
          <li>家樂福大直店</li>
          <li>台北萬豪酒</li>
          <li>維多利亞酒店</li>
          <li>賓利台北</li>
          <li>維多利亞酒店</li>
          <li>大直美堤花園管理中心</li>
          <li>達美樂大直店</li>`;
        }else{ // 平日晚上
          qselect(info).innerHTML =  `<li>STARBUCKS(美麗華門市)</li>
          <li>台北美福大飯店</li>
          <li>洲子1號公園</li>
          <li>台北萬豪酒店</li>
          <li>花旗銀行內湖分行</li>
          <li>捷運西湖站1號出口</li>
          <li>iRent應安文湖站</li>
          <li>台灣中油西湖站</li>
          <li>海德堡科技</li>
          <li>家樂福大直店</li>`;
        }

      }
    }else if (zone_id === 5){
      qselect(info).style.color = '#000';
      if (hour >= 4 && hour <= 15){
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>7-11朝幅門市</li>
          <li>民生圓環</li>
          <li>台北民生郵局</li>
          <li>麥當勞台北民生二店</li>
          <li>金夫人美式居酒屋</li>
          <li>沛洛瑟珈琲店</li>
          <li>統一健身俱樂部民生館</li>
          <li>7-11東吉門市</li>
          <li>高雄空廚</li>
          <li>7-11東榮門市</li>
          `;
        }else{
          qselect(info).innerHTML =  `<li>民生圓環</li>
          <li>麥當勞台北民生二店</li>
          <li>高雄空廚</li>
          <li>金夫人美式居酒屋</li>
          <li>有巢氏松山三民店</li>
          <li>全家康柏店</li>
          <li>7-11民復門市</li>
          <li>7-11東吉門市</li>
          <li>7-11東榮門市</li>
          <li>銅錵日式涮涮鍋</li>`;
        }
      }else{
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>民生圓環</li>
          <li>7-11朝幅門市</li>
          <li>統一健身俱樂部民生館</li>
          <li>微熱山丘民生公園門市</li>
          <li>松山機場</li>
          <li>7-11東吉門市</li>
          <li>麥當勞台北民生二店</li>
          <li>蘇杭點心店</li>
          <li>豆之府民生店</li>
          <li>鼎晟不動產停車場</li>
          `;
        }else{
          qselect(info).innerHTML =  `<li>民生圓環</li>
          <li>7-11朝幅門市</li>
          <li>松山機場</li>
          <li>豆之府民生店</li>
          <li>統一健身俱樂部民生館</li>
          <li>iRent松山機場站</li>
          <li>統一健身俱樂部民生館</li>
          <li>7-11東吉門市</li>
          <li>台北民生郵局</li>
          <li>金夫人美式居酒屋</li>
          `;
        }

      }
    }else if (zone_id === 8){
      qselect(info).style.color = '#000';
      if (hour >= 4 && hour <= 15){
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>軒登停車場</li>
          <li>TVBS大樓</li>
          <li>富邦媒體科技</li>
          <li>台灣企銀內湖分行</li>
          <li>捷運西湖站2號出口</li>`;

        }else{
          qselect(info).innerHTML =  `<li>仁寶電腦</li>
          <li>TVBS大樓</li>
          <li>富邦媒體科技</li>
          <li>軒登停車場</li>
          <li>台灣銀行內湖分行</li>
          `;
        }
      }else{
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>台灣企銀內湖分行</li>
          <li>OK便利商店港墘店</li>
          <li>日日商業股份有限公司</li>
          <li>TVBS大樓</li>
          <li>捷運港墘站2號出口</li>
          <li>永豐銀行內湖分行</li>
          <li>鷹堡52</li>
          <li>仁寶電腦</li>
          <li>元大商業銀行文德分行</li>
          `;
        }else{
          qselect(info).innerHTML =  `<li>玉山銀行內湖分行</li>
          <li>TVBS大樓</li>
          <li>仁寶電腦</li>
          <li>聯邦商業銀行內湖分行</li>
          <li>中國信託瑞光分行</li>
          <li>富邦媒體科技</li>
          <li>捷運港墘站2號出口</li>
          <li>捷運港墘站2號出口</li>`;
        }

      }
    }else if (zone_id === 9){
      qselect(info).style.color = '#000';
      if (hour >= 4 && hour <= 15){
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>7-11見晴門市</li>
          <li>7-11瑞湖門市</li>
          <li>覺旅咖啡陽光店</li>
          <li>國泰世華銀行瑞湖分行</li>
          `;
        }else{
          qselect(info).innerHTML =  `<li>覺旅咖啡陽光店</li>
          <li>國泰世華銀行瑞湖分行</li>
          <li>鬍鬚張魯肉飯內湖瑞光店</li>
          <li>7-11見晴門市</li>
          <li>7-11瑞江門市</li>
          <li>華宇光能股份有限公司</li>`;

        }
      }else{
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>7-11見晴門市</li>
          <li>鬍鬚張魯肉飯內湖瑞光店</li>
          <li>187 DBSG</li>
          <li>中村友善廚房</li>
          <li>全國加油站民權站</li>
          <li>全國加油站文德站</li>
          <li>文德黃昏市場</li>
          <li>禾雅藝術中心</li>
          <li>7-11瑞江門市</li>
          `;
        }else{
          qselect(info).innerHTML =  `<li>新內一停車場</li>
          <li>國泰世華銀行瑞湖分行</li>
          <li>台北富邦銀行瑞湖分行</li>
          <li>台新銀行(內湖大樓)</li>
          <li>台灣羅德史瓦茲</li>
          <li>遊戲橘子</li>
          <li>大衛菲爾藝文空間</li>
          <li>Crazy Cart Cafe</li>`;
        }

      }
    }else if (zone_id === 10){
      qselect(info).style.color = '#000';
      if (hour >= 4 && hour <= 15){
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>三立電視</li>
          <li>全家塔悠店</li>
          <li>角落酒吧</li>
          <li>7-11塔優門市</li>
          <li>龍都酒樓</li>
          <li>全國加油站撫遠站</li>`;
        }else{
          qselect(info).innerHTML =  `<li>三立電視</li>
          <li>全家塔悠店</li>
          <li>台北花市</li>
          <li>全國加油站撫遠站</li>
          <li>7-11聰明門市</li>
          <li>7-11塔優門市</li>
          <li>Inn 飲咖啡茶酒專門店</li>
          <li>7-11彩龍門市</li>
          `;
        }
      }else{
        if (day == 0 || day == 6){
          qselect(info).innerHTML =  `<li>Costco內湖店</li>
          <li>台北花市</li>
          <li>7-11塔優門市</li>
          <li>三立電視</li>
          <li>全家塔悠店</li>
          <li>巷弄土司</li>
          <li>全國加油站撫遠站</li>
          <li>家樂福內湖店</li>
          <li>Inn 飲咖啡茶酒專門店</li>`;
        }else{
          qselect(info).innerHTML =  `<li>台北花市</li>
          <li>三立電視</li>
          <li>ANWORD 漢樺磁磚概念館</li>
          <li>松山北府東隆宮</li>
          <li>7-11彩龍門市</li>
          <li>家樂福內湖店</li>
          <li>文品創意國際</li>
          <li>協益影音多媒體有限公司</li>
          <li>宇懋股份有限公司</li>
          <li>巷弄土司</li>
          `;
        }

      }
    }else{
      qselect(info).innerHTML =  `<li>無特殊載客熱點</li> `;
      qselect(info).style.color = 'rgba(0, 0, 0, 0.3)';
    }

    num_arr[comp(num_arr)[1]]=0;
  }
}

function comp(num_arr){
  //找出人數最多的區域
  let local_max = 0;
  let max_zone = 0;
  let top_count = 0;
  let top_zone = 0;
  for (let j = 0; j< num_arr.length; j++){
    let num = num_arr[j];
    if (local_max - num >0){
      local_max = local_max;
      max_zone = max_zone;
    }else{
      local_max = num;
      max_zone = j;
    }
    top_count = local_max;
    top_zone = max_zone;
  }
  return [top_count, top_zone];
}


// google map api 創造地圖的函數
function initMap(zone) {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 13.4,
    center: {lat: 25.0838005, lng: 121.574583},
    styles: map_style,
    mapTypeControl:false, //不可切換街道和衛星
    //gestureHandling: 'greedy' //無須 ctrl 即可 zoom in/out
  });

  var radius = 50;
  var image = {
    url: "", //https://cdn4.iconfinder.com/data/icons/essential-app-2/16/record-round-circle-dot-512.png
    // This marker is 20 pixels wide by 32 pixels high.

    scaledSize: new google.maps.Size(radius, radius),
    // The origin for this image is (0, 0).
    origin: new google.maps.Point(0, 0),
    // The anchor for this image is the base of the flagpole at (0, 32).
    anchor: new google.maps.Point(radius/2, radius/2),


  };
  position.forEach(function(e, i) {
    circle[i] = new google.maps.Circle({
      center: e,
      radius: parseInt(zone[i]) * 6.3,
      strokeOpacity: 0,
      fillColor: zone_color[i],
      fillOpacity: 0.5,
      map: map
    });
    marker[i] = new google.maps.Marker({
      position: e,
      map: map,
      label: {text: zone[i], color: "#000", fontSize: "30px", fontFamily: 'Quicksand'},
      icon: image
    });
  });


 var polygonPath = new google.maps.Polygon({
  path: polygonPathPoints,
  strokeColor: 'rgba(0 ,0 ,0, 0.6)',
  strokeOpacity: .8,
  strokeWeight: 1,
  //strokePosition: google.maps.StrokePosition.CENTER,
  fillColor: '#fff',
  fillOpacity: 0,
  map:map
  });

}


var zone = ["1", "0", "102", "18", "155", "0", "0", "107", "111", "73", "0", "0", "51", "46", "64", "0", "0", "10", "29", "45", "0", "0", "0", "23", "36"];
var zone_color = [];
for (let i = 0; i<25; i++){
  let s = 2;
  zone_color.push('rgb( 255,' + (255 - parseInt(zone[i])*s).toString() + ',' +  (255 - parseInt(zone[i])*s).toString() + ')');
}
var circle = [];
var marker = [];

var polygonPathPoints = [
  {lat: 25.115518, lng: 121.551408},
  {lat: 25.052083, lng: 121.551408},
  {lat: 25.052083, lng: 121.628658},
  {lat: 25.115518, lng: 121.628658},
  {lat: 25.115518, lng: 121.613208},
  {lat: 25.052083, lng: 121.613208},
  {lat: 25.052083, lng: 121.597758},
  {lat: 25.115518, lng: 121.597758},
  {lat: 25.115518, lng: 121.582308},
  {lat: 25.052083, lng: 121.582308},
  {lat: 25.052083, lng: 121.566858},
  {lat: 25.115518, lng: 121.566858},
  {lat: 25.115518, lng: 121.551408},
  {lat: 25.102831, lng: 121.551408},
  {lat: 25.102831, lng: 121.628658},
  {lat: 25.090144, lng: 121.628658},
  {lat: 25.090144, lng: 121.551408},
  {lat: 25.077457, lng: 121.551408},
  {lat: 25.077457, lng: 121.628658},
  {lat: 25.06477, lng: 121.628658},
  {lat: 25.06477, lng: 121.551408},
  {lat: 25.115518, lng: 121.551408},
  {lat: 25.115518, lng: 121.628658},


];


var position = [
      {lat: 25.1091745, lng: 121.559133},
      {lat: 25.0964875, lng: 121.559133},
      {lat: 25.0838005, lng: 121.559133},
      {lat: 25.0711135, lng: 121.559133},
      {lat: 25.0584265, lng: 121.559133},

      {lat: 25.1091745, lng: 121.574583},
      {lat: 25.0964875, lng: 121.574583},
      {lat: 25.0838005, lng: 121.574583},
      {lat: 25.0711135, lng: 121.574583},
      {lat: 25.0584265, lng: 121.574583},

      {lat: 25.1091745, lng: 121.590033},
      {lat: 25.0964875, lng: 121.590033},
      {lat: 25.0838005, lng: 121.590033},
      {lat: 25.0711135, lng: 121.590033},
      {lat: 25.0584265, lng: 121.590033},

      {lat: 25.1091745, lng: 121.605483},
      {lat: 25.0964875, lng: 121.605483},
      {lat: 25.0838005, lng: 121.605483},
      {lat: 25.0711135, lng: 121.605483},
      {lat: 25.0584265, lng: 121.605483},

      {lat: 25.1091745, lng: 121.620933},
      {lat: 25.0964875, lng: 121.620933},
      {lat: 25.0838005, lng: 121.620933},
      {lat: 25.0711135, lng: 121.620933},
      {lat: 25.0584265, lng: 121.620933}
      ];

var map_style = [
{
  "featureType": "poi",
  "elementType": "all",
  "stylers": [
      {
          "hue": "#fff"
      },
      {
          "saturation": -100
      },
      {
          "lightness": 0
      },
      {
          "visibility": "off"
      }
  ]
},
{
  "featureType": "poi.business",
  "elementType": "label",
  "stylers": [
      {
          "hue": "#fff"
      },
      {
          "saturation": -100
      },
      {
          "lightness": 0
      },
      {
          "visibility": "on"
      }
  ]
},
{
  "featureType": "administrative",
  "elementType": "all",
  "stylers": [
      {
          "hue": "#fff"
      },
      {
          "saturation": -100
      },
      {
          "lightness": 0
      },
      {
          "visibility": "off"
      }
  ]
},
{
  "featureType": "road",
  "elementType": "labels",
  "stylers": [
      {
          "hue": "#ffffff"
      },
      {
          "saturation": -100
      },
      {
          "lightness": 0
      },
      {
          "visibility": "off"
      }
  ]
},
{
  "featureType": "water",
  "elementType": "labels",
  "stylers": [
      {
          "hue": "#000000"
      },
      {
          "saturation": -100
      },
      {
          "lightness": -100
      },
      {
          "visibility": "off"
      }
  ]
},
{
  "featureType": "water",
  "elementType": "geometry",
  "stylers": [
      {
          "hue": "#a0fdff"
      },
      {
          "saturation": -50
      },
      {
          "lightness": 0
      },
      {
          "visibility": "on"
      }
  ]
},
{
  "featureType": "road",
  "elementType": "geometry",
  "stylers": [
      {
          "hue": "#bbbbbb"
      },
      {
          "saturation": -100
      },
      {
          "lightness": 26
      },
      {
          "visibility": "on"
      }
  ]
},
{
  "featureType": "road.local",
  "elementType": "all",
  "stylers": [
      {
          "hue": "#ffffff"
      },
      {
          "saturation": -100
      },
      {
          "lightness": 100
      },
      {
          "visibility": "on"
      }
  ]
},
{
  "featureType": "transit",
  "elementType": "labels",
  // 車站、捷運站站名標示
  // 捷運路線預設開啟
  "stylers": [
      {
          "hue": "#000000"
      },
      {
          "saturation": 0
      },
      {
          "lightness": 0
      },
      {
          "visibility": "on"
      }
  ]
},
{
  "featureType": "landscape",
  "elementType": "labels",
  "stylers": [
      {
          "hue": "#000000"
      },
      {
          "saturation": -100
      },
      {
          "lightness": -100
      },
      {
          "visibility": "off"
      }
  ]
},
{
  "featureType": "landscape",
  "elementType": "geometry",
  "stylers": [
      {
          "hue": "#dddddd"
      },
      {
          "saturation": -100
      },
      {
          "lightness": -3
      },
      {
          "visibility": "on"
      }
  ]
},

]
