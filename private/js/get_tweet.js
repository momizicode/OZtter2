var z_count = 0;

function start(token, token_secret, limit) {
  const
    socketio = io.connect(location.hostname + ':' + location.port),
    $tweet = $('#tweet'),
    $tweets = $('#tweets'),
    se = new Audio('/Oztter2_SE.mp3');

  socketio.on('init', function () {
    socketio.emit('init', {
      token: token,
      token_secret: token_secret
    });
  });

  var w_size = 48;

  socketio.on('tweet', function (data) {
    $tc = $tweets.children();

    if (limit <= $tc.length) {
      $tc.eq(0).remove();
    }

    var wh = window.innerHeight - 104;
    var ww = window.innerWidth - 300;

    if (data.retweeted_status) {
      data.text = data.text.replace(/RT\s@.+:\s/g, '');

      if (data.is_quote_status) {
        add('RT Quote <a href="https://twitter.com/' + data.retweeted_status.user.screen_name + '" target="_blank">@' + data.retweeted_status.user.screen_name + '</a>');
      } else {
        add('RT <a href="https://twitter.com/' + data.retweeted_status.user.screen_name + '" target="_blank">@' + data.retweeted_status.user.screen_name + '</a>');
      }
    } else if (data.is_quote_status) {
      add('Quote');
    } else if (data.in_reply_to_status_id_str) {
      add('Reply');
    } else {
      add('');
    }

    function add(type) {
      $tweets.append('<div class="tweet" id="' + data.id_str + '" style="top:' + calculation(wh / 100 * w_size, wh, 104) + 'px; left:' + calculation(ww / 100 * w_size, ww, 300) + 'px; z-index:' + z_count + ';">'
        + '<div class="title_bar">'
        + 'OZtter2 Message - <a href="https://twitter.com/' + data.user.screen_name + '" target="_blank">@' + data.user.screen_name
        + '</a> ' + type + '<button class="close" title="閉じる">'
        + '<span class="cross"></span>'
        + '</button>'
        + '</div>'
        + '<img class="icon" align="left" src="' + data.user.profile_image_url_https + '">'
        + '<p class="value">' + tweet_value(data.text) + '</p>'
        + '</div>');

      se.currentTime = 0;
      se.play();

      function calculation(min, max, size) {
        return Math.random() * ((max - min) - min) + min;
      }

      function tweet_value(value) {
        return value
          .replace(/(https?:\/\/[\x21-\x7e]+)/gi, '<a href="$1" target="_blank">$1</a>') // メンションのURLと干渉するため、必ず一番最初にこの処理を書くこと
          .replace(/#(w*[一-龠_ぁ-ん_ァ-ヴーａ-ｚＡ-Ｚa-zA-Z0-9]+|[a-zA-Z0-9_]+|[a-zA-Z0-9_]w*)/g, '<a href="https://twitter.com/search?q=%23$1" target="_blank">#$1</a>')
          .replace(/@(\w+)/g, '<a href="https://twitter.com/$1" target="_blank">@$1</a>')
          .replace(/\r\n?/g, "<br>");
      }
    }

    $('#' + data.id_str).draggable({ handle: '.title_bar' });

    if (0 < w_size) w_size--;
  });

  $tweet.on("keydown", function (e) {
    $this = $(this);

    if (e.keyCode === 13 && $this.val() !== '') {
      socketio.emit('tweet', $this.val());

      $this.val('');
    }
  });

  socketio.on('delete', function (id_str) { $('#' + id_str).remove(); });

  socketio.on('err', function (message) {
    switch (message) {
      default:
        console.error(message);
        break;
      case 'Status Code: 401':
        window.location.href = "/reset";
        break;
      case 'Status Code: 420':
        alert('Twitterに接続出来ませんでした\n15分程経ってから再度アクセスしてください');
        break;
    }
  });
}
