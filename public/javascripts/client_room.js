$(() => {
  'use strict';
  const match = io.connect('http://192.168.33.10:8000/match');
  // const match = io.connect('https://sakemajin.herokuapp.com/match');
  let userId = String(Math.floor(Math.random() * 1000000000));
  let userIds = {};
  let opponentId = '' ;
  let userName1 = '';
  let character1 = '';
  let userName2 = '';
  let character2 = '';
  let nextGameFlag = 0;
  let recast = {};
  recast['enchant1'] = 1;
  recast['enchant2'] = 1;

  match.json.emit('match', {
    userName: $('#userName').val(),
    character: $('#character').val(),
    userId: userId,
    nextGame: 0
  });
  $('#nextGame').submit((e) => {
    e.preventDefault();
    if (nextGameFlag === 1) {
      let userIdTmp = String(Math.floor(Math.random() * 1000000000));
      match.json.emit('match', {
        userName: $('#userName').val(),
        character: $('#character').val(),
        userId: userIdTmp,
        oldUserId: userId,
        nextGame: 1
      });
      userId = userIdTmp;
    }
  });

  match.on('match', (data) => {
    userIds = {};
    opponentId = '' ;
    userName1 = '';
    character1 = '';
    userName2 = '';
    character2 = '';
    userIds = Object.keys(data) ;
    for (let i of userIds) {
      if (i !== userId) {
        opponentId = i;
      }
    }

    $('#countDown').text('waiting for opponent...');

    // init player1
    userName1 = data[userId] ['userName'];
    character1 = data[userId] ['character'];
    $('#player1Name').text(`you: [${userName1}]`);
    $('#player1').attr('src',`../images/${character1}_icon.png`);
    $('#power1').text('pow: ');
    $('#enchant1').attr('src',`../images/${character1}_enchant1.png`);
    $('#enchant2').attr('src',`../images/${character1}_enchant2.png`);
    $('#enchant3').attr('src',`../images/${character1}_enchant3.png`);

    // init player2
    $('#player2Name').text(`opponent: `);
    $('#player2').attr('src','../images/unknown_icon.png');
    $('#player2').attr('class','player2');
    $('#selected_sakemajin2').attr('src','../images/unknown_icon.png');
    $('#power2').text('pow: ');
    if (opponentId) {
      $("#modal-main,#modal-bg").fadeOut("slow",function(){
        //挿入した<div id="modal-bg"></div>を削除
        $('#modal-bg').remove() ;
      });
      userName2 = data[opponentId] ['userName'] ;
      character2 = data[opponentId] ['character'] ;
      $('#player2Name').text(`opponent: [${userName2}]`);
      $('#player2').attr('src',`../images/${character2}_icon.png`);
      $('#player2').attr('class','player2 flip-horizontal');
      $('#selected_sakemajin1').attr('src','../images/unknown_icon.png');
      $('#power1').text('pow: ');

      sound('gameStart');
      match.json.emit('gameStart', {});
      match.json.emit('reset', {});
    }
  });

  match.on('setSakemajin', (data) => {
    $('#selected_sakemajin1').attr('src','../images/unknown_icon.png');
    if (data[userId] ['sakemajin']) {
      $('#selected_sakemajin1').attr('src',`../images/${data[userId] ['sakemajin']}.png`);
      $('#power1').text(`pow: ${data[userId] ['enchantPower']}`);
    }
    $('#selected_sakemajin2').attr('src','../images/unknown_icon.png');
    $('#power2').text('pow: ');
    if (opponentId && data[opponentId] ['sakemajin']) {
      $('#selected_sakemajin2').attr('src',`../images/${data[opponentId] ['sakemajin']}.png`);
      $('#power2').text(`pow: ${data[opponentId] ['enchantPower']}`);
    }
  });

  match.on('setEnchant', (data) => {
    $('#power1').text(`pow: ${data[userId] ['enchantPower']}`);
    if (opponentId && data[opponentId] ['sakemajin']) {
      $('#power2').text(`pow: ${data[opponentId] ['enchantPower']}`);
    }
  });

  match.on('gameStart', (data) => {
    nextGameFlag = 0;
    $('#countDown').text(`u hav ${data[userId] ['count']}s to Skmjn battle...`);
    if (data[userId] ['count'] === 0) {
      nextGameFlag = 1;
    }
  });

  match.on('gameEnd', (data) => {
    $('#countDown').text(data);

    //body内の最後に<div id="modal-bg"></div>を挿入
    $("body").append('<div id="modal-bg"></div>');
    //画面中央を計算する関数を実行
    modalResize();
    //モーダルウィンドウを表示
    $("#modal-bg,#modal-main").fadeIn("slow");
    if (data === "you win") {
      $("#judge").attr('src','../images/win.png');
      sound('win');
    } else if (data === "you lose") {
      $("#judge").attr('src','../images/lose.png');
      sound('lose');
    } else if (data === "draw") {
      $("#judge").attr('src','../images/draw.png');
      sound('draw');
    }

    //画面のどこかをクリックしたらモーダルを閉じる
    $("#modal-bg,#modal-main").click(function(){
      $("#modal-main,#modal-bg").fadeOut("slow",function(){
        //挿入した<div id="modal-bg"></div>を削除
        $('#modal-bg').remove() ;
      });
    });

    //画面の左上からmodal-mainの横幅・高さを引き、その値を2で割ると画面中央の位置が計算できる
    $(window).resize(modalResize);
    function modalResize(){
      var w = $(window).width();
      var h = $(window).height();
      var cw = $("#modal-main").outerWidth();
      var ch = $("#modal-main").outerHeight();
      //取得した値をcssに追加する
      $("#modal-main").css({
        "left": ((w - cw)/2) + "px",
        "top": ((h - ch)/2) + "px"
      });
    }
  });

  var audio = new Audio(); // audioの作成
  audio.src = `../sounds/gameStart.mp3`; // 音声ファイルの指定
  audio.load(); // audioの読み込み
  audio.play(); // audioの再生

  const tips = {
    "": {
      profile: '???'
    },
    "sakemajin": {
      sakemajin1: '[酒魔神]<br>[封印されし酒魔神]に強く、<br>[酒魔神封印の壺]に弱いと伝えられている。',
      sakemajin2: '[酒魔神封印の壺]<br>[酒魔神]に強く、<br>[封印されし酒魔神]に弱いらしい。',
      sakemajin3: '[封印されし酒魔神]<br>[酒魔神封印の壺]に強く、<br>[酒魔神]に弱い。'
    },
    hatnychan: {
      profile: '[ハルトルニル・リルル・ニル]<br>お花の国からやってきた酒魔神使い。<br>太陽光を吸収して力に変換する機構を持つ。<br>-陽魔術 Lv3<br>-光合成 Lv5<br>-格闘術 Lv2<br>-挑発 Lv3<br>-魅了 Lv1<br>-感情起伏 Lv2<br>-種族差別 Lv2',
      enchant1: '[能力向上]<br>起動型能力:再使用時間0秒<br>酒魔神力を0.3%上昇させる。',
      enchant2: '[能力超向上]<br>起動型能力:再使用時間2秒<br>酒魔神力を3%上昇させる。',
      enchant3: '[SunKissed]<br>常在型能力<br>"日中"且つ天気が"晴れ"である場合、<br>酒魔神力を3%上昇させる。(工事中)'
    },
    Qchan: {
      profile: '[Q]<br>闇の国からやってきた酒魔神使い。<br>視力はほとんど無いが優れた聴力を持つ。<br>-陰魔術 Lv2<br>-反響定位 Lv5<br>-絶対音感 Lv5<br>-屍霊術 Lv2<br>-吸血 Lv1<br>-魅了 Lv2<br>-感情起伏 Lv1<br>-種族差別 Lv1',
      enchant1: '[能力向上]<br>起動型能力:再使用時間0秒<br>酒魔神力を0.3%上昇させる。',
      enchant2: '[能力超向上]<br>起動型能力:再使用時間2秒<br>酒魔神力を3%上昇させる。',
      enchant3: '[NachtMusik]<br>常在型能力<br>"夜"である場合、酒魔神力を3%上昇させる。(工事中)'
    },
    nochan: {
      profile: '[ノーフェイス]<br>屍の国からやってきた酒魔神使い。<br>顔の無い食屍鬼。<br>死体から引剥した顔を自分の顔に付けている。<br>-陰魔術 Lv4<br>-屍霊術 Lv3<br>-死体発掘 Lv3<br>-食屍術 Lv5<br>-防腐術 Lv3<br>-縫合 Lv3<br>-魅了 Lv3<br>-感情起伏 Lv0<br>-種族差別 Lv0',
      enchant1: '[能力向上]<br>起動型能力:再使用時間0秒<br>酒魔神力を3%上昇させる。',
      enchant2: '[能力超向上]<br>起動型能力:再使用時間2秒<br>酒魔神力を300%上昇させる。',
      enchant3: '[DeadCatBounce]<br>常在型能力<br>"夜"である場合、酒魔神力を1500%上昇させる。',
      enchant4: '[InTheLongRunWeAreAllDead]<br>常在型能力<br>"夜"である場合、酒魔神力を1500%上昇させる。'
    }
  };

  // マウスオーバー時
  function iconMouse(id, tip) {
    $(id).on('mouseenter', () => {
      //注釈を挿入
      if (id === '#player2') {
        $('#dummy').after(`<div id="tips_pop">${tips[character2] [tip]}</div>`);
      } else if (id.indexOf('#sakemajin') === 0) {
        $('#dummy').after(`<div id="tips_pop">${tips["sakemajin"] [tip]}</div>`);
      } else {
        $('#dummy').after(`<div id="tips_pop">${tips[character1] [tip]}</div>`);
      }
      // マウスの座標を取得して位置を調整
      $(window).mousemove((e) => {
        var x = e.pageX;
        var y = e.pageY;
        $('#tips_pop').css({left: x + 'px', top: y + 'px'});
      });
    });
    $(id).on('mouseleave', () => {
      $('#tips_pop').remove(); //注釈を削除する
    });
  }
  iconMouse('#player1', 'profile');
  iconMouse('#player2', 'profile');
  iconMouse('#sakemajin1', 'sakemajin1');
  iconMouse('#sakemajin2', 'sakemajin2');
  iconMouse('#sakemajin3', 'sakemajin3');
  iconMouse('#enchant1', 'enchant1');
  iconMouse('#enchant2', 'enchant2');
  iconMouse('#enchant3', 'enchant3');

  // sound settings
  function sound(soundFile) {
    var audio = new Audio(); // audioの作成
    audio.src = `../sounds/${soundFile}.ogg`; // 音声ファイルの指定
    audio.load(); // audioの読み込み
    audio.play(); // audioの再生
  }

  // enchant1クリック時
  function clickEnchant(enchant) {
    $(`#${enchant}`).on('click', () => {
      if (recast[enchant] === 1) {
        sound(`${character1}_${enchant}`);
        match.json.emit('setEnchant', {
          "enchant": enchant,
        });
        recast[enchant] = 0;
        if (enchant === 'enchant1') {
          recast[enchant] = 1;
        } else if (enchant === 'enchant2') {
          setTimeout(() => {recast[enchant] = 1;}, 2000);
        }
      }
    });
  }
  clickEnchant('enchant1');
  clickEnchant('enchant2');

  // 酒魔神セット時
  function setSakemajin(sakemajinType) {
    $(`#${sakemajinType}`).on('click', () => {
      sound(`set_${sakemajinType}`);
      match.json.emit('setSakemajin', {
        sakemajin: sakemajinType
      });
    });
  }
  setSakemajin('sakemajin1');
  setSakemajin('sakemajin2');
  setSakemajin('sakemajin3');
});
